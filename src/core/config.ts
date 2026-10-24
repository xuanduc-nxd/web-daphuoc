import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export const ROOT = resolve(import.meta.dirname, '../..');

export function loadEnv(path = resolve(ROOT, '.env')): void {
  let source = '';
  try { source = readFileSync(path, 'utf8'); } catch { return; }
  for (const line of source.split(/\r?\n/)) {
    const match = line.trim().match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
}
loadEnv();

export type Row = Record<string, any>;
export type Table = 'posts' | 'members' | 'sponsors' | 'about_sections' | 'settings' | 'admin_users';
export class StorageError extends Error {}
export class ConflictError extends Error {}
export class InputError extends Error {}
export class RateLimitError extends InputError {}

export const production = () => process.env.APP_ENV === 'production' || Boolean(process.env.RENDER);
export const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const randomId = (prefix: string) => `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
export const imageName = (prefix: string, extension: string) => `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 24)}.${extension}`;

export function dateValue(value: string): string | null {
  const text = String(value || '').trim();
  if (!text) return null;
  let match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) return validateDate(Number(match[3]), Number(match[2]), Number(match[1]));
  match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return validateDate(Number(match[1]), Number(match[2]), Number(match[3]));
  const parsed = new Date(text.replace(/\s*\([^)]*\)\s*$/, ''));
  if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString().slice(0, 10);
  throw new InputError('Ngày không hợp lệ. Dùng định dạng dd/mm/yyyy.');
}
function validateDate(year: number, month: number, day: number): string {
  const result = new Date(Date.UTC(year, month - 1, day));
  if (result.getUTCFullYear() !== year || result.getUTCMonth() + 1 !== month || result.getUTCDate() !== day) throw new InputError('Ngày không hợp lệ. Dùng định dạng dd/mm/yyyy.');
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}
export function adminDateValue(value: string): string | null {
  if (value.trim() && !/^(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})$/.test(value.trim())) throw new InputError('Ngày cần đúng định dạng dd/mm/yyyy.');
  return dateValue(value);
}
export function imageValue(value: string): string {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text) && URL.canParse(text)) return text;
  if (/^[a-zA-Z0-9_][a-zA-Z0-9_./?=&%+-]*$/.test(text) && !text.includes('..')) return text;
  throw new InputError('Đường dẫn ảnh không hợp lệ.');
}
