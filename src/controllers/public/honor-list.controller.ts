import { type PublicPageModel } from '../../models/types.ts';
import { sponsors } from '../../models/sponsor.model.ts';

export async function loadHonorListPageData(data: PublicPageModel): Promise<void> {
  data.rows = await sponsors();
}
