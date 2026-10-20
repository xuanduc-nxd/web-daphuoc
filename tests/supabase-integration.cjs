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
const root = path.resolve(__dirname, "..");
const php = process.env.UI_PHP_PATH || "php";
const secret = "sb_secret_local_integration_fixture";
const password = "ui-review-password-42";
const tables = ["posts", "members", "sponsors", "about_sections", "settings", "admin_users", "admin_login_attempts"];
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
  let server, web, failBackend = false;
  const objects = new Map();
  const operations = [];
  let queue = Promise.resolve();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table public.site_data(name text primary key,payload jsonb); insert into public.site_data values('keep', '{\"keep\":true}');");
    const ddl = fs.readFileSync(path.join(root, "supabase-setup.sql"), "utf8");
    await db.exec(ddl);
    await db.exec(ddl);
    assert.equal((await db.query("select count(*)::int as n from site_data")).rows[0].n, 1, "Legacy data retained");
    await db.exec("set role anon");
    for (const table of tables) {
      await assert.rejects(db.query("select * from public." + identifier(table)), /permission denied/, table + " anonymous access denied");
    }
    await assert.rejects(db.query("select public.consume_admin_login_attempt($1)", ["a".repeat(64)]), /permission denied/);
    await db.exec("reset role");
    console.log("SQL rerun, grants, RLS and legacy data retention passed");

    server = http.createServer((request, response) => {
      const task = async () => {
        const url = new URL(request.url, "http://127.0.0.1");
        const parts = url.pathname.split("/").filter(Boolean);
        const send = (status, value) => {
          response.writeHead(status, {"Content-Type":"application/json"});
          response.end(JSON.stringify(value));
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
    const phpRun = (file, args = [], extra = {}) => run(php, [file, ...args], {cwd:root, env:{...env,...extra}, maxBuffer:1024*1024});
    await phpRun("scripts/migrate-supabase.php", ["--apply"]);
    const initialCount = (await db.query("select count(*)::int as n from posts")).rows[0].n;
    assert(initialCount > 0);
    const memberCount = (await db.query("select count(*)::int as n from members")).rows[0].n;
    await phpRun("scripts/migrate-supabase.php", ["--apply"]);
    assert.equal((await db.query("select count(*)::int as n from posts")).rows[0].n, initialCount);
    assert.equal((await db.query("select max(version)::int as n from posts")).rows[0].n, 1, "Import rerun does not overwrite");
    assert((await db.query("select image from members where image <> '' limit 1")).rows[0].image.startsWith(api + "/storage/"));
    await phpRun("scripts/create-admin.php", ["--username","admin"]);
    await phpRun("scripts/create-admin.php", ["--username","editor","--role","editor"]);
    await assert.rejects(phpRun("scripts/create-admin.php", ["--username","admin"]));
    await phpRun("scripts/check-supabase.php");
    console.log("Import, repeat import, image migration and account creation passed");

    // Check the row limit at the API boundary: second page is required.
    await db.exec("insert into members(id,type,name,sort_order) select 'page_'||g, 'student','Pagination fixture',g from generate_series(1,501) g");
    const many = await run(php, ["-r","require 'app/Models/SiteRepository.php'; echo count(site_members());"], {cwd:root,env});
    assert.equal(Number(many.stdout), memberCount + 501);
    await db.exec("delete from members where id like 'page_%'");
    console.log("Data API pagination beyond 500 records passed");
    const webPort = await freePort();
    web = spawn(php, ["-d","session.save_path=" + path.join(temp,"sessions"), "-d","upload_max_filesize=5M", "-d","post_max_size=7M", "-S","127.0.0.1:" + webPort, "-t",path.join(root,"public")], {cwd:root,env,stdio:["ignore","ignore","pipe"],windowsHide:true});
    let phpErrors = "";
    web.stderr.on("data", bytes => { const line = bytes.toString(); if (/Fatal error|Warning:|Deprecated:/.test(line)) phpErrors += line; });
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
    const uploadedForm = new FormData();
    for (const [key,value] of Object.entries(form)) uploadedForm.append(key,value);
    uploadedForm.append("image",new Blob([fs.readFileSync(path.join(root,"tests/fixtures/upload.png"))],{type:"image/png"}),"image.png");
    assert.equal((await request("/admin/post-edit.php",uploadedForm)).status,302);
    let post = (await db.query("select * from posts where title=$1",[form.title])).rows[0];
    assert(post);
    assert(post.image.startsWith(api+"/storage/v1/object/public/site-media/post-"));
    assert.equal((await fetch(post.image)).status,200,"Uploaded image served publicly");
    assert.equal((await request("/detail.php?type=activities&id="+post.id)).status,404);
    assert(!(await request("/Activities.php")).html.includes(form.title));
    const saveA = {...form,id:post.id,version:"1",status:"published",title:"Hoạt động Supabase đã xuất bản"};
    assert.equal((await request("/admin/post-edit.php?id="+post.id,saveA)).status,302);
    post = (await db.query("select * from posts where id=$1",[post.id])).rows[0];
    assert.equal(post.version,2);
    assert((await request("/")).html.includes(saveA.title));
    assert((await request("/Activities.php")).html.includes(saveA.title));
    assert.equal((await request("/detail.php?type=activities&id="+post.id)).status,200);
    const stale = {...saveA,version:"1",title:"Không được ghi đè"};
    const conflict = await request("/admin/post-edit.php?id="+post.id,stale);
    assert.equal(conflict.status,200);
    assert(conflict.html.includes("người khác sửa"));
    assert.equal((await db.query("select title from posts where id=$1",[post.id])).rows[0].title,saveA.title);
    const list = await request("/admin/posts.php?kind=activity");
    const statusToken = field(list.html,"token");
    const invalidDelete = await request("/admin/post-delete.php",{id:post.id,version:"2",token:"bad"});
    assert.equal(invalidDelete.status,302);
    assert.equal((await db.query("select count(*)::int as n from posts where id=$1",[post.id])).rows[0].n,1);
    const statusChange = await request("/admin/post-status.php",{id:post.id,version:"2",token:statusToken});
    assert.equal(statusChange.status,302);
    assert.equal((await request("/detail.php?type=activities&id="+post.id)).status,404);
    const hidden = await request("/admin/post-edit.php?id="+post.id);
    const hiddenToken = field(hidden.html,"token");
    assert.equal((await request("/admin/post-delete.php",{id:post.id,version:"3",token:hiddenToken})).status,302);
    assert.equal((await db.query("select count(*)::int as n from posts where id=$1",[post.id])).rows[0].n,0);
    assert.equal((await db.query("select count(*)::int as n from posts")).rows[0].n,initialCount);
    const forged = new FormData();
    const freshEditor = await request("/admin/post-edit.php?kind=activity");
    for (const [key,value] of Object.entries({...form,token:field(freshEditor.html,"token")})) forged.append(key,value);
    forged.append("image",new Blob(["not an image"],{type:"image/png"}),"fake.png");
    assert.equal((await request("/admin/post-edit.php",forged)).status,200);
    assert.equal((await db.query("select count(*)::int as n from posts")).rows[0].n,initialCount,"Server rejects fake image");
    for (const [kind,route] of [["notification","/Notifications.php"],["blog","/Blog.php"]]) {
      const page = await request("/admin/post-edit.php?kind="+kind);
      const draft = {...form,kind,title:"Kiểm thử "+kind,status:"published",token:field(page.html,"token")};
      assert.equal((await request("/admin/post-edit.php",draft)).status,302);
      assert((await request(route)).html.includes(draft.title));
    }
    assert.equal((await request("/detail.php?type=activities&id=1")).status,200,"Legacy activity link");
    assert.equal((await request("/detail_blog.php?id=1")).status,404,"Unused legacy sheet Blog remains a draft");
    console.log("All three article types, drafts, publish/hide/delete, CSRF, conflicts and old links passed");

    const member = (await db.query("select * from members order by id limit 1")).rows[0];
    const memberPage = await request("/admin/team-edit.php?id="+member.id);
    const memberForm = {id:member.id,version:String(member.version),token:field(memberPage.html,"token"),name:member.name,detail:"Cập nhật bản ghi riêng",position:member.position,type:member.type};
    assert.equal((await request("/admin/team-edit.php?id="+member.id,memberForm)).status,302);
    assert.equal((await db.query("select count(*)::int as n from members")).rows[0].n,memberCount);
    assert.equal((await db.query("select count(*)::int as n from members where version=2")).rows[0].n,1);
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
    assert((await request("/Sponsorship.php")).html.includes("clb@example.com"));
    assert(!(await request("/")).html.includes(secret));
    const blankPage = await request("/admin/settings.php");
    const blank = {...settingsForm,version:"2",token:field(blankPage.html,"token"),email:"",phone:"",facebook:""};
    assert.equal((await request("/admin/settings.php",blank)).status,302);
    for (const route of ["/","/contact.php","/Blog.php","/Sponsorship.php"]) {
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
    await assert.rejects(run(php, ["-r","require 'app/Models/SiteRepository.php'; site_posts();"], {cwd:root,env:{...env,APP_ENV:"production",SUPABASE_URL:"",SUPABASE_SECRET_KEY:""}}));
    console.log("Authorization, account revocation, outage handling and production config required passed");

    if (process.env.UI_PLAYWRIGHT_MODULE) {
      const output = await run(process.execPath, ["tests/ui-smoke.cjs"], {cwd:root,env:{...env,UI_TEST_BASE_URL:base,UI_TEST_ADMIN_PASSWORD:password},maxBuffer:1024*1024});
      process.stdout.write(output.stdout);
    }
    assert.equal(phpErrors,"","PHP runtime errors");
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
