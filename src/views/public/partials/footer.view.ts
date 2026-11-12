import { type Row } from '../../../core/config.ts';
import { e, icon } from '../components.ts';

export function renderPublicFooter(settings: Row): string {
  const phoneClean = String(settings.phone || '').replace(/[^0-9+]/g, '');

  return `<footer class="site-footer">
    <div class="container footer-main">
      <div class="footer-brand">
        <a class="brand" href="index.php">
          <img src="assets/images/logo.webp" width="44" height="44" alt="Logo Đa Phước">
          <span>
            <small>Quỹ học bổng &amp; Kết nối</small>
            <strong>${e(settings.site_name)}</strong>
          </span>
        </a>
        <p class="footer-mission">${e(settings.notice)}</p>
        ${settings.contact ? `<p class="footer-extra">${e(settings.contact).replace(/\n/g, '<br>')}</p>` : ''}
        <div class="footer-contact-list">
          ${settings.email ? `<a href="mailto:${e(settings.email)}">${icon('envelope')} ${e(settings.email)}</a>` : ''}
          ${phoneClean ? `<a href="tel:${e(phoneClean)}">${icon('phone')} ${e(settings.phone)}</a>` : ''}
          ${settings.location ? `<span>${icon('map-pin')} ${e(settings.location)}</span>` : ''}
        </div>
        <div class="social-links">
          ${(['facebook', 'instagram', 'tiktok', 'threads'] as const)
      .map(name =>
        settings[name]
          ? `<a href="${e(settings[name])}" target="_blank" rel="noopener noreferrer" aria-label="${name}">${icon(
            name === 'facebook'
              ? 'facebook-logo'
              : name === 'instagram'
                ? 'instagram-logo'
                : name === 'tiktok'
                  ? 'tiktok-logo'
                  : 'threads-logo',
          )}</a>`
          : '',
      )
      .join('')}
        </div>
      </div>
      <div class="footer-navigation">
        <h2>Về CLB</h2>
        <a href="About.php">Tổng quan CLB</a>
        <a href="ExecutiveBoard.php">Ban điều hành</a>
        <a href="Students.php">Hỗ trợ sinh viên</a>
      </div>
      <div class="footer-navigation">
        <h2>Tin tức</h2>
        <a href="Notifications.php">Thông báo từ BĐH</a>
        <a href="Activities.php">Tin tức &amp; Sự kiện</a>
        <a href="Blog.php">We're Shining · Blog</a>
      </div>
      <div class="footer-navigation">
        <h2>Kết nối</h2>
        <a href="HonorList.php">Tri ân &amp; tài trợ</a>
        <a href="Blog.php#chia-se">Gửi tâm tình</a>
        <a href="contact.php">Liên hệ CLB ${icon('arrow-up-right')}</a>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <span>© ${new Date().getFullYear()} ${e(settings.site_name)} và những người bạn. Bảo lưu mọi quyền.</span>
      </div>
    </div>
  </footer>`;
}
