import { activityGallery } from '../../../core/content.ts';
import { type Row } from '../../../core/config.ts';
import { e, icon, image, srcset, dateText, richText, strip, breadcrumb, postHref } from '../components.ts';

function galleryView(gallery: string[], article: Row): string {
  return `<section class="article-gallery" data-article-gallery aria-label="Album ảnh hoạt động">
    <div class="article-gallery-heading">
      <h2>Hình ảnh hoạt động</h2>
      <div class="article-gallery-controls" aria-label="Điều hướng album ảnh" hidden>
        <button type="button" data-gallery-scroll-previous aria-label="Ảnh trước" disabled>${icon('arrow-left')}</button>
        <button type="button" data-gallery-scroll-next aria-label="Ảnh tiếp theo">${icon('arrow-right')}</button>
      </div>
    </div>
    <div class="article-gallery-grid" data-gallery-track tabindex="0" aria-label="Vuốt ngang hoặc dùng nút mũi tên để xem thêm ảnh">
      ${gallery
        .map(
          (url, index) => `<button type="button" data-lightbox="${e(image(url))}" data-gallery-group="activity" aria-label="Xem ảnh hoạt động ${index + 2}">
            <img src="${e(image(url))}" srcset="${e(srcset(url))}" sizes="(max-width:767px) 42vw, 260px" data-fallback="Image/act-1.jpg" alt="Ảnh hoạt động ${index + 2}: ${e(article.title)}" width="400" height="300" loading="lazy">
          </button>`,
        )
        .join('')}
    </div>
  </section>`;
}

export function renderDetailPage(
  article: Row | null,
  kind: string,
  recent: Row[],
): { body: string; status: number; title: string; description: string } {
  const category =
    kind === 'activity'
      ? 'Hoạt động'
      : kind === 'notification'
        ? 'Thông báo'
        : kind === 'blog'
          ? String(article?.role || 'Blog')
          : 'Tài trợ';
  const backLabel =
    kind === 'activity' ? 'Hoạt động' : kind === 'notification' ? 'Thông báo' : kind === 'blog' ? 'Blog' : 'Tài trợ';
  const backHref =
    kind === 'activity'
      ? 'Activities.php'
      : kind === 'notification'
        ? 'Notifications.php'
        : kind === 'blog'
          ? 'Blog.php'
          : 'HonorList.php';

  if (!article) {
    return {
      status: 404,
      title: 'Bài viết không tồn tại · CLB Golf Đa Phước',
      description: '',
      body: `<main id="main-content" class="container not-found">
        <div class="empty-state">
          <span class="empty-symbol">${icon('newspaper')}</span>
          <h1>Bài viết không tồn tại</h1>
          <p>Bài viết có thể đã được ẩn hoặc liên kết chưa chính xác. Bạn có thể quay lại danh sách để tìm nội dung khác.</p>
          <a class="button primary" href="${backHref}">Về ${backLabel} ${icon('arrow-right')}</a>
        </div>
      </main>`,
    };
  }

  const gallery = kind === 'activity' ? activityGallery(article).filter(url => url !== article.image) : [];
  const relatedTitle =
    kind === 'notification'
      ? 'Thông báo khác'
      : kind === 'activity'
        ? 'Hoạt động khác'
        : kind === 'blog'
          ? 'Bài viết khác'
          : 'Nhà tài trợ khác';

  const related = recent.length
    ? `<aside class="related-posts" aria-labelledby="related-posts-title">
        <h2 id="related-posts-title">${relatedTitle}</h2>
        <div class="related-posts-grid">
          ${recent
            .map(row => {
              const href = kind === 'sponsor' ? `detail.php?type=sponsors&id=${encodeURIComponent(row.id)}` : postHref(row);
              return `<a class="related-post-card" href="${e(href)}">
                <span class="related-post-image">
                  <img src="${e(image(row.image))}" srcset="${e(srcset(row.image))}" sizes="(max-width:767px) 104px, (max-width:1024px) 78px, 94px" data-fallback="assets/images/activity-800.webp" alt="" width="300" height="220" loading="lazy" decoding="async">
                </span>
                <span class="related-post-copy">
                  <strong>${e(row.title)}</strong>
                  <small>${e(dateText(row.date))}</small>
                </span>
              </a>`;
            })
            .join('')}
        </div>
      </aside>`
    : '';

  const main = `<main id="main-content" class="container article-main">
    ${breadcrumb('Bài viết', backLabel, backHref)}
    <div class="article-layout">
      <article>
        <header class="article-header">
          <div class="article-meta">
            <span class="category-label">${e(category)}</span>
            ${kind === 'notification' && article.pinned ? `<span class="pinned-label">${icon('push-pin')} Đã ghim</span>` : ''}
            <span>${e(dateText(article.date))}</span>
            ${article.author ? `<span>${e(article.author)}</span>` : ''}
          </div>
          <h1>${e(article.title)}</h1>
          ${article.excerpt ? `<p class="article-lead">${e(strip(article.excerpt))}</p>` : ''}
        </header>
        ${
          article.image
            ? `<button class="article-cover" type="button" data-lightbox="${e(image(article.image))}" ${kind === 'activity' ? 'data-gallery-group="activity"' : ''} aria-label="Xem ảnh bìa bài viết">
                <img src="${e(image(article.image))}" srcset="${e(srcset(article.image))}" sizes="(max-width:767px) calc(100vw - 36px), 820px" data-fallback="Image/act-1.jpg" alt="${e(article.title)}" width="1000" height="625" fetchpriority="high">
              </button>`
            : ''
        }
        <div class="article-content">
          ${article.content_format === 'plain' || (kind === 'blog' && !article.content_format) ? e(article.content).replace(/\n/g, '<br>') : richText(String(article.content || ''))}
        </div>
        ${gallery.length ? galleryView(gallery, article) : ''}
        <div class="article-actions">
          <a class="text-link" href="${backHref}">${icon('arrow-left')} Quay lại ${backLabel}</a>
          <div class="share-actions">
            <button class="button secondary" type="button" data-share>${icon('share-network')} Chia sẻ</button>
            <button class="icon-button" type="button" data-copy-link aria-label="Sao chép liên kết">${icon('link')}</button>
          </div>
        </div>
      </article>
      ${related}
    </div>
  </main>`;

  return {
    status: 200,
    title: `${article.title} · CLB Golf Đa Phước`,
    description: strip(article.excerpt).slice(0, 180),
    body: main,
  };
}
