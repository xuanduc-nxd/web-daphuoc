import { StorageError, type Table } from '../src/core/config.ts';
import { record } from '../src/models/repository.ts';
import { supabaseConfigured, supabaseRequest, select } from '../src/models/supabase.ts';

try {
  if (!supabaseConfigured()) throw new StorageError('Chưa cấu hình Supabase.');
  console.log(`Supabase: ${new URL(process.env.SUPABASE_URL!).hostname}`);
  for (const table of ['posts','members','sponsors','about_sections','settings','admin_users'] as Table[]) {
    const rows=await select(table,{},'id.asc','id,version');
    console.log(`${table}: ${rows.length} bản ghi.`);
  }
  const missingMemberColumns: string[] = [];
  for (const column of ['direction','support_needs','expertise']) {
    const response = await supabaseRequest('GET',`/rest/v1/members?select=${column}&limit=1`);
    if (response.ok) continue;
    let code = '';
    try { const error = await response.json() as {code?: unknown}; if (typeof error.code === 'string') code = error.code; } catch {}
    if (response.status === 400 && ['42703','PGRST204'].includes(code)) missingMemberColumns.push(column);
    else throw new StorageError(`Không kiểm tra được cột members.${column} (HTTP ${response.status}).`);
  }
  if (missingMemberColumns.length) throw new StorageError(`Bảng members thiếu cột ${missingMemberColumns.join(', ')}. Chạy file supabase-student-fields.sql trong Supabase SQL Editor.`);
  const missingColumns: string[] = [];
  for (const column of ['gallery','pinned','expires_on']) {
    const response = await supabaseRequest('GET',`/rest/v1/posts?select=${column}&limit=1`);
    if (response.ok) continue;
    let code = '';
    try { const error = await response.json() as {code?: unknown}; if (typeof error.code === 'string') code = error.code; } catch {}
    if (response.status === 400 && ['42703','PGRST204'].includes(code)) missingColumns.push(column);
    else throw new StorageError(`Không kiểm tra được cột posts.${column} (HTTP ${response.status}).`);
  }
  if (missingColumns.length) throw new StorageError(`Bảng posts thiếu cột ${missingColumns.join(', ')}. Chạy file supabase-posts-columns.sql trong Supabase SQL Editor.`);
  if (!await record('settings','main')) throw new StorageError('Chưa nhập cài đặt ban đầu. Chạy migrate --apply.');
  if (!(await select('admin_users',{role:'eq.admin',disabled:'eq.false'},'id.asc','id',1)).length) console.log('Chưa có quản trị viên. Chạy scripts/create-admin.ps1.');
  console.log('Đọc dữ liệu thành công. Kiểm tra thêm đăng nhập, đăng bài và tải ảnh trên website.');
} catch(error) {console.error(error instanceof Error?error.message:error);process.exitCode=1;}
