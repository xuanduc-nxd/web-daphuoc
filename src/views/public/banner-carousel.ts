import { type Row } from '../../core/config.ts';
import { e, icon, image } from './components.ts';

export function bannerCarousel(site: Row, primary: string, extraField: string, fallback: string, photoClass = ''): string {
  const extras = Array.isArray(site[extraField]) ? site[extraField].filter((url: unknown): url is string => typeof url === 'string' && Boolean(url)).slice(0, 5) : [];
  const slides = [image(primary, fallback), ...extras.map(url => image(url))];
  return `<div class="banner-slides" data-hero-carousel aria-label="Ảnh đầu trang">
    ${slides.map((url, index) => `<img class="banner-slide ${photoClass}" data-hero-slide ${index ? 'hidden loading="lazy"' : 'fetchpriority="high"'} src="${e(url)}" data-fallback="${fallback}" alt="" aria-hidden="true" width="2048" height="1536">`).join('')}
    ${slides.length > 1 ? `<div class="banner-controls" aria-label="Điều hướng ảnh đầu trang">
      <button type="button" data-hero-prev aria-label="Ảnh trước">${icon('caret-left')}</button>
      <span class="banner-count" data-hero-count aria-live="polite">1 / ${slides.length}</span>
      <button type="button" data-hero-next aria-label="Ảnh tiếp theo">${icon('caret-right')}</button>
    </div>` : ''}
  </div>`;
}
