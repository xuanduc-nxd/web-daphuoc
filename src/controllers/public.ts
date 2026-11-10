import { type Form } from '../core/http.ts';
import { type PublicPageModel, type RouteResult } from '../models/types.ts';
import { settings } from '../models/setting.model.ts';
import { renderPublicPage } from '../views/public/pages.ts';
import { loadHomePageData } from './public/home.controller.ts';
import { loadAboutPageData } from './public/about.controller.ts';
import { loadExecutiveBoardPageData } from './public/executive-board.controller.ts';
import { loadActivitiesPageData } from './public/activities.controller.ts';
import { loadNotificationsPageData } from './public/notifications.controller.ts';
import { handleBlogSubmission, loadBlogPageData } from './public/blog.controller.ts';
import { loadStudentsPageData } from './public/students.controller.ts';
import { loadHonorListPageData } from './public/honor-list.controller.ts';
import { loadDetailPageData } from './public/detail.controller.ts';

export async function publicRoute(
  page: string,
  url: URL,
  form?: Form,
  remoteAddress = 'unknown',
): Promise<RouteResult> {
  const data: PublicPageModel = {};
  let formStatus = 200;

  if (page === 'Blog.php' && form) {
    const submission = await handleBlogSubmission(form, remoteAddress, data);
    if (submission.redirectResult) return submission.redirectResult;
    formStatus = submission.formStatus;
  }

  const loadPageData = async (): Promise<void> => {
    switch (page) {
      case 'index.php':
        return loadHomePageData(data);
      case 'Activities.php':
        return loadActivitiesPageData(data);
      case 'Notifications.php':
        return loadNotificationsPageData(data);
      case 'Blog.php':
        return loadBlogPageData(url, data);
      case 'Students.php':
        return loadStudentsPageData(data);
      case 'ExecutiveBoard.php':
        return loadExecutiveBoardPageData(data);
      case 'About.php':
        return loadAboutPageData(data);
      case 'HonorList.php':
        return loadHonorListPageData(data);
      case 'detail.php':
      case 'detail_blog.php':
        return loadDetailPageData(page, url, data);
      case 'contact.php':
        return;
      default:
        return;
    }
  };

  const [site] = await Promise.all([settings(), loadPageData()]);
  const result = renderPublicPage(page, site, data);
  return { ...result, status: formStatus === 200 ? result.status : formStatus };
}
