const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright-core');

const base = process.env.UI_TEST_BASE_URL || 'http://127.0.0.1:8765';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname));

(async () => {
  const { renderHomePage } = await import('../src/views/public/pages/home.view.ts');
  const { renderAboutPage } = await import('../src/views/public/pages/about.view.ts');
  const site = {
    site_name: 'CLB Golf Đa Phước', banner_image: 'assets/images/hero-clb.jpg',
    about_banner_image: 'assets/images/hero-clb.jpg',
    banner_slides: ['assets/images/activity-800.webp'],
    about_banner_slides: ['assets/images/activity-800.webp'],
  };
  const browser = await chromium.launch({ executablePath: process.env.UI_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    for (const [name, body] of [['Trang chủ', renderHomePage(site, {})], ['Giới thiệu', renderAboutPage(site, [])]]) {
      for (const width of [1440, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await page.setContent(`<!doctype html><html><head><base href="${base}/"></head><body>${body}</body></html>`);
        await page.addStyleTag({ path: path.join(__dirname, '../public/CSS/site.css') });
        await page.addScriptTag({ path: path.join(__dirname, '../public/JS/site.js') });
        const slides = page.locator('[data-hero-carousel] [data-hero-slide]');
        const carousel = page.locator('[data-hero-carousel]');
        assert.equal(await slides.count(), 2, `${name}: hai ảnh`);
        await carousel.locator('[data-hero-next]').click();
        assert.equal(await slides.nth(1).isVisible(), true, `${name}: ảnh tiếp theo ở ${width}px`);
        assert.equal(await carousel.locator('[data-hero-count]').textContent(), '2 / 2');
        await carousel.locator('[data-hero-prev]').click();
        assert.equal(await slides.first().isVisible(), true, `${name}: ảnh trước ở ${width}px`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: không tràn ngang ở ${width}px`);
      }
    }
    console.log('Banner arrows: Home and About at 1440px and 375px passed');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
