import { type PublicPageModel } from '../../models/types.ts';
import { collection } from '../../models/repository.ts';

export async function loadActivitiesPageData(data: PublicPageModel): Promise<void> {
  data.rows = await collection('activities');
}
