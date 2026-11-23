import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderStudentsPage } from '../../src/views/public/pages/students.view.ts';

test('student directory renders name, school, major and profile link without photos or initials', () => {
  const rows = [
    {
      id: 's1',
      name: 'Nguyễn Văn A',
      school: 'ĐH Bách Khoa',
      major: 'Công nghệ thông tin',
      direction: 'Kỹ sư cầu nối',
      expertise: 'Web & AI',
    },
  ];
  const html = renderStudentsPage(rows);

  // Contains approved public fields
  assert(html.includes('Hỗ trợ sinh viên'));
  assert(html.includes('Nguyễn Văn A'));
  assert(html.includes('ĐH Bách Khoa'));
  assert(html.includes('Công nghệ thông tin'));

  // Profile link with clear 'Xem hồ sơ' text and id route
  assert(html.includes('href="Students.php?id=s1"'));
  assert(html.includes('Xem hồ sơ'));

  // Text-only: NO photos and NO initials avatar
  assert(!html.includes('<img'));
  assert(!html.includes('student-initial'));
  assert(!html.includes('avatar'));
});

test('student directory handles missing fields (school, major)', () => {
  const rows = [
    {
      id: 's2',
      name: 'Trần Thị B',
    },
  ];
  const html = renderStudentsPage(rows);

  assert(html.includes('Trần Thị B'));
  assert(html.includes('Xem hồ sơ'));
  assert(!html.includes('undefined'));
  assert(!html.includes('null'));
  // Missing fields display fallback or dash
  assert(html.includes('student-muted'));
  assert(!html.includes('<img'));
  assert(!html.includes('student-initial'));
});

test('student directory escapes HTML in name, school, and major', () => {
  const rows = [
    {
      id: 's3',
      name: '<script>alert("xss")</script>',
      school: '<b>Trường Lộ Thiên</b>',
      major: 'IT & "Security"',
    },
  ];
  const html = renderStudentsPage(rows);

  assert(!html.includes('<script>'));
  assert(html.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'));
  assert(!html.includes('<b>Trường'));
  assert(html.includes('&lt;b&gt;Trường Lộ Thiên&lt;/b&gt;'));
  assert(html.includes('IT &amp; &quot;Security&quot;'));
});

test('student directory handles empty student list', () => {
  const html = renderStudentsPage([]);
  assert(html.includes('Thông tin sinh viên đang được cập nhật'));
  assert(!html.includes('student-directory-head'));
  assert(!html.includes('student-pagination'));
});

test('student directory paginates with 12 items per page', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({
    id: `student-${i + 1}`,
    name: `Sinh viên thứ ${i + 1}`,
    school: `Trường ${i + 1}`,
    major: `Ngành ${i + 1}`,
  }));

  // Page 1
  const page1 = renderStudentsPage(rows, 1);
  assert(page1.includes('Sinh viên thứ 1'));
  assert(page1.includes('Sinh viên thứ 12'));
  assert(!page1.includes('Sinh viên thứ 13'));
  assert(page1.includes('aria-label="Các trang sinh viên"'));
  assert(page1.includes('href="Students.php?page=1"'));
  assert(page1.includes('href="Students.php?page=2"'));
  assert(page1.includes('href="Students.php?page=3"'));

  // Page 2
  const page2 = renderStudentsPage(rows, 2);
  assert(!page2.includes('Sinh viên thứ 12'));
  assert(page2.includes('Sinh viên thứ 13'));
  assert(page2.includes('Sinh viên thứ 24'));
  assert(!page2.includes('Sinh viên thứ 25'));

  // Page 3
  const page3 = renderStudentsPage(rows, 3);
  assert(page3.includes('Sinh viên thứ 25'));
  assert(!page3.includes('Sinh viên thứ 24'));
});

test('student profile displays development direction and areas of interest without photo or initials', () => {
  const rows = [
    {
      id: 'profile-1',
      name: 'Lê Hoàng Nam',
      school: 'ĐH Khoa học Tự nhiên',
      major: 'Khoa học máy tính',
      direction: 'Mục tiêu trở thành chuyên gia xử lý ngôn ngữ tự nhiên\nĐóng góp cho cộng đồng mã nguồn mở',
      expertise: 'Trí tuệ nhân tạo, Xử lý ảnh',
    },
  ];
  const html = renderStudentsPage(rows, 1, 'profile-1');

  // Eyebrow and heading
  assert(html.includes('Gương mặt sinh viên'));
  assert(html.includes('<h1>Lê Hoàng Nam</h1>'));

  // Back link
  assert(html.includes('href="Students.php"'));
  assert(html.includes('Danh sách sinh viên'));

  // Sections
  assert(html.includes('Trường và ngành học'));
  assert(html.includes('ĐH Khoa học Tự nhiên · Khoa học máy tính'));
  assert(html.includes('Định hướng phát triển'));
  assert(html.includes('Mục tiêu trở thành chuyên gia xử lý ngôn ngữ tự nhiên<br>Đóng góp cho cộng đồng mã nguồn mở'));
  assert(html.includes('Lĩnh vực quan tâm'));
  assert(html.includes('Trí tuệ nhân tạo, Xử lý ảnh'));

  // Text-only: NO photo and NO initials avatar
  assert(!html.includes('<img'));
  assert(!html.includes('student-initial'));
  assert(!html.includes('avatar'));
});

test('student profile handles missing ID gracefully', () => {
  const rows = [
    { id: 's1', name: 'Sinh viên 1' },
  ];
  const html = renderStudentsPage(rows, 1, 'non-existent-id');
  assert(html.includes('Không tìm thấy sinh viên'));
  assert(html.includes('Về danh sách sinh viên'));
  assert(html.includes('href="Students.php"'));
});

test('student directory and profile never expose private support needs, notes, or contact info', () => {
  const row = {
    id: 's-private',
    name: 'Bảo mật Sinh viên',
    school: 'ĐH Ngoại ngữ',
    major: 'Ngôn ngữ Anh',
    direction: 'Giảng dạy ngoại ngữ',
    expertise: 'Ngôn ngữ học đối chiếu',
    support_needs: 'Nhu cầu trợ cấp 10 triệu đồng/tháng',
    detail: 'Ghi chú gia cảnh khó khăn riêng tư',
    image: 'https://example.com/private-photo.jpg',
    phone: '0909123456',
    email: 'private@student.edu.vn',
  };

  const listHtml = renderStudentsPage([row]);
  assert(!listHtml.includes('Nhu cầu trợ cấp'));
  assert(!listHtml.includes('Ghi chú gia cảnh'));
  assert(!listHtml.includes('private-photo.jpg'));
  assert(!listHtml.includes('0909123456'));
  assert(!listHtml.includes('private@student.edu.vn'));

  const profileHtml = renderStudentsPage([row], 1, 's-private');
  assert(!profileHtml.includes('Nhu cầu trợ cấp'));
  assert(!profileHtml.includes('Ghi chú gia cảnh'));
  assert(!profileHtml.includes('private-photo.jpg'));
  assert(!profileHtml.includes('0909123456'));
  assert(!profileHtml.includes('private@student.edu.vn'));
});
