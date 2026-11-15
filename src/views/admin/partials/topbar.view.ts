import { type Session } from '../../../core/http.ts';
import { e, icon } from '../../public/components.ts';

export function renderAdminTopbar(title: string, session: Session): string {
  return `<div class="admin-topbar">
    <div class="admin-topbar-left">
      <button class="icon-button admin-menu-toggle" type="button" data-admin-menu aria-controls="admin-sidebar" aria-expanded="false" aria-label="Mở menu quản trị">${icon('list')}</button>
      <span class="admin-topbar-location"><small>Trang quản trị</small><strong>${e(title)}</strong></span>
    </div>
    <span class="admin-user">${icon('user-circle')} <span><strong>${e(session.data.admin_username || 'Admin')}</strong><small>${session.data.admin_role === 'admin' ? 'Quản trị viên' : 'Biên tập viên'}</small></span></span>
  </div>`;
}
