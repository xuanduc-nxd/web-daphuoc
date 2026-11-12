import { InputError, randomId, type Row } from '../../core/config.ts';
import { type Form, type Session, value, checked } from '../../core/http.ts';
import { type RouteResult } from '../../models/types.ts';
import { members, record, remove, save } from '../../models/repository.ts';
import { uploadedImage } from '../../services/admin.ts';
import { teamView, teamEditView } from '../../views/admin/pages/team.view.ts';
import { scalar, integer, flashRedirect, errorMessage, fields, view } from './helpers.ts';

export async function handleTeamList(
  page: string,
  url: URL,
  session: Session,
): Promise<RouteResult> {
  const type = url.searchParams.get('type') === 'student' ? 'student' : 'board';
  return view(
    page,
    type === 'student' ? 'Sinh viên' : 'Ban điều hành',
    teamView(await members(type), type, session),
    session,
  );
}

export async function handleTeamEdit(
  page: string,
  url: URL,
  method: string,
  form: Form,
  session: Session,
): Promise<RouteResult> {
  const id = (url.searchParams.get('id') || value(form, 'id')).trim();
  const existing = id ? await record('members', id) : null;
  if (id && !existing) {
    return flashRedirect(session, 'team.php', 'Không tìm thấy hồ sơ.', 'error');
  }

  const type =
    existing?.type ||
    ((url.searchParams.get('type') || value(form, 'type')) === 'student' ? 'student' : 'board');

  const row: Row = existing
    ? { ...existing }
    : {
        id: '',
        type,
        name: '',
        position: 'Ban điều hành',
        role_title: '',
        board_term: '',
        term_order: 0,
        school: '',
        major: '',
        detail: '',
        direction: '',
        support_needs: '',
        expertise: '',
        image: '',
        sort_order: 0,
        version: 1,
      };

  let error = '';

  if (method === 'POST') {
    if (!session.check(form, 'team')) {
      return flashRedirect(session, `team.php?type=${type}`, 'Yêu cầu không hợp lệ.', 'error');
    }

    row.name = scalar(form, 'name');
    row.version = integer(form, 'version');
    if (type === 'board') {
      row.detail = scalar(form, 'detail');
      row.role_title = scalar(form, 'role_title');
      row.position = value(form, 'position') === 'Ban cố vấn' ? 'Ban cố vấn' : 'Ban điều hành';
      const termKind = value(form, 'term_kind');
      row.board_term = row.position === 'Ban cố vấn' ? '' : termKind === 'current' ? 'current' : termKind === 'previous' ? scalar(form, 'board_term') : '';
      row.term_order = row.position === 'Ban cố vấn' || termKind !== 'previous' ? 0 : integer(form, 'term_order');
      if (value(form, 'sort_order').trim()) row.sort_order = integer(form, 'sort_order');
    } else {
      for (const field of ['school', 'major', 'direction', 'support_needs', 'expertise']) {
        row[field] = scalar(form, field);
      }
    }

    try {
      if (!row.name || [...row.name].length > 200) {
        throw new InputError('Họ tên cần từ 1 đến 200 ký tự.');
      }
      if (type === 'student') {
        if (!row.school || !row.major || !row.direction) {
          throw new InputError('Nhập trường, ngành học và định hướng của sinh viên.');
        }
        if (
          [...row.school].length > 200 ||
          [...row.major].length > 200 ||
          [...row.direction].length > 3000 ||
          [...row.support_needs].length > 3000 ||
          [...row.expertise].length > 200
        ) {
          throw new InputError('Thông tin sinh viên quá dài.');
        }
      } else {
        if (row.board_term !== 'current' && [...row.board_term].length > 100) {
          throw new InputError('Tên khóa không hợp lệ hoặc quá dài.');
        }
        if (row.position === 'Ban điều hành' && value(form, 'term_kind') === 'previous' && (!row.board_term || row.term_order < 1 || row.term_order > 9999)) {
          throw new InputError('Nhập tên khóa cũ và năm bắt đầu hợp lệ.');
        }
        if ([...row.detail].length > 3000) throw new InputError('Giới thiệu quá dài.');
        if ([...row.role_title].length > 120) throw new InputError('Chức danh quá dài.');
        if (!Number.isInteger(row.sort_order) || row.sort_order < 0 || row.sort_order > 9999) throw new InputError('Thứ tự hiển thị không hợp lệ.');
        const uploaded = await uploadedImage(form, 'team');
        if (uploaded) row.image = uploaded;
        else if (checked(form, 'remove_image')) row.image = '';
      }

      const payload = fields(row, [
        'id',
        'type',
        'name',
        'position',
        'role_title',
        'board_term',
        'term_order',
        'school',
        'major',
        'detail',
        'direction',
        'support_needs',
        'expertise',
        'image',
        'sort_order',
      ]);
      payload.id = existing ? id : randomId('team');

      if (!existing) {
        const all = await members();
        if (!value(form, 'sort_order').trim()) {
          payload.sort_order = all.length
            ? Math.max(...all.map(item => Number(item.sort_order || 0))) + 1
            : 0;
        }
      }

      await save('members', payload, existing ? row.version : undefined);
      return flashRedirect(session, `team.php?type=${type}`, 'Đã lưu hồ sơ.');
    } catch (failure) {
      error = errorMessage(failure);
    }
  }

  return view(
    page,
    existing ? 'Sửa hồ sơ' : 'Thêm hồ sơ',
    teamEditView(row, existing, type, error, session),
    session,
  );
}

export async function handleTeamDelete(
  method: string,
  form: Form,
  session: Session,
): Promise<RouteResult> {
  if (method !== 'POST') return { location: 'team.php' };
  if (!session.check(form, 'team')) {
    return flashRedirect(session, 'team.php', 'Yêu cầu không hợp lệ.', 'error');
  }

  const id = scalar(form, 'id');
  const row = await record('members', id);
  if (!row) return flashRedirect(session, 'team.php', 'Không tìm thấy hồ sơ.', 'error');

  try {
    await remove('members', id, integer(form, 'version'));
    return flashRedirect(session, `team.php?type=${row.type}`, 'Đã xóa hồ sơ.');
  } catch (failure) {
    return flashRedirect(session, `team.php?type=${row.type}`, errorMessage(failure), 'error');
  }
}
