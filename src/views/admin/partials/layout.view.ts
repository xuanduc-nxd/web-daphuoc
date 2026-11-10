import { type Session, type SessionData } from '../../../core/http.ts';
import { e, icon } from '../../public/components.ts';
import { renderAdminSidebar } from './sidebar.view.ts';
import { renderAdminTopbar } from './topbar.view.ts';

export function adminFrame(
  page: string,
  title: string,
  body: string,
  session: Session,
  flash?: SessionData['flash'],
): string {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)} · Golf Đa Phước Admin</title>
  <link rel="icon" href="../assets/images/favicon.png">
  <link rel="stylesheet" href="../CSS/fonts.css">
  <link rel="stylesheet" href="../CSS/icons.css">
  <link rel="stylesheet" href="../CSS/site.css">
  <link rel="stylesheet" href="admin.css?v=student-fields-1">
  <script src="../JS/site.js" defer></script>
  <script src="admin.js" defer></script>
</head>
<body class="admin-body">
  <a class="skip-link" href="#main-content">Đến nội dung chính</a>
  <div class="admin-shell">
    ${renderAdminSidebar(page, session.data.admin_role)}
    <main class="admin-main" id="main-content">
      ${renderAdminTopbar(title, session)}
      ${flash ? `<div class="flash ${e(flash.type)}" role="${flash.type === 'error' ? 'alert' : 'status'}">${e(flash.message)}</div>` : ''}
      ${body}
    </main>
  </div>
  <dialog class="confirm-dialog" id="confirm-dialog" aria-labelledby="confirm-title">
    <span class="heading-symbol">${icon('trash')}</span>
    <h2 id="confirm-title">Xác nhận xóa</h2>
    <p id="confirm-message"></p>
    <div class="dialog-actions">
      <button class="button secondary" type="button" data-confirm-cancel>Giữ lại</button>
      <button class="button danger" type="button" data-confirm-accept>Xóa</button>
    </div>
  </dialog>
  <div class="toast" id="ui-toast" role="status" aria-live="polite" hidden></div>
</body>
</html>`;
}
