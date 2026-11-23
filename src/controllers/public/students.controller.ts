import { type PublicPageModel } from '../../models/types.ts';
import { publicStudent, publicStudentsPage } from '../../models/member.model.ts';

export async function loadStudentsPageData(data: PublicPageModel, page: number, studentId: string): Promise<void> {
  if (studentId) {
    const student = await publicStudent(studentId);
    data.rows = student ? [student] : [];
    return;
  }
  const result = await publicStudentsPage(page, 10);
  data.rows = result.rows;
  data.studentTotal = result.total;
}
