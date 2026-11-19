import { type Row } from '../../../core/config.ts';
import { type PublicPageModel } from '../../../models/types.ts';
import { e, icon, image, srcset, dateText, card, empty, postHref } from '../components.ts';
import { bannerCarousel } from '../banner-carousel.ts';
import { youtubeEmbedUrl, youtubeVideoId } from '../../../services/youtube.ts';

function siteGalleryView(gallery: string[]): string {
  if (!gallery.length) return '';
  return `<section class="home-site-gallery article-gallery" data-article-gallery aria-label="Album ảnh CLB Golf Đa Phước">
    <div class="article-gallery-heading">
      <div>
        <p class="home-gallery-kicker">ALBUM ẢNH</p>
        <h3>Khoảnh khắc của CLB</h3>
        <p class="home-gallery-copy">Bấm vào ảnh để xem lớn hoặc vuốt ngang để xem thêm.</p>
      </div>
      <div class="article-gallery-controls" aria-label="Điều hướng album ảnh" hidden>
        <button type="button" data-gallery-scroll-previous aria-label="Ảnh trước" disabled>${icon('arrow-left')}</button>
        <button type="button" data-gallery-scroll-next aria-label="Ảnh tiếp theo">${icon('arrow-right')}</button>
      </div>
    </div>
    <div class="article-gallery-grid" data-gallery-track tabindex="0" aria-label="Vuốt ngang hoặc dùng nút mũi tên để xem thêm ảnh">
      ${gallery.map((url,index) => `<button type="button" data-lightbox="${e(image(url))}" data-gallery-group="site-gallery" aria-label="Xem ảnh album CLB ${index + 1}">
        <img src="${e(image(url))}" srcset="${e(srcset(url))}" sizes="(max-width:767px) 78vw, 320px" data-fallback="assets/images/activity-800.webp" alt="Khoảnh khắc CLB Golf Đa Phước ${index + 1}" width="640" height="480" loading="lazy" decoding="async">
      </button>`).join('')}
    </div>
  </section>`;
}

