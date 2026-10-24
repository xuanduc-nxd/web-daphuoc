// PostgreSQL executes the real schema. Only Supabase's HTTP gateway/Storage are
// emulated locally; no credentials or writes to a real Supabase project.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const net = require("node:net");
const { spawn, execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { PGlite } = require(process.env.UI_PGLITE_MODULE || "@electric-sql/pglite");
const run = promisify(execFile);
const root = path.resolve(__dirname, "../..");
const node = process.execPath;
const secret = "sb_secret_local_integration_fixture";
const password = "ui-review-password-42";
const tables = ["posts", "members", "sponsors", "about_sections", "settings", "admin_users", "admin_login_attempts", "public_blog_submission_attempts"];
const identifier = value => {
  assert.match(value, /^[a-z_][a-z0-9_]*$/);
  return '"' + value + '"';
};
const freePort = async () => {
  const listener = net.createServer();
  await new Promise(resolve => listener.listen(0, "127.0.0.1", resolve));
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  return port;
};

(async () => {
  const db = new PGlite();
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "clb-supabase-test-"));
  fs.mkdirSync(path.join(temp, "sessions"));
  let server, web, failBackend = false, storageUploadError = null;
  const objects = new Map();
  const operations = [];
  let queue = Promise.resolve();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table public.site_data(name text primary key,payload jsonb); insert into public.site_data values('keep', '{\"keep\":true}');");
    const ddl = fs.readFileSync(path.join(root, "supabase-setup.sql"), "utf8");
    await db.exec(ddl);
    const blogMigration = fs.readFileSync(path.join(root, "supabase-public-blog.sql"), "utf8");
    await db.exec(blogMigration);
    await db.exec(blogMigration);
    await db.exec("alter table public.members drop column direction; alter table public.members drop column support_needs; alter table public.members drop column expertise");
    const studentMigration = fs.readFileSync(path.join(root, "supabase-student-fields.sql"), "utf8");
    await db.exec(studentMigration);
    await db.exec(studentMigration);
    assert.equal((await db.query("select count(*)::int as n from information_schema.columns where table_schema='public' and table_name='members' and column_name in ('direction','support_needs','expertise')")).rows[0].n,3,"Student fields migration adds all columns and can be rerun");
    await db.exec("update storage.buckets set file_size_limit=5242880 where id='site-media'");
    await db.exec(ddl);
    assert.equal((await db.query("select file_size_limit::int as bytes from storage.buckets where id='site-media'")).rows[0].bytes,20*1024*1024,"Existing media bucket upgraded to 20 MB");
    assert.equal((await db.query("select count(*)::int as n from site_data")).rows[0].n, 1, "Legacy data retained");
    await db.exec("set role anon");
    for (const table of tables) {
      await assert.rejects(db.query("select * from public." + identifier(table)), /permission denied/, table + " anonymous access denied");
    }
    await assert.rejects(db.query("select public.consume_admin_login_attempt($1)", ["a".repeat(64)]), /permission denied/);
    await assert.rejects(db.query("select public.consume_public_blog_submission($1,$2)", ["a".repeat(64),"b".repeat(64)]), /permission denied/);
    await db.exec("reset role");
    console.log("SQL rerun, grants, RLS and legacy data retention passed");

    server = http.createServer((request, response) => {
      const task = async () => {
        const url = new URL(request.url, "http://127.0.0.1");
        const parts = url.pathname.split("/").filter(Boolean);
        const send = (status, value) => {
          response.writeHead(status, {"Content-Type":"application/json"});
          response.end(JSON.stringify(value,(key,entry) =>
            (key === "date" || key === "expires_on") && typeof entry === "string" && /^\d{4}-\d{2}-\d{2}T/.test(entry)
              ? entry.slice(0,10) : entry));
        };
        if (parts.slice(0, 5).join("/") === "storage/v1/object/public/site-media") {
          const object = objects.get(decodeURIComponent(parts[5] || ""));
          if (!object) return send(404, {});
          response.writeHead(200, {"Content-Type": object.mime});
          return response.end(object.bytes);
        }
        if (request.headers.apikey !== secret) return send(401, {error:"Unauthorized"});
        assert.equal(request.headers.authorization, undefined, "New secret keys only in apikey");
        if (failBackend) return send(503, {error:"Unavailable"});
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const bytes = Buffer.concat(chunks);
        if (parts.slice(0, 4).join("/") === "storage/v1/object/site-media") {
          const name = decodeURIComponent(parts[4] || "");
          if (storageUploadError) return send(storageUploadError.status, storageUploadError.body);
          if (objects.has(name)) return send(400, {error:"Duplicate",statusCode:"409"});
          assert.equal(request.headers["x-upsert"], "false");
          objects.set(name, {bytes, mime:request.headers["content-type"]});
          return send(200, {Key:"site-media/" + name});
        }
        if (parts[0] !== "rest" || parts[1] !== "v1") return send(404, {});
        if (parts[2] === "rpc" && parts[3] === "consume_admin_login_attempt") {
          const input = JSON.parse(bytes.toString());
          const result = await db.query("select public.consume_admin_login_attempt($1) as allowed", [input.attempt_key]);
          return send(200, result.rows[0].allowed);
        }
        if (parts[2] === "rpc" && parts[3] === "consume_public_blog_submission") {
          const input = JSON.parse(bytes.toString());
          const result = await db.query("select public.consume_public_blog_submission($1,$2) as allowed", [input.attempt_key,input.network_key]);
          return send(200, result.rows[0].allowed);
        }
        const table = parts[2];
        if (!tables.includes(table)) return send(404, {});
        const values = [];
        const conditions = [];
        for (const [field, filter] of url.searchParams) {
          if (["select","order","offset","limit","on_conflict"].includes(field)) continue;
          assert(filter.startsWith("eq."), "Expected equality filter");
          values.push(filter.slice(3));
          conditions.push(identifier(field) + " = $" + values.length);
        }
        const where = conditions.length ? " where " + conditions.join(" and ") : "";
        let rows;
        await db.exec("set role service_role");
        try {
          if (request.method === "GET") {
            const select = (url.searchParams.get("select") || "*").split(",").map(x => x === "*" ? "*" : identifier(x)).join(",");
            const order = (url.searchParams.get("order") || "id.asc").split(",").map(part => {
              const [column, direction, nulls] = part.split(".");
              return identifier(column) + (direction === "desc" ? " desc" : " asc") + (nulls === "nullslast" ? " nulls last" : "");
            }).join(",");
            const limit = Number(url.searchParams.get("limit") || 500);
            const offset = Number(url.searchParams.get("offset") || 0);
            assert(Number.isInteger(limit) && limit > 0 && Number.isInteger(offset) && offset >= 0);
            rows = (await db.query("select " + select + " from " + identifier(table) + where + " order by " + order + " limit " + limit + " offset " + offset, values)).rows;
          } else if (request.method === "POST") {
            const payload = JSON.parse(bytes.toString());
            const batch = Array.isArray(payload) ? payload : [payload];
            rows = [];
            for (const row of batch) {
              const columns = Object.keys(row);
              const ignore = String(request.headers.prefer).includes("resolution=ignore-duplicates");
              const sql = "insert into " + identifier(table) + "(" + columns.map(identifier).join(",") + ") values(" + columns.map((_, i) => "$" + (i + 1)).join(",") + ")" + (ignore ? " on conflict(id) do nothing" : "") + " returning *";
              rows.push(...(await db.query(sql, Object.values(row))).rows);
            }
          } else if (request.method === "PATCH") {
            assert(url.searchParams.has("id") && url.searchParams.has("version"), "Update must check version");
            const row = JSON.parse(bytes.toString());
            const sets = Object.entries(row).map(([column, value]) => {
              values.push(value);
              return identifier(column) + " = $" + values.length;
            }).join(",");
            rows = (await db.query("update " + identifier(table) + " set " + sets + where + " returning *", values)).rows;
          } else if (request.method === "DELETE") {
            if (table !== "admin_login_attempts") assert(url.searchParams.has("version"), "Delete must check version");
            rows = (await db.query("delete from " + identifier(table) + where + " returning *", values)).rows;
          } else return send(405, {});
          operations.push({method:request.method,table,count:rows.length});
          return send(200, rows);
        } catch (error) {
          return send(error.code === "23505" ? 409 : 400, {error:"Database rejected the request",code:error.code});
        } finally { await db.exec("reset role"); }
      };
      queue = queue.then(task).catch(error => {
        console.error(error);
        if (!response.headersSent) response.writeHead(500);
        response.end();
      });
    });
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const api = "http://127.0.0.1:" + server.address().port;
    const env = {...process.env, APP_ENV:"test", APP_PREVIEW_MODE:"false", SUPABASE_URL:api, SUPABASE_SECRET_KEY:secret, ADMIN_SETUP_PASSWORD:password};
    const nodeRun = (file, args = [], extra = {}) => run(node, ["--experimental-strip-types",file, ...args], {cwd:root, env:{...env,...extra}, maxBuffer:1024*1024});
    await nodeRun("scripts/migrate-supabase.ts", ["--apply"]);
    const initialCount = (await db.query("select count(*)::int as n from posts")).rows[0].n;
    assert(initialCount > 0);
    const memberCount = (await db.query("select count(*)::int as n from members")).rows[0].n;
    await nodeRun("scripts/migrate-supabase.ts", ["--apply"]);
    assert.equal((await db.query("select count(*)::int as n from posts")).rows[0].n, initialCount);
    assert.equal((await db.query("select max(version)::int as n from posts")).rows[0].n, 1, "Import rerun does not overwrite");
    assert((await db.query("select image from members where image <> '' limit 1")).rows[0].image.startsWith(api + "/storage/"));
    await nodeRun("scripts/create-admin.ts", ["--username","admin"]);
    await nodeRun("scripts/create-admin.ts", ["--username","editor","--role","editor"]);
    await assert.rejects(nodeRun("scripts/create-admin.ts", ["--username","admin"]));
    await nodeRun("scripts/check-supabase.ts");
    console.log("Import, repeat import, image migration and account creation passed");

    // Check the row limit at the API boundary: second page is required.
    await db.exec("insert into members(id,type,name,sort_order) select 'page_'||g, 'student','Pagination fixture',g from generate_series(1,501) g");
    const many = await run(node, ["--experimental-strip-types","-e","import('./src/models/repository.ts').then(async m=>console.log((await m.members()).length))"], {cwd:root,env});
    assert.equal(Number(many.stdout), memberCount + 501);
    await db.exec("delete from members where id like 'page_%'");
    console.log("Data API pagination beyond 500 records passed");
    const webPort = await freePort();
    web = spawn(node, ["--experimental-strip-types","src/server.ts"], {cwd:root,env:{...env,PORT:String(webPort),APP_SESSION_DIR:path.join(temp,"sessions")},stdio:["ignore","ignore","pipe"],windowsHide:true});
    let runtimeErrors = "";
    web.stderr.on("data", bytes => { const line = bytes.toString(); if (/TypeError|ReferenceError|SyntaxError|uncaughtException/.test(line)) runtimeErrors += line; });
    const base = "http://127.0.0.1:" + webPort;
    for (let attempt = 0; ; attempt++) {
      try { await fetch(base + "/admin/login.php"); break; }
      catch (error) { if (attempt > 30) throw error; await new Promise(resolve => setTimeout(resolve,100)); }
    }
    let cookie = "";
    const request = async (route, form = null) => {
      const response = await fetch(base + route, {
        method:form ? "POST" : "GET", redirect:"manual",
        headers:{...(cookie ? {Cookie:cookie} : {}), ...(form && !(form instanceof FormData) ? {"Content-Type":"application/x-www-form-urlencoded"} : {})},
        body:form instanceof FormData ? form : form ? new URLSearchParams(form) : undefined,
      });
      const nextCookie = response.headers.get("set-cookie");
      if (nextCookie) cookie = nextCookie.split(";")[0];
      return {status:response.status, html:await response.text(), location:response.headers.get("location")};
    };
    const field = (html, name) => {
      const match = html.match(new RegExp('name="' + name + '"[^>]*value="([^"]*)"'));
      assert(match, "Missing form field " + name);
      return match[1];
    };
    const login = async username => {
      const page = await request("/admin/login.php");
      return request("/admin/login.php", {token:field(page.html,"token"),username,password});
    };
    const loginPage = await request("/admin/login.php");
    const badLogin = await request("/admin/login.php",{token:field(loginPage.html,"token"),username:"admin",password:"123"});
    assert.equal(badLogin.status,200);
    assert(badLogin.html.includes("Tên đăng nhập hoặc mật khẩu không đúng"));
    assert.equal((await login("admin")).status,302);
    assert.equal((await request("/admin/index.php")).status,200);
    const attemptKey = "b".repeat(64);
    for (let index=0;index<11;index++) {
      assert.equal((await db.query("select consume_admin_login_attempt($1) as allowed",[attemptKey])).rows[0].allowed, index < 10);
    }
    console.log("Login, default-password rejection and shared throttling passed");

    const editor = await request("/admin/post-edit.php?kind=activity");
    const form = {token:field(editor.html,"token"),id:"",version:"1",kind:"activity",title:"Hoạt động kiểm thử Supabase",excerpt:"Nội dung kiểm thử",content:"Nội dung không ghi vào dữ liệu thật.",author:"CLB",role:"CLB",date:"14/10/2026",status:"draft"};
    const withGallery = (base, gallery, removed = [], cover = "", positions = []) => {
      const data = new FormData();
      for (const [key,value] of Object.entries(base)) data.append(key,value);
      gallery.forEach((url,index) => {
        data.append("gallery_keep[]",url);
        data.append("gallery_position[]",String(positions[index] || index + 1));
      });
      removed.forEach(url => data.append("gallery_remove[]",url));
      if (cover) data.append("gallery_cover",cover);
      return data;
    };
    const uploadedForm = new FormData();
    for (const [key,value] of Object.entries(form)) uploadedForm.append(key,value);
    const photo = fs.readFileSync(path.join(root,"tests/fixtures/upload.png"));
    for (let index=0;index<3;index++) uploadedForm.append("gallery[]",new Blob([photo],{type:"image/png"}),"image-"+index+".png");
    uploadedForm.append("gallery_cover","new:1");
    assert.equal((await request("/admin/post-edit.php",uploadedForm)).status,302);
    let post = (await db.query("select * from posts where title=$1",[form.title])).rows[0];
    assert(post);
    assert.equal(post.gallery.length,3,"Activity album stores three images");
    assert.equal(post.image,post.gallery[1],"Selected cover is saved");
    assert(post.image.startsWith(api+"/storage/v1/object/public/site-media/activity-"));
    assert.equal((await fetch(post.image)).status,200,"Uploaded image served publicly");
    assert.equal((await request("/detail.php?type=activities&id="+post.id)).status,404);
    assert(!(await request("/Activities.php")).html.includes(form.title));
    const saveA = {...form,id:post.id,version:"1",status:"published",title:"Hoạt động Supabase đã xuất bản"};
    assert.equal((await request("/admin/post-edit.php?id="+post.id,withGallery(saveA,post.gallery,[],post.image))).status,302);
    post = (await db.query("select * from posts where id=$1",[post.id])).rows[0];
    assert.equal(post.version,2);
    assert((await request("/")).html.includes(saveA.title));
    assert((await request("/Activities.php")).html.includes(saveA.title));
    assert.equal((await request("/detail.php?type=activities&id="+post.id)).status,200);
    const stale = {...saveA,version:"1",title:"Không được ghi đè"};
    const conflict = await request("/admin/post-edit.php?id="+post.id,withGallery(stale,post.gallery,[post.image]));
    assert.equal(conflict.status,200);
    assert(conflict.html.includes("người khác sửa"));
    assert.equal((await db.query("select title from posts where id=$1",[post.id])).rows[0].title,saveA.title);
    assert.equal((await db.query("select image from posts where id=$1",[post.id])).rows[0].image,post.image,"Conflict keeps the existing cover");
    const imageEditor = await request("/admin/post-edit.php?id="+post.id);
    assert(imageEditor.html.includes('name="gallery_keep[]"'),"Existing album can be edited");
    const updateGallery = {...saveA,version:"2",token:field(imageEditor.html,"token")};
    assert.equal((await request("/admin/post-edit.php?id="+post.id,withGallery(updateGallery,post.gallery,[post.gallery[1]],post.gallery[2],[2,3,1]))).status,302);
    post = (await db.query("select * from posts where id=$1",[post.id])).rows[0];
    assert.equal(post.gallery.length,2,"Image removed from album");
    assert.equal(post.image,post.gallery[0],"Cover follows album selection");
    assert.equal((await request("/detail.php?type=activities&id="+post.id)).html.match(/data-gallery-group="activity"/g).length,2,"Public article shows both remaining photos");
    assert.equal(post.version,3);
    const list = await request("/admin/posts.php?kind=activity");
    const statusToken = field(list.html,"token");
    const invalidDelete = await request("/admin/post-delete.php",{id:post.id,version:"3",token:"bad"});
    assert.equal(invalidDelete.status,302);
    assert.equal((await db.query("select count(*)::int as n from posts where id=$1",[post.id])).rows[0].n,1);
    const staleStatus = await request("/admin/post-status.php",{id:post.id,version:"1",token:statusToken});
    assert.equal(staleStatus.status,302,"Stale status change rejected");
    const statusChange = await request("/admin/post-status.php",{id:post.id,version:"3",token:statusToken});
    assert.equal(statusChange.status,302);
    assert.equal((await request("/detail.php?type=activities&id="+post.id)).status,404);
    const hidden = await request("/admin/post-edit.php?id="+post.id);
    const hiddenToken = field(hidden.html,"token");
    assert.equal((await request("/admin/post-delete.php",{id:post.id,version:"4",token:hiddenToken})).status,302);
    assert.equal((await db.query("select count(*)::int as n from posts where id=$1",[post.id])).rows[0].n,0);
    assert.equal((await db.query("select count(*)::int as n from posts")).rows[0].n,initialCount);
    const forged = new FormData();
    const freshEditor = await request("/admin/post-edit.php?kind=activity");
    for (const [key,value] of Object.entries({...form,token:field(freshEditor.html,"token")})) forged.append(key,value);
    forged.append("gallery[]",new Blob(["not an image"],{type:"image/png"}),"fake.png");
    assert.equal((await request("/admin/post-edit.php",forged)).status,200);
    assert.equal((await db.query("select count(*)::int as n from posts")).rows[0].n,initialCount,"Server rejects fake image");
    const failedUploadPage = await request("/admin/post-edit.php?kind=activity");
    const failedUploadForm = new FormData();
    for (const [key,value] of Object.entries({...form,title:"Lỗi Storage kiểm thử",token:field(failedUploadPage.html,"token")})) failedUploadForm.append(key,value);
    failedUploadForm.append("gallery[]",new Blob([photo],{type:"image/png"}),"storage-error.png");
    storageUploadError = {status:400,body:{code:"InvalidRequest",message:"Rejected for test"}};
    try {
      const failedUpload = await request("/admin/post-edit.php",failedUploadForm);
      assert.equal(failedUpload.status,200);
      assert(failedUpload.html.includes("HTTP 400, mã InvalidRequest"),"Storage error code is shown in admin");
    } finally { storageUploadError = null; }
    assert.equal((await db.query("select count(*)::int as n from posts where title=$1",["Lỗi Storage kiểm thử"])).rows[0].n,0);
    const largeImage = Buffer.concat([photo, Buffer.alloc(20*1024*1024-photo.length)]);
    const largePage = await request("/admin/post-edit.php?kind=activity");
    const largeForm = new FormData();
    for (const [key,value] of Object.entries({...form,title:"Ảnh 20 MB kiểm thử",token:field(largePage.html,"token")})) largeForm.append(key,value);
    largeForm.append("gallery[]",new Blob([largeImage],{type:"image/png"}),"large.png");
    assert.equal((await request("/admin/post-edit.php",largeForm)).status,302,"Image of exactly 20 MB accepted");
    const largePost = (await db.query("select gallery from posts where title=$1",["Ảnh 20 MB kiểm thử"])).rows[0];
    assert.equal(largePost.gallery.length,1);
    assert.equal(objects.get(new URL(largePost.gallery[0]).pathname.split("/").pop()).bytes.length,20*1024*1024);
    const tooLargePage = await request("/admin/post-edit.php?kind=activity");
    const tooLargeForm = new FormData();
    for (const [key,value] of Object.entries({...form,title:"Ảnh vượt 20 MB kiểm thử",token:field(tooLargePage.html,"token")})) tooLargeForm.append(key,value);
    tooLargeForm.append("gallery[]",new Blob([largeImage,Buffer.from([0])],{type:"image/png"}),"too-large.png");
    assert.equal((await request("/admin/post-edit.php",tooLargeForm)).status,200,"Image over 20 MB rejected");
    assert.equal((await db.query("select count(*)::int as n from posts where title=$1",["Ảnh vượt 20 MB kiểm thử"])).rows[0].n,0);
    const galleryUiPage = await request("/admin/post-edit.php?kind=activity");
    const galleryUiForm = new FormData();
    for (const [key,value] of Object.entries({...form,title:"Album giao diện kiểm thử",status:"published",token:field(galleryUiPage.html,"token")})) galleryUiForm.append(key,value);
    for (let index=0;index<5;index++) galleryUiForm.append("gallery[]",new Blob([photo],{type:"image/png"}),"gallery-"+index+".png");
    assert.equal((await request("/admin/post-edit.php",galleryUiForm)).status,302);
    const galleryUiId = (await db.query("select id from posts where title=$1",["Album giao diện kiểm thử"])).rows[0].id;
    env.UI_TEST_GALLERY_URL = "/detail.php?type=activities&id=" + galleryUiId;
    env.UI_TEST_GALLERY_EDIT_URL = "/admin/post-edit.php?id=" + galleryUiId;
    for (const [kind,route] of [["notification","/Notifications.php"],["blog","/Blog.php"]]) {
      const page = await request("/admin/post-edit.php?kind="+kind);
      const draft = {...form,kind,title:"Kiểm thử "+kind,status:"published",token:field(page.html,"token")};
      const browserForm = new FormData();
      for (const [key,entry] of Object.entries(draft)) browserForm.append(key,entry);
      browserForm.append("image",new Blob([],{type:"application/octet-stream"}),"");
      assert.equal((await request("/admin/post-edit.php",browserForm)).status,302);
      assert((await request(route)).html.includes(draft.title));
    }
    const blogId = (await db.query("select id from posts where title=$1",["Kiểm thử blog"])).rows[0].id;
    const blogEditor = await request("/admin/post-edit.php?id="+blogId);
    const blogUpload = new FormData();
    for (const [key,value] of Object.entries({...form,id:blogId,version:"1",kind:"blog",title:"Kiểm thử blog",status:"published",token:field(blogEditor.html,"token")})) blogUpload.append(key,value);
    blogUpload.append("image",new Blob([photo],{type:"image/png"}),"blog.png");
    assert.equal((await request("/admin/post-edit.php?id="+blogId,blogUpload)).status,302);
    assert((await db.query("select image from posts where id=$1",[blogId])).rows[0].image.includes("/post-"));
    const blogRemoveEditor = await request("/admin/post-edit.php?id="+blogId);
    const blogRemove = {...form,id:blogId,version:"2",kind:"blog",title:"Kiểm thử blog",status:"published",token:field(blogRemoveEditor.html,"token"),remove_image:"1"};
    assert.equal((await request("/admin/post-edit.php?id="+blogId,blogRemove)).status,302);
    assert.equal((await db.query("select image from posts where id=$1",[blogId])).rows[0].image,"","Single-image posts can remove their cover");
    const adminCookie = cookie;
    cookie = "";
    const publicBlogPage = await request("/Blog.php");
    assert(publicBlogPage.html.includes('name="author"') && publicBlogPage.html.includes('name="content"'),"Blog form available without login");
    const visitorForm = {started:field(publicBlogPage.html,"started"),token:field(publicBlogPage.html,"token"),author:"Khách ghé thăm",category:"Lời cảm ơn",title:"Cảm ơn CLB <script>alert(1)</script>",content:"Cảm ơn các anh chị đã giúp đỡ sinh viên. <script>alert(1)</script>"};
    assert.equal((await request("/Blog.php",{...visitorForm,token:"0".repeat(64)})).status,400,"Tampered form token rejected");
    assert.equal((await request("/Blog.php",{...visitorForm,content:"Quá ngắn"})).status,400,"Invalid visitor content rejected");
    await new Promise(resolve => setTimeout(resolve,2100));
    assert.equal((await request("/Blog.php",visitorForm)).status,302,"Anonymous visitor can submit");
    const visitorPost=(await db.query("select * from posts where title=$1",[visitorForm.title])).rows[0];
    assert(visitorPost && visitorPost.status === "draft" && visitorPost.kind === "blog" && visitorPost.role === "Lời cảm ơn");
    assert(!(await request("/Blog.php")).html.includes(visitorForm.title),"Submission stays hidden until approved");
    assert.equal((await request("/detail_blog.php?id="+visitorPost.id)).status,404,"Draft direct link stays private");
    cookie = adminCookie;
    const pendingPage = await request("/admin/posts.php?kind=blog");
    assert(pendingPage.html.includes("Cảm ơn CLB &lt;script&gt;"),"Visitor draft reaches admin list escaped");
    assert.equal((await request("/admin/post-status.php",{token:field(pendingPage.html,"token"),id:visitorPost.id,version:String(visitorPost.version)})).status,302,"Admin can approve visitor post");
    cookie = "";
    const approvedPage = await request("/Blog.php");
    assert(approvedPage.html.includes("Cảm ơn CLB &lt;script&gt;") && !approvedPage.html.includes("<script>alert(1)</script>"),"Approved title is escaped");
    const approvedDetail = await request("/detail_blog.php?id="+visitorPost.id);
    assert.equal(approvedDetail.status,200);
    assert(approvedDetail.html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"),"Visitor body is rendered as plain text");
    for (let index=0; index<2; index++) assert.equal((await request("/Blog.php",{...visitorForm,title:"Cảm nghĩ thử giới hạn " + index})).status,302);
    assert.equal((await request("/Blog.php",{...visitorForm,title:"Cảm nghĩ vượt giới hạn"})).status,429,"Anonymous submission is limited across requests");
    cookie = adminCookie;
    console.log("Anonymous Blog submission, moderation, escaping and shared throttling passed");
    const pinnedPage = await request("/admin/post-edit.php?kind=notification");
    const pinnedNotice = {...form,kind:"notification",title:"Thông báo được ghim",date:"01/01/2020",status:"published",pinned:"1",expires_on:"31/12/2999",token:field(pinnedPage.html,"token")};
    assert.equal((await request("/admin/post-edit.php",pinnedNotice)).status,302);
    const expiredPage = await request("/admin/post-edit.php?kind=notification");
    const expiredNotice = {...form,kind:"notification",title:"Thông báo đã hết hạn",status:"published",pinned:"1",expires_on:"01/01/2000",token:field(expiredPage.html,"token")};
    assert.equal((await request("/admin/post-edit.php",expiredNotice)).status,302);
    const expiredId = (await db.query("select id from posts where title=$1",[expiredNotice.title])).rows[0].id;
    const notificationsHtml = (await request("/Notifications.php")).html;
    assert(notificationsHtml.includes(pinnedNotice.title));
    assert(notificationsHtml.indexOf(pinnedNotice.title) < notificationsHtml.indexOf("Kiểm thử notification"),"Pinned notification comes first");
    assert(!notificationsHtml.includes(expiredNotice.title),"Expired notification hidden from list");
    assert(!(await request("/")).html.includes(expiredNotice.title),"Expired notification hidden from home");
    assert.equal((await request("/search.php")).status,404,"Global search page removed");
    assert.equal((await request("/Sponsorship.php")).status,404,"Sponsorship page removed");
    assert.equal((await request("/detail.php?id="+expiredId)).status,404,"Expired direct link unavailable");
    assert.equal((await request("/detail.php?type=activities&id=1")).status,200,"Legacy activity link");
    assert.equal((await request("/detail_blog.php?id=1")).status,404,"Unused legacy sheet Blog remains a draft");
    console.log("All three article types, drafts, publish/hide/delete, CSRF, conflicts and old links passed");

    const member = (await db.query("select * from members order by id limit 1")).rows[0];
    const memberPage = await request("/admin/team-edit.php?id="+member.id);
    const memberForm = {id:member.id,version:String(member.version),token:field(memberPage.html,"token"),name:member.name,detail:"Cập nhật bản ghi riêng",position:member.position,type:member.type};
    assert.equal((await request("/admin/team-edit.php?id="+member.id,memberForm)).status,302);
    assert.equal((await db.query("select count(*)::int as n from members")).rows[0].n,memberCount);
    assert.equal((await db.query("select count(*)::int as n from members where version=2")).rows[0].n,1);
    const studentPage = await request("/admin/team-edit.php?type=student");
    assert(!studentPage.html.includes('name="image"'),"Student editor has no photo upload");
    const studentForm = {id:"",version:"1",type:"student",token:field(studentPage.html,"token"),name:"Sinh viên kiểm thử",school:"Trường Đại học A",major:"Kỹ thuật",direction:"Mục tiêu học tập và nghề nghiệp",support_needs:"Học bổng và thiết bị học tập",expertise:"Phát triển phần mềm"};
    const invalidStudent = await request("/admin/team-edit.php?type=student",{...studentForm,direction:""});
    assert.equal(invalidStudent.status,200,"Direction is required");
    assert.equal((await request("/admin/team-edit.php?type=student",studentForm)).status,302);
    const studentId = (await db.query("select id from members where name=$1",[studentForm.name])).rows[0].id;
    await db.query("update members set image=$1,detail=$2 where id=$3",["https://example.com/private-photo.jpg","Ghi chú riêng không công khai",studentId]);
    const studentsHtml = (await request("/Students.php")).html;
    for (const value of [studentForm.name,studentForm.school,studentForm.major,studentForm.direction,studentForm.support_needs,studentForm.expertise]) assert(studentsHtml.includes(value));
    const studentListHtml = (await request("/admin/team.php?type=student")).html;
    assert(studentListHtml.includes(studentForm.support_needs) && studentListHtml.includes(studentForm.expertise),"Student admin list includes new fields");
    assert(!studentsHtml.includes("private-photo.jpg") && !studentsHtml.includes("Ghi chú riêng"),"Student public page exposes only approved fields");
    const sponsorPage = await request("/admin/content-edit.php?type=sponsor");
    const sponsorForm = {id:"",version:"1",token:field(sponsorPage.html,"token"),title:"Tài trợ kiểm thử",excerpt:"Đóng góp kiểm thử",content:"Nội dung",date:"14/10/2026",sort_order:"99"};
    assert.equal((await request("/admin/content-edit.php?type=sponsor",sponsorForm)).status,302);
    assert((await request("/HonorList.php")).html.includes(sponsorForm.title));
    const aboutPage = await request("/admin/content-edit.php?type=about");
    assert.equal((await request("/admin/content-edit.php?type=about",{id:"",version:"1",token:field(aboutPage.html,"token"),section_key:"method",category:"",content:"Phương thức kiểm thử",sort_order:"99"})).status,302);
    assert((await request("/About.php")).html.includes("Phương thức kiểm thử"));
    const setting = await request("/admin/settings.php");
    const current = (await db.query("select * from settings where id='main'")).rows[0];
    const settingsForm = {...current,token:field(setting.html,"token"),email:"clb@example.com",contact:"Liên hệ kiểm thử"};
    for (const key of ["created_at","updated_at"]) delete settingsForm[key];
    assert.equal((await request("/admin/settings.php",settingsForm)).status,302);
    assert((await request("/contact.php")).html.includes("clb@example.com"));
    assert(!(await request("/")).html.includes(secret));
    const blankPage = await request("/admin/settings.php");
    const blank = {...settingsForm,version:"2",token:field(blankPage.html,"token"),email:"",phone:"",facebook:""};
    assert.equal((await request("/admin/settings.php",blank)).status,302);
    for (const route of ["/","/contact.php","/Blog.php"]) {
      const html = (await request(route)).html;
      assert(!html.includes('href="mailto:"') && !html.includes('href="mailto:?') && !html.includes('href="tel:"'),"Blank contact links hidden: "+route);
    }
    await db.query("update settings set email=$1,phone=$2,facebook=$3 where id='main'",[current.email,current.phone,current.facebook]);
    console.log("Members, sponsors, about sections and public settings binding passed");
    await db.exec("update admin_users set role='editor' where username='admin'");
    assert.equal((await request("/admin/posts.php")).status,302,"Changed account invalidates old session");
    assert.equal((await login("admin")).status,302);
    assert.equal((await request("/admin/settings.php")).status,403,"Downgraded account loses owner permissions");
    await db.exec("update admin_users set role='admin' where username='admin'");

    await request("/admin/logout.php");
    assert.equal((await login("editor")).status,302);
    assert.equal((await request("/admin/posts.php")).status,200);
    assert.equal((await request("/admin/settings.php")).status,403);
    assert.equal((await request("/admin/content.php?type=sponsor")).status,403);
    await db.exec("update admin_users set disabled=true where username='editor'");
    assert.equal((await request("/admin/posts.php")).status,302,"Disabled account rejected");
    cookie = "";
    failBackend = true;
    const unavailable = await request("/Activities.php");
    assert.equal(unavailable.status,503);
    assert(unavailable.html.includes("Chưa kết nối được dữ liệu"));
    assert(!unavailable.html.includes(secret));
    failBackend = false;
    await assert.rejects(run(node, ["--experimental-strip-types","-e","import('./src/models/repository.ts').then(m=>m.posts())"], {cwd:root,env:{...env,APP_ENV:"production",SUPABASE_URL:"",SUPABASE_SECRET_KEY:""}}));
    console.log("Authorization, account revocation, outage handling and production config required passed");

    if (process.env.UI_PLAYWRIGHT_MODULE) {
      const output = await run(process.execPath, ["tests/ui-smoke.cjs"], {cwd:root,env:{...env,UI_TEST_BASE_URL:base,UI_TEST_ADMIN_PASSWORD:password},maxBuffer:1024*1024});
      process.stdout.write(output.stdout);
    }
    assert.equal(runtimeErrors,"","Node runtime errors");
    assert(operations.some(op=>op.method==="PATCH"&&op.count===0),"A stale update was rejected by PostgreSQL");
    console.log("Supabase integration passed using local PostgreSQL and an emulated HTTP gateway; real Supabase still needs verification.");
  } finally {
    if (web) web.kill();
    if (server) await new Promise(resolve => server.close(resolve));
    await db.close();
    const resolved = path.resolve(temp);
    assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));
    assert(path.basename(resolved).startsWith("clb-supabase-test-"));
    fs.rmSync(resolved,{recursive:true,force:true});
  }
})().catch(error=>{console.error(error);process.exitCode=1;});

