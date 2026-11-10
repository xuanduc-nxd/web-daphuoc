import { type Row } from '../../../core/config.ts';
import { type Session } from '../../../core/http.ts';
import { e, icon } from '../../public/components.ts';
import { csrf, hidden, errorBox, selected, adminImage } from '../components.ts';

export function teamView(rows: Row[], type: string, session: Session): string {
  const student = type === 'student';

  return `<section class="page-heading">
    <div>
      <p class="eyebrow">Giới thiệu</p>
      <h1>${student ? 'Sinh viên' : 'Ban điều hành'}</h1>
      <p>${student ? 'Quản lý thông tin sinh viên. Trang công khai chỉ hiển thị họ tên và định hướng.' : 'Quản lý hồ sơ và ảnh đại diện hiển thị trên website.'}</p>
    </div>
    <a class="button primary" href="team-edit.php?type=${type}">${icon('plus')} Thêm ${student ? 'sinh viên' : 'thành viên'}</a>
  </section>
  <div class="team-tabs">
    <a class="${!student ? 'active' : ''}" href="team.php?type=board">Ban điều hành / Cố vấn</a>
    <a class="${student ? 'active' : ''}" href="team.php?type=student">Sinh viên</a>
  </div>
  <section data-collection data-result-label="hồ sơ" data-page-size="10" aria-label="Quản lý hồ sơ">
    <div class="collection-toolbar">
      <label class="search-field">
        <span class="sr-only">Tìm hồ sơ</span>
        ${icon('magnifying-glass')}
        <input type="search" data-search-input placeholder="Tìm họ tên, ${student ? 'trường, ngành, chuyên môn' : 'chức danh'}..." autocomplete="off">
      </label>
      ${
        student
          ? ''
          : `<label class="select-field">
              <span class="sr-only">Nhóm</span>
              <select data-category-filter>
                <option value="">Tất cả nhóm</option>
                <option>Ban điều hành</option>
                <option>Ban cố vấn</option>
              </select>
            </label>`
      }
    </div>
    <div class="collection-summary">
      <span data-result-count aria-live="polite">${rows.length} hồ sơ</span>
      <button class="text-link" type="button" data-reset-filters hidden>Xóa bộ lọc ${icon('x')}</button>
    </div>
    <div class="panel table-wrap ${student ? 'student-table' : ''}">
      <table>
        <thead>
          <tr>
            <th>${student ? 'Định hướng' : 'Ảnh'}</th>
            <th>Họ tên</th>
            <th>${student ? 'Trường / Ngành' : 'Nhóm'}</th>
            ${student ? '<th>Nhu cầu hỗ trợ</th><th>Lĩnh vực chuyên môn</th>' : ''}
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map(
                    row => `<tr data-filter-item data-search="${e(`${row.name || ''} ${row.school || ''} ${row.major || ''} ${row.direction || ''} ${row.support_needs || ''} ${row.expertise || ''} ${row.position || ''}`)}" data-category="${e(row.position || '')}" data-date="0">
                      <td>${student ? e(String(row.direction || '').slice(0, 90)) : row.image ? `<img class="team-thumb" src="${e(adminImage(row.image))}" alt="Ảnh ${e(row.name)}">` : `<span class="team-thumb-placeholder">${e(String(row.name || '').slice(0, 1))}</span>`}</td>
                      <td><strong>${e(row.name)}</strong>${student ? '' : `<small>${e(row.detail)}</small>`}</td>
                      <td>${e(student ? `${row.school || ''} · ${row.major || ''}` : row.position)}</td>
                      ${student ? `<td>${e(String(row.support_needs || '').slice(0, 100))}</td><td>${e(String(row.expertise || '').slice(0, 100))}</td>` : ''}
                      <td class="actions">
                        <a href="team-edit.php?id=${encodeURIComponent(row.id)}">${icon('pencil-simple')} Sửa</a>
                        <form method="post" action="team-delete.php" data-confirm="${e(`Xóa hồ sơ của ${row.name}?`)}">
                          ${hidden('version', row.version)}
                          ${hidden('id', row.id)}
                          ${csrf(session.teamToken())}
                          <button class="link-danger" type="submit">${icon('trash')} Xóa</button>
                        </form>
                      </td>
                    </tr>`,
                  )
                  .join('')
              : `<tr><td colspan="${student ? 6 : 4}" class="empty table-empty">${icon('users-three')}<p>Chưa có hồ sơ nào.</p></td></tr>`
          }
        </tbody>
      </table>
    </div>
    ${rows.length ? `<div class="empty-state" data-filter-empty hidden><h2>Chưa tìm thấy kết quả</h2></div><nav class="pagination" data-pagination aria-label="Phân trang" hidden></nav>` : ''}
  </section>`;
}

