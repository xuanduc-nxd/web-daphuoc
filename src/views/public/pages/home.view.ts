import { type Row } from '../../../core/config.ts';
import { type PublicPageModel } from '../../../models/types.ts';
import { e, icon, image, srcset, dateText, strip, card, empty, postHref } from '../components.ts';

export function renderHomePage(site: Row, data: PublicPageModel): string {
  const { activities = [], notifications = [], sponsors = [], students = [], blogs = [] } = data;
  const recent = activities.slice(0, 4);
  const first = recent[0];
  const heroImg = image(site.hero_image);

  const carouselSlides = recent.length
    ? recent.map((item, idx) => ({
        img: image(item.image),
        srcset: srcset(item.image),
        title: String(item.title || 'Hoạt động CLB Golf Đa Phước'),
        desc: strip(item.excerpt) || 'Hành trình kết nối đam mê và tiếp sức ước mơ sinh viên Đà Nẵng.',
        href: postHref(item),
        active: idx === 0,
      }))
    : [
        {
          img: heroImg,
          srcset: srcset(heroImg),
          title: 'Lễ trao học bổng & Đồng hành Sinh viên',
          desc: 'Tiếp sức học sinh, sinh viên vượt khó vươn lên trong học tập tại Đà Nẵng.',
          href: 'Activities.php',
          active: true,
        },
      ];

  const heroCarousel = `<div class="tsnt-carousel" data-hero-carousel aria-roledescription="carousel" aria-label="Khoảnh khắc nổi bật">
    <div class="tsnt-carousel-Stage">
      ${carouselSlides
        .map(
          (slide, idx) => `<div class="tsnt-carousel-slide ${slide.active ? 'is-active' : ''}" data-hero-slide="${idx}" ${slide.active ? '' : 'hidden'}>
        <div class="tsnt-slide-frame">
          <button type="button" class="tsnt-slide-lightbox" data-lightbox="${e(slide.img)}" aria-label="Xem ảnh: ${e(slide.title)}">
            <img src="${e(slide.img)}" srcset="${e(slide.srcset)}" sizes="(max-width:767px) calc(100vw - 36px), 580px" data-fallback="assets/images/activity-800.webp" alt="${e(slide.title)}" width="900" height="600" ${idx === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
          </button>
          ${carouselSlides.length > 1 ? `<button type="button" class="tsnt-carousel-arrow prev" data-hero-prev aria-label="Slide trước">${icon('caret-left')}</button><button type="button" class="tsnt-carousel-arrow next" data-hero-next aria-label="Slide tiếp theo">${icon('caret-right')}</button>` : ''}
        </div>
        <div class="tsnt-slide-caption">
          <a href="${e(slide.href)}" class="tsnt-slide-title">${e(slide.title)}</a>
          <p class="tsnt-slide-desc">${e(slide.desc)}</p>
        </div>
      </div>`,
        )
        .join('')}
    </div>
    ${carouselSlides.length > 1 ? `<div class="tsnt-carousel-dots" role="tablist" aria-label="Chọn slide">${carouselSlides.map((_, idx) => `<button type="button" class="tsnt-dot ${idx === 0 ? 'is-active' : ''}" data-hero-dot="${idx}" aria-label="Xem mục ${idx + 1}" aria-current="${idx === 0 ? 'true' : 'false'}"></button>`).join('')}</div>` : ''}
  </div>`;

  const noticeRows = notifications.slice(0, 5);
  const shiningStudents = students.slice(0, 3);
  const blogCards = (blogs.length ? blogs : activities).slice(0, 3);

  return `<main id="main-content">
    <section class="home-hero tsnt-hero">
      <div class="tsnt-hero-bg" aria-hidden="true">
        <div class="tsnt-hero-glow-left"></div>
        <div class="tsnt-hero-glow-right"></div>
        <div class="tsnt-hero-grid"></div>
      </div>
      <div class="container hero-layout">
        <div class="hero-copy">
          <div class="hero-eyebrow"><span class="eyebrow-dot"></span>CLB GOLF ĐA PHƯỚC &amp; NHỮNG NGƯỜI BẠN</div>
          <h1>
            <span class="hero-heading-line1">Chắp cánh ước mơ,</span>
            <span class="hero-heading-line2" data-typewriter="Thay đổi tương lai|Kết nối tri thức|Lan tỏa sẻ chia">Thay đổi tương lai</span>
          </h1>
          <p class="hero-description">Cùng ${e(site.site_name)} kiến tạo hành trình tri thức và chắp cánh ước mơ cho thế hệ trẻ Đà Nẵng. Nơi kết nối những người bạn giàu tấm lòng sẻ chia, đồng hành cùng học sinh, sinh viên vượt khó vươn lên.</p>
          <div class="hero-actions">
            <a class="button accent" href="Students.php">${icon('graduation-cap')} Về Chương trình Học bổng</a>
            <a class="button ghost-light" href="About.php">${icon('info')} Về ${e(site.site_name)}</a>
          </div>
        </div>
        <div class="hero-visual">
          ${heroCarousel}
        </div>
      </div>
    </section>

    <section id="ve-chung-toi" class="tsnt-section bg-white">
      <div class="container">
        <div class="tsnt-section-header">
          <h2 class="tsnt-title">Về chúng tôi</h2>
          <p class="tsnt-subtitle">Sứ mệnh, hành trình gắn kết đam mê thể thao và cam kết minh bạch đồng hành cùng sinh viên Đà Nẵng</p>
        </div>
        <div class="tsnt-showcase-box">
          <button type="button" class="tsnt-showcase-media" data-lightbox="${e(heroImg)}" aria-label="Xem ảnh hoạt động tiêu biểu của CLB Golf Đa Phước">
            <img src="${e(heroImg)}" srcset="${e(srcset(heroImg))}" sizes="(max-width:767px) calc(100vw - 36px), 896px" data-fallback="assets/images/activity-800.webp" alt="Hoạt động trao học bổng của CLB Golf Đa Phước và những người bạn" width="1100" height="620" loading="lazy">
            <span class="tsnt-showcase-overlay">
              <span class="tsnt-play-badge">${icon('arrows-out')}</span>
              <span class="tsnt-showcase-caption">Khoảnh khắc trao học bổng &amp; đồng hành cùng sinh viên Đại học Đà Nẵng</span>
            </span>
          </button>
        </div>
        <div class="tsnt-impact-wrap">
          <h3 class="tsnt-impact-title">Cộng đồng của chúng tôi<span class="tsnt-accent-bar"></span></h3>
          <div class="tsnt-impact-grid">
            <div class="tsnt-impact-card">
              <div class="tsnt-impact-num-row"><span class="tsnt-impact-big">${students.length}</span><span class="tsnt-impact-Small">sinh viên</span></div>
              <div class="tsnt-impact-label">Hồ sơ sinh viên được giới thiệu trên website</div>
            </div>
            <div class="tsnt-impact-card">
              <div class="tsnt-impact-num-row"><span class="tsnt-impact-big">${activities.length}</span><span class="tsnt-impact-Small">hoạt động</span></div>
              <div class="tsnt-impact-label">Câu chuyện hoạt động đã đăng</div>
            </div>
            <div class="tsnt-impact-card">
              <div class="tsnt-impact-num-row"><span class="tsnt-impact-big">${sponsors.length}</span><span class="tsnt-impact-Small">đối tác</span></div>
              <div class="tsnt-impact-label">Người và tổ chức trong danh sách tri ân</div>
            </div>
            <div class="tsnt-impact-card">
              <div class="tsnt-impact-num-row"><span class="tsnt-impact-big tsnt-impact-word">Công khai</span></div>
              <div class="tsnt-impact-label">Thông tin hoạt động và các chương trình đồng hành</div>
            </div>
          </div>
          <div class="tsnt-impact-actions">
            <a class="button outline-primary" href="About.php">Tầm nhìn &amp; Sứ mệnh</a>
            <a class="button accent" href="HonorList.php">Báo cáo &amp; Tri ân ${icon('arrow-right')}</a>
          </div>
        </div>
      </div>
    </section>

    <section id="hoc-bong" class="tsnt-section bg-primary-soft">
      <div class="container">
        <div class="tsnt-section-header-row">
          <div>
            <h2 class="tsnt-title">Học bổng &amp; Hỗ trợ</h2>
            <p class="tsnt-subtitle">Thông tin xét cấp học bổng, lịch trình sinh hoạt và các thông báo chính thức từ CLB</p>
          </div>
          <span class="tsnt-status-badge"><span class="status-dot"></span>Đang đồng hành năm học mới</span>
        </div>
        <div class="tsnt-scholarship-grid">
          <div class="tsnt-notice-panel">
            <div class="tsnt-panel-head">
              <p class="tsnt-panel-title">${icon('megaphone')} Thông báo xét cấp &amp; sinh hoạt CLB</p>
              <a class="tsnt-panel-link" href="Notifications.php">Xem tất cả</a>
            </div>
            ${
              noticeRows.length
                ? `<div class="tsnt-notice-list">${noticeRows
                    .map(
                      row => `<a class="tsnt-notice-item" href="${e(postHref(row))}">
                  <span class="tsnt-notice-icon">${icon(row.pinned ? 'push-pin' : 'bell')}</span>
                  <span class="tsnt-notice-text">${row.pinned ? '<strong class="tsnt-pin-tag">[GHIM]</strong> ' : ''}${e(row.title)}</span>
                  <time class="tsnt-notice-date">${e(dateText(row.date))}</time>
                </a>`,
                    )
                    .join('')}</div>`
                : `<div class="tsnt-panel-empty"><p>Chưa có thông báo mới. Theo dõi các cập nhật tiếp theo từ Ban điều hành.</p></div>`
            }
          </div>
          <div class="tsnt-quick-cards">
            <a class="tsnt-quick-card" href="About.php">
              <div class="tsnt-quick-card-left">
                <span class="tsnt-quick-icon">${icon('book-open')}</span>
                <div>
                  <p class="tsnt-quick-title">Giới thiệu chương trình</p>
                  <p class="tsnt-quick-sub">Tôn chỉ, mục tiêu, giá trị &amp; đối tượng hỗ trợ</p>
                </div>
              </div>
              ${icon('caret-right')}
            </a>
            <a class="tsnt-quick-card" href="Students.php">
              <div class="tsnt-quick-card-left">
                <span class="tsnt-quick-icon">${icon('graduation-cap')}</span>
                <div>
                  <p class="tsnt-quick-title">Sinh viên được đồng hành</p>
                  <p class="tsnt-quick-sub">Danh sách &amp; định hướng phát triển của các em</p>
                </div>
              </div>
              ${icon('caret-right')}
            </a>
            <a class="tsnt-quick-card tsnt-quick-card-accent" href="contact.php">
              <div class="tsnt-quick-card-left">
                <span class="tsnt-quick-icon">${icon('paper-plane-tilt')}</span>
                <div>
                  <p class="tsnt-quick-title">Kết nối &amp; Giới thiệu hồ sơ</p>
                  <p class="tsnt-quick-sub">Liên hệ trực tiếp với Ban điều hành CLB</p>
                </div>
              </div>
              ${icon('arrow-up-right')}
            </a>
          </div>
        </div>
      </div>
    </section>

    <section id="nguoi-thap-sang-niem-tin" class="tsnt-section bg-gray-soft">
      <div class="container">
        <div class="tsnt-section-header-row">
          <div>
            <h2 class="tsnt-title">Người Thắp Sáng Niềm Tin</h2>
            <p class="tsnt-subtitle">Những cá nhân, tổ chức và mạnh thường quân đồng hành cùng CLB trên hành trình hỗ trợ sinh viên</p>
          </div>
          <a class="tsnt-more-link" href="HonorList.php">Danh sách tri ân ${icon('arrow-right')}</a>
        </div>
        ${
          sponsors.length
            ? `<div class="tsnt-sponsors-grid">${sponsors
                .slice(0, 8)
                .map(
                  row => `<a class="tsnt-sponsor-card" href="HonorList.php">
              <div class="tsnt-sponsor-emblem">${icon('hand-heart')}</div>
              <h3 class="tsnt-sponsor-name">${e(row.title)}</h3>
              <p class="tsnt-sponsor-amount">${e(row.excerpt)}</p>
            </a>`,
                )
                .join('')}</div>`
            : empty('Danh sách đang được cập nhật', 'Cảm ơn những tấm lòng đã đồng hành cùng CLB.', 'hand-heart')
        }
      </div>
    </section>

    <section id="cong-dong" class="tsnt-section bg-primary-soft">
      <div class="container">
        <div class="tsnt-section-header-row">
          <div>
            <h2 class="tsnt-title">Cộng đồng CLB Đa Phước</h2>
            <p class="tsnt-subtitle">Mạng lưới gắn kết không chỉ là những suất học bổng, mà là cả hành trình đồng hành lâu dài cùng sinh viên Đà Nẵng.</p>
          </div>
          <a class="tsnt-more-link" href="Activities.php">Xem tất cả hoạt động ${icon('arrow-right')}</a>
        </div>
        ${
          first
            ? `<div class="tsnt-community-bento">
          <a class="tsnt-bento-featured" href="${e(postHref(first))}">
            <img src="${e(image(first.image))}" srcset="${e(srcset(first.image))}" sizes="(max-width:767px) calc(100vw - 36px), 720px" data-fallback="assets/images/activity-800.webp" alt="${e(first.title)}" width="900" height="600" loading="lazy">
            <div class="tsnt-bento-gradient"></div>
            <div class="tsnt-bento-content">
              <span class="tsnt-bento-badge">Cộng đồng Đà Nẵng</span>
              <h3>${e(first.title)}</h3>
              <p>${e(strip(first.excerpt))}</p>
              <div class="tsnt-bento-meta">${icon('calendar-blank')} <span>${e(dateText(first.date))}</span></div>
            </div>
          </a>
          <div class="tsnt-bento-side">
            ${
              recent.slice(1, 4).length
                ? recent
                    .slice(1, 4)
                    .map(
                      row => `<a class="tsnt-bento-item" href="${e(postHref(row))}">
                <div class="tsnt-bento-thumb"><img src="${e(image(row.image))}" srcset="${e(srcset(row.image))}" sizes="120px" data-fallback="assets/images/activity-480.webp" alt="${e(row.title)}" width="240" height="180" loading="lazy"></div>
                <div class="tsnt-bento-info">
                  <span class="tsnt-mini-tag">Hoạt động CLB</span>
                  <h4>${e(row.title)}</h4>
                  <span class="tsnt-mini-date">${icon('calendar-blank')} ${e(dateText(row.date))}</span>
                </div>
              </a>`,
                    )
                    .join('')
                : `<div class="tsnt-bento-cta-box"><h3>Lan tỏa tinh thần sẻ chia</h3><p>Cùng theo dõi các hoạt động giao lưu thể thao và trao học bổng của CLB Golf Đa Phước.</p><a class="button primary" href="Activities.php">Khám phá thêm ${icon('arrow-right')}</a></div>`
            }
          </div>
        </div>`
            : empty('Hoạt động đang được cập nhật', 'Bạn có thể xem các thông báo hoặc tìm hiểu thêm về CLB.')
        }
      </div>
    </section>

    <section id="hoat-dong" class="tsnt-section bg-white">
      <div class="container">
        <div class="tsnt-section-header">
          <h2 class="tsnt-title">Hoạt động</h2>
          <p class="tsnt-subtitle">Những gì đang diễn ra trong cộng đồng ${e(site.site_name)} và những người bạn</p>
        </div>

        <div class="tsnt-activity-blocks">
          <div class="tsnt-dual-boxes">
            <div class="tsnt-feed-box tsnt-feed-narrow">
              <div class="tsnt-feed-head">
                <span>${icon('bell-ringing')} Thông báo từ BĐH</span>
                <a href="Notifications.php">Xem tất cả</a>
              </div>
              <div class="tsnt-feed-list">
                ${
                  noticeRows.length
                    ? noticeRows
                        .map(
                          row => `<a class="tsnt-feed-row-compact" href="${e(postHref(row))}">
                    <span class="tsnt-feed-mini-icon">${icon('file-text')}</span>
                    <p>${e(row.title)}</p>
                    <time>${e(dateText(row.date))}</time>
                  </a>`,
                        )
                        .join('')
                    : `<p class="tsnt-empty-inline">Chưa có thông báo mới.</p>`
                }
              </div>
            </div>

            <div class="tsnt-feed-box tsnt-feed-wide">
              <div class="tsnt-feed-head">
                <span>${icon('newspaper')} Tin tức mới nhất</span>
                <a href="Activities.php">Xem tất cả</a>
              </div>
              <div class="tsnt-feed-list">
                ${
                  recent.length
                    ? recent
                        .slice(0, 3)
                        .map(
                          row => `<a class="tsnt-feed-row-media" href="${e(postHref(row))}">
                    <div class="tsnt-feed-thumb"><img src="${e(image(row.image))}" srcset="${e(srcset(row.image))}" sizes="80px" data-fallback="assets/images/activity-480.webp" alt="${e(row.title)}" width="160" height="160" loading="lazy"></div>
                    <div class="tsnt-feed-body">
                      <span class="tsnt-feed-tag">TIN CLB</span>
                      <h4>${e(row.title)}</h4>
                      <time>${icon('calendar-blank')} ${e(dateText(row.date))}</time>
                    </div>
                  </a>`,
                        )
                        .join('')
                    : `<p class="tsnt-empty-inline">Chưa có bài viết hoạt động mới.</p>`
                }
              </div>
            </div>
          </div>

          <div class="tsnt-subblock">
            <div class="tsnt-subblock-head">
              <h3>${icon('sparkle')} We're Shining · Gương mặt Sinh viên</h3>
              <a href="Students.php">Xem tất cả ${icon('arrow-right')}</a>
            </div>
            ${
              shiningStudents.length
                ? `<div class="tsnt-shining-grid">${shiningStudents
                    .map(st => {
                      const init = String(st.name || 'S').trim().slice(0, 1).toUpperCase();
                      return `<a class="tsnt-shining-card" href="Students.php">
                  <div class="tsnt-shining-avatar" aria-hidden="true">${e(init)}</div>
                  <div class="tsnt-shining-copy">
                    <div class="tsnt-shining-name">${e(st.name)}</div>
                    <div class="tsnt-shining-region">Cộng đồng Sinh viên Đà Nẵng</div>
                    <p class="tsnt-shining-quote">&ldquo;${e(st.direction || 'Nỗ lực học tập và rèn luyện để vươn tới ước mơ.')}&rdquo;</p>
                  </div>
                </a>`;
                    })
                    .join('')}</div>`
                : `<p class="tsnt-empty-inline">Danh sách gương mặt sinh viên đang được cập nhật.</p>`
            }
          </div>

          <div class="tsnt-subblock">
            <div class="tsnt-subblock-head">
              <h3>${icon('notebook')} Bản tin Chung tay &amp; Góc sẻ chia</h3>
              <a href="Blog.php">Xem tất cả ${icon('arrow-right')}</a>
            </div>
            ${
              blogCards.length
                ? `<div class="news-grid">${blogCards
                    .map(row => card(row, postHref(row), row.kind === 'blog' ? String(row.role || 'Góc sẻ chia') : 'Hoạt động'))
                    .join('')}</div>`
                : `<p class="tsnt-empty-inline">Hãy là người đầu tiên gửi câu chuyện chia sẻ đến CLB.</p>`
            }
          </div>
        </div>
      </div>
    </section>
  </main>`;
}
