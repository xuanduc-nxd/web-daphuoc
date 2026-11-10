import { type Session } from '../../core/http.ts';
import { type RouteResult } from '../../models/types.ts';
import { posts, members, settings } from '../../models/repository.ts';
import { dashboardView } from '../../views/admin/pages/dashboard.view.ts';
import { view } from './helpers.ts';

export async function handleDashboard(page: string, session: Session): Promise<RouteResult> {
  const [allPosts, team, site] = await Promise.all([posts(), members(), settings()]);
  return view(page, 'Tổng quan', dashboardView(allPosts, team, site, session), session);
}
