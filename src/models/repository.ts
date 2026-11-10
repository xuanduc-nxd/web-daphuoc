import { resolve } from 'node:path';
import { ROOT, StorageError, InputError, production, type Row, type Table } from '../core/config.ts';
import { legacyDatasets } from './legacy.ts';
import { supabaseConfigured, select, insert, change } from './supabase.ts';
import { posts, publicPost } from './post.model.ts';
import { members, publicStudents } from './member.model.ts';
import { sponsors } from './sponsor.model.ts';
import { aboutSections } from './about.model.ts';
import { settings } from './setting.model.ts';

export { posts, publicPost, members, publicStudents, sponsors, aboutSections, settings };

export const uploadDir = (): string => process.env.APP_UPLOAD_DIR || resolve(ROOT, 'uploads');

export function previewMode(): boolean {
  if (supabaseConfigured()) return false;
  if (production()) throw new StorageError('Website production cần cấu hình Supabase.');
  const flag = process.env.APP_PREVIEW_MODE;
  if (flag !== undefined && !['1', 'true'].includes(flag.toLowerCase())) {
    throw new StorageError('Chưa cấu hình Supabase.');
  }
  return true;
}

let previewCache: Record<Table, Row[]> | undefined;

export function previewRows(table: Table): Row[] {
  previewCache ??= legacyDatasets();
  return (previewCache[table] || []).map(row => ({ ...row, version: 1 }));
}

export async function record(
  table: Table,
  id: string,
  filters: Record<string, string> = {},
): Promise<Row | null> {
  if (!id) return null;
  if (previewMode()) {
    return (
      previewRows(table).find(
        row =>
          row.id === id &&
          Object.entries(filters).every(([key, value]) => row[key] === value),
      ) || null
    );
  }
  return (
    (
      await select(
        table,
        {
          id: `eq.${id}`,
          ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, `eq.${value}`])),
        },
        'id.asc',
        '*',
        1,
      )
    )[0] || null
  );
}

export async function collection(name: string): Promise<Row[]> {
  const kinds: Record<string, string> = {
    activities: 'activity',
    notifications: 'notification',
    blog: 'blog',
  };
  if (kinds[name]) return posts(kinds[name], true);
  if (name === 'sponsors') return sponsors();
  if (name === 'abouts') return aboutSections();
  throw new InputError('Danh sách nội dung không hợp lệ.');
}

export async function save(table: Table, row: Row, version?: number): Promise<Row> {
  if (previewMode()) {
    throw new StorageError('Bản xem trước chỉ đọc. Cấu hình Supabase để lưu nội dung.');
  }
  const copy = { ...row };
  delete copy.version;
  delete copy.created_at;
  delete copy.updated_at;
  if (version === undefined) return insert(table, copy);
  const id = String(copy.id || '');
  delete copy.id;
  return change(table, id, version, copy);
}

export async function remove(table: Table, id: string, version: number): Promise<void> {
  if (previewMode()) throw new StorageError('Bản xem trước chỉ đọc.');
  await change(table, id, version, null);
}
