import { type Row } from '../../core/config.ts';
import { type PublicPageModel } from '../../models/types.ts';
import { publicFrame } from './components.ts';
import { renderHomePage } from './pages/home.view.ts';
import { renderAboutPage } from './pages/about.view.ts';
import { renderExecutiveBoardPage } from './pages/executive-board.view.ts';
import { renderActivitiesPage } from './pages/activities.view.ts';
import { renderNotificationsPage } from './pages/notifications.view.ts';
import { renderBlogPage } from './pages/blog.view.ts';
import { renderStudentsPage } from './pages/students.view.ts';
import { renderHonorListPage } from './pages/honor-list.view.ts';
import { renderContactPage } from './pages/contact.view.ts';
import { renderDetailPage } from './pages/detail.view.ts';

export type { PublicPageModel };
export {
  renderHomePage,
  renderAboutPage,
  renderExecutiveBoardPage,
  renderActivitiesPage,
  renderNotificationsPage,
  renderBlogPage,
  renderStudentsPage,
  renderHonorListPage,
  renderContactPage,
  renderDetailPage,
};

export function renderPublicPage(
  page: string,
  site: Row,
  data: PublicPageModel,
): { html: string; status: number } {
  let body = '';
  let title = 'CLB Golf Đa Phước và những người bạn';
  let description = '';
  let status = 200;
  let article: Row | undefined;

  switch (page) {
    case 'index.php': {
      body = renderHomePage(site, data);
      break;
    }
    case 'Activities.php': {
      const rows = data.rows || [];
      title = 'Hoạt động · CLB Golf Đa Phước';
      description = 'Theo dõi các hoạt động, chương trình học bổng và những khoảnh khắc của CLB Golf Đa Phước.';
      body = renderActivitiesPage(rows);
      break;
    }
    case 'Notifications.php': {
      const rows = data.rows || [];
      title = 'Thông báo · CLB Golf Đa Phước';
      body = renderNotificationsPage(rows);
      break;
    }
    case 'Blog.php': {
      const rows = data.rows || [];
      title = 'Blog · CLB Golf Đa Phước';
      body = renderBlogPage(rows, data);
      break;
    }
    case 'Students.php': {
      const rows = data.rows || [];
      title = 'Hỗ trợ sinh viên · CLB Golf Đa Phước';
      body = renderStudentsPage(rows);
      break;
    }
    case 'ExecutiveBoard.php': {
      const rows = data.rows || [];
      title = 'Ban điều hành Quỹ · CLB Golf Đa Phước';
      body = renderExecutiveBoardPage(rows);
      break;
    }
    case 'About.php': {
      const rows = data.rows || [];
      title = 'Giới thiệu · CLB Golf Đa Phước';
      body = renderAboutPage(site, rows);
      break;
    }
    case 'HonorList.php': {
      const rows = data.rows || [];
      title = 'Tri ân mạnh thường quân · CLB Golf Đa Phước';
      body = renderHonorListPage(rows);
      break;
    }
    case 'contact.php': {
      title = 'Liên hệ · CLB Golf Đa Phước';
      body = renderContactPage(site);
      break;
    }
    case 'detail.php':
    case 'detail_blog.php': {
      const kind = data.kind || 'notification';
      const row = data.article || null;
      const recent = data.recent || [];
      const result = renderDetailPage(row, kind, recent);
      ({ body, title, description, status } = result);
      article = row ? { ...row, kind } : undefined;
      break;
    }
    default:
      return { html: '', status: 404 };
  }

  return {
    html: publicFrame(page, site, title, body, description || undefined, article),
    status,
  };
}
