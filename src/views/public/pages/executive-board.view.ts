import { type Row } from '../../../core/config.ts';
import { e, image, breadcrumb, empty } from '../components.ts';

const teamCard = (row: Row): string =>
  `<article class="team-card">
    <div class="member-avatar">
      ${
        row.image
          ? `<img src="${e(image(row.image))}" alt="Ảnh đại diện của ${e(row.name)}">`
          : `<div class="avatar-placeholder">${e(String(row.name || '').slice(0, 1).toUpperCase())}</div>`
      }
    </div>
    <h2 class="member-name">${e(row.name)}</h2>
    ${row.position ? `<p class="member-role">${e(row.position)}</p>` : ''}
    ${row.detail ? `<p class="member-bio">${e(row.detail).replace(/\n/g, '<br>')}</p>` : ''}
  </article>`;

export function renderExecutiveBoardPage(rows: Row[]): string {
  const groups = [
    ['Ban điều hành', 'Ban điều hành'],
    ['Ban cố vấn', 'Ban cố vấn'],
  ] as const;

  return `<main id="main-content">
    <section class="tsnt-page-banner">
      <div class="container">
        ${breadcrumb('Ban điều hành Quỹ', 'Giới thiệu', 'About.php')}
        <div class="tsnt-banner-body">
          <div class="hero-eyebrow"><span class="eyebrow-dot"></span>Về chúng tôi</div>
          <h1>
            <span class="tsnt-banner-title-org">CLB Golf Đa Phước &amp; Những người bạn</span>
            <span class="tsnt-banner-title-main">Ban điều hành &amp; Ban cố vấn Quỹ</span>
          </h1>
          <p class="tsnt-banner-sub">Những con người tâm huyết đứng sau sứ mệnh kết nối và sẻ chia — đồng hành cùng thế hệ sinh viên vượt khó vươn lên tại Đà Nẵng.</p>
        </div>
      </div>
    </section>

    <div class="container listing-main">
      ${groups
        .map(([label, position]) => {
          const group = rows.filter(row => row.position === position);
          return `<section class="team-group">
          <div class="tsnt-team-group-head">
            <h2>${label}</h2>
            <span class="tsnt-team-count">${group.length} thành viên</span>
          </div>
          ${
            group.length
              ? `<div class="team-grid">${group.map(teamCard).join('')}</div>`
              : empty('Danh sách đang được cập nhật', `Thông tin ${label} sẽ được bổ sung tại đây.`, 'users-three')
          }
        </section>`;
        })
        .join('')}
    </div>
  </main>`;
}
