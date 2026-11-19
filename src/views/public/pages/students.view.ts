import { type Row } from '../../../core/config.ts';
import { e, icon, breadcrumb, heading, empty } from '../components.ts';

const initials = (name: unknown): string =>
  String(name || 'S').trim().split(/\s+/).filter(Boolean).filter((_, index, parts) => index === 0 || index === parts.length - 1).map(part => part[0].toUpperCase()).join('');

function studentCard(row: Row): string {
  return `<a class="student-card student-directory-card" href="Students.php?id=${encodeURIComponent(String(row.id))}">
    <span class="student-initial" aria-hidden="true">${e(initials(row.name))}</span>
    <strong class="student-name">${e(row.name)}</strong>
    ${row.school ? `<span class="student-school">${e(row.school)}</span>` : ''}
    ${row.major ? `<span class="student-major">${e(row.major)}</span>` : ''}
    <span class="student-card-arrow" aria-hidden="true">${icon('arrow-right')}</span>
  </a>`;
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
    <header class="student-profile-head"><span class="student-initial" aria-hidden="true">${e(initials(row.name))}</span><div><p class="eyebrow">Gương mặt sinh viên</p><h1>${e(row.name)}</h1></div></header>
    ${sections.map(([title, value]) => `<section class="student-profile-section"><h2>${title}</h2><p>${e(value).replace(/\n/g, '<br>')}</p></section>`).join('')}
  </main>`;
}

export function renderStudentsPage(rows: Row[], page = 1, studentId = ''): string {
  if (studentId) {
    const student = rows.find(row => String(row.id) === studentId);
    return student ? profile(student) : `<main id="main-content" class="container listing-main">${breadcrumb('Hỗ trợ sinh viên')}${empty('Không tìm thấy sinh viên', 'Hồ sơ này hiện không có trong danh sách công khai.', 'graduation-cap')}<a class="button primary" href="Students.php">Về danh sách sinh viên</a></main>`;
  }

  const pageSize = 12;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const visible = rows.slice((current - 1) * pageSize, current * pageSize);
  return `<main id="main-content" class="container listing-main student-directory">
    ${breadcrumb('Hỗ trợ sinh viên')}
    ${heading('Hỗ trợ sinh viên', 'Những sinh viên được CLB đồng hành trên hành trình phát triển tri thức và nghề nghiệp.', 'graduation-cap')}
    ${rows.length
      ? `<div class="student-grid">${visible.map(studentCard).join('')}</div>
         ${pages > 1 ? `<nav class="student-pagination" aria-label="Các trang sinh viên">
           ${Array.from({ length: pages }, (_, index) => `<a href="Students.php?page=${index + 1}" ${current === index + 1 ? 'aria-current="page"' : ''}>${index + 1}</a>`).join('')}
         </nav>` : ''}`
      : empty('Thông tin sinh viên đang được cập nhật', 'Theo dõi chương trình học bổng trong thời gian tới.', 'graduation-cap')}
  </main>`;
}
