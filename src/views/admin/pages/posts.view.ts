import { activityGallery, notificationVisible } from '../../../core/content.ts';
import { type Row } from '../../../core/config.ts';
import { type Session } from '../../../core/http.ts';
import { e, icon, dateText, stamp, kindLabel, strip } from '../../public/components.ts';
import { csrf, hidden, errorBox, selected, checked, adminImage, dateInput } from '../components.ts';

export function postsView(rows: Row[], kind: string | null, session: Session): string {
  return `<section class="page-heading">
    <div>
      <p class="eyebrow">Nội dung</p>
      <h1>Bài viết</h1>
      <p>Quản lý Hoạt động, Thông báo và Blog hiển thị trên website.</p>
    </div>
    <div class="post-create-actions">
      <a class="button primary" href="post-edit.php?kind=activity">Tạo Hoạt động</a>
      <a class="button secondary" href="post-edit.php?kind=notification">Tạo Thông báo</a>
      <a class="button ghost" href="post-edit.php?kind=blog">Tạo Blog</a>
    </div>
  </section>
  <div class="team-tabs">
    <a class="${!kind ? 'active' : ''}" href="posts.php">Tất cả</a>
    ${['activity', 'notification', 'blog'].map(item => `<a class="${kind === item ? 'active' : ''}" href="posts.php?kind=${item}">${kindLabel(item)}</a>`).join('')}
  </div>
  <section data-collection data-page-size="10" aria-label="Quản lý bài viết">
    <div class="collection-toolbar">
      <label class="search-field">
        <span class="sr-only">Tìm bài viết</span>
        ${icon('magnifying-glass')}
        <input type="search" data-search-input placeholder="Tìm tiêu đề, tác giả..." autocomplete="off">
      </label>
      <label class="select-field">
        <span class="sr-only">Trạng thái bài</span>
        <select data-category-filter>
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã đăng</option>
          <option value="draft">Bản nháp / đã ẩn</option>
        </select>
      </label>
      <label class="select-field">
        <span class="sr-only">Sắp xếp</span>
        <select data-sort-input>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="az">Tiêu đề A-Z</option>
        </select>
      </label>
    </div>
    <div class="collection-summary">
      <span data-result-count aria-live="polite">${rows.length} bài viết</span>
      <button class="text-link" type="button" data-reset-filters hidden>Xóa bộ lọc ${icon('x')}</button>
    </div>
    <div class="panel table-wrap">
      <table>
        <thead>
          <tr><th>Tiêu đề</th><th>Ngày</th><th>Trạng thái</th><th>Thao tác</th></tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map(row => {
                    const published = row.status === 'published';
                    const expired = published && row.kind === 'notification' && !notificationVisible(row);
                    return `<tr data-filter-item data-search="${e(`${row.title || ''} ${row.author || ''}`)}" data-category="${published ? 'published' : 'draft'}" data-date="${stamp(row.date)}">
                      <td data-label="Bài viết"><span class="table-primary"><strong>${e(row.title)}</strong><small>${e(kindLabel(row.kind))} · ${e(strip(row.excerpt))}</small></span></td>
                      <td data-label="Ngày">${e(dateText(row.date))}</td>
                      <td data-label="Trạng thái"><span class="table-primary">
                        <span class="status ${published && !expired ? 'published' : 'draft'}">${expired ? 'Hết hạn' : published ? 'Đã đăng' : 'Bản nháp / đã ẩn'}</span>
                        ${row.pinned ? '<small>Đã ghim</small>' : ''}
                      </span></td>
                      <td class="actions" data-label="Thao tác">
                        <a href="post-edit.php?id=${encodeURIComponent(row.id)}">${icon('pencil-simple')} Sửa</a>
                        <form method="post" action="post-status.php">
                          ${hidden('version', row.version)}
                          ${hidden('id', row.id)}
                          ${csrf(session.statusToken())}
                          <button type="submit">${icon(published ? 'eye-slash' : 'eye')} ${published ? 'Ẩn' : 'Hiện'}</button>
                        </form>
                        <form method="post" action="post-delete.php" data-confirm="${e(`Xóa bài viết “${row.title}”? Bài sẽ được gỡ khỏi danh sách.`)}">
                          ${hidden('version', row.version)}
                          ${hidden('id', row.id)}
                          ${csrf(session.token())}
                          <button class="link-danger" type="submit">${icon('trash')} Xóa</button>
                        </form>
                      </td>
                    </tr>`;
                  })
                  .join('')
              : `<tr><td colspan="4" class="empty table-empty">${icon('newspaper')}<p>Chưa có bài viết. Chọn một trong ba loại bài ở phía trên để bắt đầu.</p></td></tr>`
          }
        </tbody>
      </table>
    </div>
    ${rows.length ? `<div class="empty-state" data-filter-empty hidden><h2>Chưa tìm thấy kết quả</h2></div><nav class="pagination" data-pagination aria-label="Phân trang" hidden></nav>` : ''}
  </section>`;
}

