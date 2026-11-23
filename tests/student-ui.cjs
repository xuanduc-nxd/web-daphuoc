const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

(async () => {
  const { renderStudentsPage } = await import('../src/views/public/pages/students.view.ts');
  const { publicFrame } = await import('../src/views/public/partials/layout.view.ts');

  const site = {
    site_name: 'CLB Golf Đa Phước',
    header_label: 'Quỹ Bảo Trợ Golf',
    header_title: 'CLB GOLF ĐA PHƯỚC',
  };

  const sampleStudents = [
    {
      id: 'sv-1',
      name: 'Nguyễn Văn An',
      school: 'Đại học Bách Khoa Đà Nẵng',
      major: 'Công nghệ Thông tin',
      direction: 'Định hướng nghiên cứu AI và kỹ thuật phần mềm.',
      expertise: 'Machine Learning, Web Development',
    },
    {
      id: 'sv-2',
      name: 'Trần Thị Bình',
      school: 'Đại học Kinh tế Đà Nẵng',
      major: 'Tài chính - Ngân hàng',
      direction: 'Phát triển chuyên môn thẩm định tài chính doanh nghiệp.',
      expertise: 'Phân tích dữ liệu tài chính, Fintech',
    },
    {
      id: 'sv-3',
      name: 'Lê Hoàng Cường',
      school: 'Đại học Sư phạm Kỹ thuật',
      major: 'Cơ điện tử',
      direction: 'Ứng dụng tự động hóa trong sản xuất xanh.',
      expertise: 'Robotics, IoT',
    },
  ];

  const browser = await chromium.launch({
    executablePath: process.env.UI_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });

    let currentHtml = '';
    await page.route('http://localhost/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/Students.php') {
        await route.fulfill({ contentType: 'text/html; charset=utf-8', body: currentHtml });
        return;
      }
      const file = path.join(__dirname, '../public', url.pathname);
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        await route.fulfill({ path: file });
      } else {
        await route.fulfill({ status: 404, body: '' });
      }
    });

    const viewports = [
      { name: 'Desktop 1440', width: 1440, height: 900 },
      { name: 'Mobile 390', width: 390, height: 844 },
      ...[701, 720, 768, 820].map(width => ({ name: `Intermediate ${width}`, width, height: 900 })),
    ];

    console.log('--- 1. Testing Standard Directory List ---');
    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên · CLB Golf Đa Phước', renderStudentsPage(sampleStudents, 1, ''));

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });

      // Check single H1
      assert.equal(await page.locator('h1').count(), 1, `${vp.name}: Exactly 1 H1`);
      assert.equal(await page.locator('h1').innerText(), 'Hỗ trợ sinh viên', `${vp.name}: H1 heading text`);

      // Verify no horizontal overflow
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(hasOverflow, false, `${vp.name}: No horizontal overflow`);

      // Verify NO photos and NO initials avatars in list
      const imagesCount = await page.locator('.student-grid img, .student-directory img').count();
      assert.equal(imagesCount, 0, `${vp.name}: No images in student directory`);
      const initialsCount = await page.locator('.student-initial').count();
      assert.equal(initialsCount, 0, `${vp.name}: No initials avatars in student directory`);

      // Verify each student entry
      const cards = page.locator('.student-directory-card');
      assert.equal(await cards.count(), 3, `${vp.name}: 3 student cards rendered`);

      for (let i = 0; i < sampleStudents.length; i++) {
        const card = cards.nth(i);
        const nameText = await card.locator('.student-name').innerText();
        assert.equal(nameText, sampleStudents[i].name, `${vp.name}: Correct student name`);
        const schoolText = await card.locator('.student-school').innerText();
        assert.equal(schoolText, sampleStudents[i].school, `${vp.name}: Correct student school`);
        const majorText = await card.locator('.student-major').innerText();
        assert.equal(majorText, sampleStudents[i].major, `${vp.name}: Correct student major`);

        // Check clear 'Xem hồ sơ' link
        const profileLink = card.locator('.student-link');
        assert.equal(await profileLink.isVisible(), true, `${vp.name}: Profile link is visible`);
        assert.match(await profileLink.innerText(), /Xem hồ sơ/, `${vp.name}: Link text has 'Xem hồ sơ'`);
        assert.equal(await profileLink.getAttribute('href'), `Students.php?id=${sampleStudents[i].id}`, `${vp.name}: Correct profile link href`);
      }

      // Responsive specifics
      const headVisible = await page.locator('.student-directory-head').isVisible();
      if (vp.width > 800) {
        assert.equal(headVisible, true, 'Desktop: directory header is visible');
      } else {
        assert.equal(headVisible, false, 'Mobile: directory header is hidden');
        // Mobile cards should stack vertically and links should have touch height >= 42
        const firstLinkBox = await cards.first().locator('.student-link').boundingBox();
        assert(firstLinkBox && firstLinkBox.height >= 40, 'Mobile link has touch height >= 40px');
      }
    }
    console.log(`✓ Standard directory list passed at ${viewports.map(vp => vp.width).join(', ')}px`);

    console.log('--- 2. Testing Long Fields (Overflow Prevention) ---');
    const longStudents = [
      {
        id: 'long-1',
        name: 'NguyễnTrầnHoàngĐứcVănNguyễnTrầnHoàngĐứcVănTênRấtDàiKhôngCóKhoảngTrắng1234567890',
        school: 'TrườngĐạiHọcCôngNghệThôngTinVàTruyềnThôngViệtHànĐàNẵngRấtDàiKhôngCóKhoảngCách',
        major: 'KỹThuậtPhầnMềmChuyênSâuHệThốngNhúngVàTríTuệNhânTạoToànDiệnSiêuDài',
      },
    ];
    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên · CLB Golf Đa Phước', renderStudentsPage(longStudents, 1, ''));

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(hasOverflow, false, `${vp.name}: No horizontal overflow with long continuous strings`);
    }
    console.log(`✓ Long fields overflow test passed at ${viewports.map(vp => vp.width).join(', ')}px`);

    console.log('--- 3. Testing Missing Fields Handling ---');
    const missingFieldStudents = [
      { id: 'm-1', name: 'Sinh viên Thiếu Trường Ngành' },
      { id: 'm-2', name: 'Sinh viên Có Trường', school: 'ĐH Đà Nẵng' },
      { id: 'm-3', name: 'Sinh viên Có Ngành', major: 'Ngôn ngữ Nhật' },
    ];
    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên · CLB Golf Đa Phước', renderStudentsPage(missingFieldStudents, 1, ''));

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(hasOverflow, false, `${vp.name}: Missing fields: No horizontal overflow`);
      const bodyText = await page.locator('body').innerText();
      assert(!bodyText.includes('undefined'), 'No undefined text');
      assert(!bodyText.includes('null'), 'No null text');
    }
    console.log('✓ Missing fields handling passed');

    console.log('--- 4. Testing Empty Student List ---');
    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên · CLB Golf Đa Phước', renderStudentsPage([], 1, ''));

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(hasOverflow, false, `${vp.name}: Empty list: No horizontal overflow`);
      assert(await page.locator('.empty-state').isVisible(), 'Empty state is visible');
      assert.match(await page.locator('.empty-state').innerText(), /Thông tin sinh viên đang được cập nhật/);
      assert.equal(await page.locator('.student-directory-head').count(), 0, 'No header when empty');
      assert.equal(await page.locator('.student-pagination').count(), 0, 'No pagination when empty');
    }
    console.log('✓ Empty student list passed');

    console.log('--- 5. Testing Pagination (>12 rows) ---');
    const manyStudents = Array.from({ length: 25 }, (_, i) => ({
      id: `p-${i + 1}`,
      name: `Sinh viên thứ ${i + 1}`,
      school: `Trường đại học số ${i + 1}`,
      major: `Ngành học số ${i + 1}`,
    }));

    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên · CLB Golf Đa Phước', renderStudentsPage(manyStudents, 1, ''));
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(hasOverflow, false, `${vp.name}: Pagination page 1: No horizontal overflow`);
      assert.equal(await page.locator('.student-directory-card').count(), 12, 'Page 1 has exactly 12 cards');
      assert(await page.locator('.student-pagination').isVisible(), 'Pagination is visible');
      assert.equal(await page.locator('.student-pagination a').count(), 3, '3 pagination page links');
    }

    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên · CLB Golf Đa Phước', renderStudentsPage(manyStudents, 2, ''));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.student-directory-card').count(), 12, 'Page 2 has 12 cards');
    assert.match(await page.locator('.student-directory-card').first().innerText(), /Sinh viên thứ 13/);

    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên · CLB Golf Đa Phước', renderStudentsPage(manyStudents, 3, ''));
    await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.student-directory-card').count(), 1, 'Page 3 has 1 card');
    assert.match(await page.locator('.student-directory-card').first().innerText(), /Sinh viên thứ 25/);
    console.log('✓ Pagination (>12 rows) passed');

    console.log('--- 6. Testing Student Profile Page ---');
    currentHtml = publicFrame('Students.php', site, 'Nguyễn Văn An · CLB Golf Đa Phước', renderStudentsPage(sampleStudents, 1, 'sv-1'));

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(hasOverflow, false, `${vp.name}: Profile: No horizontal overflow`);

      // NO photos and NO initials avatars in profile
      assert.equal(await page.locator('.student-profile img').count(), 0, `${vp.name}: No images in profile`);
      assert.equal(await page.locator('.student-initial').count(), 0, `${vp.name}: No initials in profile`);

      // Heading and eyebrow
      assert.equal((await page.locator('.student-profile-head .eyebrow').textContent()).trim(), 'Gương mặt sinh viên');
      assert.equal((await page.locator('.student-profile-head h1').textContent()).trim(), 'Nguyễn Văn An');

      // Sections
      const sections = page.locator('.student-profile-section');
      assert.equal(await sections.count(), 3, '3 sections in profile');
      assert.match(await sections.nth(0).innerText(), /Trường và ngành học/);
      assert.match(await sections.nth(0).innerText(), /Đại học Bách Khoa Đà Nẵng · Công nghệ Thông tin/);
      assert.match(await sections.nth(1).innerText(), /Định hướng phát triển/);
      assert.match(await sections.nth(1).innerText(), /Định hướng nghiên cứu AI và kỹ thuật phần mềm/);
      assert.match(await sections.nth(2).innerText(), /Lĩnh vực quan tâm/);
      assert.match(await sections.nth(2).innerText(), /Machine Learning, Web Development/);

      // Back link
      const backLink = page.locator('.student-back');
      assert(await backLink.isVisible(), 'Back link is visible');
      assert.equal(await backLink.getAttribute('href'), 'Students.php');
      assert.match(await backLink.innerText(), /Danh sách sinh viên/);
    }
    console.log('✓ Student profile passed at desktop 1440 and mobile 390');

    console.log('--- 7. Testing Missing Student Profile ID ---');
    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên · CLB Golf Đa Phước', renderStudentsPage(sampleStudents, 1, 'unknown-id'));

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(hasOverflow, false, `${vp.name}: Missing profile: No horizontal overflow`);
      assert(await page.locator('.empty-state').isVisible(), 'Not found empty state visible');
      assert.match(await page.locator('.empty-state').innerText(), /Không tìm thấy sinh viên/);
      const returnBtn = page.locator('a.button.primary');
      assert.equal(await returnBtn.getAttribute('href'), 'Students.php');
      assert.match(await returnBtn.innerText(), /Về danh sách sinh viên/);
    }
    console.log('✓ Missing profile ID handling passed');

    console.log('--- 8. Testing Keyboard Focus Accessibility ---');
    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên · CLB Golf Đa Phước', renderStudentsPage(sampleStudents, 1, ''));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });

    // Focus on first profile link directly and test activeElement
    const firstLink = page.locator('.student-link').first();
    await firstLink.focus();
    const isFocused = await firstLink.evaluate((el) => document.activeElement === el);
    assert.equal(isFocused, true, 'First profile link received keyboard focus');

    // Profile page back link focus
    currentHtml = publicFrame('Students.php', site, 'Nguyễn Văn An · CLB Golf Đa Phước', renderStudentsPage(sampleStudents, 1, 'sv-1'));
    await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
    const backBtn = page.locator('.student-back');
    await backBtn.focus();
    const isBackFocused = await backBtn.evaluate((el) => document.activeElement === el);
    assert.equal(isBackFocused, true, 'Back link received keyboard focus');
    console.log('✓ Keyboard focus accessibility passed');

    console.log('--- 9. Testing Absence of Private Data ---');
    const privateStudent = {
      id: 'sv-sec',
      name: 'Sinh viên Có Dữ Liệu Riêng',
      school: 'ĐH Kỹ thuật',
      major: 'Hệ thống thông tin',
      direction: 'Định hướng công khai',
      expertise: 'An ninh mạng',
      support_needs: 'Nhu cầu nhận học bổng 20.000.000đ/kỳ',
      detail: 'Ghi chú nội bộ bí mật gia đình',
      image: 'https://cdn.example.com/private-photo-xyz.jpg',
      phone: '0987654321',
      email: 'private_contact@test.com',
    };

    // List view
    currentHtml = publicFrame('Students.php', site, 'Hỗ trợ sinh viên', renderStudentsPage([privateStudent], 1, ''));
    await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
    let pageContent = await page.content();
    assert(!pageContent.includes('Nhu cầu nhận học bổng'), 'List does not leak support_needs');
    assert(!pageContent.includes('Ghi chú nội bộ bí mật'), 'List does not leak detail/notes');
    assert(!pageContent.includes('private-photo-xyz.jpg'), 'List does not leak photo URL');
    assert(!pageContent.includes('0987654321'), 'List does not leak phone');
    assert(!pageContent.includes('private_contact@test.com'), 'List does not leak email');

    // Profile view
    currentHtml = publicFrame('Students.php', site, 'Chi tiết sinh viên', renderStudentsPage([privateStudent], 1, 'sv-sec'));
    await page.goto('http://localhost/Students.php', { waitUntil: 'networkidle' });
    pageContent = await page.content();
    assert(!pageContent.includes('Nhu cầu nhận học bổng'), 'Profile does not leak support_needs');
    assert(!pageContent.includes('Ghi chú nội bộ bí mật'), 'Profile does not leak detail/notes');
    assert(!pageContent.includes('private-photo-xyz.jpg'), 'Profile does not leak photo URL');
    assert(!pageContent.includes('0987654321'), 'Profile does not leak phone');
    assert(!pageContent.includes('private_contact@test.com'), 'Profile does not leak email');
    console.log('✓ Absence of private data passed');

    console.log('\n=== ALL STUDENT DIRECTORY & PROFILE UI TESTS PASSED! ===');
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
