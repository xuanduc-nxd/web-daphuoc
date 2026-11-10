import { type Form, type Session, value } from '../../core/http.ts';
import { type RouteResult } from '../../models/types.ts';
import { supabaseConfigured } from '../../models/supabase.ts';
import { authenticate, requireAdmin } from '../../services/admin.ts';
import { loginView } from '../../views/admin/pages/login.view.ts';
import { errorMessage } from './helpers.ts';

export function handleLogout(session: Session): RouteResult {
  session.destroy();
  return { location: 'login.php' };
}

export async function handleLogin(
  method: string,
  form: Form,
  session: Session,
  remoteAddress: string,
): Promise<RouteResult> {
  if (await requireAdmin(session)) return { location: 'index.php' };
  const configured = supabaseConfigured();
  let error = '';

  if (method === 'POST') {
    if (!session.check(form)) {
      error = 'Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang.';
    } else if (!configured) {
      error = 'Cấu hình Supabase và tạo tài khoản quản trị trước khi đăng nhập.';
    } else {
      try {
        const account = await authenticate(value(form, 'username'), value(form, 'password'), remoteAddress);
        if (account) {
          session.regenerate();
          session.data = {
            admin_id: account.id,
            admin_version: Number(account.version),
            admin_role: account.role,
            admin_username: account.display_name || account.username,
            admin_last_active: Date.now(),
          };
          return { location: 'index.php' };
        }
        error = 'Tên đăng nhập hoặc mật khẩu không đúng.';
      } catch (failure) {
        error = errorMessage(failure);
      }
    }
  }

  return { html: loginView(configured, error, session.token()) };
}
