import { InputError, type Row } from '../core/config.ts';
import { select, selectPage } from './supabase.ts';
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
      .map(row => ({ id: row.id, name: row.name, direction: row.direction, school: row.school, major: row.major, expertise: row.expertise }));
  }

  return select('members', { type: 'eq.student' }, 'sort_order.asc,id.asc', 'id,name,direction,school,major,expertise');
}

export async function publicStudentsPage(page = 1, pageSize = 9): Promise<{ rows: Row[]; total: number }> {
  const currentPage = Math.max(1, Math.floor(page));
  const size = Math.max(1, Math.min(50, Math.floor(pageSize)));
  const offset = (currentPage - 1) * size;
  if (previewMode()) {
    const rows = await publicStudents();
    return { rows: rows.slice(offset, offset + size), total: rows.length };
  }
  const result = await selectPage('members', { type: 'eq.student' }, 'sort_order.asc,id.asc', 'id,name,direction,school,major,expertise', offset, size);
  if (!result.rows.length && result.total && offset >= result.total) {
    const lastOffset = (Math.ceil(result.total / size) - 1) * size;
    return selectPage('members', { type: 'eq.student' }, 'sort_order.asc,id.asc', 'id,name,direction,school,major,expertise', lastOffset, size);
  }
  return result;
}

export async function publicStudent(id: string): Promise<Row | null> {
  if (!id) return null;
  if (previewMode()) return (await publicStudents()).find(row => String(row.id) === id) || null;
  return (await select('members', { id: `eq.${id}`, type: 'eq.student' }, 'id.asc', 'id,name,direction,school,major,expertise', 1))[0] || null;
}