export function postEditView(
  post: Row,
  existing: Row | null,
  error: string,
  session: Session,
  removeImage = false,
): string {
  const kind = post.kind || '';
  const gallery = activityGallery(post);

  return `<section class="page-heading">
    <div>
      <p class="eyebrow">Nội dung</p>
      <h1>${existing ? 'Sửa bài' : 'Tạo bài'} ${e(kindLabel(kind))}</h1>
      <p>Soạn nội dung, chọn ảnh và xem trước bài viết trước khi lưu.</p>
    </div>
    <a class="button ghost" href="posts.php">${icon('arrow-left')} Quay lại</a>
  </section>
  ${errorBox(error)}
  <form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor data-post-editor>
    ${csrf(session.token())}
    ${hidden('id', post.id)}
    ${hidden('version', post.version)}
    <label>Loại bài
      <select name="kind" required ${existing ? 'disabled' : ''}>
        ${!existing ? `<option value="" ${!kind ? 'selected' : ''} disabled>Chọn Hoạt động, Thông báo hoặc Blog</option>` : ''}
        ${['activity', 'notification', 'blog'].map(item => `<option value="${item}" ${selected(kind, item)}>${kindLabel(item)}</option>`).join('')}
      </select>
      ${existing ? '<small>Loại bài đã lưu không thể đổi.</small>' : ''}
    </label>
    <div class="form-grid">
      <label>Tiêu đề<input name="title" value="${e(post.title)}" required placeholder="Nhập tiêu đề bài viết"></label>
      <label>Ngày đăng<input name="date" value="${e(dateInput(post.date))}" placeholder="dd/mm/yyyy"></label>
      <label>Tác giả<input name="author" value="${e(post.author)}"></label>
      <label>Nhãn bài viết<input name="role" value="${e(post.role)}"></label>
    </div>
    <label>
      <span class="field-header"><span>Tóm tắt</span><small data-character-count="post-excerpt"></small></span>
      <textarea id="post-excerpt" name="excerpt" rows="3" placeholder="Giới thiệu ngắn về bài viết">${e(post.excerpt)}</textarea>
    </label>
    <label>
      <span class="field-header"><span>Nội dung bài viết</span><small data-character-count="post-content"></small></span>
      <textarea id="post-content" name="content" rows="12" placeholder="Nhập nội dung bài viết...">${e(post.content)}</textarea>
    </label>
    <section class="gallery-editor" data-kind-section="activity" ${kind !== 'activity' ? 'hidden' : ''}>
      <h2>Album ảnh hoạt động</h2>
      <p>Khoảng 10 ảnh mỗi bài, tối đa 20 ảnh. Chọn ảnh đại diện và sắp xếp thứ tự trước khi lưu.</p>
      ${gallery
        .map(
          (url, index) => `<div class="gallery-edit-item" data-gallery-item>
            <img src="${e(adminImage(url))}" alt="Ảnh album ${index + 1}" width="120" height="85">
            <div class="gallery-edit-controls">
              <strong>Ảnh ${index + 1}</strong>
              ${hidden('gallery_keep[]', url)}
              <label>Thứ tự<input type="number" name="gallery_position[]" min="1" max="20" value="${index + 1}"></label>
              <label class="gallery-choice"><input type="radio" name="gallery_cover" value="${e(url)}" ${checked(post.image === url)}> Ảnh đại diện</label>
              <label class="gallery-choice"><input type="checkbox" name="gallery_remove[]" value="${e(url)}"> Gỡ ảnh</label>
            </div>
          </div>`,
        )
        .join('')}
      <label>Thêm ảnh vào album
        <input type="file" name="gallery[]" accept="image/jpeg,image/png,image/webp,image/gif" multiple data-gallery-input>
        <small>Mỗi ảnh tối đa 20 MB. Ảnh mới sẽ được thêm sau ảnh hiện có; bạn có thể đổi thứ tự sau khi lưu.</small>
        <small class="image-error" data-gallery-error hidden></small>
      </label>
      <div class="gallery-new-previews" data-gallery-new></div>
    </section>
    <div data-single-image-section ${kind === 'activity' ? 'hidden' : ''}>
      <label>Ảnh đại diện
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input>
        <small>JPG, PNG, WebP hoặc GIF; tối đa 20 MB.</small>
        <small class="image-error" data-image-error hidden></small>
        <img class="upload-preview" data-image-preview data-original="${e(existing?.image ? adminImage(existing.image) : '')}" src="${e(post.image ? adminImage(post.image) : '../Image/act-1.jpg')}" alt="Ảnh đại diện được chọn" ${!post.image || removeImage ? 'hidden' : ''}>
      </label>
      ${existing?.image ? `<label class="team-remove-image"><input type="checkbox" name="remove_image" value="1" ${checked(removeImage)}> Gỡ ảnh đại diện khỏi bài viết</label>` : ''}
    </div>
    <div class="notification-options" data-kind-section="notification" ${kind !== 'notification' ? 'hidden' : ''}>
      <h2>Hiển thị thông báo</h2>
      <label class="gallery-choice"><input type="checkbox" name="pinned" value="1" ${checked(post.pinned)}> Ghim thông báo lên đầu danh sách</label>
      <label>Ngày hết hạn
        <input name="expires_on" value="${e(dateInput(post.expires_on))}" placeholder="dd/mm/yyyy">
        <small>Để trống nếu thông báo không hết hạn. Sau ngày này, thông báo ẩn khỏi toàn bộ trang công khai.</small>
      </label>
    </div>
    <label>Trạng thái
      <select name="status">
        <option value="draft" ${selected(post.status, 'draft')}>Bản nháp</option>
        <option value="published" ${selected(post.status, 'published')}>Đã đăng</option>
      </select>
      <small>Chọn “Đã đăng” để bài xuất hiện trên website.</small>
    </label>
    <div class="editor-actions">
      <button class="button secondary" type="button" data-post-preview>${icon('eye')} Xem trước</button>
      <button class="button primary" type="submit">${icon('floppy-disk')} Lưu bài viết</button>
    </div>
  </form>
  <dialog class="post-preview-dialog" id="post-preview-dialog" aria-labelledby="preview-heading">
    <button class="icon-button dialog-close" type="button" data-close-dialog aria-label="Đóng xem trước">${icon('x')}</button>
    <p class="preview-note" id="preview-heading">Xem trước nội dung. Bài viết chưa được lưu.</p>
    <div class="article-meta" data-preview-meta></div>
    <h2 data-preview-title></h2>
    <p class="article-lead" data-preview-excerpt></p>
    <img data-preview-image alt="Ảnh đại diện bài viết" hidden>
    <div class="preview-content" data-preview-content></div>
  </dialog>`;
}
