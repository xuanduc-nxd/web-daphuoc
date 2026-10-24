import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import { fileTypeFromFile } from 'file-type';
import { imageSize } from 'image-size';
import { StorageError, ConflictError, InputError, imageName, type Row } from '../core/config.ts';
import { supabaseConfigured, supabaseRequest, supabaseJson, select, uploadFile } from '../models/supabase.ts';
import { type Form, type Session, file, files } from '../core/http.ts';

export async function adminAccount(id: string): Promise<Row | null> {
  if (!supabaseConfigured()) return null;
  return (await select('admin_users',{id:`eq.${id}`,disabled:'eq.false'},'id.asc','id,username,display_name,role,disabled,version',1))[0] || null;
}
export async function requireAdmin(session: Session, owner = false): Promise<boolean> {
  const data = session.data;
  if (!data.admin_id) return false;
  if (Date.now() - Number(data.admin_last_active || 0) > 3600_000) {
    delete data.admin_id; delete data.admin_version; delete data.admin_role; delete data.admin_username; delete data.admin_last_active;
    return false;
  }
  const account = await adminAccount(data.admin_id);
  if (!account || !['admin','editor'].includes(account.role) || Number(account.version) !== Number(data.admin_version)) { session.destroy(); return false; }
  data.admin_role=account.role;
  data.admin_username=account.display_name || account.username;
  data.admin_last_active=Date.now();
  return !owner || account.role === 'admin';
}
export async function authenticate(username: string, password: string, remoteAddress: string): Promise<Row | null> {
  if (!supabaseConfigured()) return null;
  username=username.trim().toLowerCase();
  const attemptKey=createHmac('sha256',process.env.SUPABASE_SECRET_KEY!).update(`${username}|${remoteAddress}`).digest('hex');
  const response=await supabaseRequest('POST','/rest/v1/rpc/consume_admin_login_attempt',JSON.stringify({attempt_key:attemptKey}));
  if (!response.ok) throw new StorageError('Không kiểm tra được đăng nhập. Kiểm tra SQL khởi tạo Supabase.');
  if (await response.json() !== true) throw new ConflictError('Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.');
  const validUsername=/^[a-z0-9_.-]{3,64}$/.test(username);
  const row=validUsername ? (await select('admin_users',{username:`eq.${username}`,disabled:'eq.false'},'id.asc','*',1))[0] : null;
  const hash=row?.password_hash || '$2y$12$8JrPkXaYP2KKlxvkEsPTDOgsND0EM6ytphEjcoPHU86DE.pWSAJ4q';
  const valid=Buffer.byteLength(password,'utf8') <= 72 && await bcrypt.compare(password,hash);
  if (!row || !valid || !['admin','editor'].includes(row.role)) return null;
  await supabaseJson('DELETE',`/rest/v1/admin_login_attempts?id=eq.${attemptKey}`);
  delete row.password_hash;
  return row;
}

const allowed: Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'};
async function validateUpload(upload: NonNullable<ReturnType<typeof file>>): Promise<{bytes:Buffer,mime:string,extension:string}> {
  if (upload.size > 20*1024*1024) throw new InputError('Ảnh vượt quá 20 MB.');
  const detected=await fileTypeFromFile(upload.path);
  const mime=detected?.mime || '';
  if (!allowed[mime] || mime !== upload.mime) throw new InputError('Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF.');
  const bytes=readFileSync(upload.path);
  try { const dimensions=imageSize(bytes); if (!dimensions.width || !dimensions.height) throw new Error('No dimensions'); }
  catch { throw new InputError('Ảnh không hợp lệ.'); }
  return {bytes,mime,extension:allowed[mime]};
}
export async function uploadedImage(form: Form, prefix: string): Promise<string | null> {
  const upload=file(form,'image');
  if (!upload) return null;
  const valid=await validateUpload(upload);
  return uploadFile(imageName(prefix,valid.extension),valid.mime,valid.bytes);
}
export async function uploadedImages(form: Form, field: string, prefix: string, remaining: number): Promise<string[]> {
  const list=files(form,field);
  if (list.length > remaining) throw new InputError('Album có tối đa 20 ảnh.');
  const validated=await Promise.all(list.map(validateUpload));
  const urls=[];
  for (const valid of validated) urls.push(await uploadFile(imageName(prefix,valid.extension),valid.mime,valid.bytes));
  return urls;
}
