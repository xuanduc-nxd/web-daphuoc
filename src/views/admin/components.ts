import { e, dateText } from '../public/components.ts';
import { renderAdminSidebar } from './partials/sidebar.view.ts';
import { renderAdminTopbar } from './partials/topbar.view.ts';
import { adminFrame } from './partials/layout.view.ts';

export { renderAdminSidebar, renderAdminTopbar, adminFrame };

export const csrf = (token: string): string => `<input type="hidden" name="token" value="${e(token)}">`;
export const hidden = (name: string, value: unknown): string => `<input type="hidden" name="${name}" value="${e(value)}">`;
export const errorBox = (error: string): string => (error ? `<div class="flash error" role="alert">${e(error)}</div>` : '');
export const selected = (value: unknown, option: unknown): string => (value === option ? 'selected' : '');
export const checked = (value: unknown): string => (value ? 'checked' : '');
export const adminImage = (value: unknown): string =>
  /^https?:\/\//i.test(String(value || '')) ? String(value) : `../${String(value || '').replace(/^\//, '')}`;
export const dateInput = (value: unknown): string =>
  /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? dateText(value) : String(value || '');

export const aboutSectionLabels: Record<string, string> = {
  principle: 'Tôn chỉ và mục đích',
  scope: 'Phạm vi và đối tượng',
  target: 'Mục tiêu',
  method: 'Phương thức hoạt động',
};

export const noAccessView = (): string =>
  `<section class="panel">
    <h1>Không có quyền truy cập</h1>
    <p>Mục này dành cho tài khoản quản trị.</p>
    <a class="button primary" href="index.php">Về tổng quan</a>
  </section>`;
