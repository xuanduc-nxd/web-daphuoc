import { type Row } from '../../../core/config.ts';
import { e, icon, breadcrumb, heading, empty } from '../components.ts';

function studentCard(row: Row): string {
  const initial = String(row.name || 'S').trim().slice(0, 1).toUpperCase();
  return `<article class="student-card">
    <div class="student-card-head">
      <span class="student-initial" aria-hidden="true">${e(initial)}</span>
      <div>
        <span class="student-badge">We're Shining · Sinh viên đồng hành</span>
        <h2 class="student-name">${e(row.name)}</h2>
      </div>
    </div>
    <div class="student-detail">
      <h3>Định hướng phát triển</h3>
      <p class="student-direction">${row.direction ? e(row.direction).replace(/\n/g, '<br>') : 'Đang cập nhật.'}</p>
    </div>
  </article>`;
}

export function renderStudentsPage(rows: Row[]): string {
  return `<main id="main-content" class="container listing-main">
    ${breadcrumb('Hỗ trợ sinh viên')}
    ${heading('Hỗ trợ sinh viên', 'Tên và định hướng của các bạn sinh viên đang được CLB đồng hành trên hành trình chinh phục tri thức.', 'graduation-cap')}
    ${
      rows.length
        ? `<div class="student-grid">${rows.map(studentCard).join('')}</div>`
        : `${empty('Thông tin sinh viên đang được cập nhật', 'Theo dõi các hoạt động và chương trình học bổng của CLB trong thời gian tới.', 'graduation-cap')}
          <div class="about-actions">
            <a class="button primary" href="Activities.php">Hoạt động ${icon('arrow-up-right')}</a>
            <a class="button secondary" href="Notifications.php">Thông báo</a>
          </div>`
    }
  </main>`;
}
