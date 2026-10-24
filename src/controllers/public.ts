import { collection, members, posts, publicPost, record, settings } from '../models/repository.ts';
import { renderPublicPage, type PublicPageModel } from '../views/public/pages.ts';

export async function publicRoute(page: string, url: URL): Promise<{html:string,status:number}> {
  const site = await settings();
  const data: PublicPageModel = {};

  switch (page) {
    case 'index.php':
      [data.activities, data.notifications, data.sponsors] = await Promise.all([
        collection('activities'), collection('notifications'), collection('sponsors'),
      ]);
      break;
    case 'Activities.php':
      data.rows = await collection('activities');
      break;
    case 'Notifications.php':
      data.rows = await collection('notifications');
      break;
    case 'Blog.php':
      data.rows = await posts('blog', true);
      break;
    case 'Students.php':
      data.rows = await members('student');
      break;
    case 'ExecutiveBoard.php':
      data.rows = await members('board');
      break;
    case 'About.php':
      data.rows = await collection('abouts');
      break;
    case 'HonorList.php':
      data.rows = await collection('sponsors');
      break;
    case 'detail.php':
    case 'detail_blog.php': {
      const id = url.searchParams.get('id')?.trim() || '';
      const type = page === 'detail_blog.php' ? 'blog' : (url.searchParams.get('type') || 'notifications');
      data.kind = type === 'activities' ? 'activity' : type === 'sponsors' ? 'sponsor' : type === 'blog' ? 'blog' : 'notification';
      const article = id ? (data.kind === 'sponsor' ? await record('sponsors', id) : await publicPost(data.kind, id)) : null;
      const rows = data.kind === 'sponsor' ? await collection('sponsors') : await posts(data.kind, true);
      data.article = article;
      data.recent = rows.filter(item => item.id !== article?.id).slice(0, 4);
      break;
    }
    case 'contact.php':
      break;
    default:
      return {html: '', status: 404};
  }

  return renderPublicPage(page, site, data);
}