export function teamEditView(
  row: Row,
  existing: Row | null,
  type: string,
  error: string,
  session: Session,
): string {
  const student = type === 'student';

  return `<section class="page-heading">
    <div>
      <p class="eyebrow">${student ? 'Sinh viên' : 'Ban điều hành / Cố vấn'}</p>
      <h1>${existing ? 'Sửa hồ sơ' : 'Thêm hồ sơ'}</h1>
      <p>${student ? 'Chỉ họ tên và định hướng hiển thị công khai. Trường, ngành học, nhu cầu hỗ trợ và lĩnh vực chuyên môn chỉ dành cho admin.' : 'Cập nhật thông tin và ảnh đại diện cho hồ sơ.'}</p>
    </div>
    <a class="button ghost" href="team.php?type=${type}">${icon('arrow-left')} Quay lại</a>
  </section>
  ${errorBox(error)}
  <form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor>
    ${hidden('version', row.version)}
    ${hidden('id', row.id)}
    ${hidden('type', type)}
    ${csrf(session.teamToken())}
    <label>Họ tên<input name="name" value="${e(row.name)}" required placeholder="Nhập họ và tên"></label>
    ${
      student
        ? `<div class="form-grid">
            <label>Trường<input name="school" value="${e(row.school)}" required maxlength="200"></label>
            <label>Ngành học<input name="major" value="${e(row.major)}" required maxlength="200"></label>
          </div>
          <label>Định hướng
            <textarea name="direction" rows="7" required maxlength="3000" placeholder="Mục tiêu học tập và định hướng của sinh viên">${e(row.direction)}</textarea>
            <small>Nội dung này sẽ hiển thị trên trang Hỗ trợ sinh viên.</small>
          </label>
          <label>Nhu cầu hỗ trợ
            <textarea name="support_needs" rows="4" maxlength="3000" placeholder="Nhu cầu hỗ trợ của sinh viên">${e(row.support_needs || '')}</textarea>
          </label>
          <label>Lĩnh vực chuyên môn
            <input name="expertise" value="${e(row.expertise || '')}" maxlength="200" placeholder="Ví dụ: phát triển phần mềm, thiết kế...">
          </label>`
        : `<label>Nhóm
            <select name="position">
              <option value="Ban điều hành" ${selected(row.position, 'Ban điều hành')}>Ban điều hành</option>
              <option value="Ban cố vấn" ${selected(row.position, 'Ban cố vấn')}>Ban cố vấn</option>
            </select>
          </label>
          <label>Thông tin giới thiệu<textarea name="detail" rows="5" placeholder="Giới thiệu ngắn về hồ sơ">${e(row.detail)}</textarea></label>
          <label>Ảnh đại diện
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input>
            <small>JPG, PNG, WebP hoặc GIF; tối đa 20 MB.</small>
            <small class="image-error" data-image-error hidden></small>
            <img class="upload-preview" data-image-preview data-original="${e(row.image ? adminImage(row.image) : '')}" src="${e(row.image ? adminImage(row.image) : '../Image/act-1.jpg')}" alt="Ảnh đại diện được chọn" ${!row.image ? 'hidden' : ''}>
          </label>
          ${row.image ? `<label class="team-remove-image"><input type="checkbox" name="remove_image" value="1"> Xóa ảnh đại diện hiện tại</label>` : ''}`
    }
    <div class="editor-actions">
      <button class="button primary" type="submit">${icon('floppy-disk')} Lưu hồ sơ</button>
    </div>
  </form>`;
}
