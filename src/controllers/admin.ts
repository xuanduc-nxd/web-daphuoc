import { InputError, ConflictError, adminDateValue, imageValue, randomId, today, type Row, type Table } from '../core/config.ts';
import { activityGallery, notificationVisible } from '../core/content.ts';
import { aboutSections, members, posts, record, remove, save, settings, sponsors } from '../models/repository.ts';
import { authenticate, requireAdmin, uploadedImage, uploadedImages } from '../services/admin.ts';
import { supabaseConfigured } from '../models/supabase.ts';
import { type Form, type Session, value, values, checked } from '../core/http.ts';
import { adminFrame, noAccessView, loginView, dashboardView, postsView, postEditView, teamView, teamEditView, contentView, contentEditView, settingsView } from '../views/admin/pages.ts';

export type RouteResult = {html?:string,status?:number,location?:string};
const scalar = (form:Form,name:string) => value(form,name).trim();
const integer = (form:Form,name:string) => Number.parseInt(value(form,name),10) || 0;
const flashRedirect = (session:Session,location:string,message='',type='success'):RouteResult => { if (message) session.flash(message,type); return {location}; };
const errorMessage = (error:unknown):string => error instanceof Error ? error.message : 'Không hoàn tất được thao tác.';
function fields(row:Row,allowed:string[]):Row { return Object.fromEntries(allowed.filter(key=>row[key] !== undefined).map(key=>[key,row[key]])); }
function view(page:string,title:string,body:string,session:Session,status=200):RouteResult { return {html:adminFrame(page,title,body,session,session.consumeFlash()),status}; }
const noAccess=(session:Session,page:string):RouteResult => view(page,'Không có quyền truy cập',noAccessView(),session,403);

