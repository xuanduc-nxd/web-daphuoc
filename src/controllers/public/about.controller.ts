import { type PublicPageModel } from '../../models/types.ts';
import { aboutSections } from '../../models/about.model.ts';

export async function loadAboutPageData(data: PublicPageModel): Promise<void> {
  data.rows = await aboutSections();
}
