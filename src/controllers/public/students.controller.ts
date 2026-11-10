import { type PublicPageModel } from '../../models/types.ts';
import { publicStudents } from '../../models/member.model.ts';

export async function loadStudentsPageData(data: PublicPageModel): Promise<void> {
  data.rows = await publicStudents();
}
