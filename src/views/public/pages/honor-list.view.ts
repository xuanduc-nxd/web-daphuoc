import { type Row } from '../../../core/config.ts';
import { e, icon, stamp, strip, breadcrumb, heading, toolbar, collectionEnd, empty } from '../components.ts';

export function renderHonorListPage(rows: Row[]): string {
  return `<main id="main-content" class="container listing-main">
    ${breadcrumb('Tri ân mạnh thường quân')}
    ${heading('Người Thắp Sáng Niềm Tin', 'Chân thành cảm ơn những mạnh thường quân đã đồng hành và chắp cánh ước mơ cho các em sinh viên.', 'hand-heart')}
    ${
      rows.length
        ? `<section data-collection data-result-label="mạnh thường quân" data-page-size="8" aria-label="Danh sách mạnh thường quân">
            ${toolbar(rows, 'Tìm tên mạnh thường quân...')}
            <div class="honor-grid">
              ${rows
                .map(
                  row => `<article class="honor-card" data-filter-item data-search="${e(`${row.title || ''} ${row.excerpt || ''}`)}" data-date="${stamp(row.date)}" data-year="${e(String(row.date || '').slice(0, 4))}">
                    <span class="heading-symbol">${icon('hand-heart')}</span>
                    <div>
                      <h2>${e(row.title)}</h2>
                      <p>Đã đóng góp đồng hành</p>
                      <strong>${e(row.excerpt)}</strong>
                      ${row.content ? `<p>${e(strip(row.content))}</p>` : ''}
                    </div>
                  </article>`,
                )
                .join('')}
            </div>
            ${collectionEnd()}
          </section>`
        : empty('Danh sách đang được cập nhật', 'Cảm ơn những tấm lòng đã đồng hành cùng CLB.', 'hand-heart')
    }
  </main>`;
}
