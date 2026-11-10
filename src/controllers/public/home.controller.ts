import { type PublicPageModel } from '../../models/types.ts';
import { collection } from '../../models/repository.ts';
import { posts } from '../../models/post.model.ts';
import { publicStudents } from '../../models/member.model.ts';

export async function loadHomePageData(data: PublicPageModel): Promise<void> {
  [data.activities, data.notifications, data.sponsors, data.students, data.blogs] = await Promise.all([
    collection('activities'),
    collection('notifications'),
    collection('sponsors'),
    publicStudents(),
    posts('blog', true),
  ]);
}
