import { type Row } from '../../../core/config.ts';
import { e, icon } from '../components.ts';

const menus = [
  {
    label: 'Về chúng tôi', href: 'About.php', id: 'about-submenu',
    links: [
      { label: 'Tổng quan CLB', href: 'About.php' },
      { label: 'Ban điều hành', href: 'ExecutiveBoard.php' },
    ],
  },
  {
    label: 'Chương trình & Dự án', href: 'Students.php', id: 'programs-submenu',
    links: [
      { label: 'Học bổng', href: 'index.php#hoc-bong' },
      { label: 'Hỗ trợ sinh viên', href: 'Students.php' },
      { label: 'Hoạt động cộng đồng', href: 'index.php#cong-dong' },
    ],
  },
  {
    label: 'Tin tức', href: 'Notifications.php', id: 'news-submenu',
    links: [
      { label: 'Thông báo từ BĐH', href: 'Notifications.php' },
      { label: 'Tin tức & Sự kiện', href: 'Activities.php' },
      { label: "We're Shining · Blog", href: 'Blog.php' },
    ],
  },
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
        menu => `<div class="nav-item has-submenu ${menu.links.some(link => link.href === current) ? 'is-active' : ''}">
          <a href="${menu.href}" ${current === menu.href ? 'aria-current="page"' : ''}>${e(menu.label)}</a>
          <button class="submenu-toggle" type="button" aria-label="Mở mục ${e(menu.label)}" aria-expanded="false" aria-controls="${menu.id}">${icon('caret-down')}</button>
          <div class="nav-submenu" id="${menu.id}" hidden>
            ${menu.links.map(link => `<a href="${link.href}" ${current === link.href ? 'aria-current="page"' : ''}>${e(link.label)}</a>`).join('')}
          </div>
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
