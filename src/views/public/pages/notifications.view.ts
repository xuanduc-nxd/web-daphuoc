import { type Row } from '../../../core/config.ts';
import { e, dateText, breadcrumb, heading, toolbar, card, collectionEnd, empty, postHref } from '../components.ts';

export function renderNotificationsPage(rows: Row[]): string {
  return `<main id="main-content" class="container listing-main">
    ${breadcrumb('Thông báo')}
    ${heading('Thông báo từ Ban điều hành', 'Cập nhật thông tin xét cấp học bổng, chương trình và những điều cần biết từ CLB.', 'megaphone')}
    ${
      rows.length
        ? `<section data-collection data-pin-first data-page-size="6" aria-label="Danh sách thông báo">
            ${toolbar(rows, 'Tìm thông báo...')}
            <div class="notification-layout">
              <div>${rows.map(row => card(row, postHref(row), 'Thông báo', 'notification-row')).join('')}</div>
              <aside class="sidebar">
                <h2>Thông báo đáng chú ý</h2>
                ${rows
                  .slice(0, 4)
                  .map(
                    row => `<a class="sidebar-link" href="${e(postHref(row))}">
                      <strong>${e(row.title)}</strong>
                      <small>${row.pinned ? 'Đã ghim · ' : ''}${e(dateText(row.date))}</small>
                    </a>`,
                  )
                  .join('')}
              </aside>
            </div>
            ${collectionEnd()}
          </section>`
        : empty('Chưa có thông báo mới', 'Bạn có thể theo dõi hoạt động của CLB hoặc liên hệ để biết thêm thông tin.', 'megaphone')
    }
  </main>`;
}
