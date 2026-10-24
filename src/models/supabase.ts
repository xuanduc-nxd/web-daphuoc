import { InputError, StorageError, ConflictError, type Row, type Table } from '../core/config.ts';

export function supabaseConfigured(): boolean {
  const url = (process.env.SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!url && !key) return false;
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new StorageError('Cấu hình Supabase chưa đầy đủ hoặc không hợp lệ.'); }
  const localTest = process.env.APP_ENV === 'test' && parsed.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(parsed.hostname);
  if (!key || (parsed.protocol !== 'https:' && !localTest) || parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname) || /[\r\n]/.test(key) || key.startsWith('sb_publishable_')) {
    throw new StorageError('Cấu hình Supabase chưa đầy đủ hoặc không hợp lệ.');
  }
  return true;
}

export async function supabaseRequest(method: string, path: string, body?: BodyInit, contentType = 'application/json', extraHeaders: Record<string,string> = {}, timeoutMs = 12000): Promise<Response> {
  if (!supabaseConfigured()) throw new StorageError('Chưa cấu hình Supabase.');
  const key = process.env.SUPABASE_SECRET_KEY!.trim();
  const headers: Record<string,string> = { apikey: key, 'Content-Type': contentType, Accept: 'application/json', ...extraHeaders };
  if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;
  try {
    return await fetch(process.env.SUPABASE_URL!.replace(/\/$/, '') + path, { method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    throw new StorageError('Không kết nối được dữ liệu Supabase. Kiểm tra cấu hình và kết nối mạng.');
  }
}

export async function supabaseJson(method: string, path: string, data?: Row | Row[], headers: Record<string,string> = {}): Promise<any[]> {
  const response = await supabaseRequest(method, path, data === undefined ? undefined : JSON.stringify(data), 'application/json', headers);
  if (!response.ok) {
    let code = '', message = '';
    try {
      const error = await response.json() as {code?: unknown; message?: unknown};
      if (typeof error.code === 'string') code = error.code;
      if (typeof error.message === 'string') message = error.message;
    } catch {}
    console.error(`Supabase request failed: HTTP ${response.status}${/^[A-Z0-9]{1,20}$/.test(code) ? `, code ${code}` : ''}`);
    if (path.startsWith('/rest/v1/members') && ['42703','PGRST204'].includes(code) && /\b(direction|support_needs|expertise)\b/i.test(message)) {
      throw new StorageError('Bảng members thiếu cột hồ sơ sinh viên. Chạy file supabase-student-fields.sql trong Supabase SQL Editor.');
    }
    if (path.startsWith('/rest/v1/posts') && ['42703','PGRST204'].includes(code)) {
      throw new StorageError('Bảng posts trên Supabase chưa đủ cột. Chạy file supabase-posts-columns.sql trong SQL Editor rồi thử lại.');
    }
    throw new StorageError(response.status === 409 ? 'Dữ liệu đã tồn tại hoặc bị trùng. Vui lòng kiểm tra lại.' : 'Không kết nối được dữ liệu Supabase. Kiểm tra cấu hình và các bảng đã tạo.');
  }
  const text = await response.text();
  if (!text) return [];
  try {
    const value = JSON.parse(text);
    if (!Array.isArray(value)) throw new Error('not array');
    return value;
  } catch { throw new StorageError('Supabase trả về dữ liệu không hợp lệ.'); }
}

const tables = new Set<Table>(['posts','members','sponsors','about_sections','settings','admin_users']);
function tablePath(table: Table): string { if (!tables.has(table)) throw new InputError('Bảng dữ liệu không hợp lệ.'); return `/rest/v1/${table}`; }
export async function select(table: Table, filters: Record<string,string> = {}, order = 'id.asc', columns = '*', maximum?: number): Promise<Row[]> {
  const rows: Row[] = [];
  let offset = 0;
  for (;;) {
    const limit = maximum === undefined ? 500 : Math.min(500, maximum - rows.length);
    if (limit <= 0) break;
    const query = new URLSearchParams({ ...filters, select: columns, order, offset: String(offset), limit: String(limit) });
    const page = await supabaseJson('GET', `${tablePath(table)}?${query}`);
    if (!page.every(row => row && typeof row === 'object' && !Array.isArray(row))) throw new StorageError('Bản ghi Supabase không hợp lệ.');
    rows.push(...page);
    offset += page.length;
    if (page.length < limit) break;
  }
  return rows;
}
export async function insert(table: Table, row: Row): Promise<Row> {
  const rows = await supabaseJson('POST', tablePath(table), row, { Prefer: 'return=representation' });
  if (!rows[0]) throw new StorageError('Không nhận được bản ghi sau khi lưu.');
  return rows[0];
}
export async function change(table: Table, id: string, version: number, updates: Row | null): Promise<Row> {
  if (!id || version < 1) throw new ConflictError('Bản ghi đã thay đổi. Tải lại trang trước khi thử lại.');
  const query = new URLSearchParams({ id: `eq.${id}`, version: `eq.${version}` });
  const rows = await supabaseJson(updates === null ? 'DELETE' : 'PATCH', `${tablePath(table)}?${query}`, updates === null ? undefined : updates, { Prefer: 'return=representation' });
  if (!rows[0]) throw new ConflictError('Nội dung đã được người khác sửa hoặc xóa. Tải lại trang để xem bản mới nhất.');
  return rows[0];
}
export async function importRows(table: Table, rows: Row[]): Promise<number> {
  let created = 0;
  for (let index = 0; index < rows.length; index += 100) created += (await supabaseJson('POST', `${tablePath(table)}?on_conflict=id`, rows.slice(index,index+100), { Prefer: 'resolution=ignore-duplicates,return=representation' })).length;
  return created;
}
export async function uploadFile(filename: string, mime: string, bytes: Buffer, allowExisting = false): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+\.(?:jpg|png|webp|gif)$/.test(filename) || bytes.length > 20 * 1024 * 1024) throw new StorageError('Ảnh tải lên không hợp lệ hoặc vượt quá 20 MB.');
  const response = await supabaseRequest('POST', `/storage/v1/object/site-media/${encodeURIComponent(filename)}`, new Uint8Array(bytes), mime, { 'x-upsert': 'false' }, 60000);
  if (!response.ok) {
    let error: Row = {};
    try { error = await response.json() as Row; } catch {}
    const duplicate = allowExisting && [400,409].includes(response.status) && (['Duplicate','Asset Already Exists'].includes(String(error.error || '')) || String(error.statusCode) === '409');
    if (!duplicate) {
      const code = /^[a-zA-Z0-9_-]{1,80}$/.test(String(error.code || error.error || '')) ? String(error.code || error.error) : '';
      console.error(`Supabase Storage upload failed: HTTP ${response.status}${code ? `, code ${code}` : ''}`);
      if (response.status === 413 || code === 'EntityTooLarge') throw new StorageError('Supabase từ chối ảnh vì vượt giới hạn dung lượng. Kiểm tra giới hạn của bucket site-media và Storage Settings.');
      throw new StorageError(`Không lưu được ảnh vào Supabase Storage (HTTP ${response.status}${code ? `, mã ${code}` : ''}).`);
    }
  }
  return `${process.env.SUPABASE_URL!.replace(/\/$/, '')}/storage/v1/object/public/site-media/${encodeURIComponent(filename)}`;
}
