const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { chromium } = require('playwright-core');

// Exercise real routes and assets; all sample data lives in an isolated temp directory.
(async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'student-navigation-'));
  let server;
  let browser;
  let serverError;
  let diagnostics = '';
  try {
    const rows = Array.from({ length: 25 }, (_, i) => ({
      id: `navigation-${i + 1}`, type: 'student', name: `Sinh viên kiểm thử ${i + 1}`,
      school: i === 1 ? '' : 'Trường đại học kiểm thử', major: 'Công nghệ thông tin',
      direction: 'Định hướng phát triển', expertise: 'Lĩnh vực quan tâm',
      support_needs: 'PRIVATE_SUPPORT_SENTINEL', detail: 'PRIVATE_NOTE_SENTINEL',
      image: '',
    }));
    fs.writeFileSync(path.join(temp, 'team.json'), JSON.stringify(rows));
    const portProbe = net.createServer();
    portProbe.listen(0, '127.0.0.1');
    await once(portProbe, 'listening');
    const port = portProbe.address().port;
    await new Promise(resolve => portProbe.close(resolve));
    const base = `http://127.0.0.1:${port}`;
    server = spawn(process.execPath, ['--experimental-strip-types', 'src/server.ts'], {
      cwd: path.join(__dirname, '..'), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: String(port), APP_ENV: 'test', RENDER: '',
        APP_PREVIEW_MODE: 'true', APP_PREVIEW_DATA_DIR: temp,
        APP_SESSION_DIR: path.join(temp, 'sessions'), APP_UPLOAD_DIR: path.join(temp, 'uploads'),
        SUPABASE_URL: '', SUPABASE_SECRET_KEY: '', SUPABASE_SERVICE_ROLE_KEY: '',
        CLOUDINARY_URL: '', CLOUDINARY_CLOUD_NAME: '', CLOUDINARY_API_KEY: '', CLOUDINARY_API_SECRET: '' },
    });
    server.on('error', error => { serverError = error; });
    server.stdout.on('data', chunk => { diagnostics += chunk; });
    server.stderr.on('data', chunk => { diagnostics += chunk; });
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (serverError) throw serverError;
      if (server.exitCode !== null) throw new Error(`Server exited: ${diagnostics}`);
      try {
        ready = (await fetch(`${base}/Students.php`, { signal: AbortSignal.timeout(1000) })).ok;
      } catch {}
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert(ready, `Local server failed to start: ${diagnostics}`);
    browser = await chromium.launch({
      executablePath: process.env.UI_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const checkLayout = async () => {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('.student-directory img, .student-profile img, .student-initial').count(), 0);
      assert(!/PRIVATE_(SUPPORT|NOTE)_SENTINEL/.test(await page.content()));
    };
    const navigate = async (action, expected) => {
      const responsePromise = page.waitForResponse(response => response.request().isNavigationRequest()
        && response.url() === base + expected);
      await action();
      assert.equal((await responsePromise).status(), 200);
      await page.waitForURL(base + expected);
      await page.waitForLoadState('load');
      await checkLayout();
    };
    for (const width of [1440, 390, 701, 720, 768, 800, 801, 820]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal((await page.goto(base + '/Students.php')).status(), 200);
      await checkLayout();
      assert.equal(await page.locator('.student-directory-card').count(), 12);
      // Reach the actual link using Tab and activate it using Enter.
      const link = page.locator('.student-link').first();
      for (let tab = 0; tab < 80; tab++) {
        await page.keyboard.press('Tab');
        if (await link.evaluate(el => el === document.activeElement)) break;
      }
      assert(await link.evaluate(el => el === document.activeElement), 'Profile link reachable by keyboard');
      assert(await link.evaluate(el => {
        const style = getComputedStyle(el);
        return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
      }), 'Visible keyboard focus');
      await navigate(() => page.keyboard.press('Enter'), '/Students.php?id=navigation-1');
      assert.equal(await page.locator('h1').innerText(), rows[0].name);
      assert.equal(await page.locator('.student-profile-section').count(), 3);
      await navigate(() => page.locator('.student-back').click(), '/Students.php');
      await navigate(() => page.locator('.student-pagination a').nth(1).click(), '/Students.php?page=2');
      assert.equal(await page.locator('.student-name').first().innerText(), rows[12].name);
      await navigate(() => page.locator('.student-link').first().click(), '/Students.php?id=navigation-13');
      assert.equal(await page.locator('h1').innerText(), rows[12].name);
      await navigate(() => page.locator('.student-back').click(), '/Students.php');
      await navigate(() => page.locator('.student-pagination a').nth(2).click(), '/Students.php?page=3');
      assert.equal(await page.locator('.student-directory-card').count(), 1);
      assert.equal(await page.locator('.student-name').innerText(), rows[24].name);
      await page.goto(base + '/Students.php?id=missing-student');
      assert(await page.locator('.empty-state').isVisible());
      await navigate(() => page.locator('main a.button.primary').click(), '/Students.php');
      console.log(`PASS real HTTP navigation, keyboard, pagination and layout at ${width}px`);
    }
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    console.log('Student navigation: 8 viewport flows passed, 0 failed, 0 skipped');
  } finally {
    if (browser) await browser.close();
    if (server && server.exitCode === null && !serverError) {
      const stopped = once(server, 'exit');
      server.kill();
      await stopped;
    }
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
