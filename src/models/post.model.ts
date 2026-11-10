import { InputError, type Row } from '../core/config.ts';
import { notificationVisible } from '../core/content.ts';
import { select } from './supabase.ts';
import { previewMode, previewRows, record } from './repository.ts';

function sortNotifications(rows: Row[]): Row[] {
  return rows
    .filter(notificationVisible)
    .sort(
      (a, b) =>
        Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
        String(b.date || '').localeCompare(String(a.date || '')) ||
        String(a.id).localeCompare(String(b.id)),
    );
}

export async function posts(kind?: string, publishedOnly = false): Promise<Row[]> {
  if (kind && !['activity', 'notification', 'blog'].includes(kind)) {
    throw new InputError('Loại bài không hợp lệ.');
  }

  let rows: Row[];
  if (previewMode()) {
    rows = previewRows('posts')
      .filter(row => (!kind || row.kind === kind) && (!publishedOnly || row.status === 'published'))
      .sort(
        (a, b) =>
          String(b.date || '').localeCompare(String(a.date || '')) ||
          String(a.id).localeCompare(String(b.id)),
      );
  } else {
    rows = await select(
      'posts',
      {
        ...(kind ? { kind: `eq.${kind}` } : {}),
        ...(publishedOnly ? { status: 'eq.published' } : {}),
      },
      'date.desc.nullslast,id.asc',
    );
  }

  if (publishedOnly && !kind) {
    rows = rows.filter(row => row.kind !== 'notification' || notificationVisible(row));
  }

  return kind === 'notification' && publishedOnly ? sortNotifications(rows) : rows;
}

export async function publicPost(kind: string, id: string): Promise<Row | null> {
  if (!['activity', 'notification', 'blog'].includes(kind)) return null;

  let row = await record('posts', id, { kind, status: 'published' });
  if (!row) {
    if (previewMode()) {
      row = (await posts(kind, true)).find(item => item.legacy_id === id) || null;
    } else {
      row = (
        await select(
          'posts',
          { legacy_id: `eq.${id}`, kind: `eq.${kind}`, status: 'eq.published' },
          'id.asc',
          '*',
          1,
        )
      )[0] || null;
    }
  }

  return row && kind === 'notification' && !notificationVisible(row) ? null : row;
}
