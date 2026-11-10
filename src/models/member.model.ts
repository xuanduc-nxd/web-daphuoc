import { InputError, type Row } from '../core/config.ts';
import { select } from './supabase.ts';
import { previewMode, previewRows } from './repository.ts';

export async function members(type?: string): Promise<Row[]> {
  if (type && !['board', 'student'].includes(type)) {
    throw new InputError('Nhóm hồ sơ không hợp lệ.');
  }

  if (previewMode()) {
    return previewRows('members').filter(row => !type || row.type === type);
  }

  return select('members', type ? { type: `eq.${type}` } : {}, 'sort_order.asc,id.asc');
}

export async function publicStudents(): Promise<Row[]> {
  if (previewMode()) {
    return previewRows('members')
      .filter(row => row.type === 'student')
      .sort(
        (a, b) =>
          Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
          String(a.id).localeCompare(String(b.id)),
      )
      .map(row => ({ name: row.name, direction: row.direction }));
  }

  return select('members', { type: 'eq.student' }, 'sort_order.asc,id.asc', 'name,direction');
}