export function renderHomePage(site: Row, data: PublicPageModel): string {
  const { activities = [], notifications = [], sponsors = [], students = [], blogs = [] } = data;
  const recent = activities.slice(0, 4);
  const heroImg = image(site.hero_image);
  const showcaseVideo = youtubeEmbedUrl(youtubeVideoId(site.showcase_video_url));
  const siteGallery = Array.isArray(site.gallery)
    ? [...new Set(site.gallery.filter((url: unknown): url is string => typeof url === 'string' && Boolean(url)))]
    : [];

  const noticeRows = notifications.slice(0, 5);
  const blogCards = (blogs.length ? blogs : activities).slice(0, 3);

  return `<main id="main-content">
    <section class="home-hero tsnt-hero">
      <div class="tsnt-hero-bg">${bannerCarousel(site, site.banner_image, 'banner_slides', 'assets/images/hero-clb.jpg')}</div>
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
      </div>
    </section>

    <section id="ve-chung-toi" class="tsnt-section bg-white">
      <div class="container">
        <div class="tsnt-section-header">
          <h2 class="tsnt-title">Về chúng tôi</h2>
          <p class="tsnt-subtitle">Sứ mệnh, hành trình gắn kết đam mê thể thao và cam kết minh bạch đồng hành cùng sinh viên Đà Nẵng</p>
        </div>
        <div class="tsnt-showcase-box">
          ${showcaseVideo ? `<div class="tsnt-showcase-media"><iframe src="${e(showcaseVideo)}" title="Video hoạt động của CLB Golf Đa Phước" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : `<div class="tsnt-showcase-media">
            <img src="${e(heroImg)}" srcset="${e(srcset(heroImg))}" sizes="(max-width:767px) calc(100vw - 36px), 896px" data-fallback="assets/images/activity-800.webp" alt="Hoạt động trao học bổng của CLB Golf Đa Phước và những người bạn" width="1100" height="620" loading="lazy">
            <span class="tsnt-showcase-overlay">
              <span class="tsnt-showcase-caption">Khoảnh khắc trao học bổng &amp; đồng hành cùng sinh viên Đại học Đà Nẵng</span>
            </span>
          </div>`}
        </div>
        ${siteGalleryView(siteGallery)}
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

    <section id="hoc-bong" class="tsnt-section bg-primary-soft home-activities-section">
      <div class="container">
        <div class="tsnt-section-header-row">
          <div>
            <h2 class="tsnt-title">Hoạt động nổi bật</h2>
            <p class="tsnt-subtitle">Những dấu mốc và hoạt động gần đây của CLB</p>
          </div>
          <a class="tsnt-more-link home-activities-desktop-link" href="Activities.php">Xem tất cả hoạt động ${icon('arrow-right')}</a>
        </div>
        ${recent.length ? `<div class="home-activity-grid">${recent.map((row, index) => {
          const cover = row.image ? `<img src="${e(image(row.image))}" srcset="${e(srcset(row.image))}" sizes="(max-width:767px) 84vw, (max-width:1100px) 44vw, 280px" alt="${e(row.title)}" loading="lazy" decoding="async">` : `<span class="home-activity-placeholder">${icon('golf')}</span>`;
          return `<article class="home-activity-card" style="--activity-order:${index}"><a class="home-activity-cover" href="${e(postHref(row))}">${cover}<span class="home-activity-label">Hoạt động</span></a><div class="home-activity-body"><time>${e(dateText(row.date))}</time><h3><a href="${e(postHref(row))}">${e(row.title)}</a></h3><a class="home-activity-read" href="${e(postHref(row))}">Xem hoạt động ${icon('arrow-right')}</a></div></article>`;
        }).join('')}</div><a class="button primary home-activities-more" href="Activities.php">Xem thêm hoạt động ${icon('arrow-right')}</a>` : `<div class="home-activities-empty"><p>Hoạt động mới đang được cập nhật.</p><a href="Activities.php">Xem trang hoạt động ${icon('arrow-right')}</a></div>`}
      </div>
    </section>

    <section id="cong-dong" class="tsnt-section bg-primary-soft home-notifications-section">
      <div class="container">
        <div class="tsnt-section-header-row">
          <div>
            <h2 class="tsnt-title">Thông báo mới</h2>
            <p class="tsnt-subtitle">Cập nhật lịch sinh hoạt, học bổng và thông tin chính thức từ CLB</p>
          </div>
          <a class="tsnt-more-link" href="Notifications.php">Xem tất cả thông báo ${icon('arrow-right')}</a>
        </div>
        ${noticeRows.length ? `<div class="home-activity-grid home-notice-grid">${noticeRows.slice(0, 4).map((row, index) => `<article class="home-activity-card" style="--activity-order:${index}"><a class="home-activity-cover" href="${e(postHref(row))}">${row.image ? `<img src="${e(image(row.image))}" srcset="${e(srcset(row.image))}" sizes="(max-width:767px) 84vw, (max-width:1100px) 44vw, 280px" alt="${e(row.title)}" loading="lazy" decoding="async">` : `<span class="home-activity-placeholder">${icon('bell-ringing')}</span>`}<span class="home-activity-label">${row.pinned ? 'Thông báo ghim' : 'Thông báo CLB'}</span></a><div class="home-activity-body"><time>${e(dateText(row.date))}</time><h3><a href="${e(postHref(row))}">${e(row.title)}</a></h3><a class="home-activity-read" href="${e(postHref(row))}">Đọc thông báo ${icon('arrow-right')}</a></div></article>`).join('')}</div>` : `<div class="home-activities-empty"><p>Chưa có thông báo mới.</p><a href="Notifications.php">Xem trang thông báo ${icon('arrow-right')}</a></div>`}
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

    <section id="hoat-dong" class="tsnt-section bg-white">
      <div class="container">
        <div class="tsnt-activity-blocks">
          <section class="shining-panel" aria-labelledby="shining-title">
            <header class="shining-heading">
              <span class="shining-icon" aria-hidden="true">${icon('graduation-cap')}</span>
              <div><h3 id="shining-title">Gương mặt Sinh viên</h3><p>We're Shining · Cộng đồng Sinh viên Đà Nẵng</p></div>
              <a class="shining-more" href="Students.php">Xem thêm <span aria-hidden="true">→</span></a>
            </header>
            ${students.length ? `<div class="shining-slider" data-shining-slider>
              <div class="shining-track" data-gallery-track>${students.map(st => `<a class="shining-card" href="Students.php">
                <span class="shining-initial" aria-hidden="true">${e(String(st.name || 'S').trim().slice(0, 1).toUpperCase())}</span>
                <div class="shining-details"><strong>${e(st.name)}</strong><p>${e(st.direction || 'Định hướng đang được cập nhật.')}</p></div>
                <span class="shining-open" aria-hidden="true">↗</span>
              </a>`).join('')}</div>
              <div class="article-gallery-controls" hidden>
                <button type="button" data-gallery-scroll-previous aria-label="Sinh viên trước">‹</button>
                <button type="button" data-gallery-scroll-next aria-label="Sinh viên tiếp theo">›</button>
              </div>
            </div>` : '<p class="tsnt-empty-inline">Danh sách gương mặt sinh viên đang được cập nhật.</p>'}
          </section>

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
