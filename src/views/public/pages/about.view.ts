import { type Row } from '../../../core/config.ts';
import { e, icon, image, srcset, richText } from '../components.ts';
import { bannerCarousel } from '../banner-carousel.ts';

export function renderAboutPage(site: Row, rows: Row[]): string {
  const group = (key: string) => rows.filter(row => row.section_key === key);
  const list = (key: string, symbol: string) =>
    `<ul class="about-content-list">${group(key)
      .map(row => `<li>${icon(symbol)}<div>${richText(String(row.content || ''))}</div></li>`)
      .join('')}</ul>`;

  const targets = new Map<string, Row[]>();
  for (const row of group('target')) {
    targets.set(String(row.category || 'Mục tiêu'), [...(targets.get(String(row.category || 'Mục tiêu')) || []), row]);
  }

  const heroPhoto = image(site.hero_image, 'Image/act-1.jpg');
  const aboutHero = image(site.about_hero_image, 'Image/act-1.jpg');

  const pillars = [
    {
        "title": "Tiếp sức học tập",
        "desc": "Hỗ trợ học bổng, giảm gánh nặng tài chính để sinh viên yên tâm học tập.",
        "svg": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m2 9 10-5 10 5-10 5-10-5Zm4 3v6c4 3 8 3 12 0v-6M22 9v8\"/></svg>"
    },
    {
        "title": "Đồng hành phát triển",
        "desc": "Cùng sinh viên rèn luyện kỹ năng, định hướng nghề nghiệp và phát triển toàn diện.",
        "svg": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"7\" r=\"3\"/><path d=\"M6 21v-3a6 6 0 0 1 12 0v3M5 5a3 3 0 0 0 0 6M19 5a3 3 0 0 1 0 6M2 20v-3a4 4 0 0 1 3-4M22 20v-3a4 4 0 0 0-3-4\"/></svg>"
    },
    {
        "title": "Trang bị hành trang",
        "desc": "Tạo cơ hội tham gia các hoạt động học thuật, ngoại khóa và trải nghiệm thực tiễn.",
        "svg": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M14 5c3-3 7-3 7-3s0 4-3 7l-7 7-5-5 8-6ZM6 11H2l4-5h6M11 16v6l5-5v-6M7 17l-4 4M4 16l-2 2M9 20l-2 2\"/><circle cx=\"16\" cy=\"7\" r=\"1.5\"/></svg>"
    },
    {
        "title": "Kết nối cộng đồng",
        "desc": "Lan tỏa tinh thần sẻ chia, gắn kết sinh viên, nhà tài trợ và các đối tác.",
        "svg": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m2 8 4-3 4 2 4-2 8 4-4 9-5 3-7-4-4-9Zm8-1-3 5 3 2 4-4 6 5M6 17l3-3M9 19l3-3M12 20l3-3\"/></svg>"
    },
    {
        "title": "Phát triển bền vững",
        "desc": "Xây dựng Quỹ ổn định, minh bạch và có sức lan tỏa lâu dài trong xã hội.",
        "svg": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 22V12M12 15C4 15 2 10 2 3c7 0 10 4 10 12ZM12 12c0-7 4-10 10-10 0 7-3 10-10 10ZM6 7l6 8M18 6l-6 6\"/></svg>"
    }
];

  const targetEntries = [...targets.entries()];

  return `<main id="main-content">
    <section class="tsnt-page-banner about-page-banner">
      ${bannerCarousel(site, site.about_banner_image || site.banner_image, 'about_banner_slides', 'assets/images/hero-clb.jpg', 'about-banner-photo')}
      <div class="container">
        <div class="tsnt-banner-body">
          <div class="hero-eyebrow">Tổng quan CLB Golf Đa Phước</div>
          <h1>
            <span class="tsnt-banner-title-org">${e(site.site_name)}</span>
            <span class="tsnt-banner-title-main">Thắp sáng những ước mơ, nâng bước giảng đường</span>
          </h1>
          <svg class="about-hero-flourish" viewBox="0 0 100 24" fill="none" aria-hidden="true"><path d="M3 20C28 1 49 1 67 8C78 12 86 12 97 6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
          <p class="tsnt-banner-sub">Kết nối đam mê golf, sẻ chia cơ hội học tập và đồng hành cùng thế hệ trẻ Đà Nẵng.</p>
          <div class="about-hero-actions">
            <a class="button about-hero-primary" href="#ton-chi">${icon('arrow-right')} Khám phá câu chuyện</a>
            <a class="button about-hero-secondary" href="contact.php">${icon('hand-heart')} Đồng hành cùng CLB</a>
          </div>
        </div>
      </div>
    </section>

    <section class="tsnt-section bg-white" id="ton-chi">
      <div class="container">
        <div class="tsnt-story-grid">
          <div class="tsnt-story-copy">
            <p class="tsnt-eyebrow-tag">Câu chuyện &amp; Tôn chỉ hoạt động</p>
            <h2 class="tsnt-story-heading">Từ một ước mơ nhỏ đến hành trình sẻ chia lớn</h2>
            <div class="tsnt-story-prose">
              <p><strong>${e(site.site_name)} và những người bạn</strong> được hình thành từ tâm huyết của những người yêu bộ môn golf tại Đà Nẵng với mong muốn biến niềm đam mê thể thao thành nhịp cầu thiện nguyện thiết thực, trao học bổng và tiếp sức cho sinh viên học giỏi vượt khó.</p>
              ${list('principle', 'check-circle')}
            </div>
            <blockquote class="tsnt-story-quote">
              <div class="tsnt-quote-row">
                ${icon('quotes')}
                <p>“Chúng tôi không chỉ hỗ trợ tài chính — chúng tôi xây dựng nền tảng và điểm tựa tinh thần để mỗi sinh viên và cộng đồng có thể tự vươn lên bền vững.”</p>
              </div>
              <footer class="tsnt-quote-author">— Ban điều hành ${e(site.site_name)} và những người bạn</footer>
            </blockquote>
            <div class="about-actions">
              <a class="button primary" href="ExecutiveBoard.php">Ban điều hành Quỹ ${icon('arrow-up-right')}</a>
              <a class="button secondary" href="Students.php">Hỗ trợ sinh viên</a>
            </div>
          </div>

          <div class="tsnt-story-collage">
            <div class="tsnt-collage-main">
              <button type="button" class="tsnt-collage-btn" data-lightbox="${e(heroPhoto)}" aria-label="Xem ảnh hoạt động của CLB Golf Đa Phước">
                <img src="${e(heroPhoto)}" srcset="${e(srcset(heroPhoto))}" sizes="(max-width:767px) calc(100vw - 36px), 560px" data-fallback="Image/act-1.jpg" width="800" height="600" alt="Hoạt động của CLB Golf Đa Phước">
              </button>
            </div>
            <div class="tsnt-collage-sub">
              <img src="${e(aboutHero)}" srcset="${e(srcset(aboutHero))}" sizes="192px" data-fallback="Image/act-1.jpg" width="320" height="240" alt="Hoạt động trao học bổng của CLB Golf Đa Phước" loading="lazy">
            </div>
            <div class="tsnt-collage-badge">
              <span>Đồng hành</span>
              <strong>Đà Nẵng</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="tsnt-section tsnt-org-section" aria-labelledby="org-title">
      <div class="container">
        <div class="about-org-strip">
          <div class="about-org-intro">
            <p class="about-org-eyebrow">Thông tin tổ chức</p>
            <h2 id="org-title">Quỹ học bổng<br>CLB Golf Đa Phước</h2>
          </div>
          <dl class="about-org-facts">
            <div class="about-org-fact">
              <dt><span class="about-org-icon">${icon('map-pin')}</span>Địa bàn hoạt động</dt>
              <dd>${e(site.location || 'Đà Nẵng, Việt Nam')}</dd>
            </div>
            <div class="about-org-fact">
              <dt><span class="about-org-icon">${icon('users-three')}</span>Đối tượng hỗ trợ</dt>
              <dd>Sinh viên các trường<br>đại học</dd>
            </div>
            <div class="about-org-fact">
              <dt><span class="about-org-icon"><svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4"/></svg></span>Lĩnh vực trọng tâm</dt>
              <dd>Giáo dục &amp; phát triển<br>nguồn nhân lực</dd>
            </div>
            <div class="about-org-fact">
              <dt><span class="about-org-icon"><svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></span>Hình thức hoạt động</dt>
              <dd>Phi lợi nhuận,<br>đồng hành dài hạn</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <section id="tam-nhin-su-menh" class="tsnt-section bg-white">
      <div class="container">
        <div class="tsnt-section-header">
          <p class="tsnt-eyebrow-tag">Sứ mệnh &amp; Giá trị cốt lõi</p>
          <h2 class="tsnt-title">Hành trình <span>Thắp Sáng Niềm Tin</span></h2>
          <p class="tsnt-subtitle">Quỹ Học bổng CLB Golf Đa Phước mang sứ mệnh trao cơ hội giáo dục và đồng hành toàn diện cùng sinh viên, vì một thế hệ tri thức, nhân ái và đóng góp tích cực cho cộng đồng.</p>
        </div>
        <div class="tsnt-pillars-grid">
          ${pillars
            .map(
              p => `<article class="tsnt-pillar-card">
            <div class="tsnt-pillar-icon">${p.svg}</div>
            <h3>${e(p.title)}</h3>
            <p>${e(p.desc)}</p>
          </article>`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section id="muc-tieu" class="tsnt-section bg-gray-soft about-roadmap">
      <div class="container">
        <div class="tsnt-timeline-header">
          <p class="tsnt-eyebrow-tag">Lộ trình phát triển</p>
          <h2 class="tsnt-title">Các giai đoạn trọng tâm</h2>
        </div>
        ${targetEntries.length ? `<div class="about-roadmap-grid">
          ${targetEntries.map(([period, items]) => `<article class="about-roadmap-card">
            <h3><span class="about-roadmap-dot" aria-hidden="true"></span>${e(period)}</h3>
            <ul>${items.map(row => `<li>${richText(String(row.content || ''))}</li>`).join('')}</ul>
          </article>`).join('')}
        </div>` : '<p class="about-roadmap-empty">Lộ trình phát triển đang được cập nhật.</p>'}
      </div>
    </section>

    <section class="tsnt-section bg-white">
      <div class="container">
        <div class="tsnt-about-bottom-grid">
          <section class="about-block">
            <div class="tsnt-block-head">
              <span class="tsnt-quick-icon">${icon('compass')}</span>
              <h2>Phạm vi và đối tượng</h2>
            </div>
            ${list('scope', 'arrow-right')}
          </section>
          <section class="about-block">
            <div class="tsnt-block-head">
              <span class="tsnt-quick-icon">${icon('gear-six')}</span>
              <h2>Phương thức hoạt động</h2>
            </div>
            ${list('method', 'check-circle')}
            <div class="about-actions">
              <a class="text-link" href="contact.php">Đồng hành cùng chúng tôi ${icon('arrow-up-right')}</a>
            </div>
          </section>
        </div>
      </div>
    </section>
    <section class="about-support" aria-labelledby="about-support-title">
      <div class="container about-support-inner">
        <div>
          <p class="about-support-eyebrow">Cùng trao cơ hội, cùng nuôi dưỡng ước mơ</p>
          <h2 id="about-support-title">Đồng hành cùng Quỹ</h2>
          <p>Chung tay cùng Quỹ Học bổng CLB Golf Đa Phước để tiếp sức cho nhiều sinh viên hơn trên hành trình chinh phục tri thức.</p>
        </div>
        <a class="button about-support-link" href="contact.php">${icon('hand-heart')} Liên hệ đồng hành ${icon('arrow-right')}</a>
      </div>
    </section>
  </main>`;
}
