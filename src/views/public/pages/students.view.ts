import { type Row } from '../../../core/config.ts';
import { e, icon, breadcrumb, empty } from '../components.ts';

function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).filter((_, index, words) => index === 0 || index === words.length - 1).map(word => word[0]).join('').toLocaleUpperCase('vi');
}

function studentCard(row: Row): string {
  const name = row.name ? String(row.name).trim() : '';
  const school = row.school ? String(row.school).trim() : '';
  const major = row.major ? String(row.major).trim() : '';
  const searchText = [name, school, major].join(' ').toLocaleLowerCase('vi');
  return `<article class="student-card student-directory-card" data-student-card data-name="${e(name.toLocaleLowerCase('vi'))}" data-school="${e(school.toLocaleLowerCase('vi'))}" data-major="${e(major.toLocaleLowerCase('vi'))}" data-search="${e(searchText)}">
    <div class="student-avatar" aria-hidden="true">${e(initials(name || 'Sinh viên'))}</div>
    <div class="student-card-content">
      <strong class="student-name">${e(name || 'Sinh viên')}</strong>
      <span class="student-school">${school ? e(school) : '<span class="student-muted">Đang cập nhật trường</span>'}</span>
      <span class="student-major">${major ? `${icon('books')} ${e(major)}` : 'Ngành học đang cập nhật'}</span>
    </div>
    <a class="student-link" href="Students.php?id=${encodeURIComponent(String(row.id))}" aria-label="Xem hồ sơ ${e(name || 'sinh viên')}">
      <span class="student-link-label">Xem hồ sơ</span><span class="student-card-arrow" aria-hidden="true">${icon('arrow-up-right')}</span>
    </a>
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

  const pageSize = 9;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const schools = [...new Set(rows.map(row => String(row.school || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  const majors = [...new Set(rows.map(row => String(row.major || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  return `<main id="main-content" class="student-directory-page">
    <section class="student-hero" aria-labelledby="student-hero-title">
      <div class="container student-hero-layout">
        <div class="student-hero-copy">
          ${breadcrumb('Hỗ trợ sinh viên')}
          <p class="student-eyebrow">CHƯƠNG TRÌNH HỖ TRỢ SINH VIÊN <span aria-hidden="true"></span></p>
          <h1 id="student-hero-title">Tiếp sức hôm nay.<br><span>Vững bước ngày mai.</span></h1>
          <p class="student-hero-description">Đồng hành cùng những sinh viên giàu nghị lực, tiếp thêm động lực trên hành trình học tập và phát triển bản thân.</p>
          <div class="student-hero-actions"><a class="button primary" href="#sinh-vien">Khám phá sinh viên ${icon('arrow-right')}</a><a class="button secondary" href="#chuong-trinh">Tìm hiểu chương trình</a></div>
        </div>
      </div>
    </section>

    <section class="container student-program" id="chuong-trinh" aria-label="Thông tin chương trình hỗ trợ">
      <article class="student-program-item"><span class="student-program-icon">${icon('graduation-cap')}</span><div><h2>Đối tượng hỗ trợ</h2><p>Sinh viên có hoàn cảnh khó khăn, có tinh thần vươn lên trong học tập.</p></div></article>
      <article class="student-program-item"><span class="student-program-icon">${icon('handshake')}</span><div><h2>Hình thức hỗ trợ</h2><p>Học bổng, hỗ trợ chi phí học tập, định hướng phát triển và các hoạt động đồng hành phù hợp.</p></div></article>
      <article class="student-program-item"><span class="student-program-icon">${icon('chart-line-up')}</span><div><h2>Giá trị mang lại</h2><p>Tiếp thêm động lực, mở rộng cơ hội học tập và xây dựng kết nối với cộng đồng.</p></div></article>
    </section>

    <section class="container student-directory listing-main" id="sinh-vien" aria-labelledby="student-list-title" data-student-directory>
      <div class="student-list-heading"><div><p class="student-section-eyebrow">NHỮNG GƯƠNG MẶT ĐƯỢC ĐỒNG HÀNH</p><h2 id="student-list-title">Sinh viên đang được hỗ trợ</h2><p>Khám phá những gương mặt đang được Quỹ đồng hành trên hành trình học tập và phát triển.</p></div><span class="student-count">${icon('users-three')} <span data-student-count data-total="${total}">${total}</span> sinh viên</span></div>
      ${rows.length
        ? `<div class="student-tools">
            <label class="student-search">${icon('magnifying-glass')}<span class="sr-only">Tìm kiếm sinh viên</span><input type="search" data-student-search placeholder="Tìm theo tên sinh viên, trường hoặc ngành học..." autocomplete="off"></label>
            <label class="student-select-wrap">${icon('books')}<span class="sr-only">Lọc theo ngành học</span><select data-student-major><option value="">Tất cả ngành học</option>${majors.map(major => `<option value="${e(major.toLocaleLowerCase('vi'))}">${e(major)}</option>`).join('')}</select>${icon('caret-down')}</label>
            <label class="student-select-wrap">${icon('buildings')}<span class="sr-only">Lọc theo trường</span><select data-student-school><option value="">Tất cả trường</option>${schools.map(school => `<option value="${e(school.toLocaleLowerCase('vi'))}">${e(school)}</option>`).join('')}</select>${icon('caret-down')}</label>
            <label class="student-select-wrap student-sort-wrap">${icon('sliders-horizontal')}<span class="sr-only">Sắp xếp</span><select data-student-sort><option value="default">Thứ tự mặc định</option><option value="name">Tên A–Z</option><option value="school">Trường A–Z</option></select>${icon('caret-down')}</label>
          </div>
          <p class="student-filter-status" data-student-status aria-live="polite"></p>
          <div class="student-grid">${rows.map(studentCard).join('')}</div>
          <div class="student-filter-empty" data-student-empty hidden>Không tìm thấy sinh viên phù hợp. Hãy thử thay đổi từ khóa hoặc bộ lọc.</div>
          <nav class="student-pagination" aria-label="Các trang sinh viên" data-student-pagination>
            ${current === 1 ? `<span aria-disabled="true" aria-label="Trang trước">${icon('caret-left')}</span>` : `<a href="Students.php?page=${current - 1}" aria-label="Trang trước">${icon('caret-left')}</a>`}
            ${Array.from({ length: pages }, (_, index) => `<a href="Students.php?page=${index + 1}" ${current === index + 1 ? 'aria-current="page"' : ''}>${index + 1}</a>`).join('')}
            ${current === pages ? `<span aria-disabled="true" aria-label="Trang sau">${icon('caret-right')}</span>` : `<a href="Students.php?page=${current + 1}" aria-label="Trang sau">${icon('caret-right')}</a>`}
          </nav>`
        : empty('Thông tin sinh viên đang được cập nhật', 'Theo dõi chương trình học bổng trong thời gian tới.', 'graduation-cap')}
    </section>

    <section class="container student-join-banner">
      <div class="student-join-copy"><p class="student-section-eyebrow">CHUNG TAY MỞ LỐI TRI THỨC</p><h2>Cùng chúng tôi tiếp sức<br>cho những hành trình tri thức</h2><p>Mỗi sự đồng hành hôm nay có thể mở ra thêm nhiều cơ hội học tập và phát triển cho sinh viên trong tương lai.</p><a href="contact.php" class="button secondary">Đồng hành cùng Quỹ ${icon('arrow-right')}</a></div>
    </section>
  </main>`;
}
