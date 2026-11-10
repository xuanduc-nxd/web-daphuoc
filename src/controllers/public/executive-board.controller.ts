import { type PublicPageModel } from '../../models/types.ts';
import { members } from '../../models/member.model.ts';

export async function loadExecutiveBoardPageData(data: PublicPageModel): Promise<void> {
  data.rows = await members('board');
}
