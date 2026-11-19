import { type Row } from '../../../core/config.ts';
import { e, image, postHref } from '../components.ts';
import { renderPublicHeader } from './header.view.ts';
import { renderPublicFooter } from './footer.view.ts';
import { renderPublicDialogs } from './dialogs.view.ts';

export function publicFrame(
  page: string,
  settings: Row,
  title: string,
  body: string,
  description = 'Tin tức, hoạt động và những câu chuyện đồng hành cùng thế hệ trẻ Đà Nẵng của CLB Golf Đa Phước và những người bạn.',
  article?: Row,
): string {
  let articleMeta = '';
  if (article) {
    const origin = new URL(process.env.PUBLIC_SITE_URL || 'https://web-daphuoc.vercel.app').origin;
    const fallback = 'assets/images/scholarship-group.jpg';
    const cover = image(String(article.image || '').replace(/^\/(?!\/)/, ''), fallback);
    const href = article.kind === 'sponsor'
      ? `detail.php?type=sponsors&id=${encodeURIComponent(article.id)}`
      : postHref(article);
    articleMeta = `<meta property="og:url" content="${e(new URL(href, origin).href)}">
  <meta property="og:image" content="${e(new URL(cover, origin).href)}">
  <meta property="og:image:alt" content="${e(cover === fallback ? 'Lễ trao học bổng của CLB Golf Đa Phước' : article.title)}">
  <meta property="og:locale" content="vi_VN">
  <meta property="og:site_name" content="CLB Golf Đa Phước">`;
  }
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${e(description)}">
  <meta name="theme-color" content="#086653">
  <meta property="og:title" content="${e(article?.title || title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:type" content="${article ? 'article' : 'website'}">
  ${articleMeta}
  <title>${e(title)}</title>
  <link rel="icon" href="assets/images/favicon.png" type="image/png">
  <link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
  <link rel="preload" href="assets/fonts/be-vietnam-pro-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="CSS/fonts.css">
  <link rel="stylesheet" href="CSS/icons.css">
  <link rel="stylesheet" href="CSS/site.css?v=shining-layout-2">
  <script src="JS/site.js?v=scroll-reveal-2" defer></script>
  <link rel="stylesheet" href="CSS/foundation.css?v=webp-1">
</head>
<body class="public-site">
  <a class="skip-link" href="#main-content">Đến nội dung chính</a>
  ${renderPublicHeader(page, settings, article)}
  ${body}
  ${renderPublicFooter(settings)}
  ${renderPublicDialogs()}
</body>
</html>`;
}
