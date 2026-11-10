import { StorageError, type Row } from '../core/config.ts';
import { defaultSettings } from './legacy.ts';
import { record } from './repository.ts';

export async function settings(): Promise<Row> {
  const row = await record('settings', 'main');
  if (!row) {
    throw new StorageError('Chưa nhập dữ liệu ban đầu. Chạy công cụ migrate-supabase.');
  }
  return { ...defaultSettings(), ...row };
}
