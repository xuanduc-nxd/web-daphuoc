import { type Row } from '../../../core/config.ts';
import { e, breadcrumb, heading, toolbar, card, collectionEnd, empty, postHref } from '../components.ts';

export function renderActivitiesPage(rows: Row[]): string {
  const label = 'Hoạt động';
  const title = 'Hoạt động của CLB';
  const intro = 'Những cuộc gặp gỡ, những hành trình sẻ chia và những dấu ấn cùng nhau.';

  return `<main id="main-content" class="container listing-main">
    ${breadcrumb(label)}
    ${heading(title, intro, 'users-three')}
    ${
      rows.length
        ? `<section data-collection data-page-size="6" aria-label="Danh sách ${e(label)}">
            ${toolbar(rows, 'Tìm hoạt động, chương trình...')}
            <div class="news-grid">${rows.map(row => card(row, postHref(row), 'Hoạt động')).join('')}</div>
            ${collectionEnd()}
          </section>`
        : empty(`Chưa có ${label.toLowerCase()} được đăng`, 'Nội dung mới sẽ được cập nhật tại đây.')
    }
  </main>`;
}
