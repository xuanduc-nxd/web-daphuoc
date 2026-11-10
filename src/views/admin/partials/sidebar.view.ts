import { icon } from '../../public/components.ts';

export function renderAdminSidebar(page: string, role?: string): string {
  const nav = [
    ['Tổng quan', 'index.php', 'squares-four'],
    ['Bài viết', 'posts.php', 'newspaper'],
    ['Ban điều hành', 'team.php?type=board', 'users-three'],
    ['Sinh viên', 'team.php?type=student', 'graduation-cap'],
    ['Tri ân & tài trợ', 'content.php?type=sponsor', 'hand-heart'],
    ['Giới thiệu CLB', 'content.php?type=about', 'info'],
    ['Thông tin website', 'settings.php', 'gear-six'],
  ];
  const visible = role === 'admin' ? nav : nav.slice(0, 4);

  return `<aside class="admin-sidebar" id="admin-sidebar">
    <button class="icon-button admin-sidebar-close" type="button" data-admin-close aria-label="Đóng menu quản trị">${icon('x')}</button>
    <a class="admin-brand" href="index.php">
      <img src="../assets/images/logo.webp" width="44" height="44" alt="Logo Đa Phước">
      <span>Golf Đa Phước<small>Trang quản trị</small></span>
    </a>
    <span class="sidebar-label">Quản lý nội dung</span>
    <nav aria-label="Điều hướng quản trị">
      ${visible
        .map(
          ([label, href, symbol]) =>
            `<a href="${href}" class="${
              page === href.split('?')[0] ||
              (page === 'post-edit.php' && href === 'posts.php') ||
              (page === 'team-edit.php' && href.startsWith('team.php')) ||
              (page === 'content-edit.php' && href.startsWith('content.php'))
                ? 'active'
                : ''
            }">${icon(symbol)} ${label}</a>`,
        )
        .join('')}
    </nav>
    <div class="sidebar-bottom">
      <a href="../" target="_blank" rel="noopener noreferrer">${icon('arrow-square-out')} Xem website</a>
      <a href="logout.php">${icon('sign-out')} Đăng xuất</a>
    </div>
  </aside>
  <div class="admin-backdrop" data-admin-backdrop hidden></div>`;
}
