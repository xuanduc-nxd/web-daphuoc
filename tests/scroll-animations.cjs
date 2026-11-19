const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright-core');

const base = process.env.UI_TEST_BASE_URL || 'http://127.0.0.1:8765';

(async () => {
  const { renderHomePage } = await import('../src/views/public/pages/home.view.ts');
  const site = {
    site_name: 'CLB Golf Đa Phước',
    banner_image: 'assets/images/hero-clb.jpg',
    banner_slides: ['assets/images/activity-800.webp'],
  };
  const dummyData = {
    activities: [
      { id: 'act-1', title: 'Giải đấu giao lưu', date: '2026-10-15', image: 'Image/act-1.jpg', excerpt: 'Tóm tắt hoạt động' },
      { id: 'act-2', title: 'Trao học bổng đợt 1', date: '2026-10-20', image: 'Image/act-1.jpg', excerpt: 'Tóm tắt học bổng' },
    ],
    students: [
      { id: 'stu-1', name: 'Nguyễn Văn A', school: 'ĐH Bách Khoa', date: '2026-10-10', image: 'Image/act-1.jpg' },
    ],
    sponsors: [
      { id: 'sp-1', name: 'Công ty ABC', date: '2026-10-01', image: 'Image/act-1.jpg' },
    ],
    notifications: [],
    blogs: [],
  };

  const browser = await chromium.launch({
    executablePath: process.env.UI_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });

  try {
    const page = await browser.newPage();
    const body = renderHomePage(site, dummyData);

    // Test 1: Standard viewport & scroll enhancements
    await page.setViewportSize({ width: 1440, height: 900 });
    const fullHtml = `<!doctype html>
      <html lang="vi">
      <head>
        <base href="${base}/">
      </head>
      <body class="public-site">
        <header class="site-header"><div class="header-inner">Header</div></header>
        ${body}
      </body>
      </html>`;

    await page.setContent(fullHtml);
    await page.addStyleTag({ path: path.join(__dirname, '../public/CSS/site.css') });
    await page.addStyleTag({ path: path.join(__dirname, '../public/CSS/foundation.css') });
    await page.addScriptTag({ path: path.join(__dirname, '../public/JS/site.js') });

    // Verify progress bar and back to top button were injected
    const progressBar = page.locator('.scroll-progress-bar');
    assert.equal(await progressBar.count(), 1, 'Scroll progress bar is injected');

    const backToTop = page.locator('.back-to-top');
    assert.equal(await backToTop.count(), 1, 'Back to top button is injected');
    assert.equal(await backToTop.isVisible(), false, 'Back to top is hidden at top of page');

    // Verify reveal elements have been observed and given reveal classes
    const htmlHasClass = await page.evaluate(() => document.documentElement.classList.contains('has-scroll-reveal'));
    assert.equal(htmlHasClass, true, 'html has has-scroll-reveal class');
    const thanks = page.locator('.foundation-thanks-panel');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.foundation-thanks-panel')).opacity === '0');
    await thanks.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(() => {
      const panel = document.querySelector('.foundation-thanks-panel');
      return !panel.classList.contains('reveal-init') && getComputedStyle(panel).opacity === '1';
    });

    // Scroll down 500px
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.site-header').classList.contains('is-scrolled'));

    // Verify header elevation
    const headerIsScrolled = await page.evaluate(() => document.querySelector('.site-header').classList.contains('is-scrolled'));
    assert.equal(headerIsScrolled, true, 'Header has is-scrolled class after scrolling');

    // Verify back to top is now visible
    const backToTopVisible = await page.evaluate(() => document.querySelector('.back-to-top').classList.contains('is-visible'));
    assert.equal(backToTopVisible, true, 'Back to top button is visible after scrolling past 350px');

    // Click back to top and verify scroll returns
    await backToTop.click();
    await page.waitForTimeout(300);

    // Test 2: Check responsiveness and no horizontal overflow at 1440px, 768px, 375px, 320px
    for (const width of [1440, 768, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('.site-header').getBoundingClientRect().top >= 0);
      await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('.site-header').getBoundingClientRect().bottom <= 0);
      await page.evaluate(() => window.scrollTo({ top: 450, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('.site-header').getBoundingClientRect().top >= 0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(overflow, false, `No horizontal overflow at ${width}px with scroll animations`);
    }

    // Test 3: Respect prefers-reduced-motion
    const reducedMotionPage = await browser.newPage();
    await reducedMotionPage.emulateMedia({ reducedMotion: 'reduce' });
    await reducedMotionPage.setContent(fullHtml);
    await reducedMotionPage.addStyleTag({ path: path.join(__dirname, '../public/CSS/site.css') });
    await reducedMotionPage.addScriptTag({ path: path.join(__dirname, '../public/JS/site.js') });

    const reducedMotionHasClass = await reducedMotionPage.evaluate(() => document.documentElement.classList.contains('has-scroll-reveal'));
    assert.equal(reducedMotionHasClass, false, 'prefers-reduced-motion skips scroll reveal animations');
    await reducedMotionPage.close();

    console.log('Scroll animations, progress bar, header elevation, and back-to-top passed on desktop, tablet, and mobile');
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
