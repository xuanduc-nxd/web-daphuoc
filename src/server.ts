import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { isIP } from 'node:net';
import { pipeline } from 'node:stream/promises';
import { fileTypeFromFile } from 'file-type';
import { ROOT, InputError, StorageError } from './core/config.ts';
import { uploadDir } from './models/repository.ts';
import { parseForm, Session, sendHtml, redirect, type Form } from './core/http.ts';
import { adminRoute } from './controllers/admin.ts';
import { publicRoute } from './controllers/public.ts';
import { errorPage } from './views/public/components.ts';

const publicRoot=resolve(ROOT,'public');
const mime:Record<string,string>={'.css':'text/css; charset=UTF-8','.js':'text/javascript; charset=UTF-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2','.woff':'font/woff','.ico':'image/x-icon','.svg':'image/svg+xml','.txt':'text/plain; charset=UTF-8'};
const publicPages=new Set(['index.php','About.php','Activities.php','Blog.php','contact.php','detail_blog.php','detail.php','ExecutiveBoard.php','HonorList.php','Notifications.php','Students.php']);
const adminPages=new Set(['index.php','login.php','logout.php','posts.php','post-edit.php','post-status.php','post-delete.php','team.php','team-edit.php','team-delete.php','content.php','content-edit.php','settings.php']);

function clientAddress(req: IncomingMessage): string {
  // Render's Cloudflare edge overwrites this header; direct local traffic uses the socket.
  const cloudflare=req.headers['cf-connecting-ip'];
  if (process.env.RENDER && typeof cloudflare==='string' && isIP(cloudflare)) return cloudflare;
  return req.socket.remoteAddress || 'unknown';
}

async function staticFile(pathname:string,res:ServerResponse):Promise<boolean> {
  const extension=extname(pathname).toLowerCase();
  if (!mime[extension]) return false;
  const path=resolve(publicRoot,`.${pathname}`);
  if (!path.startsWith(publicRoot+sep)) return false;
  let stat;
  try { stat=statSync(path); } catch { return false; }
  if (!stat.isFile()) return false;
  res.writeHead(200,{'Content-Type':mime[extension],'Content-Length':stat.size,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'});
  await pipeline(createReadStream(path),res);
  return true;
}
async function media(url:URL,res:ServerResponse):Promise<void> {
  const filename=url.searchParams.get('file') || '';
  if (!/^[a-zA-Z0-9_-]+\.(?:jpg|png|webp|gif)$/.test(filename)) {res.writeHead(404);res.end();return;}
  const path=resolve(uploadDir(),filename);
  let stat;
  try {stat=statSync(path);} catch {res.writeHead(404);res.end();return;}
  if (!stat.isFile()) {res.writeHead(404);res.end();return;}
  const detected=await fileTypeFromFile(path);
  if (!detected || !['image/jpeg','image/png','image/webp','image/gif'].includes(detected.mime)) {res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':detected.mime,'Content-Length':stat.size,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'});
  await pipeline(createReadStream(path),res);
}
export async function handle(req:IncomingMessage,res:ServerResponse):Promise<void> {
  let form:Form|undefined;
  try {
    const url=new URL(req.url || '/','http://localhost');
    let pathname:string;
    try {pathname=decodeURIComponent(url.pathname);} catch {res.writeHead(400);res.end();return;}
    if (pathname==='/' || pathname==='') pathname='/index.php';
    if (pathname==='/admin' || pathname==='/admin/') pathname='/admin/index.php';
    if (pathname==='/media.php') return await media(url,res);
    if (!pathname.toLowerCase().endsWith('.php')) {
      if (await staticFile(pathname,res)) return;
      res.writeHead(404);res.end();return;
    }
    const method=req.method || 'GET';
    if (!['GET','HEAD','POST'].includes(method)) {res.writeHead(405,{Allow:'GET, HEAD, POST'});res.end();return;}
    const admin=pathname.startsWith('/admin/');
    const page=pathname.slice(admin?7:1);
    if ((admin && !adminPages.has(page)) || (!admin && !publicPages.has(page))) {res.writeHead(404);res.end();return;}
    if (!admin && method==='POST' && page!=='Blog.php') {res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
    if (!admin && method==='POST' && (!String(req.headers['content-type'] || '').startsWith('application/x-www-form-urlencoded') || Number(req.headers['content-length'] || 0)>32*1024)) throw new InputError('Biểu mẫu Blog không hợp lệ hoặc quá lớn.');
    if (admin) {
      const session=Session.open(req);
      form=method==='POST' ? await parseForm(req) : {fields:{},files:{},cleanup:()=>{}};
      const result=await adminRoute(page,url,method,form,session,req.socket.remoteAddress || 'unknown');
      session.save(res,req);
      if (result.location) redirect(res,result.location);
      else sendHtml(res,result.html || '',result.status || 200);
      return;
    }
    if (method==='POST') form=await parseForm(req);
    const result=await publicRoute(page,url,form,clientAddress(req));
    if (result.location) redirect(res,result.location);
    else sendHtml(res,result.html || '',result.status);
  } catch (error) {
    console.error('CLB application error:',error instanceof Error ? error.stack : error);
    if (!res.headersSent) sendHtml(res,errorPage(),error instanceof StorageError ? 503 : error instanceof InputError ? 400 : 500);
    else res.end();
  } finally {form?.cleanup();}
}

const port=Number(process.env.PORT || 10000);
if (!Number.isInteger(port) || port<1 || port>65535) throw new Error('PORT không hợp lệ.');
createServer((req,res)=>{void handle(req,res);}).listen(port,'0.0.0.0',()=>console.log(`CLB Golf Đa Phước listening on ${port}`));
