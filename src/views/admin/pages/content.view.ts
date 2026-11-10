import { type Row } from '../../../core/config.ts';
import { type Session } from '../../../core/http.ts';
import { e, icon, strip } from '../../public/components.ts';
import { csrf, hidden, errorBox, selected, adminImage, dateInput, aboutSectionLabels } from '../components.ts';

export function contentView(rows: Row[], type: string, session: Session): string {
  const about = type === 'about';
  const title = about ? 'Giới thiệu CLB' : 'Tri ân & tài trợ';

  return `<section class="page-heading">
    <div>
      <p class="eyebrow">Nội dung website</p>
      <h1>${title}</h1>
      <p>${about ? 'Cập nhật nội dung trên trang Giới thiệu.' : 'Cập nhật danh sách tri ân và thông tin đóng góp.'}</p>
    </div>
    <a class="button primary" href="content-edit.php?type=${type}">${icon('plus')} Thêm nội dung</a>
  </section>
  <section data-collection data-page-size="10" data-result-label="nội dung">
    <div class="collection-toolbar">
      <label class="search-field">
        <span class="sr-only">Tìm nội dung</span>
        ${icon('magnifying-glass')}
        <input type="search" data-search-input placeholder="Tìm nội dung...">
      </label>
      <label class="select-field">
        <span class="sr-only">Sắp xếp</span>
        <select data-sort-input>
          <option value="newest">Thứ tự hiện tại</option>
          <option value="az">Nội dung A–Z</option>
        </select>
      </label>
    </div>
    <div class="collection-summary">
      <span data-result-count aria-live="polite">${rows.length} nội dung</span>
      <button class="text-link" type="button" data-reset-filters hidden>Xóa bộ lọc ${icon('x')}</button>
    </div>
    <div class="panel table-wrap">
      <table>
        <thead>
          <tr><th>Nội dung</th><th>${about ? 'Mục' : 'Đóng góp'}</th><th>Thứ tự</th><th>Thao tác</th></tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map(row => {
                    const label = about ? strip(row.content) : String(row.title || '');
                    return `<tr data-filter-item data-search="${e(`${label} ${row.category || ''} ${row.excerpt || ''}`)}" data-date="${-Number(row.sort_order || 0)}">
                      <td><strong>${e(label.slice(0, 150))}</strong></td>
                      <td>${e(about ? `${aboutSectionLabels[row.section_key] || ''}${row.category ? ' · ' + row.category : ''}` : row.excerpt)}</td>
                      <td>${Number(row.sort_order || 0)}</td>
                      <td class="actions">
                        <a href="content-edit.php?type=${type}&amp;id=${encodeURIComponent(row.id)}">${icon('pencil-simple')} Sửa</a>
                        <form method="post" action="content.php?type=${type}" data-confirm="${e(`Xóa nội dung “${label.slice(0, 80)}”?`)}">
                          ${csrf(session.token())}
                          ${hidden('id', row.id)}
                          ${hidden('version', row.version)}
                          <button class="link-danger" type="submit">${icon('trash')} Xóa</button>
                        </form>
                      </td>
                    </tr>`;
                  })
                  .join('')
              : '<tr><td colspan="4" class="empty table-empty">Chưa có nội dung.</td></tr>'
          }
        </tbody>
      </table>
    </div>
    ${rows.length ? `<div class="empty-state" data-filter-empty hidden><h2>Chưa tìm thấy kết quả</h2></div><nav class="pagination" data-pagination aria-label="Phân trang" hidden></nav>` : ''}
  </section>`;
}

export function contentEditView(
  row: Row,
  existing: Row | null,
  type: string,
  error: string,
  session: Session,
): string {
  const about = type === 'about';

  return `<section class="page-heading">
    <div>
      <p class="eyebrow">${about ? 'Giới thiệu CLB' : 'Tri ân & tài trợ'}</p>
      <h1>${existing ? 'Sửa nội dung' : 'Thêm nội dung'}</h1>
    </div>
    <a class="button ghost" href="content.php?type=${type}">${icon('arrow-left')} Quay lại</a>
  </section>
  ${errorBox(error)}
  <form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor>
    ${hidden('id', row.id)}
    ${hidden('version', row.version)}
    ${csrf(session.token())}
    ${
      about
        ? `<div class="form-grid">
            <label>Mục
              <select name="section_key">
                ${Object.entries(aboutSectionLabels)
                  .map(([key, label]) => `<option value="${key}" ${selected(row.section_key, key)}>${label}</option>`)
                  .join('')}
              </select>
            </label>
            <label>Giai đoạn / nhóm mục tiêu<input name="category" value="${e(row.category)}" placeholder="Dùng cho mục Mục tiêu"></label>
          </div>`
        : `<label>Tên cá nhân / đơn vị<input name="title" required maxlength="500" value="${e(row.title)}"></label>
          <div class="form-grid">
            <label>Thông tin đóng góp<input name="excerpt" value="${e(row.excerpt)}"></label>
            <label>Ngày<input name="date" value="${e(dateInput(row.date))}" placeholder="dd/mm/yyyy"></label>
          </div>`
    }
    <label>Nội dung<textarea name="content" rows="8" ${about ? 'required' : ''}>${e(row.content)}</textarea></label>
    <label>Thứ tự hiển thị
      <input type="number" min="0" max="100000" name="sort_order" value="${Number(row.sort_order || 0)}">
      <small>Số nhỏ được xếp trước.</small>
    </label>
    ${
      !about
        ? `<label>Ảnh
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input>
            <small>Tối đa 20 MB.</small>
            <small data-image-error class="image-error" hidden></small>
            <img class="upload-preview" data-image-preview data-original="${e(row.image ? adminImage(row.image) : '')}" src="${e(row.image ? adminImage(row.image) : '../Image/act-1.jpg')}" alt="Ảnh tài trợ" ${!row.image ? 'hidden' : ''}>
          </label>`
        : ''
    }
    <div class="editor-actions">
      <button class="button primary" type="submit">${icon('floppy-disk')} Lưu nội dung</button>
    </div>
  </form>`;
}
