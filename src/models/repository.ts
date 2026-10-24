import { resolve } from 'node:path';
import { ROOT, StorageError, InputError, production, type Row, type Table } from '../core/config.ts';
import { notificationVisible } from '../core/content.ts';
import { defaultSettings, legacyDatasets } from './legacy.ts';
import { supabaseConfigured, select, insert, change } from './supabase.ts';

export const uploadDir = () => process.env.APP_UPLOAD_DIR || resolve(ROOT, 'uploads');
export function previewMode(): boolean {
  if (supabaseConfigured()) return false;
  if (production()) throw new StorageError('Website production cần cấu hình Supabase.');
  const flag = process.env.APP_PREVIEW_MODE;
  if (flag !== undefined && !['1','true'].includes(flag.toLowerCase())) throw new StorageError('Chưa cấu hình Supabase.');
  return true;
}
let previewCache: Record<Table, Row[]> | undefined;
function previewRows(table: Table): Row[] {
  previewCache ??= legacyDatasets();
  return (previewCache[table] || []).map(row => ({ ...row, version: 1 }));
}
function sortNotifications(rows: Row[]): Row[] { return rows.filter(notificationVisible).sort((a,b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || String(b.date || '').localeCompare(String(a.date || '')) || String(a.id).localeCompare(String(b.id))); }
export async function posts(kind?: string, publishedOnly = false): Promise<Row[]> {
  if (kind && !['activity','notification','blog'].includes(kind)) throw new InputError('Loại bài không hợp lệ.');
  let rows: Row[];
  if (previewMode()) rows = previewRows('posts').filter(row => (!kind || row.kind === kind) && (!publishedOnly || row.status === 'published')).sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')) || String(a.id).localeCompare(String(b.id)));
  else rows = await select('posts', { ...(kind ? {kind:`eq.${kind}`} : {}), ...(publishedOnly ? {status:'eq.published'} : {}) }, 'date.desc.nullslast,id.asc');
  if (publishedOnly && !kind) rows = rows.filter(row => row.kind !== 'notification' || notificationVisible(row));
  return kind === 'notification' && publishedOnly ? sortNotifications(rows) : rows;
}
export async function record(table: Table, id: string, filters: Record<string,string> = {}): Promise<Row | null> {
  if (!id) return null;
  if (previewMode()) return previewRows(table).find(row => row.id === id && Object.entries(filters).every(([key,value]) => row[key] === value)) || null;
  return (await select(table, { id: `eq.${id}`, ...Object.fromEntries(Object.entries(filters).map(([key,value]) => [key,`eq.${value}`])) }, 'id.asc','*',1))[0] || null;
}
export async function publicPost(kind: string, id: string): Promise<Row | null> {
  if (!['activity','notification','blog'].includes(kind)) return null;
  let row = await record('posts', id, {kind,status:'published'});
  if (!row) {
    if (previewMode()) row = (await posts(kind,true)).find(item => item.legacy_id === id) || null;
    else row = (await select('posts', {legacy_id:`eq.${id}`,kind:`eq.${kind}`,status:'eq.published'},'id.asc','*',1))[0] || null;
  }
  return row && kind === 'notification' && !notificationVisible(row) ? null : row;
}
export async function members(type?: string): Promise<Row[]> {
  if (type && !['board','student'].includes(type)) throw new InputError('Nhóm hồ sơ không hợp lệ.');
  return previewMode() ? previewRows('members').filter(row => !type || row.type === type) : select('members', type ? {type:`eq.${type}`} : {}, 'sort_order.asc,id.asc');
}
export async function sponsors(): Promise<Row[]> { return previewMode() ? previewRows('sponsors') : select('sponsors',{},'sort_order.asc,id.asc'); }
export async function aboutSections(): Promise<Row[]> { return previewMode() ? previewRows('about_sections') : select('about_sections',{},'sort_order.asc,id.asc'); }
export async function settings(): Promise<Row> {
  const row = await record('settings','main');
  if (!row) throw new StorageError('Chưa nhập dữ liệu ban đầu. Chạy công cụ migrate-supabase.');
  return { ...defaultSettings(), ...row };
}
export async function collection(name: string): Promise<Row[]> {
  const kinds: Record<string,string> = { activities:'activity', notifications:'notification', blog:'blog' };
  if (kinds[name]) return posts(kinds[name],true);
  if (name === 'sponsors') return sponsors();
  if (name === 'abouts') return aboutSections();
  throw new InputError('Danh sách nội dung không hợp lệ.');
}
export async function save(table: Table, row: Row, version?: number): Promise<Row> {
  if (previewMode()) throw new StorageError('Bản xem trước chỉ đọc. Cấu hình Supabase để lưu nội dung.');
  const copy = { ...row };
  delete copy.version; delete copy.created_at; delete copy.updated_at;
  if (version === undefined) return insert(table,copy);
  const id = String(copy.id || ''); delete copy.id;
  return change(table,id,version,copy);
}
export async function remove(table: Table, id: string, version: number): Promise<void> {
  if (previewMode()) throw new StorageError('Bản xem trước chỉ đọc.');
  await change(table,id,version,null);
}
