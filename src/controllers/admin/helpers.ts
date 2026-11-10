import { type Row } from '../../core/config.ts';
import { type Form, type Session, value } from '../../core/http.ts';
import { type RouteResult } from '../../models/types.ts';
import { adminFrame, noAccessView } from '../../views/admin/components.ts';

export const scalar = (form: Form, name: string): string => value(form, name).trim();
export const integer = (form: Form, name: string): number => Number.parseInt(value(form, name), 10) || 0;

export const flashRedirect = (
  session: Session,
  location: string,
  message = '',
  type = 'success',
): RouteResult => {
  if (message) session.flash(message, type);
  return { location };
};

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Không hoàn tất được thao tác.';

export function fields(row: Row, allowed: string[]): Row {
  return Object.fromEntries(allowed.filter(key => row[key] !== undefined).map(key => [key, row[key]]));
}

export function view(
  page: string,
  title: string,
  body: string,
  session: Session,
  status = 200,
): RouteResult {
  return {
    html: adminFrame(page, title, body, session, session.consumeFlash()),
    status,
  };
}

export const noAccess = (session: Session, page: string): RouteResult =>
  view(page, 'Không có quyền truy cập', noAccessView(), session, 403);
