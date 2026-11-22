const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
(async () => {
  const { renderAboutPage } = await import('../src/views/public/pages/about.view.ts');
  const { publicFrame } = await import('../src/views/public/partials/layout.view.ts');
  const site = { site_name: 'CLB Golf Đa Phước', about_banner_image: 'Image/act-1.jpg', about_banner_slides: ['assets/images/hero-clb.jpg'] };
  const rows = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sheets/abouts.json'), 'utf8'));
  const targetPeriods = [...new Set(rows.filter(row => row.section_key === 'target').map(row => row.category || 'Mục tiêu'))];
  assert(targetPeriods.length > 0, 'Roadmap fixture includes development periods');
  const html = publicFrame('about', site, 'Tổng quan CLB', renderAboutPage(site, rows));
  const browser = await chromium.launch({ executablePath: process.env.UI_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('http://localhost/**', async route => {
      if (new URL(route.request().url()).pathname === '/About.php') {
        await route.fulfill({ contentType: 'text/html', body: html });
        return;
      }
      // Reproduce a browser retaining the previous stylesheet version.
      if (route.request().url().includes('site.css?v=shining-layout-2')) {
        await route.fulfill({ contentType: 'text/css', body: '.about-page-banner { background: #092c48; }' });
        return;
      }
      const file = path.join(__dirname, '../public', new URL(route.request().url()).pathname);
      if (fs.existsSync(file) && fs.statSync(file).isFile()) await route.fulfill({ path: file });
      else await route.fulfill({ status: 404, body: '' });
    });
    for (const width of [1440, 768, 375, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://localhost/About.php', { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.about-org-strip').evaluate(el => getComputedStyle(el).display), 'grid', 'Page loads current organization styles');
      assert.equal(await page.locator('.about-hero-flourish').evaluate(el => el.getBoundingClientRect().width), 84, 'Hero flourish uses current CSS');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const copy = await page.locator('.tsnt-banner-body').boundingBox();
      const photo = await page.locator('.banner-slides').boundingBox();
      if (width < 768) assert(photo.y >= copy.y + copy.height - 1, 'Photo below copy on mobile');
      else assert(copy.x + copy.width <= photo.x + photo.width * .2, 'Copy clear of photo');
      assert.equal(await page.locator('.about-hero-primary').getAttribute('href'), '#ton-chi');
      assert.equal(await page.locator('#ton-chi').count(), 1);
      assert.equal(await page.locator('.about-hero-secondary').getAttribute('href'), 'contact.php');
      await page.locator('[data-hero-next]').click();
      assert(await page.locator('[data-hero-slide]').nth(1).isVisible());
      await page.locator('[data-hero-prev]').click();
      assert(await page.locator('[data-hero-slide]').first().isVisible());
      assert(await page.locator('[data-hero-slide]').first().evaluate(img => img.complete && img.naturalWidth > 0));
      const facts = page.locator('.about-org-fact');
      const milestones = page.locator('.about-roadmap-card');
      assert.equal(await milestones.count(), targetPeriods.length);
      assert.deepEqual(await milestones.locator('h3').allTextContents(), targetPeriods);
      assert.equal(await page.locator('.about-support-link').getAttribute('href'), 'contact.php');
      assert.equal(await page.locator('.about-roadmap img, .about-support img').count(), 0);
      if (targetPeriods.length >= 2) {
        const first = await milestones.nth(0).boundingBox();
        const second = await milestones.nth(1).boundingBox();
        if (width >= 768) assert(Math.abs(first.y - second.y) < 1, 'Roadmap shares a row on desktop');
        else assert(second.y >= first.y + first.height, 'Roadmap stacks on mobile');
      }
      if (process.env.UI_SCREENSHOT_DIR) {
        await page.locator('.about-roadmap').screenshot({ path: path.join(process.env.UI_SCREENSHOT_DIR, `about-roadmap-${width}.png`) });
        await page.locator('.about-support').screenshot({ path: path.join(process.env.UI_SCREENSHOT_DIR, `about-support-${width}.png`) });
      }
      const pillars = page.locator('.tsnt-pillar-card');
      assert.equal(await pillars.count(), 5);
      const pillarBoxes = await pillars.evaluateAll(items => items.map(item => {
        const r = item.getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right };
      }));
      for (const box of pillarBoxes) assert(box.x >= 0 && box.right <= width, 'Mission cards fit viewport');
      if (width === 1440) assert(pillarBoxes.every(box => Math.abs(box.y - pillarBoxes[0].y) < 1), 'Five mission cards share a desktop row');
      if (width <= 375) assert(pillarBoxes[1].y > pillarBoxes[0].y, 'Mission cards stack on phones');
      if (process.env.UI_SCREENSHOT_DIR) await page.locator('#tam-nhin-su-menh').screenshot({ path: path.join(process.env.UI_SCREENSHOT_DIR, `about-mission-${width}.png`) });
      assert.equal(await facts.count(), 4);
      const boxes = await facts.evaluateAll(items => items.map(item => {
        const { x, y, width, height } = item.getBoundingClientRect();
        return { x, y, width, height };
      }));
      if (width >= 768) assert(boxes.every(box => Math.abs(box.y - boxes[0].y) < 1), 'Organization facts share a row');
      else assert(boxes[2].y >= boxes[0].y + boxes[0].height, 'Organization facts wrap on mobile');
      for (const box of boxes) assert(box.x >= 0 && box.x + box.width <= width, 'Organization facts fit viewport');
      if (process.env.UI_SCREENSHOT_DIR) await page.locator('.about-org-strip').screenshot({ path: path.join(process.env.UI_SCREENSHOT_DIR, `about-org-${width}.png`) });
      if (process.env.UI_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.UI_SCREENSHOT_DIR, `about-hero-${width}.png`) });
      console.log(`PASS About hero ${width}px: layout, image, links, carousel`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
