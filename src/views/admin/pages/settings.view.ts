import { type Row } from '../../../core/config.ts';
import { type Session } from '../../../core/http.ts';
import { e, icon } from '../../public/components.ts';
import { csrf, hidden, errorBox, adminImage } from '../components.ts';

export function settingsView(site: Row, error: string, session: Session): string {
  const gallery = Array.isArray(site.gallery)
    ? [...new Set(site.gallery.filter((url: unknown): url is string => typeof url === 'string' && Boolean(url)))]
    : [];
  const imageControl = (title: string, field: string, uploadField: string, value: string, fallback: string, help: string): string => {
    const preview = adminImage(value || fallback);
    return `<div class="settings-image-card">
      <h3>${title}</h3>
      <label>Đường dẫn ảnh<input name="${field}" value="${e(value)}"></label>
      <label>Hoặc tải ảnh mới
        <input type="file" name="${uploadField}" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input>
        <small>${help}</small>
        <small data-image-error class="image-error" hidden></small>
        <img class="upload-preview settings-banner-preview" data-image-preview data-original="${e(preview)}" src="${e(preview)}" alt="${title}">
      </label>
    </div>`;
  };
  return `<section class="page-heading">
    <div>
      <p class="eyebrow">Cài đặt</p>
      <h1>Thông tin website</h1>
      <p>Điều chỉnh tên hiển thị, ảnh nền và thông tin liên hệ của website.</p>
    </div>
  </section>
  ${errorBox(error)}
  <form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor>
    ${csrf(session.token())}
    ${hidden('version', site.version)}
    <label>Tên website<input name="site_name" maxlength="80" required value="${e(site.site_name)}"></label>
    <div class="settings-section-heading"><h2>Đầu trang</h2><p>Hai dòng này hiển thị cạnh logo. Tên website phía trên vẫn dùng cho nội dung các trang khác.</p></div>
    <label>Dòng chữ nhỏ<input name="header_label" maxlength="60" required value="${e(site.header_label)}"></label>
    <label>Dòng chữ lớn<input name="header_title" maxlength="120" required value="${e(site.header_title)}"></label>
    <div class="settings-section-heading"><h2>Ảnh trang chủ</h2><p>Thay riêng ảnh nền đầu trang và ảnh lớn trong mục Về chúng tôi.</p></div>
    <div class="settings-image-grid">
      ${imageControl('Ảnh nền trang chủ', 'banner_image', 'banner_upload', String(site.banner_image || ''), 'assets/images/hero-clb.jpg', 'Ảnh ngang, tối đa 10 MB; tự động tối ưu tối đa 2.400 px.')}
      ${imageControl('Ảnh trung tâm trang chủ', 'hero_image', 'image', String(site.hero_image || ''), 'Image/act-1.jpg', 'Ảnh lớn trong mục Về chúng tôi; tối đa 10 MB.')}
    </div>
    <div class="settings-section-heading"><h2>Ảnh trang Giới thiệu</h2><p>Hai ảnh này có thể thay độc lập với trang chủ. Ảnh nhỏ bên cạnh ảnh trung tâm hiện dùng ảnh trung tâm trang chủ.</p></div>
    <div class="settings-image-grid">
      ${imageControl('Ảnh nền Giới thiệu', 'about_banner_image', 'about_banner_upload', String(site.about_banner_image || site.banner_image || ''), 'assets/images/hero-clb.jpg', 'Ảnh ngang ở phần đầu trang Giới thiệu; tối đa 10 MB.')}
      ${imageControl('Ảnh trung tâm Giới thiệu', 'about_hero_image', 'about_hero_upload', String(site.about_hero_image || ''), 'Image/act-1.jpg', 'Ảnh lớn trong phần câu chuyện CLB; tối đa 10 MB.')}
    </div>
    <div class="settings-section-heading"><h2>Thông tin CLB</h2></div>
    <label>Tên khóa Ban điều hành hiện tại<input name="current_board_label" maxlength="100" value="${e(site.current_board_label || '')}" placeholder="Ví dụ: Khóa 2026–2027"><small>Để trống nếu chưa xác nhận tên hoặc thời gian của khóa.</small></label>
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
    <section class="gallery-editor">
      <h2>Album ảnh website</h2>
      <p>Album hiển thị công khai trên trang chủ. Người xem có thể bấm mở ảnh, dùng nút điều hướng hoặc vuốt ngang trên điện thoại.</p>
      ${gallery
        .map(
          (url, index) => `<div class="gallery-edit-item" data-gallery-item>
            <img src="${e(adminImage(url))}" alt="Ảnh album website ${index + 1}" width="120" height="85">
            <div class="gallery-edit-controls">
              <strong>Ảnh ${index + 1}</strong>
              ${hidden('gallery_keep[]', url)}
              <label>Thứ tự<input type="number" name="gallery_position[]" min="1" max="20" value="${index + 1}"></label>
              <label class="gallery-choice"><input type="checkbox" name="gallery_remove[]" value="${e(url)}"> Gỡ ảnh</label>
            </div>
          </div>`,
        )
        .join('')}
      <label>Thêm ảnh vào album
        <input type="file" name="gallery[]" accept="image/jpeg,image/png,image/webp,image/gif" multiple data-gallery-input>
        <small>Album tối đa 20 ảnh; mỗi ảnh tối đa 10 MB và được tối ưu tối đa 2.000 px.</small>
        <small class="image-error" data-gallery-error hidden></small>
      </label>
      <div class="gallery-new-previews" data-gallery-new></div>
    </section>
    <div class="editor-actions">
      <button class="button primary" type="submit">${icon('floppy-disk')} Lưu thông tin</button>
    </div>
  </form>`;
}
