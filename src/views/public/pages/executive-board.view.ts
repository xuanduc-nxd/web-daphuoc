import { type Row } from '../../../core/config.ts';
import { e, image, breadcrumb } from '../components.ts';

const teamCard = (row: Row): string =>
  `<article class="team-card">
    <div class="member-avatar">
      ${
        row.image
          ? `<img src="${e(image(row.image))}" alt="Ảnh đại diện của ${e(row.name)}" width="480" height="600" loading="lazy" decoding="async">`
          : `<div class="avatar-placeholder">${e(String(row.name || '').slice(0, 1).toUpperCase())}</div>`
      }
    </div>
    <h3 class="member-name">${e(row.name)}</h3>
    ${row.role_title ? `<p class="member-role">${e(row.role_title)}</p>` : ''}
    ${row.detail ? `<p class="member-bio">${e(row.detail).replace(/\n/g, '<br>')}</p>` : ''}
  </article>`;

export function renderExecutiveBoardPage(rows: Row[], currentBoardLabel = ''): string {
  const advisors = rows.filter(row => row.position === 'Ban cố vấn');
  const board = rows.filter(row => row.position !== 'Ban cố vấn');
  const current = board.filter(row => row.board_term === 'current' || row.board_term === undefined);
  const unassigned = board.filter(row => row.board_term === '');
  const previous = new Map<string, Row[]>();
  for (const row of board) {
    const term = String(row.board_term || '');
    if (term && term !== 'current') {
      const group = previous.get(term) || [];
      group.push(row);
      previous.set(term, group);
    }
  }
  const previousTerms = [...previous.entries()].sort((a, b) =>
    Math.max(...b[1].map(row => Number(row.term_order || 0))) -
      Math.max(...a[1].map(row => Number(row.term_order || 0))) ||
    b[0].localeCompare(a[0], 'vi'),
  );

  const group = (id: string, label: string, people: Row[], className = '', subtitle = '') =>
    `<section class="team-group ${className}" aria-labelledby="${id}">
      <div class="tsnt-team-group-head">
        <div><h2 id="${id}">${e(label)}</h2>${subtitle ? `<p class="team-group-subtitle">${e(subtitle)}</p>` : ''}</div>
        <span class="tsnt-team-count">${people.length} thành viên</span>
      </div>
      ${people.length
        ? `<div class="team-grid">${people.map(teamCard).join('')}</div>`
        : `<p class="team-empty">Thông tin ${e(label)} đang được cập nhật.</p>`}
    </section>`;

  return `<main id="main-content" class="team-page">
    <section class="tsnt-page-banner">
      <div class="container">
        ${breadcrumb('Ban cố vấn & Ban điều hành', 'Giới thiệu', 'About.php')}
        <div class="tsnt-banner-body">
          <h1>
            <span class="tsnt-banner-title-main">Những người đồng hành cùng CLB</span>
          </h1>
          <p class="tsnt-banner-sub">Ban cố vấn, Ban điều hành hiện tại và những người đã đồng hành cùng CLB qua các khóa.</p>
        </div>
      </div>
    </section>

    <div class="container listing-main team-page-content">
      ${group('advisors-heading', 'Ban cố vấn', advisors, 'team-group-advisors')}
      ${group('current-board-heading', 'Ban điều hành khóa hiện tại', current, 'team-group-current', currentBoardLabel)}
      ${unassigned.length ? group('unassigned-board-heading', 'Ban điều hành chưa phân khóa', unassigned, 'team-group-unassigned') : ''}
      <section class="team-terms" aria-labelledby="previous-boards-heading">
        <div class="tsnt-team-group-head"><h2 id="previous-boards-heading">Ban điều hành các khóa trước</h2></div>
        ${previousTerms.length
          ? previousTerms.map(([label, people], index) => `<details class="team-term-panel" ${index === 0 ? 'open' : ''}>
              <summary><span>${e(label)}</span><span class="team-term-meta">${people.length} thành viên <span class="team-term-chevron" aria-hidden="true"></span></span></summary>
              <div class="team-grid">${people.map(teamCard).join('')}</div>
            </details>`).join('')
          : '<p class="team-empty">Thông tin các khóa trước đang được cập nhật.</p>'}
      </section>
    </div>
  </main>`;
}
