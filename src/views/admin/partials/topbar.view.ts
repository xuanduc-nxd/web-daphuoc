import { type Session } from '../../../core/http.ts';
import { e, icon } from '../../public/components.ts';

export function renderAdminTopbar(title: string, session: Session): string {
  return `<div class="admin-topbar">
    <div>
      <button class="icon-button admin-menu-toggle" type="button" data-admin-menu aria-controls="admin-sidebar" aria-expanded="false" aria-label="Mở menu quản trị">${icon('list')}</button>
      <span>${e(title)}</span>
    </div>
    <span class="admin-user">${icon('user-circle')} ${e(session.data.admin_username || 'Admin')}</span>
  </div>`;
}
