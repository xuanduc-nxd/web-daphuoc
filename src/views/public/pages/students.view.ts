import { type Row } from '../../../core/config.ts';
import { e, icon, breadcrumb, heading, empty } from '../components.ts';

function studentCard(row: Row): string {
  const name = row.name ? String(row.name).trim() : '';
  const school = row.school ? String(row.school).trim() : '';
  const major = row.major ? String(row.major).trim() : '';
  return `<article class="student-card student-directory-card">
    <div class="student-col student-col-name">
      <strong class="student-name">${e(name || 'Sinh viên')}</strong>
    </div>
    <div class="student-col student-col-school">
      <span class="student-col-label">Trường:</span>
      <span class="student-school">${school ? e(school) : '<span class="student-muted">—</span>'}</span>
    </div>
    <div class="student-col student-col-major">
      <span class="student-col-label">Ngành học:</span>
      <span class="student-major">${major ? e(major) : '<span class="student-muted">—</span>'}</span>
    </div>
    <div class="student-col student-col-action">
      <a class="student-link" href="Students.php?id=${encodeURIComponent(String(row.id))}" aria-label="Xem hồ sơ ${e(name || 'sinh viên')}">
        <span>Xem hồ sơ</span>
        <span class="student-card-arrow" aria-hidden="true">${icon('arrow-right')}</span>
      </a>
    </div>
  </article>`;
}

function profile(row: Row): string {
  const sections = [
    ['Trường và ngành học', [row.school, row.major].filter(Boolean).join(' · ')],
    ['Định hướng phát triển', row.direction],
    ['Lĩnh vực quan tâm', row.expertise],
  ].filter(([, value]) => Boolean(value));
  return `<main id="main-content" class="container listing-main student-profile">
    ${breadcrumb('Hỗ trợ sinh viên')}
    <a class="student-back" href="Students.php">${icon('arrow-left')} Danh sách sinh viên</a>
    <header class="student-profile-head"><div><p class="eyebrow">Gương mặt sinh viên</p><h1>${e(row.name)}</h1></div></header>
    ${sections.map(([title, value]) => `<section class="student-profile-section"><h2>${e(title)}</h2><p>${e(value).replace(/\n/g, '<br>')}</p></section>`).join('')}
  </main>`;
}

export function renderStudentsPage(rows: Row[], page = 1, studentId = '', total = rows.length): string {
  if (studentId) {
    const student = rows.find(row => String(row.id) === studentId);
    return student ? profile(student) : `<main id="main-content" class="container listing-main">${breadcrumb('Hỗ trợ sinh viên')}${empty('Không tìm thấy sinh viên', 'Hồ sơ này hiện không có trong danh sách công khai.', 'graduation-cap')}<a class="button primary" href="Students.php">Về danh sách sinh viên</a></main>`;
  }

  const pageSize = 10;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const visible = rows;
  return `<main id="main-content" class="container listing-main student-directory">
    ${breadcrumb('Hỗ trợ sinh viên')}
    ${heading('Hỗ trợ sinh viên', 'Những sinh viên được CLB đồng hành trên hành trình phát triển tri thức và nghề nghiệp.', 'graduation-cap')}
    ${rows.length
      ? `<div class="student-directory-head" aria-hidden="true">
           <span class="student-head-name">Họ và tên</span>
           <span class="student-head-school">Trường</span>
           <span class="student-head-major">Ngành học</span>
           <span class="student-head-action">Hồ sơ</span>
         </div>
         <div class="student-grid">${visible.map(studentCard).join('')}</div>
         <nav class="student-pagination" aria-label="Các trang sinh viên">
           ${current === 1 ? '<span aria-disabled="true">Trước</span>' : `<a href="Students.php?page=${current - 1}">Trước</a>`}
           ${Array.from({ length: pages }, (_, index) => `<a href="Students.php?page=${index + 1}" ${current === index + 1 ? 'aria-current="page"' : ''}>${index + 1}</a>`).join('')}
           ${current === pages ? '<span aria-disabled="true">Sau</span>' : `<a href="Students.php?page=${current + 1}">Sau</a>`}
         </nav>`
      : empty('Thông tin sinh viên đang được cập nhật', 'Theo dõi chương trình học bổng trong thời gian tới.', 'graduation-cap')}
  </main>`;
}
