import { type Row } from '../../../core/config.ts';
import { e, image } from '../components.ts';
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
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${e(description)}">
  <meta name="theme-color" content="#19578f">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:type" content="${article ? 'article' : 'website'}">
  ${article?.image && /^https?:\/\//.test(article.image) ? `<meta property="og:image" content="${e(image(article.image))}">` : ''}
  <title>${e(title)}</title>
  <link rel="icon" href="assets/images/favicon.png" type="image/png">
  <link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
  <link rel="preload" href="assets/fonts/be-vietnam-pro-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="CSS/fonts.css">
  <link rel="stylesheet" href="CSS/icons.css">
  <link rel="stylesheet" href="CSS/site.css?v=tsnt-ui-6">
  <script src="JS/site.js?v=tsnt-ui-6" defer></script>
</head>
<body>
  <a class="skip-link" href="#main-content">Đến nội dung chính</a>
  ${renderPublicHeader(page, settings, article)}
  ${body}
  ${renderPublicFooter(settings)}
  ${renderPublicDialogs()}
</body>
</html>`;
}
