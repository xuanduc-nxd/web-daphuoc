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

function profileSection(title: string, symbol: string, content: string): string {
  return `<section class="student-profile-section"><span class="student-profile-section-icon" aria-hidden="true">${icon(symbol)}</span><div class="student-profile-section-content"><h2>${e(title)}</h2>${content}</div></section>`;
}

function profile(row: Row, roster: Row[]): string {
  const name = String(row.name || 'Sinh viên').trim();
  const school = String(row.school || '').trim();
  const major = String(row.major || '').trim();
  const direction = String(row.direction || '').trim();
  const expertise = String(row.expertise || '').trim();
  const initialsText = initials(name);
  const studentIndex = roster.findIndex(student => String(student.id) === String(row.id));
  const previous = studentIndex > 0 ? roster[studentIndex - 1] : null;
  const next = studentIndex >= 0 && studentIndex < roster.length - 1 ? roster[studentIndex + 1] : null;
  const sections = [
    school || major ? profileSection('Trường và ngành học', 'graduation-cap', `${school ? `<p>${e(school)}</p>` : ''}${major ? `<span class="student-profile-tag">${icon('notebook')} ${e(major)}</span>` : ''}`) : '',
    direction ? profileSection('Định hướng phát triển', 'arrows-out', `<p class="student-profile-preserve-lines">${e(direction).replace(/\r?\n/g, '<br>')}</p>`) : '',
    expertise ? profileSection('Lĩnh vực quan tâm', 'squares-four', `<p class="student-profile-preserve-lines">${e(expertise).replace(/\r?\n/g, '<br>')}</p>`) : '',
  ].filter(Boolean).join('');
  const quickRows = [
    ['Họ và tên', name, 'user-circle'],
    ['Trường', school, 'graduation-cap'],
    ['Ngành học', major, 'notebook'],
    ['Chương trình', 'Hỗ trợ sinh viên', 'hand-heart'],
  ].filter(([, value]) => Boolean(value));
  return `<main id="main-content" class="student-profile-page">
    <div class="container student-profile-top">
      ${breadcrumb('Hồ sơ sinh viên', 'Hỗ trợ sinh viên', 'Students.php')}
      <a class="student-back" href="Students.php">${icon('arrow-left')} Danh sách sinh viên</a>
    </div>
    <article class="container student-profile-card" aria-labelledby="student-profile-name">
      <header class="student-profile-hero">
        <div class="student-profile-avatar" aria-label="Chữ viết tắt ${e(initialsText)}">${e(initialsText)}</div>
        <div class="student-profile-identity"><p class="student-profile-eyebrow">GƯƠNG MẶT SINH VIÊN</p><h1 id="student-profile-name">${e(name)}</h1></div>
      </header>
      <div class="student-profile-body">
        <div class="student-profile-details">
          ${sections || `<p class="student-profile-no-details">Thông tin chi tiết đang được cập nhật.</p>`}
        </div>
        <aside class="student-profile-aside" aria-label="Thông tin sinh viên">
          <section class="student-profile-panel">
            <h2>${icon('info')} Thông tin nhanh</h2>
            <dl>${quickRows.map(([label, value, symbol]) => `<div class="student-profile-quick-row"><dt>${icon(symbol)}<span>${e(label)}</span></dt><dd>${e(value)}</dd></div>`).join('')}</dl>
          </section>
          <section class="student-profile-panel student-profile-contact">
            <h2>${icon('phone')} Liên hệ</h2>
            <p>${icon('info')} Thông tin liên hệ chưa được công khai.</p>
          </section>
        </aside>
      </div>
      <section class="student-profile-support">
        <span class="student-profile-support-icon" aria-hidden="true">${icon('hand-heart')}</span>
        <div><h2>Cùng tiếp sức cho hành trình tri thức</h2><p>Mỗi sự đồng hành góp phần mở thêm cơ hội học tập và phát triển cho sinh viên.</p></div>
      </section>
      <nav class="student-profile-navigation" aria-label="Điều hướng hồ sơ sinh viên">
        <a class="student-profile-nav-button" href="Students.php">${icon('arrow-left')} Quay lại danh sách</a>
        <div class="student-profile-nav-neighbors">
          ${previous ? `<a class="student-profile-nav-button" href="Students.php?id=${encodeURIComponent(String(previous.id))}">${icon('arrow-left')} Sinh viên trước</a>` : `<span class="student-profile-nav-button is-disabled" aria-disabled="true">${icon('arrow-left')} Sinh viên trước</span>`}
          ${next ? `<a class="student-profile-nav-button" href="Students.php?id=${encodeURIComponent(String(next.id))}">Sinh viên tiếp theo ${icon('arrow-right')}</a>` : `<span class="student-profile-nav-button is-disabled" aria-disabled="true">Sinh viên tiếp theo ${icon('arrow-right')}</span>`}
        </div>
      </nav>
    </article>
  </main>`;
}

export function renderStudentsPage(rows: Row[], page = 1, studentId = '', total = rows.length, roster: Row[] = rows): string {
  if (studentId) {
    const student = rows.find(row => String(row.id) === studentId);
    return student ? profile(student, roster) : `<main id="main-content" class="container listing-main">${breadcrumb('Hỗ trợ sinh viên')}${empty('Không tìm thấy sinh viên', 'Hồ sơ này hiện không có trong danh sách công khai.', 'graduation-cap')}<a class="button primary" href="Students.php">Về danh sách sinh viên</a></main>`;
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
      <article class="student-program-item"><span class="student-program-icon">${icon('hand-heart')}</span><div><h2>Hình thức hỗ trợ</h2><p>Học bổng, hỗ trợ chi phí học tập, định hướng phát triển và các hoạt động đồng hành phù hợp.</p></div></article>
      <article class="student-program-item"><span class="student-program-icon">${icon('share-network')}</span><div><h2>Giá trị mang lại</h2><p>Tiếp thêm động lực, mở rộng cơ hội học tập và xây dựng kết nối với cộng đồng.</p></div></article>
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
