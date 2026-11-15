import { icon } from '../../public/components.ts';

export function renderAdminSidebar(page: string, role?: string, section?: string): string {
  const active = section || (
    page === 'post-edit.php' ? 'posts.php' : page
  );
  const link = (label: string, href: string, symbol: string): string =>
    `<a href="${href}"${active === href ? ' class="active" aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span></a>`;

  return `<aside class="admin-sidebar" id="admin-sidebar">
    <button class="icon-button admin-sidebar-close" type="button" data-admin-close aria-label="Đóng menu quản trị">${icon('x')}</button>
    <a class="admin-brand" href="index.php">
      <img src="../assets/images/logo.webp" width="44" height="44" alt="Logo Đa Phước">
      <span>Golf Đa Phước<small>Trang quản trị</small></span>
    </a>
    <span class="sidebar-label">Bảng điều khiển</span>
    <nav aria-label="Điều hướng quản trị">
      ${link('Tổng quan', 'index.php', 'squares-four')}
      ${link('Bài viết', 'posts.php', 'newspaper')}
      <span class="sidebar-label sidebar-group-label">Con người</span>
      ${link('Ban điều hành', 'team.php?type=board', 'users-three')}
      ${link('Sinh viên', 'team.php?type=student', 'graduation-cap')}
      ${role === 'admin' ? `<span class="sidebar-label sidebar-group-label">Website</span>
        ${link('Tri ân & tài trợ', 'content.php?type=sponsor', 'hand-heart')}
        ${link('Giới thiệu CLB', 'content.php?type=about', 'info')}
        ${link('Thông tin website', 'settings.php', 'gear-six')}` : ''}
    </nav>
    <div class="sidebar-bottom">
      <a href="../" target="_blank" rel="noopener noreferrer">${icon('arrow-square-out')} Xem website</a>
      <a href="logout.php">${icon('sign-out')} Đăng xuất</a>
    </div>
  </aside>
  <div class="admin-backdrop" data-admin-backdrop hidden></div>`;
}
