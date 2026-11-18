const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

(async () => {
  const { settingsView } = await import('../src/views/admin/pages/settings.view.ts');
  const session = { token: () => 'test-token' };
  const site = { id: 'main', version: 2, site_name: 'CLB Golf Đa Phước', header_label: 'Quỹ học bổng', header_title: 'CLB Golf Đa Phước', banner_image: 'assets/images/hero-clb.jpg', about_banner_image: 'assets/images/hero-clb.jpg', banner_slides: ['assets/images/activity-800.webp'], about_banner_slides: [], hero_image: 'Image/act-1.jpg', about_hero_image: 'Image/act-1.jpg', notice: '', contact: '', phone: '', email: '', location: '', gallery: [] };
  const browser = await chromium.launch({ executablePath: process.env.UI_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    const url = 'http://127.0.0.1:8798/admin/settings.php';
    await page.route(url, route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: route.request().method() === 'POST'
        ? '<div class="flash error">Trang Cài đặt đã cũ.</div>'
        : `<html><body>${settingsView(site, '', session)}</body></html>`,
    }));
    await page.goto(url);
    await page.addScriptTag({ path: path.join(__dirname, '../public/admin/admin.js') });
    const input = page.locator('[name="banner_upload"]');
    await input.setInputFiles({ name: 'banner.png', mimeType: 'image/png', buffer: fs.readFileSync(path.join(__dirname, '../public/assets/images/favicon.png')) });
    assert((await page.locator('.settings-page-photos').first().locator('.settings-primary-photo [data-image-preview]').getAttribute('src')).startsWith('blob:'), 'Ảnh chính được xem trước');
    assert(!(await page.locator('.settings-page-photos').nth(1).locator('.settings-primary-photo [data-image-preview]').getAttribute('src')).startsWith('blob:'), 'Ảnh trang Giới thiệu không đổi');
    const extra = page.locator('.settings-page-photos').first().locator('.settings-slide-row').first();
    await extra.locator('[data-banner-remove]').check();
    assert.equal(await extra.locator('input[name="banner_slide[]"]').inputValue(), '', 'Gỡ ảnh chỉ xóa vị trí đã chọn');
    await extra.locator('[data-banner-remove]').uncheck();
    assert.equal(await extra.locator('input[name="banner_slide[]"]').inputValue(), site.banner_slides[0], 'Có thể hoàn tác trước khi lưu');
    await page.locator('button[type="submit"]').click();
    await page.locator('.flash.error').waitFor();
    assert.equal(await input.evaluate(el => el.files.length), 1, 'Ảnh vẫn được chọn sau lỗi lưu');
    assert.equal(await page.locator('.settings-page-photos').first().locator('.settings-primary-photo [data-image-preview]').isVisible(), true, 'Ảnh xem trước vẫn hiển thị');
    assert.equal(await page.locator('button[type="submit"]').isEnabled(), true, 'Có thể thử lại');
    console.log('Settings save error keeps the selected image and preview');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
