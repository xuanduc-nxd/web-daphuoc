import { type Form, type Session } from '../core/http.ts';
import { type RouteResult } from '../models/types.ts';
import { requireAdmin } from '../services/admin.ts';
import { noAccess } from './admin/helpers.ts';
import { handleLogin, handleLogout } from './admin/auth.controller.ts';
import { handleDashboard } from './admin/dashboard.controller.ts';
import {
  handlePostsList,
  handlePostEdit,
  handlePostStatus,
  handlePostDelete,
} from './admin/posts.controller.ts';
import {
  handleTeamList,
  handleTeamEdit,
  handleTeamDelete,
} from './admin/team.controller.ts';
import { handleContentList, handleContentEdit } from './admin/content.controller.ts';
import { handleSettings } from './admin/settings.controller.ts';

export type { RouteResult };

export async function adminRoute(
  page: string,
  url: URL,
  method: string,
  form: Form,
  session: Session,
  remoteAddress: string,
): Promise<RouteResult> {
  if (page === 'logout.php') return handleLogout(session);
  if (page === 'login.php') return handleLogin(method, form, session, remoteAddress);

  if (!(await requireAdmin(session))) return { location: 'login.php' };

  const ownerPages = new Set(['content.php', 'content-edit.php', 'settings.php']);
  if (ownerPages.has(page) && session.data.admin_role !== 'admin') {
    return noAccess(session, page);
  }

  switch (page) {
    case 'index.php':
      return handleDashboard(page, session);
    case 'posts.php':
      return handlePostsList(page, url, session);
    case 'post-edit.php':
      return handlePostEdit(page, url, method, form, session);
    case 'post-status.php':
      return handlePostStatus(method, form, session);
    case 'post-delete.php':
      return handlePostDelete(method, form, session);
    case 'team.php':
      return handleTeamList(page, url, session);
    case 'team-edit.php':
      return handleTeamEdit(page, url, method, form, session);
    case 'team-delete.php':
      return handleTeamDelete(method, form, session);
    case 'content.php':
      return handleContentList(page, url, method, form, session);
    case 'content-edit.php':
      return handleContentEdit(page, url, method, form, session);
    case 'settings.php':
      return handleSettings(page, method, form, session);
    default:
      return { status: 404, html: 'Không tìm thấy trang.' };
  }
}
