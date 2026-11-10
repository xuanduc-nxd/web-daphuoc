import { type Row } from '../../../core/config.ts';
import { e, icon } from '../components.ts';

const menus = [
  { label: 'Về chúng tôi', href: 'About.php' },
  { label: 'Hỗ trợ sinh viên', href: 'Students.php' },
  { label: 'Hoạt động', href: 'Activities.php' },
  { label: 'Thông báo', href: 'Notifications.php' },
  { label: 'Blog sẻ chia', href: 'Blog.php' },
];

export function renderPublicHeader(page: string, settings: Row, article?: Row): string {
  const current =
    page === 'detail_blog.php'
      ? 'Blog.php'
      : page === 'detail.php'
        ? ({
          activity: 'Activities.php',
          notification: 'Notifications.php',
          sponsor: 'HonorList.php',
        } as Record<string, string>)[article?.kind || 'notification']
        : page;

  return `<header class="site-header">
    <div class="header-inner">
      <a class="brand" href="index.php">
        <img src="assets/images/logo.webp" width="50" height="50" alt="Logo Đa Phước">
        <span>
        <small>Và những người bạn</small>
          <strong>${e(settings.site_name)}</strong>
          
        </span>
      </a>
      <nav class="site-nav" id="mobileMenu" aria-label="Điều hướng chính">
        ${menus
      .map(
        menu => `<div class="nav-item ${menu.href === 'About.php' ? 'has-submenu' : ''}">
          <a href="${menu.href}" ${current === menu.href || (menu.href === 'About.php' && (page === 'ExecutiveBoard.php' || page === 'HonorList.php')) ? 'aria-current="page"' : ''}>${menu.label}</a>
          ${menu.href === 'About.php'
            ? `<button class="submenu-toggle" type="button" aria-label="Mở các trang giới thiệu" aria-expanded="false" aria-controls="about-submenu">${icon('caret-down')}</button>
          <div class="nav-submenu" id="about-submenu" hidden>
            <a href="About.php">Tổng quan CLB</a>
            <a href="ExecutiveBoard.php">Ban điều hành Quỹ</a>
          </div>`
            : ''
          }
        </div>`,
      )
      .join('')}
        <div class="nav-cta-group">
          <a class="nav-cta-outline" href="HonorList.php">${icon('hand-heart')} Đồng hành</a>
          <a class="nav-contact" href="contact.php">${icon('paper-plane-tilt')} Liên hệ</a>
        </div>
      </nav>
      <div class="header-actions">
        <button class="icon-button menu-toggle" id="menuToggle" type="button" aria-controls="mobileMenu" aria-expanded="false" aria-label="Mở menu">${icon('list')}</button>
      </div>
    </div>
  </header>
  <div class="menu-backdrop" data-menu-backdrop hidden></div>`;
}
