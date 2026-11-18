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
    return `<div class="settings-image-card settings-primary-photo">
      <h3>${title}</h3>
      <img class="upload-preview settings-banner-preview" data-image-preview data-original="${e(preview)}" src="${e(preview)}" alt="${title}">
      <label>Chọn ảnh thay thế
        <input type="file" name="${uploadField}" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input>
        <small>${help}</small>
        <small data-image-error class="image-error" hidden></small>
      </label>
      <details class="settings-advanced"><summary>Dùng đường dẫn ảnh</summary><label>Đường dẫn ảnh<input name="${field}" value="${e(value)}"></label></details>
    </div>`;
  };
  const extraSlides = (title: string, property: string, field: string, uploadField: string): string => {
    const slides: string[] = Array.isArray(site[property]) ? site[property].slice(0, 4) : [];
    return `<div class="banner-slide-editor" aria-label="Ảnh bổ sung ${title}"><p>Ảnh 2–5 · Có thể bỏ trống những vị trí chưa dùng.</p>
      <div class="settings-slide-list">${Array.from({ length: 4 }, (_, index) => {
        const url = slides[index] || '';
        return `<div class="settings-slide-row"><div class="settings-slide-thumb">
            <img data-image-preview data-original="${e(url ? adminImage(url) : '')}" src="${e(url ? adminImage(url) : '')}" alt="Ảnh ${index + 2} ${title}" ${url ? '' : 'hidden'}>
            <span data-image-empty ${url ? 'hidden' : ''}>Chưa có ảnh</span>
          </div><div class="settings-slide-fields"><strong>Ảnh ${index + 2}</strong>
            <input type="hidden" name="${field}[]" value="${e(url)}" data-original="${e(url)}">
            <label>Chọn ảnh<input type="file" name="${uploadField}_${index}" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input><small data-image-error class="image-error" hidden></small></label>
            ${url ? `<label class="gallery-choice"><input type="checkbox" data-banner-remove> Gỡ ảnh này</label>` : ''}
          </div>
        </div>`;
      }).join('')}</div></div>`;
  };
  return `<section class="page-heading">
    <div>
      <p class="eyebrow">Cài đặt</p>
      <h1>Quản lý website</h1>
      <p>Chọn ảnh hoặc sửa thông tin, sau đó bấm Lưu thay đổi.</p>
    </div>
  </section>
  <nav class="settings-nav" aria-label="Các phần cài đặt"><a href="#settings-banners">Ảnh đầu trang</a><a href="#settings-content">Nội dung</a><a href="#settings-contact">Liên hệ</a><a href="#settings-gallery">Album</a></nav>
  ${errorBox(error)}
  <form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor data-settings-form>
    ${csrf(session.token())}
    ${hidden('version', site.version)}
    <section id="settings-banners" class="settings-block"><div class="settings-section-heading"><h2>Ảnh đầu trang</h2><p>Trang chủ và Giới thiệu có bộ ảnh riêng. Ảnh 1 luôn hiển thị đầu tiên; tối đa 5 ảnh mỗi trang.</p></div>
      <div class="settings-page-photos"><h3>Trang chủ</h3>
        ${imageControl('Ảnh 1 · Ảnh chính', 'banner_image', 'banner_upload', String(site.banner_image || ''), 'assets/images/hero-clb.jpg', 'Ảnh ngang, tối đa 10 MB.')}
        ${extraSlides('Trang chủ', 'banner_slides', 'banner_slide', 'banner_slide_upload')}
      </div>
      <div class="settings-page-photos"><h3>Giới thiệu CLB</h3>
        ${imageControl('Ảnh 1 · Ảnh chính', 'about_banner_image', 'about_banner_upload', String(site.about_banner_image || site.banner_image || ''), 'assets/images/hero-clb.jpg', 'Ảnh ngang, tối đa 10 MB.')}
        ${extraSlides('Giới thiệu', 'about_banner_slides', 'about_banner_slide', 'about_banner_slide_upload')}
      </div>
    </section>
    <section id="settings-content" class="settings-block"><div class="settings-section-heading"><h2>Nội dung hiển thị</h2></div>
    <label>Tên website<input name="site_name" maxlength="80" required value="${e(site.site_name)}"></label>
    <div class="form-grid"><label>Dòng chữ nhỏ cạnh logo<input name="header_label" maxlength="60" required value="${e(site.header_label)}"></label>
    <label>Dòng chữ lớn cạnh logo<input name="header_title" maxlength="120" required value="${e(site.header_title)}"></label></div>
    <label>Tên khóa Ban điều hành hiện tại<input name="current_board_label" maxlength="100" value="${e(site.current_board_label || '')}" placeholder="Ví dụ: Khóa 2026–2027"><small>Để trống nếu chưa xác nhận tên hoặc thời gian của khóa.</small></label>
    <label>Thông điệp của CLB<textarea name="notice" rows="2">${e(site.notice)}</textarea></label>
    <div class="settings-image-grid">
      ${imageControl('Ảnh hoạt động trên Trang chủ', 'hero_image', 'image', String(site.hero_image || ''), 'Image/act-1.jpg', 'Ảnh trong mục Về chúng tôi; tối đa 10 MB.')}
      ${imageControl('Ảnh câu chuyện trên Giới thiệu', 'about_hero_image', 'about_hero_upload', String(site.about_hero_image || ''), 'Image/act-1.jpg', 'Ảnh trong phần câu chuyện CLB; tối đa 10 MB.')}
    </div></section>
    <section id="settings-contact" class="settings-block"><div class="settings-section-heading"><h2>Liên hệ</h2></div>
    <label>Thông tin liên hệ bổ sung<textarea name="contact" rows="3">${e(site.contact)}</textarea></label>
    <div class="form-grid">
      <label>Điện thoại<input name="phone" value="${e(site.phone)}"></label>
      <label>Email<input type="email" name="email" value="${e(site.email)}"></label>
    </div>
    <label>Khu vực hoạt động<input name="location" value="${e(site.location)}"></label>
    <details class="settings-optional"><summary>Liên kết mạng xã hội</summary>
    <div class="form-grid">
      ${(['facebook', 'instagram', 'tiktok', 'threads'] as const)
        .map(
          field =>
            `<label>${field[0].toUpperCase() + field.slice(1)}<input type="url" name="${field}" value="${e(site[field])}" placeholder="https://"></label>`,
        )
        .join('')}
    </div>
    </details></section>
    <details id="settings-gallery" class="gallery-editor settings-optional">
      <summary>Album ảnh website <span>${gallery.length} ảnh</span></summary>
      <p>Album hiển thị ở phần dưới Trang chủ, tách biệt với ảnh đầu trang.</p>
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
    </details>
    <div class="editor-actions settings-save-bar">
      <span>Kiểm tra ảnh xem trước rồi lưu để cập nhật website.</span>
      <button class="button primary" type="submit">${icon('floppy-disk')} Lưu thay đổi</button>
    </div>
  </form>`;
}