export async function adminRoute(page:string,url:URL,method:string,form:Form,session:Session,remoteAddress:string):Promise<RouteResult> {
  if (page==='logout.php') { session.destroy(); return {location:'login.php'}; }
  if (page==='login.php') {
    if (await requireAdmin(session)) return {location:'index.php'};
    const configured=supabaseConfigured();
    let error='';
    if (method==='POST') {
      if (!session.check(form)) error='Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang.';
      else if (!configured) error='Cấu hình Supabase và tạo tài khoản quản trị trước khi đăng nhập.';
      else {
        try {
          const account=await authenticate(value(form,'username'),value(form,'password'),remoteAddress);
          if (account) {
            session.regenerate();
            session.data={admin_id:account.id,admin_version:Number(account.version),admin_role:account.role,admin_username:account.display_name||account.username,admin_last_active:Date.now()};
            return {location:'index.php'};
          }
          error='Tên đăng nhập hoặc mật khẩu không đúng.';
        } catch (failure) { error=errorMessage(failure); }
      }
    }
    return {html:loginView(configured,error,session.token())};
  }
  if (!await requireAdmin(session)) return {location:'login.php'};
  const ownerPages=new Set(['content.php','content-edit.php','settings.php']);
  if (ownerPages.has(page) && session.data.admin_role!=='admin') return noAccess(session,page);

  switch (page) {
    case 'index.php': {
      const [allPosts,team,site]=await Promise.all([posts(),members(),settings()]);
      return view(page,'Tổng quan',dashboardView(allPosts,team,site,session),session);
    }
    case 'posts.php': {
      const kind=['activity','notification','blog'].includes(url.searchParams.get('kind')||'') ? url.searchParams.get('kind')! : null;
      return view(page,'Bài viết',postsView(await posts(kind || undefined),kind,session),session);
    }
    case 'post-edit.php': {
      const id=(url.searchParams.get('id') || value(form,'id')).trim();
      const existing=id ? await record('posts',id) : null;
      if (id && !existing) return flashRedirect(session,'posts.php','Không tìm thấy bài viết.','error');
      const initialKind=['activity','notification','blog'].includes(url.searchParams.get('kind')||'') ? url.searchParams.get('kind') : '';
      const post:Row=existing ? {...existing} : {id:'',kind:initialKind,title:'',excerpt:'',content:'',content_format:'plain',image:'',gallery:[],author:'CLB Golf Đa Phước',role:'CLB Golf Đa Phước',date:today(),status:'draft',pinned:false,expires_on:null,version:1};
      let error='',removeImage=false;
      if (method==='POST') {
        if (!session.check(form)) return flashRedirect(session,'posts.php','Phiên biểu mẫu đã hết hiệu lực. Mở lại trang đăng bài rồi thử lại.','error');
        post.kind=existing?.kind || scalar(form,'kind');
        for (const field of ['title','excerpt','content','author','role']) post[field]=scalar(form,field);
        post.date=scalar(form,'date'); post.status=value(form,'status')==='published'?'published':'draft';
        if (post.kind==='notification') { post.pinned=checked(form,'pinned'); post.expires_on=scalar(form,'expires_on'); }
        post.version=integer(form,'version'); removeImage=Boolean(existing && checked(form,'remove_image'));
        try {
          if (!['activity','notification','blog'].includes(post.kind)) throw new InputError('Chọn loại bài hợp lệ.');
          if (!post.title || [...post.title].length>500) throw new InputError('Tiêu đề cần từ 1 đến 500 ký tự.');
          if ([...post.author].length>200 || [...post.role].length>200 || Buffer.byteLength(post.content,'utf8')>1_000_000) throw new InputError('Thông tin bài viết quá dài.');
          if (existing && post.version!==Number(existing.version)) throw new ConflictError('Nội dung đã được người khác sửa. Tải lại trang để xem bản mới nhất.');
          const date=adminDateValue(post.date);
          if (post.kind==='activity') {
            const available=activityGallery(existing || {});
            const kept=values(form,'gallery_keep[]'),positions=values(form,'gallery_position[]'),removed=values(form,'gallery_remove[]');
            if (kept.length!==positions.length || (existing && (kept.length!==available.length || new Set(kept).size!==available.length))) throw new InputError('Danh sách ảnh hiện có không đầy đủ.');
            const ordered=new Map<string,{position:number,index:number}>();
            kept.forEach((url,index)=>{
              const position=positions[index];
              if (!available.includes(url) || !/^[1-9]\d?$/.test(position) || Number(position)>20) throw new InputError('Album chứa ảnh không hợp lệ.');
              if (!removed.includes(url) && !ordered.has(url)) ordered.set(url,{position:Number(position),index});
            });
            const gallery=[...ordered].sort((a,b)=>a[1].position-b[1].position || a[1].index-b[1].index).map(([url])=>url);
            const newImages=await uploadedImages(form,'gallery[]','activity',20-gallery.length);
            gallery.push(...newImages);
            let cover=value(form,'gallery_cover');
            const newMatch=cover.match(/^new:(\d{1,2})$/);
            if (newMatch) cover=newImages[Number(newMatch[1])] || '';
            post.gallery=gallery;
            post.image=gallery.includes(cover) ? cover : gallery.includes(existing?.image) ? existing!.image : gallery[0] || '';
          } else {
            const uploaded=await uploadedImage(form,'post');
            if (uploaded) {post.image=uploaded; removeImage=false;}
            else if (removeImage) post.image='';
          }
          if (post.kind==='notification') post.expires_on=adminDateValue(String(post.expires_on || ''));
          const payload=fields(post,['id','kind','title','excerpt','content','content_format','image','gallery','author','role','status','pinned','expires_on']);
          payload.id=existing ? id : randomId('post'); payload.date=date;
          await save('posts',payload,existing ? post.version : undefined);
          return flashRedirect(session,`posts.php?kind=${post.kind}`,'Đã lưu bài viết.');
        } catch (failure) {
          error=errorMessage(failure);
          if (post.kind==='activity') {post.gallery=existing?.gallery || []; post.image=existing?.image || '';}
        }
      }
      return view(page,existing?'Sửa bài viết':'Đăng bài mới',postEditView(post,existing,error,session,removeImage),session);
    }
    case 'post-status.php': {
      if (method!=='POST') return {location:'posts.php'};
      if (!session.check(form,'status')) return flashRedirect(session,'posts.php','Yêu cầu không hợp lệ.','error');
      const id=scalar(form,'id'),post=await record('posts',id);
      if (!post) return flashRedirect(session,'posts.php','Không tìm thấy bài viết.','error');
      try {
        const status=post.status==='published'?'draft':'published';
        await save('posts',{id,status},integer(form,'version'));
        const message=status==='draft'?'Đã ẩn bài viết khỏi website.':status==='published'&&post.kind==='notification'&&!notificationVisible(post)?'Thông báo đã xuất bản nhưng đã hết hạn. Hãy gia hạn để hiển thị công khai.':'Đã hiển thị bài viết trên website.';
        return flashRedirect(session,`posts.php?kind=${post.kind}`,message);
      } catch (failure) {return flashRedirect(session,'posts.php',errorMessage(failure),'error');}
    }
    case 'post-delete.php': {
      if (method!=='POST') return {location:'posts.php'};
      if (!session.check(form)) return flashRedirect(session,'posts.php','Yêu cầu không hợp lệ.','error');
      try { await remove('posts',scalar(form,'id'),integer(form,'version')); return flashRedirect(session,'posts.php','Đã xóa bài viết.'); }
      catch (failure) { return flashRedirect(session,'posts.php',errorMessage(failure),'error'); }
    }
    case 'team.php': {
      const type=url.searchParams.get('type')==='student'?'student':'board';
      return view(page,type==='student'?'Sinh viên':'Ban điều hành',teamView(await members(type),type,session),session);
    }
    case 'team-edit.php': {
      const id=(url.searchParams.get('id') || value(form,'id')).trim(),existing=id ? await record('members',id) : null;
      if (id && !existing) return flashRedirect(session,'team.php','Không tìm thấy hồ sơ.','error');
      const type=existing?.type || ((url.searchParams.get('type') || value(form,'type'))==='student'?'student':'board');
      const row:Row=existing?{...existing}:{id:'',type,name:'',position:'Ban điều hành',school:'',major:'',detail:'',direction:'',support_needs:'',expertise:'',image:'',sort_order:0,version:1};
      let error='';
      if (method==='POST') {
        if (!session.check(form,'team')) return flashRedirect(session,`team.php?type=${type}`,'Yêu cầu không hợp lệ.','error');
        row.name=scalar(form,'name'); row.version=integer(form,'version');
        if (type==='board') {row.detail=scalar(form,'detail'); row.position=value(form,'position')==='Ban cố vấn'?'Ban cố vấn':'Ban điều hành';}
        else for (const field of ['school','major','direction','support_needs','expertise']) row[field]=scalar(form,field);
        try {
          if (!row.name || [...row.name].length>200) throw new InputError('Họ tên cần từ 1 đến 200 ký tự.');
          if (type==='student') {
            if (!row.school || !row.major || !row.direction) throw new InputError('Nhập trường, ngành học và định hướng của sinh viên.');
            if ([...row.school].length>200 || [...row.major].length>200 || [...row.direction].length>3000 || [...row.support_needs].length>3000 || [...row.expertise].length>200) throw new InputError('Thông tin sinh viên quá dài.');
          } else {const uploaded=await uploadedImage(form,'team'); if (uploaded) row.image=uploaded; else if (checked(form,'remove_image')) row.image='';}
          const payload=fields(row,['id','type','name','position','school','major','detail','direction','support_needs','expertise','image','sort_order']);
          payload.id=existing?id:randomId('team');
          if (!existing) {const all=await members();payload.sort_order=all.length?Math.max(...all.map(item=>Number(item.sort_order||0)))+1:0;}
          await save('members',payload,existing?row.version:undefined);
          return flashRedirect(session,`team.php?type=${type}`,'Đã lưu hồ sơ.');
        } catch (failure) {error=errorMessage(failure);}
      }
      return view(page,existing?'Sửa hồ sơ':'Thêm hồ sơ',teamEditView(row,existing,type,error,session),session);
    }
    case 'team-delete.php': {
      if (method!=='POST') return {location:'team.php'};
      if (!session.check(form,'team')) return flashRedirect(session,'team.php','Yêu cầu không hợp lệ.','error');
      const id=scalar(form,'id'),row=await record('members',id);
      if (!row) return flashRedirect(session,'team.php','Không tìm thấy hồ sơ.','error');
      try {await remove('members',id,integer(form,'version'));return flashRedirect(session,`team.php?type=${row.type}`,'Đã xóa hồ sơ.');}
      catch (failure) {return flashRedirect(session,`team.php?type=${row.type}`,errorMessage(failure),'error');}
    }
    case 'content.php': {
      const type=url.searchParams.get('type')==='about'?'about':'sponsor',table:Table=type==='about'?'about_sections':'sponsors';
      if (method==='POST') {
        if (!session.check(form)) return flashRedirect(session,`content.php?type=${type}`,'Yêu cầu không hợp lệ.','error');
        try {await remove(table,scalar(form,'id'),integer(form,'version'));return flashRedirect(session,`content.php?type=${type}`,'Đã xóa nội dung.');}
        catch (failure) {return flashRedirect(session,`content.php?type=${type}`,errorMessage(failure),'error');}
      }
      return view(page,type==='about'?'Giới thiệu CLB':'Tri ân & tài trợ',contentView(type==='about'?await aboutSections():await sponsors(),type,session),session);
    }
    case 'content-edit.php': {
      const type=url.searchParams.get('type')==='about'?'about':'sponsor',table:Table=type==='about'?'about_sections':'sponsors';
      const id=(url.searchParams.get('id') || value(form,'id')).trim(),existing=id?await record(table,id):null;
      if (id && !existing) return flashRedirect(session,`content.php?type=${type}`,'Không tìm thấy nội dung.','error');
      const row:Row=existing?{...existing}:type==='about'?{id:'',section_key:'principle',category:'',content:'',sort_order:0,version:1}:{id:'',title:'',excerpt:'',content:'',image:'',date:today(),sort_order:0,version:1};
      let error='';
      if (method==='POST') {
        if (!session.check(form)) return flashRedirect(session,`content.php?type=${type}`,'Yêu cầu không hợp lệ.','error');
        for (const field of type==='about'?['section_key','category','content']:['title','excerpt','content','date']) row[field]=scalar(form,field);
        row.sort_order=integer(form,'sort_order');row.version=integer(form,'version');
        try {
          let date:string|null=null;
          if (type==='about') {if (!['principle','scope','target','method'].includes(row.section_key) || !row.content) throw new InputError('Chọn mục và nhập nội dung giới thiệu.');}
          else {if (!row.title || [...row.title].length>500) throw new InputError('Tên cần từ 1 đến 500 ký tự.');date=adminDateValue(row.date);const uploaded=await uploadedImage(form,'sponsor');if(uploaded)row.image=uploaded;}
          if (row.sort_order<0 || row.sort_order>100000) throw new InputError('Thứ tự cần từ 0 đến 100000.');
          const payload=fields(row,type==='about'?['id','section_key','category','content','sort_order']:['id','title','excerpt','content','image','date','sort_order']);
          payload.id=existing?id:randomId(type);if(type==='sponsor')payload.date=date;
          await save(table,payload,existing?row.version:undefined);
          return flashRedirect(session,`content.php?type=${type}`,'Đã lưu nội dung.');
        } catch (failure) {error=errorMessage(failure);}
      }
      return view(page,existing?'Sửa nội dung':'Thêm nội dung',contentEditView(row,existing,type,error,session),session);
    }
    case 'settings.php': {
      const site=await settings();let error='';
      if (method==='POST') {
        if (!session.check(form)) return flashRedirect(session,'settings.php','Yêu cầu không hợp lệ.','error');
        site.version=integer(form,'version');
        for (const field of ['site_name','notice','contact','phone','email','location','facebook','instagram','tiktok','threads','hero_image']) site[field]=scalar(form,field);
        try {
          if (!site.site_name || [...site.site_name].length>80) throw new InputError('Tên website cần từ 1 đến 80 ký tự.');
          if (site.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)) throw new InputError('Email không hợp lệ.');
          if (site.phone && !/^[0-9+(). \-]{6,30}$/.test(site.phone)) throw new InputError('Số điện thoại không hợp lệ.');
          for (const field of ['facebook','instagram','tiktok','threads']) if (site[field] && (!URL.canParse(site[field]) || new URL(site[field]).protocol!=='https:')) throw new InputError('Liên kết mạng xã hội cần bắt đầu bằng https://.');
          site.hero_image=imageValue(site.hero_image);
          const uploaded=await uploadedImage(form,'hero');if(uploaded)site.hero_image=uploaded;
          await save('settings',fields(site,['id','site_name','notice','contact','phone','email','location','facebook','instagram','tiktok','threads','hero_image']),site.version);
          return flashRedirect(session,'settings.php','Đã cập nhật thông tin website.');
        } catch (failure) {error=errorMessage(failure);}
      }
      return view(page,'Thông tin website',settingsView(site,error,session),session);
    }
    default: return {status:404,html:'Không tìm thấy trang.'};
  }
}
