import { type Row } from '../../../core/config.ts';
import { e, icon, image, srcset, richText, breadcrumb } from '../components.ts';

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

  const phoneClean = String(site.phone || '').replace(/[^0-9+]/g, '');
  const heroPhoto = image(site.hero_image, 'Image/act-1.jpg');

  const pillars = [
    {
      theme: 'blue',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      tag: 'CHẮP CÁNH TRI THỨC',
      title: 'Tài trợ học bổng, nâng cao năng lực cộng đồng',
      desc: 'Đồng hành và hỗ trợ học sinh, sinh viên có hoàn cảnh khó khăn vững bước đến giảng đường, theo đuổi tri thức và hiện thực hóa ước mơ.',
    },
    {
      theme: 'green',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z"/><path d="M9 21V13h6v8"/></svg>',
      tag: 'ĐỒNG HÀNH DÀI HẠN',
      title: 'Nuôi dưỡng hành trình trưởng thành toàn diện',
      desc: 'Không chỉ trao học bổng, CLB đồng hành cùng người học trong học tập, cuộc sống và hành trình trưởng thành, hướng tới những công dân có ích cho gia đình và xã hội.',
    },
    {
      theme: 'orange',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      tag: 'PHÁT TRIỂN TOÀN DIỆN',
      title: 'Trang bị hành trang tương lai',
      desc: 'Bồi dưỡng kiến thức, kỹ năng mềm, kỹ năng nghề nghiệp, giao tiếp, ứng xử và kinh nghiệm thực tiễn, mở rộng cơ hội việc làm và phát triển sự nghiệp.',
    },
    {
      theme: 'purple',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      tag: 'KẾT NỐI CỘNG ĐỒNG',
      title: 'Lan tỏa giá trị nhân văn đến cộng đồng',
      desc: 'Xây dựng cộng đồng và Đại gia đình CLB Golf Đa Phước, tạo môi trường giao lưu, sẻ chia, học hỏi và lan tỏa tinh thần tương thân tương ái.',
    },
    {
      theme: 'cyan',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>',
      tag: 'KIẾN TẠO NGUỒN NHÂN LỰC',
      title: 'Phát triển nhân lực chất lượng cao cho tương lai',
      desc: 'Gắn kết trách nhiệm an sinh xã hội của CLB, hướng tới bồi dưỡng thế hệ sinh viên giàu tri thức, bản lĩnh và đóng góp cho sự phát triển bền vững của đất nước.',
    },
  ];

  const targetEntries = [...targets.entries()];

  return `<main id="main-content">
    <section class="tsnt-page-banner">
      <div class="container">
        ${breadcrumb('Giới thiệu')}
        <div class="tsnt-banner-body">
          <div class="hero-eyebrow"><span class="eyebrow-dot"></span>Về chúng tôi</div>
          <h1>
            <span class="tsnt-banner-title-org">${e(site.site_name)}</span>
            <span class="tsnt-banner-title-main">Thắp sáng những ước mơ, nâng bước giảng đường</span>
          </h1>
          <p class="tsnt-banner-sub">Bền bỉ kết nối niềm đam mê thể thao với trách nhiệm xã hội, hỗ trợ thiết thực cho các học sinh, sinh viên có hoàn cảnh khó khăn vươn lên trong học tập tại Đà Nẵng.</p>
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
              <button type="button" class="tsnt-collage-btn" data-lightbox="Image/act-1.jpg" aria-label="Xem ảnh hoạt động trao học bổng">
                <img src="Image/act-1.jpg" srcset="${e(srcset('Image/act-1.jpg'))}" sizes="(max-width:767px) calc(100vw - 36px), 560px" width="800" height="600" alt="Hoạt động trao học bổng của CLB Golf Đa Phước">
                <span class="tsnt-collage-caption">Những bước chân đồng hành cùng sinh viên Đà Nẵng</span>
              </button>
            </div>
            <div class="tsnt-collage-sub">
              <img src="${e(heroPhoto)}" srcset="${e(srcset(heroPhoto))}" sizes="192px" data-fallback="assets/images/activity-480.webp" width="320" height="240" alt="Từ một ước mơ nhỏ đến hành trình lớn" loading="lazy">
            </div>
            <div class="tsnt-collage-badge">
              <span>Đồng hành</span>
              <strong>Đà Nẵng</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="tsnt-section bg-gray-soft tsnt-org-section">
      <div class="container">
        <div class="tsnt-org-grid">
          <div>
            <p class="tsnt-eyebrow-tag">Thông tin tổ chức</p>
            <h2 class="tsnt-org-title">${e(site.site_name)}</h2>
            <p class="tsnt-org-sub">Da Phuoc Golf Club &amp; Friends · Scholarship Fund</p>
            <p class="tsnt-org-desc">${e(site.notice)}</p>
          </div>
          <div class="tsnt-org-cards">
            <div class="tsnt-org-card">
              <span class="tsnt-org-icon">${icon('map-pin')}</span>
              <div>
                <p class="tsnt-org-label">Khu vực hoạt động</p>
                <p class="tsnt-org-val">${e(site.location || 'Đà Nẵng, Việt Nam')}</p>
              </div>
            </div>
            <div class="tsnt-org-card">
              <span class="tsnt-org-icon">${icon('phone')}</span>
              <div>
                <p class="tsnt-org-label">Điện thoại liên hệ</p>
                <p class="tsnt-org-val">${phoneClean ? `<a href="tel:${e(phoneClean)}">${e(site.phone)}</a>` : 'Liên hệ qua trang thông tin CLB'}</p>
              </div>
            </div>
            <div class="tsnt-org-card">
              <span class="tsnt-org-icon">${icon('envelope')}</span>
              <div>
                <p class="tsnt-org-label">Email chính thức</p>
                <p class="tsnt-org-val">${site.email ? `<a href="mailto:${e(site.email)}">${e(site.email)}</a>` : 'Đang cập nhật tại trang Liên hệ'}</p>
              </div>
            </div>
            <div class="tsnt-org-card">
              <span class="tsnt-org-icon">${icon('hand-heart')}</span>
              <div>
                <p class="tsnt-org-label">Sứ mệnh trọng tâm</p>
                <p class="tsnt-org-val">Khuyến học khuyến tài &amp; Hỗ trợ sinh viên</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="tam-nhin-su-menh" class="tsnt-section bg-white">
      <div class="container">
        <div class="tsnt-section-header">
          <p class="tsnt-eyebrow-tag">Sứ mệnh &amp; Giá trị cốt lõi</p>
          <h2 class="tsnt-title">Hành trình Thắp Sáng Niềm Tin</h2>
          <p class="tsnt-subtitle">${e(site.site_name)} mang sứ mệnh trao cơ hội giáo dục và đồng hành toàn diện cùng những sinh viên có hoàn cảnh khó khăn nhưng giàu nghị lực và khát vọng vươn lên.</p>
        </div>
        <div class="tsnt-pillars-grid">
          ${pillars
            .map(
              p => `<article class="tsnt-pillar-card is-${p.theme}">
            <span class="tsnt-pillar-topline"></span>
            <div class="tsnt-pillar-icon">${p.svg}</div>
            <p class="tsnt-pillar-tag">${e(p.tag)}</p>
            <h3>${e(p.title)}</h3>
            <p>${e(p.desc)}</p>
          </article>`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section id="muc-tieu" class="tsnt-section bg-gray-soft">
      <div class="container">
        <div class="tsnt-timeline-header">
          <p class="tsnt-eyebrow-tag">Lộ trình &amp; Mục tiêu phát triển</p>
          <h2 class="tsnt-title">Các cột mốc &amp; Mục tiêu quan trọng</h2>
          <p class="tsnt-subtitle">Định hướng phát triển và các mục tiêu đồng hành lâu dài cùng học sinh, sinh viên của ${e(site.site_name)}.</p>
        </div>
        ${
          targetEntries.length
            ? `<div class="tsnt-timeline">
          <div class="tsnt-timeline-line" aria-hidden="true"></div>
          ${targetEntries
            .map(([period, items], idx) => {
              const isEven = idx % 2 === 1;
              const isLast = idx === targetEntries.length - 1;
              const badgeLabel = isLast ? '★' : String(idx + 1).padStart(2, '0');
              return `<article class="tsnt-timeline-item ${isEven ? 'is-reversed' : ''} ${isLast ? 'is-featured' : ''}">
              <div class="tsnt-timeline-content">
                <span class="tsnt-timeline-node-mobile">${e(badgeLabel)}</span>
                <div class="tsnt-timeline-card">
                  <span class="tsnt-timeline-step">Giai đoạn 0${idx + 1}</span>
                  <h3>${e(period)}</h3>
                  <ul class="tsnt-timeline-list">${items.map(row => `<li>${richText(String(row.content || ''))}</li>`).join('')}</ul>
                </div>
              </div>
              <div class="tsnt-timeline-node" aria-hidden="true">${e(badgeLabel)}</div>
              <div class="tsnt-timeline-visual">
                <div class="tsnt-timeline-photo">
                  <img src="Image/act-1.jpg" srcset="${e(srcset('Image/act-1.jpg'))}" sizes="320px" width="480" height="320" alt="${e(period)}" loading="lazy">
                </div>
              </div>
            </article>`;
            })
            .join('')}
        </div>`
            : ''
        }
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
  </main>`;
}
