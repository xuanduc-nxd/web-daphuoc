import { type Row } from '../../../core/config.ts';
import { type Session } from '../../../core/http.ts';
import { e, icon } from '../../public/components.ts';
import { csrf, hidden, errorBox, adminImage } from '../components.ts';

export function settingsView(site: Row, error: string, session: Session): string {
  return `<section class="page-heading">
    <div>
      <p class="eyebrow">Cài đặt</p>
      <h1>Thông tin website</h1>
      <p>Các thông tin này hiển thị trên trang chủ, chân trang và trang Liên hệ.</p>
    </div>
  </section>
  ${errorBox(error)}
  <form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor>
    ${csrf(session.token())}
    ${hidden('version', site.version)}
    <label>Tên website<input name="site_name" maxlength="80" required value="${e(site.site_name)}"></label>
    <label>Thông điệp của CLB<textarea name="notice" rows="2">${e(site.notice)}</textarea></label>
    <label>Thông tin liên hệ bổ sung<textarea name="contact" rows="3">${e(site.contact)}</textarea></label>
    <div class="form-grid">
      <label>Điện thoại<input name="phone" value="${e(site.phone)}"></label>
      <label>Email<input type="email" name="email" value="${e(site.email)}"></label>
    </div>
    <label>Khu vực hoạt động<input name="location" value="${e(site.location)}"></label>
    <div class="form-grid">
      ${(['facebook', 'instagram', 'tiktok', 'threads'] as const)
        .map(
          field =>
            `<label>${field[0].toUpperCase() + field.slice(1)}<input type="url" name="${field}" value="${e(site[field])}" placeholder="https://"></label>`,
        )
        .join('')}
    </div>
    <label>Đường dẫn ảnh chính trang chủ<input name="hero_image" value="${e(site.hero_image)}"></label>
    <label>Hoặc tải ảnh mới
      <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input>
      <small>Tối đa 20 MB.</small>
      <small data-image-error class="image-error" hidden></small>
      <img class="upload-preview" data-image-preview data-original="${e(adminImage(site.hero_image))}" src="${e(adminImage(site.hero_image))}" alt="Ảnh chính trang chủ">
    </label>
    <div class="editor-actions">
      <button class="button primary" type="submit">${icon('floppy-disk')} Lưu thông tin</button>
    </div>
  </form>`;
}
