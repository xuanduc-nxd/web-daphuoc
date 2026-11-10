import { InputError, adminDateValue, randomId, today, type Row, type Table } from '../../core/config.ts';
import { type Form, type Session, value } from '../../core/http.ts';
import { type RouteResult } from '../../models/types.ts';
import { aboutSections, sponsors, record, remove, save } from '../../models/repository.ts';
import { uploadedImage } from '../../services/admin.ts';
import { contentView, contentEditView } from '../../views/admin/pages/content.view.ts';
import { scalar, integer, flashRedirect, errorMessage, fields, view } from './helpers.ts';

export async function handleContentList(
  page: string,
  url: URL,
  method: string,
  form: Form,
  session: Session,
): Promise<RouteResult> {
  const type = url.searchParams.get('type') === 'about' ? 'about' : 'sponsor';
  const table: Table = type === 'about' ? 'about_sections' : 'sponsors';

  if (method === 'POST') {
    if (!session.check(form)) {
      return flashRedirect(session, `content.php?type=${type}`, 'Yêu cầu không hợp lệ.', 'error');
    }
    try {
      await remove(table, scalar(form, 'id'), integer(form, 'version'));
      return flashRedirect(session, `content.php?type=${type}`, 'Đã xóa nội dung.');
    } catch (failure) {
      return flashRedirect(session, `content.php?type=${type}`, errorMessage(failure), 'error');
    }
  }

  const rows = type === 'about' ? await aboutSections() : await sponsors();
  return view(
    page,
    type === 'about' ? 'Giới thiệu CLB' : 'Tri ân & tài trợ',
    contentView(rows, type, session),
    session,
  );
}

export async function handleContentEdit(
  page: string,
  url: URL,
  method: string,
  form: Form,
  session: Session,
): Promise<RouteResult> {
  const type = url.searchParams.get('type') === 'about' ? 'about' : 'sponsor';
  const table: Table = type === 'about' ? 'about_sections' : 'sponsors';
  const id = (url.searchParams.get('id') || value(form, 'id')).trim();
  const existing = id ? await record(table, id) : null;

  if (id && !existing) {
    return flashRedirect(session, `content.php?type=${type}`, 'Không tìm thấy nội dung.', 'error');
  }

  const row: Row = existing
    ? { ...existing }
    : type === 'about'
      ? { id: '', section_key: 'principle', category: '', content: '', sort_order: 0, version: 1 }
      : { id: '', title: '', excerpt: '', content: '', image: '', date: today(), sort_order: 0, version: 1 };

  let error = '';

  if (method === 'POST') {
    if (!session.check(form)) {
      return flashRedirect(session, `content.php?type=${type}`, 'Yêu cầu không hợp lệ.', 'error');
    }

    for (const field of type === 'about' ? ['section_key', 'category', 'content'] : ['title', 'excerpt', 'content', 'date']) {
      row[field] = scalar(form, field);
    }
    row.sort_order = integer(form, 'sort_order');
    row.version = integer(form, 'version');

    try {
      let date: string | null = null;
      if (type === 'about') {
        if (!['principle', 'scope', 'target', 'method'].includes(row.section_key) || !row.content) {
          throw new InputError('Chọn mục và nhập nội dung giới thiệu.');
        }
      } else {
        if (!row.title || [...row.title].length > 500) {
          throw new InputError('Tên cần từ 1 đến 500 ký tự.');
        }
        date = adminDateValue(row.date);
        const uploaded = await uploadedImage(form, 'sponsor');
        if (uploaded) row.image = uploaded;
      }

      if (row.sort_order < 0 || row.sort_order > 100000) {
        throw new InputError('Thứ tự cần từ 0 đến 100000.');
      }

      const payload = fields(
        row,
        type === 'about'
          ? ['id', 'section_key', 'category', 'content', 'sort_order']
          : ['id', 'title', 'excerpt', 'content', 'image', 'date', 'sort_order'],
      );
      payload.id = existing ? id : randomId(type);
      if (type === 'sponsor') payload.date = date;

      await save(table, payload, existing ? row.version : undefined);
      return flashRedirect(session, `content.php?type=${type}`, 'Đã lưu nội dung.');
    } catch (failure) {
      error = errorMessage(failure);
    }
  }

  return view(
    page,
    existing ? 'Sửa nội dung' : 'Thêm nội dung',
    contentEditView(row, existing, type, error, session),
    session,
  );
}
