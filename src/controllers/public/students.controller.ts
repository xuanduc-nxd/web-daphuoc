import { type PublicPageModel } from '../../models/types.ts';
import { publicStudents, publicStudentsPage } from '../../models/member.model.ts';

export async function loadStudentsPageData(data: PublicPageModel, page: number, studentId: string): Promise<void> {
  if (studentId) {
    const roster = await publicStudents();
    const student = roster.find(row => String(row.id) === studentId) || null;
    data.rows = student ? [student] : [];
    data.students = roster;
    return;
  }
  const result = await publicStudentsPage(page, 9);
  data.rows = result.rows;
  data.studentTotal = result.total;
}
