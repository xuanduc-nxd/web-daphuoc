const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

const base = process.env.UI_TEST_BASE_URL || 'http://127.0.0.1:8765';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Chỉ kiểm tra trên máy cục bộ.');

(async () => {
  const [dashboard, posts, team, content, settings] = await Promise.all([
    import('../src/views/admin/pages/dashboard.view.ts'),
    import('../src/views/admin/pages/posts.view.ts'),
    import('../src/views/admin/pages/team.view.ts'),
    import('../src/views/admin/pages/content.view.ts'),
    import('../src/views/admin/pages/settings.view.ts'),
  ]);
  const session = {
    data: { admin_username: 'Kiểm tra', admin_role: 'admin' },
    token: () => 'preview',
    statusToken: () => 'preview',
    teamToken: () => 'preview',
  };
  const post = {
    id: 'preview-post', version: 1, kind: 'activity', title: 'Hoạt động cộng đồng',
    excerpt: 'Kết nối sinh viên và những người đồng hành.', date: '2026-11-12',
    status: 'published', image: '',
  };
  const member = {
    id: 'preview-member', version: 1, type: 'board', name: 'Nguyễn Thị Minh',
    position: 'Ban điều hành', board_term: 'current', role_title: 'Chủ nhiệm', image: '',
  };
  const student = {
    id: 'preview-student', version: 1, type: 'student', name: 'Trần Văn Nam',
    direction: 'Học tập và phát triển kỹ năng công nghệ', school: 'Đại học Đà Nẵng',
    major: 'Công nghệ thông tin', support_needs: 'Học bổng và định hướng nghề nghiệp',
    expertise: 'Lập trình',
  };
  const sponsor = {
    id: 'preview-sponsor', version: 1, title: 'Người đồng hành',
    excerpt: 'Đồng hành cùng chương trình học bổng', sort_order: 1,
  };
  const about = {
    id: 'preview-about', version: 1, content: 'Câu chuyện của CLB',
    section_key: 'story', category: 'Giới thiệu', sort_order: 1,
  };
  const site = {
    site_name: 'CLB Golf Đa Phước', notice: 'Đồng hành cùng sinh viên Đà Nẵng',
    contact: '', phone: '', email: '', location: 'Đà Nẵng', version: 1,
  };
  const views = [
    ['Tổng quan', dashboard.dashboardView([post], [member], site, session)],
    ['Bài viết', posts.postsView([post], null, session)],
    ['Sửa bài', posts.postEditView(post, post, '', session)],
    ['Ban điều hành', team.teamView([member], 'board', session)],
    ['Sinh viên', team.teamView([student], 'student', session)],
    ['Sửa thành viên', team.teamEditView(member, member, 'board', '', session)],
    ['Sửa sinh viên', team.teamEditView(student, student, 'student', '', session)],
    ['Tri ân', content.contentView([sponsor], 'sponsor', session)],
    ['Giới thiệu', content.contentView([about], 'about', session)],
    ['Sửa tri ân', content.contentEditView(sponsor, sponsor, 'sponsor', '', session)],
    ['Sửa giới thiệu', content.contentEditView(about, about, 'about', '', session)],
    ['Cài đặt', settings.settingsView(site, '', session)],
  ];
  const pageHtml = (body) => `<!doctype html><html lang="vi"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <base href="${base}/admin/">
    <link rel="stylesheet" href="../CSS/fonts.css">
    <link rel="stylesheet" href="../CSS/icons.css">
    <link rel="stylesheet" href="../CSS/site.css">
    <link rel="stylesheet" href="admin.css">
    </head><body class="admin-body"><main class="admin-main">${body}</main></body></html>`;

  const browser = await chromium.launch({
    executablePath: process.env.UI_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage();
    for (const width of [1440, 768, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const login = await page.goto(`${base}/admin/login.php`, { waitUntil: 'networkidle' });
      assert.equal(login.status(), 200, `Đăng nhập HTTP ở ${width}px`);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `Đăng nhập tràn ngang ở ${width}px`,
      );
      for (const [name, html] of views) {
        await page.setContent(pageHtml(html), { waitUntil: 'networkidle' });
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
          `${name} tràn ngang ở ${width}px`,
        );
        if (width <= 375 && html.includes('class="panel table-wrap')) {
          assert.equal(
            await page.locator('td[data-label]').first().evaluate((element) => getComputedStyle(element).display),
            'grid',
            `${name} chưa hiển thị dạng mục trên điện thoại`,
          );
        }
      }
    }
    console.log('Admin layouts: login and 12 screens at 1440, 768, 375 and 320px passed');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
