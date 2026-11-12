import { InputError, imageValue } from '../../core/config.ts';
import { type Form, type Session } from '../../core/http.ts';
import { type RouteResult } from '../../models/types.ts';
import { settings, save } from '../../models/repository.ts';
import { uploadedImage } from '../../services/admin.ts';
import { settingsView } from '../../views/admin/pages/settings.view.ts';
import { scalar, integer, flashRedirect, errorMessage, fields, view } from './helpers.ts';

export async function handleSettings(
  page: string,
  method: string,
  form: Form,
  session: Session,
): Promise<RouteResult> {
  const site = await settings();
  let error = '';

  if (method === 'POST') {
    if (!session.check(form)) {
      return flashRedirect(session, 'settings.php', 'Yêu cầu không hợp lệ.', 'error');
    }

    site.version = integer(form, 'version');
    for (const field of [
      'site_name',
      'notice',
      'contact',
      'phone',
      'email',
      'location',
      'facebook',
      'instagram',
      'tiktok',
      'threads',
      'hero_image',
      'current_board_label',
    ]) {
      site[field] = scalar(form, field);
    }

    try {
      if (!site.site_name || [...site.site_name].length > 80) {
        throw new InputError('Tên website cần từ 1 đến 80 ký tự.');
      }
      if ([...site.current_board_label].length > 100) throw new InputError('Tên khóa hiện tại quá dài.');
      if (site.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)) {
        throw new InputError('Email không hợp lệ.');
      }
      if (site.phone && !/^[0-9+(). \-]{6,30}$/.test(site.phone)) {
        throw new InputError('Số điện thoại không hợp lệ.');
      }
      for (const field of ['facebook', 'instagram', 'tiktok', 'threads']) {
        if (site[field] && (!URL.canParse(site[field]) || new URL(site[field]).protocol !== 'https:')) {
          throw new InputError('Liên kết mạng xã hội cần bắt đầu bằng https://.');
        }
      }

      site.hero_image = imageValue(site.hero_image);
      const uploaded = await uploadedImage(form, 'hero');
      if (uploaded) site.hero_image = uploaded;

      await save(
        'settings',
        fields(site, [
          'id',
          'site_name',
          'notice',
          'contact',
          'phone',
          'email',
          'location',
          'facebook',
          'instagram',
          'tiktok',
          'threads',
          'hero_image',
          'current_board_label',
        ]),
        site.version,
      );
      return flashRedirect(session, 'settings.php', 'Đã cập nhật thông tin website.');
    } catch (failure) {
      error = errorMessage(failure);
    }
  }

  return view(page, 'Thông tin website', settingsView(site, error, session), session);
}
