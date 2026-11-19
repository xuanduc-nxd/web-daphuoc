import { type Row } from '../../../core/config.ts';
import { type PublicPageModel } from '../../../models/types.ts';
import { e, icon, image, srcset, dateText, postHref } from '../components.ts';
import { youtubeEmbedUrl, youtubeVideoId } from '../../../services/youtube.ts';

const initials = (name: unknown): string =>
  String(name || 'S').trim().split(/\s+/).filter(Boolean).filter((_, index, parts) => index === 0 || index === parts.length - 1).map(part => part[0].toUpperCase()).join('');

export function renderHomePage(site: Row, data: PublicPageModel): string {
  const { activities = [], notifications = [], sponsors = [], students = [] } = data;
  const video = youtubeEmbedUrl(youtubeVideoId(site.showcase_video_url));
  const latestNotices = [...notifications]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .slice(0, 3);
  const aboutImage = image(site.hero_image, 'assets/images/scholarship-group.jpg');

  return `<main id="main-content" class="foundation-home">
    <section class="foundation-hero" aria-labelledby="home-title">
      <div class="container foundation-hero-layout">
        <div class="foundation-hero-copy">
          <span class="foundation-eyebrow">CLB GOLF ĐA PHƯỚC</span>
          <h1 id="home-title">Hỗ trợ sinh viên <span>Đồng hành cùng thế hệ trẻ</span></h1>
          <p>Cùng Quỹ học bổng CLB Golf Đa Phước, chúng tôi đồng hành, hỗ trợ và tạo điều kiện để sinh viên phát triển tri thức, kỹ năng và sự nghiệp.</p>
          <div class="foundation-actions">
            <a class="button primary" href="Students.php">Về chương trình học bổng ${icon('arrow-right')}</a>
            <a class="button secondary" href="${video ? '#ve-chung-toi' : 'About.php'}">${icon(video ? 'play-circle' : 'info')} ${video ? 'Xem video giới thiệu' : 'Tìm hiểu về CLB'}</a>
          </div>
        </div>
        <div class="foundation-hero-media">
          <img src="assets/images/scholarship-group.jpg" alt="Sinh viên và đại diện CLB Golf Đa Phước tại lễ trao học bổng" width="2048" height="1536" fetchpriority="high">
        </div>
      </div>
      <div class="container">
        <div class="foundation-stats" aria-label="Thông tin hoạt động">
          <div>${icon('graduation-cap')}<strong>${students.length}</strong><span>Sinh viên được giới thiệu</span></div>
          <div>${icon('hand-heart')}<strong>${sponsors.length}</strong><span>Đối tác đồng hành</span></div>
          <div>${icon('newspaper')}<strong>${activities.length}</strong><span>Hoạt động đã đăng</span></div>
          <div>${icon('users-three')}<strong>Đà Nẵng</strong><span>Cộng đồng sinh viên</span></div>
          <div>${icon('graduation-cap')}<strong>Nhiều</strong><span>Cơ hội phát triển</span></div>
        </div>
      </div>
    </section>

    <section id="ve-chung-toi" class="foundation-section foundation-about">
      <div class="container foundation-about-layout">
        <div class="foundation-about-copy">
          <span class="foundation-kicker">Về chúng tôi</span>
          <h2>Đồng hành cùng thế hệ trẻ Việt Nam</h2>
          <p>CLB Golf Đa Phước là cầu nối giữa tri thức, cơ hội và cộng đồng, hướng đến việc hỗ trợ sinh viên phát triển toàn diện về học tập, kỹ năng và định hướng nghề nghiệp.</p>
          <a class="button secondary" href="About.php">Tìm hiểu thêm ${icon('arrow-right')}</a>
        </div>
        <div class="foundation-about-media">
          ${video ? `<iframe src="${e(video)}" title="Video giới thiệu CLB Golf Đa Phước" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>` : `<img src="${e(aboutImage)}" srcset="${e(srcset(aboutImage))}" alt="Hoạt động trao học bổng của CLB Golf Đa Phước" width="1100" height="620" loading="lazy">`}
        </div>
      </div>
    </section>

    <section id="hoc-bong" class="foundation-section foundation-activities">
      <div class="container">
        <div class="foundation-heading"><div><h2>Hoạt động nổi bật</h2><p>Những dấu ấn trong hành trình đồng hành cùng sinh viên.</p></div><a href="Activities.php">Xem tất cả hoạt động ${icon('arrow-right')}</a></div>
        ${activities.length ? `<div class="foundation-activity-grid">${activities.slice(0, 3).map(row => `<article class="foundation-activity-card">
          <a class="foundation-activity-image" href="${e(postHref(row))}">${row.image ? `<img src="${e(image(row.image))}" srcset="${e(srcset(row.image))}" alt="${e(row.title)}" width="640" height="420" loading="lazy">` : `<span>${icon('newspaper')}</span>`}</a>
          <div><span class="foundation-category">Hoạt động</span><h3><a href="${e(postHref(row))}">${e(row.title)}</a></h3><time>${e(dateText(row.date))}</time><a class="foundation-arrow" href="${e(postHref(row))}" aria-label="Xem hoạt động ${e(row.title)}">${icon('arrow-right')}</a></div>
        </article>`).join('')}</div>` : '<p class="foundation-empty">Hoạt động mới đang được cập nhật.</p>'}
      </div>
    </section>

    <div class="container foundation-updates">
      <section id="cong-dong" class="foundation-section foundation-notices">
        <div class="foundation-heading"><div><h2>Thông báo mới</h2><p>Cập nhật nhanh các kế hoạch và thông tin quan trọng.</p></div><a href="Notifications.php">Xem tất cả ${icon('arrow-right')}</a></div>
        ${latestNotices.length ? `<div class="foundation-notice-list">${latestNotices.map((row, index) => `<a href="${e(postHref(row))}" class="foundation-notice${index === 0 ? ' is-latest' : ''}">
          <span class="foundation-notice-icon">${icon('megaphone')}</span><span>${index === 0 ? '<span class="foundation-notice-new">NEW</span>' : ''}<strong>${e(row.title)}</strong><time>${e(dateText(row.date))}</time></span>${icon('arrow-right')}
        </a>`).join('')}</div>` : '<p class="foundation-empty">Chưa có thông báo mới.</p>'}
      </section>
      <section id="hoat-dong" class="foundation-section foundation-students">
        <div class="foundation-heading"><div><h2>Gương mặt sinh viên</h2><p>Những sinh viên tiêu biểu được CLB đồng hành và hỗ trợ.</p></div><a href="Students.php">Xem tất cả sinh viên ${icon('arrow-right')}</a></div>
        ${students.length ? `<div class="foundation-student-grid">${students.slice(0, 3).map(row => `<a class="foundation-student-card" href="Students.php?id=${encodeURIComponent(String(row.id))}">
          <span class="foundation-initial" aria-hidden="true">${e(initials(row.name))}</span>
          <strong>${e(row.name)}</strong>
          ${row.school ? `<span>${e(row.school)}</span>` : ''}
          ${row.major ? `<span class="foundation-student-tag">${e(row.major)}</span>` : ''}
          <span class="foundation-student-arrow" aria-hidden="true">${icon('arrow-right')}</span>
        </a>`).join('')}</div>` : '<p class="foundation-empty">Danh sách gương mặt sinh viên đang được cập nhật.</p>'}
      </section>
    </div>

    <section class="foundation-section foundation-thanks">
      <div class="container"><div class="foundation-thanks-panel"><span class="foundation-thanks-icon" aria-hidden="true">${icon('hand-heart')}</span><div><h2>Lời cảm ơn</h2><p>CLB Golf Đa Phước xin gửi lời cảm ơn chân thành đến các cá nhân, tổ chức và đối tác đã luôn tin tưởng, đồng hành và hỗ trợ Quỹ học bổng. Sự đóng góp của Quý vị là nguồn động lực to lớn, giúp chúng tôi tiếp tục chắp cánh cho những ước mơ và tạo nên nhiều giá trị tốt đẹp cho thế hệ trẻ Việt Nam.</p></div></div></div>
    </section>
  </main>`;
}
