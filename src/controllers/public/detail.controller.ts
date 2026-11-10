import { type PublicPageModel } from '../../models/types.ts';
import { collection, record } from '../../models/repository.ts';
import { posts, publicPost } from '../../models/post.model.ts';

export async function loadDetailPageData(page: string, url: URL, data: PublicPageModel): Promise<void> {
  const id = url.searchParams.get('id')?.trim() || '';
  const type = page === 'detail_blog.php' ? 'blog' : url.searchParams.get('type') || 'notifications';
  data.kind =
    type === 'activities'
      ? 'activity'
      : type === 'sponsors'
        ? 'sponsor'
        : type === 'blog'
          ? 'blog'
          : 'notification';

  const [article, rows] = await Promise.all([
    id ? (data.kind === 'sponsor' ? record('sponsors', id) : publicPost(data.kind, id)) : Promise.resolve(null),
    data.kind === 'sponsor' ? collection('sponsors') : posts(data.kind, true),
  ]);

  data.article = article;
  data.recent = rows.filter(item => item.id !== article?.id).slice(0, 4);
}
