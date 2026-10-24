const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(
  process.env.UI_PLAYWRIGHT_MODULE || "playwright-core",
);
const base = process.env.UI_TEST_BASE_URL || "http://127.0.0.1:8765";
assert(
  ["127.0.0.1", "localhost"].includes(new URL(base).hostname),
  "Chỉ chạy kiểm tra này trên máy chủ cục bộ.",
);
const output = process.env.UI_SCREENSHOT_DIR || "";
const password = process.env.UI_TEST_ADMIN_PASSWORD || "";

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.UI_CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => dialog.accept());
    const routes = [
      "/",
      "/About.php",
      "/Activities.php",
      "/Notifications.php",
      "/Blog.php",
      "/ExecutiveBoard.php",
      "/Students.php",
      "/HonorList.php",
      "/contact.php",
    ];
    if (process.env.UI_TEST_GALLERY_URL) routes.push(process.env.UI_TEST_GALLERY_URL);
    for (const width of process.env.UI_SKIP_LAYOUT === "1"
      ? []
      : [1440, 768, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        const response = await page.goto(base + route, {
          waitUntil: "networkidle",
        });
        assert.equal(response.status(), 200, route + " HTTP");
        assert.equal(await page.locator("h1").count(), 1, route + " H1");
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          route + " tràn ngang tại " + width,
        );
      }
    }
    if (process.env.UI_SKIP_LAYOUT !== "1")
      console.log("Public pages: desktop, tablet, 375px and 320px passed");
    await page.setViewportSize({width:1440,height:900});
    await page.goto(base + "/Blog.php", {waitUntil:"networkidle"});
    const blogForm=page.locator(".blog-share-form");
    assert(await blogForm.isVisible(),"Anonymous Blog form visible on desktop");
    assert(await page.locator('.blog-share-form button[type="submit"]').isEnabled());
    const desktopBlog=await page.locator(".blog-share").evaluate(element => ({intro:element.querySelector(".blog-share-intro").getBoundingClientRect().top,form:element.querySelector(".blog-share-form").getBoundingClientRect().top}));
    assert(Math.abs(desktopBlog.intro-desktopBlog.form)<4,"Blog intro and form share a row on desktop");
    await page.setViewportSize({width:375,height:900});
    await page.reload({waitUntil:"networkidle"});
    const mobileBlog=await page.locator(".blog-share").evaluate(element => ({intro:element.querySelector(".blog-share-intro").getBoundingClientRect().bottom,form:element.querySelector(".blog-share-form").getBoundingClientRect().top}));
    assert(mobileBlog.form>mobileBlog.intro,"Blog form stacks below its introduction on mobile");
    if (output) await page.screenshot({path:path.join(output,"blog-mobile.png"),fullPage:true});
    console.log("Anonymous Blog form layout passed");
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.locator("#menuToggle").click();
    assert.equal(
      await page.locator("#menuToggle").getAttribute("aria-expanded"),
      "true",
    );
    await page.keyboard.press("Tab");
    assert(
      await page
        .locator("#mobileMenu a")
        .first()
        .evaluate((el) => el === document.activeElement),
    );
    await page.locator(".submenu-toggle").click();
    assert(await page.locator("#about-submenu").isVisible());
    await page.keyboard.press("Escape");
    assert.equal(
      await page.locator("#menuToggle").getAttribute("aria-expanded"),
      "false",
    );
    console.log("Mobile navigation and keyboard passed");
    await page.goto(base + "/Activities.php", { waitUntil: "networkidle" });
    const activities = await page.locator("[data-filter-item]").count();
    assert(activities > 0, "Cần có dữ liệu hoạt động thử.");
    await page.locator("[data-search-input]").fill("khong-co-ket-qua-ui-82761");
    assert(await page.locator("[data-filter-empty]").isVisible());
    await page.locator(".collection-summary [data-reset-filters]").click();
    assert.equal(
      await page.locator("[data-filter-item]:visible").count(),
      Math.min(6, activities),
    );
    await page.locator("[data-search-input]").fill("giang duong");
    assert(
      (await page.locator("[data-filter-item]:visible").count()) > 0,
      "Tìm không dấu.",
    );
    await page.locator(".collection-summary [data-reset-filters]").click();
    const activityLinks = await page
      .locator(".news-image")
      .evaluateAll((elements) => elements.map((el) => el.href));
    for (const url of activityLinks)
      assert.equal(
        (await page.request.get(url)).status(),
        200,
        "Liên kết hoạt động",
      );
    await page.goto(activityLinks[0], { waitUntil: "networkidle" });
    await page.locator("[data-lightbox]").first().click();
    assert(await page.locator("#image-dialog").isVisible());
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#image-dialog").isVisible(), false);
    await page.locator("[data-copy-link]").click();
    await page.locator("#ui-toast").waitFor({ state: "visible" });
    assert.match(await page.locator("#ui-toast").innerText(), /Đã sao chép/);
    if (process.env.UI_TEST_GALLERY_URL) {
      await page.setViewportSize({width:1280,height:900});
      await page.goto(base + process.env.UI_TEST_GALLERY_URL, {waitUntil:"networkidle"});
      assert.equal(await page.locator('[data-gallery-group="activity"]').count(),5,"Album has cover and four more photos");
      const track = page.locator("[data-gallery-track]");
      const layout = await track.evaluate(element => ({
        overflow: element.scrollWidth > element.clientWidth,
        tops: [...element.children].map(child => Math.round(child.getBoundingClientRect().top)),
      }));
      assert(layout.overflow,"Album has horizontal overflow");
      assert.equal(new Set(layout.tops).size,1,"All album photos stay on one row");
      await page.locator("[data-gallery-scroll-next]").click();
      await page.waitForFunction(() => document.querySelector("[data-gallery-track]").scrollLeft > 10);
      await page.waitForFunction(() => !document.querySelector("[data-gallery-scroll-previous]").disabled);
      assert.equal(await page.locator("[data-gallery-scroll-previous]").isDisabled(),false);
      await page.locator(".article-cover").click();
      assert(await page.locator("[data-gallery-next]").isVisible());
      const coverSrc = await page.locator("#image-dialog-image").getAttribute("src");
      await page.locator("[data-gallery-next]").click();
      assert.notEqual(await page.locator("#image-dialog-image").getAttribute("src"),coverSrc);
      await page.keyboard.press("ArrowLeft");
      assert.equal(await page.locator("#image-dialog-image").getAttribute("src"),coverSrc);
      await page.keyboard.press("Escape");
      await page.setViewportSize({width:375,height:900});
      await page.reload({waitUntil:"networkidle"});
      assert(await track.evaluate(element => element.scrollWidth > element.clientWidth),"Mobile album can scroll sideways");
      await page.setViewportSize({width:320,height:900});
    }
    const missing = await page.goto(base + "/detail.php?id=ui-not-found", {
      waitUntil: "networkidle",
    });
    assert.equal(missing.status(), 404);
    console.log(
      "Search, empty state, article links, image dialog, copy and 404 passed",
    );
    await page.goto(base + "/Notifications.php", {waitUntil:"networkidle"});
    assert.equal(await page.locator("[data-filter-item]:visible").first().getAttribute("data-pinned"),"1","Pinned notice stays first after client sorting");
    assert(!(await page.locator("body").innerText()).includes("Thông báo đã hết hạn"));
    for (const route of ["/Sponsorship.php", "/search.php"]) {
      const response = await page.request.get(base + route);
      assert.equal(response.status(),404,route + " removed");
    }
    console.log("Removed pages and expired notifications passed");
    if (password) {
      await page.goto(base + "/admin/login.php", { waitUntil: "networkidle" });
      await page.locator("[data-toggle-password]").click();
      assert.equal(
        await page.locator('[name="password"]').getAttribute("type"),
        "text",
      );
      await page.locator('[name="username"]').fill("admin");
      await page.locator('[name="password"]').fill(password);
      await Promise.all([
        page.waitForURL("**/admin/index.php"),
        page.getByRole("button", { name: "Đăng nhập", exact: true }).click(),
      ]);
      for (const width of [1440, 375, 320]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of [
          "/admin/index.php",
          "/admin/posts.php",
          "/admin/team.php?type=board",
          "/admin/team.php?type=student",
          "/admin/post-edit.php",
          "/admin/post-edit.php?kind=activity",
          "/admin/post-edit.php?kind=notification",
          "/admin/team-edit.php?type=student",
          "/admin/settings.php",
          "/admin/content.php?type=sponsor",
          "/admin/content.php?type=about",
          "/admin/content-edit.php?type=sponsor",
          "/admin/content-edit.php?type=about",
        ]) {
          const response = await page.goto(base + route, {
            waitUntil: "networkidle",
          });
          assert.equal(response.status(), 200, route);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
            route + " tràn ngang " + width,
          );
          assert(
            !/Fatal error|Warning:/.test(
              await page.locator("body").innerText(),
            ),
            route,
          );
        }
      }
      if (process.env.UI_TEST_GALLERY_EDIT_URL) {
        await page.setViewportSize({width:375,height:900});
        await page.goto(base + process.env.UI_TEST_GALLERY_EDIT_URL,{waitUntil:"networkidle"});
        assert.equal(await page.locator("[data-gallery-item]").count(),5);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,"Gallery editor fits mobile width");
        if (output) {
          fs.mkdirSync(output,{recursive:true});
          await page.screenshot({path:path.join(output,"gallery-editor-mobile.png"),fullPage:true});
        }
      }
      await page.goto(base + "/admin/index.php", { waitUntil: "networkidle" });
      await page.locator("[data-admin-menu]").click();
      assert(await page.locator("#admin-sidebar").isVisible());
      await page.keyboard.press("Tab");
      assert(
        await page
          .locator(".admin-brand")
          .evaluate((el) => el === document.activeElement),
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("[data-admin-menu]").getAttribute("aria-expanded"),
        "false",
      );
      await page.goto(base + "/admin/post-edit.php", {
        waitUntil: "networkidle",
      });
      await page
        .locator('[name="title"]')
        .fill("Bài xem trước <script>window.__previewUnsafe=true</script>");
      await page.locator('[name="excerpt"]').fill("Tóm tắt bài xem trước.");
      await page.locator('[name="content"]').fill("Nội dung chưa lưu.");
      await page.locator("[data-post-preview]").click();
      assert(await page.locator("#post-preview-dialog").isVisible());
      assert.equal(
        await page.locator("[data-preview-content]").innerText(),
        "Nội dung chưa lưu.",
      );
      assert.equal(
        await page.evaluate(() => window.__previewUnsafe),
        undefined,
      );
      await page.keyboard.press("Escape");
      await page
        .locator('[name="image"]')
        .setInputFiles({
          name: "invalid.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("invalid"),
        });
      assert.equal(
        await page
          .locator('[name="image"]')
          .evaluate((el) => el.checkValidity()),
        false,
      );
      assert(await page.locator("[data-image-error]").isVisible());
      await page
        .locator('[name="image"]')
        .setInputFiles(path.resolve(__dirname, "fixtures/upload.png"));
      assert.equal(
        await page
          .locator('[name="image"]')
          .evaluate((el) => el.checkValidity()),
        true,
      );
      await page.locator("[data-image-preview]").waitFor({state:"visible"});
      assert(await page.locator("[data-image-preview]").isVisible());
      await page.locator('[name="kind"]').selectOption("activity");
      assert(await page.locator('[data-kind-section="activity"]').isVisible());
      await page.locator("[data-gallery-input]").setInputFiles([
        path.resolve(__dirname,"fixtures/upload.png"),
        path.resolve(__dirname,"fixtures/upload.png"),
      ]);
      assert.equal(await page.locator(".gallery-new-item").count(),2,"Album previews selected images");
      await page.locator('[name="kind"]').selectOption("notification");
      assert(await page.locator('[data-kind-section="notification"]').isVisible());
      assert.equal(await page.locator('[data-kind-section="activity"]').isVisible(),false);
      await page.goto(base + "/admin/team-edit.php?type=student", {waitUntil:"networkidle"});
      assert.equal(await page.locator('[name="image"]').count(),0,"Student editor excludes photo");
      assert(await page.locator('[name="direction"]').isVisible());
      await page.goto(base + "/admin/posts.php", { waitUntil: "networkidle" });
      if ((await page.locator("form[data-confirm]").count()) > 0) {
        const first = page.locator("form[data-confirm]").first();
        await first.getByRole("button", { name: "Xóa", exact: true }).click();
        assert(await page.locator("#confirm-dialog").isVisible());
        await page.locator("[data-confirm-cancel]").click();
        assert.equal(await page.locator("#confirm-dialog").isVisible(), false);
      }
      console.log(
        "Admin pages, menu, password, preview, upload validation and delete cancel passed",
      );
    }
    if (output) {
      fs.mkdirSync(output, { recursive: true });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(base + "/", { waitUntil: "networkidle" });
      await page.screenshot({ path: path.join(output, "home-desktop.png") });
      await page.screenshot({
        path: path.join(output, "home-full.png"),
        fullPage: true,
      });
      await page.setViewportSize({ width: 375, height: 812 });
      await page.screenshot({
        path: path.join(output, "home-mobile.png"),
        fullPage: true,
      });
      if (password) {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto(base + "/admin/index.php", {
          waitUntil: "networkidle",
        });
        await page.screenshot({ path: path.join(output, "admin-desktop.png") });
      }
    }
    assert.deepEqual(errors, [], "Lỗi JavaScript");
    console.log("UI smoke test passed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
