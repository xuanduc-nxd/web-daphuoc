import type { IncomingMessage, ServerResponse } from 'node:http';
import { createWriteStream, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import Busboy from 'busboy';
import { ROOT, InputError } from './config.ts';

export interface Upload { field: string; name: string; mime: string; path: string; size: number; }
export interface Form { fields: Record<string, string[]>; files: Record<string, Upload[]>; cleanup: () => void; }
export const value = (form: Form, name: string) => form.fields[name]?.at(-1) || '';
export const values = (form: Form, name: string) => form.fields[name] || [];
export const file = (form: Form, name: string) => form.files[name]?.[0];
export const files = (form: Form, name: string) => form.files[name] || [];
export const checked = (form: Form, name: string) => Boolean(form.fields[name]?.length);
const uploadTemp = resolve(tmpdir(), 'clb-golf-upload');

export async function parseForm(req: IncomingMessage): Promise<Form> {
  const fields: Record<string,string[]> = {};
  const uploads: Record<string,Upload[]> = {};
  const tempPaths: string[] = [];
  const cleanup = () => { for (const path of tempPaths) { try { unlinkSync(path); } catch {} } };
  const type = String(req.headers['content-type'] || '');
  if (type.startsWith('application/x-www-form-urlencoded')) {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 1024 * 1024) throw new InputError('Biểu mẫu quá lớn.'); chunks.push(chunk); }
    for (const [key, val] of new URLSearchParams(Buffer.concat(chunks).toString('utf8'))) (fields[key] ||= []).push(val);
    return { fields, files: uploads, cleanup };
  }
  if (!type.startsWith('multipart/form-data')) throw new InputError('Định dạng biểu mẫu không hợp lệ.');
  if (Number(req.headers['content-length'] || 0) > 420 * 1024 * 1024) throw new InputError('Tổng dung lượng biểu mẫu vượt giới hạn 420 MB.');
  mkdirSync(uploadTemp, {recursive:true});
  const parser = Busboy({ headers: req.headers, limits: { files: 25, fileSize: 20 * 1024 * 1024 + 1, fields: 200, fieldSize: 1024 * 1024, parts: 250 } });
  const tasks: Promise<void>[] = [];
  let failed: Error | undefined;
  parser.on('field', (name, text, info) => { if (info.valueTruncated) failed = new InputError('Trường nội dung quá dài.'); (fields[name] ||= []).push(text); });
  parser.on('file', (name, stream, info) => {
    if (!info.filename) { stream.resume(); return; }
    const path = resolve(uploadTemp, randomBytes(16).toString('hex'));
    tempPaths.push(path);
    const upload:Upload={field:name,name:info.filename || '',mime:info.mimeType,path,size:0};
    (uploads[name] ||= []).push(upload);
    stream.on('data', chunk => { upload.size += chunk.length; });
    // Keep the truncated 20 MB + 1 byte file so the editor can show its own validation error.
    const task = pipeline(stream, createWriteStream(path));
    tasks.push(task);
  });
  parser.on('filesLimit', () => { failed = new InputError('Album có tối đa 20 ảnh.'); });
  parser.on('fieldsLimit', () => { failed = new InputError('Biểu mẫu có quá nhiều trường.'); });
  parser.on('partsLimit', () => { failed = new InputError('Biểu mẫu có quá nhiều phần.'); });
  try {
    await new Promise<void>((resolveDone,reject) => { parser.on('close',resolveDone); parser.on('error',reject); req.pipe(parser); });
    await Promise.all(tasks);
    if (failed) throw failed;
    return {fields,files:uploads,cleanup};
  } catch (error) { cleanup(); throw error; }
}

export interface SessionData { admin_id?: string; admin_version?: number; admin_role?: string; admin_username?: string; admin_last_active?: number; token?: string; team_token?: string; post_status_token?: string; flash?: {message:string,type:string}; }
const sessionDir = process.env.APP_SESSION_DIR || resolve(ROOT, '.runtime', 'sessions');
mkdirSync(sessionDir,{recursive:true});
setInterval(() => {
  for (const name of readdirSync(sessionDir)) {
    if (!/^[a-f0-9]{64}$/.test(name)) continue;
    const path=resolve(sessionDir,name);
    try { if (Date.now()-statSync(path).mtimeMs>24*60*60*1000) unlinkSync(path); } catch {}
  }
},60*60*1000).unref();
export class Session {
  id: string;
  data: SessionData;
  constructor(id: string, data: SessionData) { this.id=id; this.data=data; }
  static open(req: IncomingMessage): Session {
    const cookie = String(req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('clb_sid='));
    const id = cookie?.slice(8) || '';
    if (/^[a-f0-9]{64}$/.test(id)) {
      try { return new Session(id,JSON.parse(readFileSync(resolve(sessionDir,id),'utf8'))); } catch {}
    }
    return new Session(randomBytes(32).toString('hex'),{});
  }
  token(): string { return this.data.token ||= randomBytes(32).toString('hex'); }
  teamToken(): string { return this.data.team_token ||= randomBytes(32).toString('hex'); }
  statusToken(): string { return this.data.post_status_token ||= randomBytes(32).toString('hex'); }
  check(form: Form, kind: 'token'|'team'|'status' = 'token'): boolean {
    const expected = kind === 'team' ? this.teamToken() : kind === 'status' ? this.statusToken() : this.token();
    const submitted = value(form,'token');
    return Boolean(submitted && submitted === expected);
  }
  regenerate(): void { this.destroy(); this.id = randomBytes(32).toString('hex'); }
  destroy(): void { try { unlinkSync(resolve(sessionDir,this.id)); } catch {} this.data = {}; }
  save(res: ServerResponse, req: IncomingMessage): void {
    const tmp = resolve(sessionDir,`${this.id}.${randomBytes(4).toString('hex')}.tmp`);
    writeFileSync(tmp,JSON.stringify(this.data),{mode:0o600}); renameSync(tmp,resolve(sessionDir,this.id));
    const secure = 'encrypted' in req.socket || String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
    res.setHeader('Set-Cookie',`clb_sid=${this.id}; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`);
    res.setHeader('Cache-Control','no-store');
  }
  flash(message:string,type='success'):void { this.data.flash={message,type}; }
  consumeFlash():SessionData['flash'] { const result=this.data.flash; delete this.data.flash; return result; }
}

export function sendHtml(res: ServerResponse, html: string, status = 200): void { res.writeHead(status,{'Content-Type':'text/html; charset=UTF-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(html); }
export function redirect(res: ServerResponse, location: string): void { res.writeHead(302,{Location:location,'Cache-Control':'no-store'}); res.end(); }
