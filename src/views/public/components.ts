import sanitizeHtml from 'sanitize-html';
import { type Row } from '../../core/config.ts';
import { renderPublicHeader } from './partials/header.view.ts';
import { renderPublicFooter } from './partials/footer.view.ts';
import { renderPublicDialogs } from './partials/dialogs.view.ts';
import { publicFrame } from './partials/layout.view.ts';

export { renderPublicHeader, renderPublicFooter, renderPublicDialogs, publicFrame };

export const e = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]!);

export const icon = (name: string): string =>
  `<i class="ph ph-${e(name)}" aria-hidden="true"></i>`;

export const strip = (value: unknown): string =>
  String(value ?? '').replace(/<[^>]*>/g, '');

export function dateText(value: unknown): string {
  const raw = String(value || '').slice(0, 10);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : 'Chưa cập nhật ngày';
}

export function stamp(value: unknown): number {
  const result = new Date(String(value || '')).getTime();
  return Number.isNaN(result) ? 0 : Math.floor(result / 1000);
}

export function image(value: unknown, fallback = 'Image/act-1.jpg'): string {
  const raw = String(value || '').trim();
  if (/^https?:\/\//i.test(raw) && URL.canParse(raw)) return raw;
  if (raw && /^[a-zA-Z0-9_][a-zA-Z0-9_./?=&%+-]*$/.test(raw) && !raw.includes('..')) return raw;
  return fallback;
}

export function srcset(value: unknown): string {
  const url = image(value);
  if (url === 'Image/act-1.jpg') {
    return 'assets/images/activity-480.webp 480w, assets/images/activity-800.webp 800w, assets/images/activity-1200.webp 1200w';
  }
  if (!/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/v\d+\//.test(url)) return '';
  return [480, 800, 1200]
    .map(width => `${url.replace('/image/upload/', `/image/upload/c_limit,w_${width}/q_auto/f_auto/`)} ${width}w`)
    .join(', ');
}

export function richText(html: string): string {
  if (!html.trim()) return '';
  if (html === strip(html)) return e(html).replace(/\n/g, '<br>');
  return sanitizeHtml(html, {
    allowedTags: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'blockquote', 'br', 'a'],
    allowedAttributes: { a: ['href'] },
    allowedSchemes: ['http', 'https'],
    transformTags: {
      a: (_tag, attrs) => ({
        tagName: 'a',
        attribs: { href: attrs.href || '', rel: 'noopener noreferrer' },
      }),
    },
  });
}

export const kindLabel = (kind: string): string =>
  ({ activity: 'Hoạt động', notification: 'Thông báo', blog: 'Blog' } as Record<string, string>)[kind] || 'Bài viết';

export const postHref = (post: Row): string =>
  post.kind === 'activity'
    ? `detail.php?type=activities&id=${encodeURIComponent(post.id)}`
    : post.kind === 'notification'
      ? `detail.php?id=${encodeURIComponent(post.id)}`
      : `detail_blog.php?id=${encodeURIComponent(post.id)}`;

export const breadcrumb = (label: string, parent = '', href = ''): string =>
  `<nav class="breadcrumbs" aria-label="Đường dẫn trang">
    <a href="index.php">Trang chủ</a><span aria-hidden="true">/</span>
    ${parent ? `<a href="${e(href)}">${e(parent)}</a><span aria-hidden="true">/</span>` : ''}
    <span aria-current="page">${e(label)}</span>
  </nav>`;

export const heading = (title: string, description: string, symbol = ''): string =>
  `<div class="page-heading-public">
    <div class="page-heading-badge">
      ${symbol ? `<span class="heading-symbol">${icon(symbol)}</span>` : ''}
      <span>QUỸ HỌC BỔNG GOLF ĐA PHƯỚC</span>
    </div>
    <h1>${e(title)}</h1>
    <p>${e(description)}</p>
  </div>`;

export const empty = (title: string, description: string, symbol = 'newspaper'): string =>
  `<div class="empty-state">
    <span class="empty-symbol">${icon(symbol)}</span>
    <h2>${e(title)}</h2>
    <p>${e(description)}</p>
  </div>`;

export const errorPage = (): string =>
  `<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Chưa kết nối được dữ liệu · CLB Golf Đa Phước</title>
  <link rel="stylesheet" href="/CSS/site.css">
</head>
<body>
  <main class="container not-found">
    <div class="empty-state">
      <h1>Chưa kết nối được dữ liệu</h1>
      <p>Website đang tạm thời gián đoạn. Vui lòng thử lại sau ít phút.</p>
      <a class="button primary" href="/">Thử tải lại</a>
    </div>
  </main>
</body>
</html>`;

export function card(post: Row, href: string, category = 'Hoạt động', className = ''): string {
  const title = String(post.title || 'Bài viết');
  const excerpt = strip(post.excerpt);
  const sizes = className.includes('news-featured')
    ? '(max-width:767px) calc(100vw - 36px), 680px'
    : className.includes('news-compact')
      ? '(max-width:767px) 100px, 145px'
      : '(max-width:767px) calc(100vw - 36px), 400px';

  return `<article class="news-card ${e(className)}" data-filter-item data-search="${e(`${title} ${excerpt} ${post.author || ''}`)}" data-category="${e(category)}" data-date="${stamp(post.date)}" data-year="${e(String(post.date || '').slice(0, 4))}" data-pinned="${post.pinned ? '1' : '0'}">
    <a class="news-image${post.image ? '' : ' is-placeholder'}" href="${e(href)}" aria-label="Xem bài: ${e(title)}">
      ${post.image
        ? `<img src="${e(image(post.image))}" srcset="${e(srcset(post.image))}" sizes="${sizes}" data-fallback="assets/images/activity-800.webp" alt="${e(title)}" width="800" height="500" loading="lazy" decoding="async">`
        : `<span class="news-image-placeholder" aria-hidden="true">${icon('notebook')}<span>${e(category)}</span></span>`}
    </a>
    <div class="news-body">
      <div class="article-meta">
        <span class="category-label">${e(category)}</span>
        ${category === 'Thông báo' && post.pinned ? `<span class="pinned-label">${icon('push-pin')} Đã ghim</span>` : ''}
        <span>${icon('calendar-blank')} ${e(dateText(post.date))}</span>
      </div>
      <h2><a href="${e(href)}">${e(title)}</a></h2>
      <p>${e(excerpt)}</p>
      <a class="text-link" href="${e(href)}">Xem chi tiết ${icon('arrow-right')}</a>
    </div>
  </article>`;
}

export function toolbar(rows: Row[], placeholder = 'Tìm bài viết...', categories: string[] = []): string {
  const years = [...new Set(rows.map(row => String(row.date || '').slice(0, 4)).filter(Boolean))].sort().reverse();
  return `<div class="collection-toolbar">
    <label class="search-field">
      <span class="sr-only">Tìm kiếm trong danh sách</span>
      ${icon('magnifying-glass')}
      <input type="search" data-search-input placeholder="${e(placeholder)}" autocomplete="off">
    </label>
    ${categories.length ? `<label class="select-field"><span class="sr-only">Chủ đề</span><select data-category-filter><option value="">Tất cả chủ đề</option>${categories.map(x => `<option>${e(x)}</option>`).join('')}</select></label>` : ''}
    ${years.length ? `<label class="select-field"><span class="sr-only">Năm đăng bài</span><select data-year-filter><option value="">Tất cả năm</option>${years.map(x => `<option>${e(x)}</option>`).join('')}</select></label>` : ''}
    <label class="select-field">
      <span class="sr-only">Sắp xếp bài viết</span>
      <select data-sort-input>
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="az">Tiêu đề A-Z</option>
      </select>
    </label>
  </div>
  <div class="collection-summary">
    <span data-result-count aria-live="polite">${rows.length} bài viết</span>
    <button class="text-link" type="button" data-reset-filters hidden>Xóa bộ lọc ${icon('x')}</button>
  </div>`;
}

export const collectionEnd = (): string =>
  `<div class="empty-state" data-filter-empty hidden>
    <span class="empty-symbol">${icon('magnifying-glass')}</span>
    <h2>Chưa tìm thấy kết quả</h2>
    <p>Thử từ khóa khác hoặc xóa bộ lọc để xem tất cả nội dung.</p>
    <button class="button secondary" type="button" data-reset-filters>Xóa bộ lọc</button>
  </div>
  <nav class="pagination" data-pagination aria-label="Phân trang" hidden></nav>`;
