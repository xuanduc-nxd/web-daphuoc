import { type Row } from '../../../core/config.ts';
import { type Session } from '../../../core/http.ts';
import { e, icon, dateText } from '../../public/components.ts';

export function dashboardView(posts: Row[], team: Row[], settings: Row, session: Session): string {
  return `<section class="page-heading">
    <div>
      <p class="eyebrow">Xin chào, ${e(session.data.admin_username || 'Admin')}</p>
      <h1>Một ngày mới cùng CLB</h1>
      <p>Quản lý bài viết và hồ sơ hiển thị trên website.</p>
    </div>
    <div class="post-create-actions">
      <a class="button primary" href="post-edit.php?kind=activity">Tạo Hoạt động</a>
      <a class="button secondary" href="post-edit.php?kind=notification">Tạo Thông báo</a>
      <a class="button ghost" href="post-edit.php?kind=blog">Tạo Blog</a>
    </div>
  </section>
  <div class="stats-grid">
    <div class="stat-card">${icon('newspaper')}<span>Bài viết</span><strong>${posts.length}</strong></div>
    <div class="stat-card">${icon('check-circle')}<span>Đã xuất bản</span><strong>${posts.filter(row => row.status === 'published').length}</strong></div>
    <div class="stat-card">${icon('users-three')}<span>Hồ sơ thành viên</span><strong>${team.length}</strong></div>
  </div>
  <section class="panel">
    <div class="panel-heading">
      <h2>Bài viết gần đây</h2>
      <a href="posts.php">Xem tất cả ${icon('arrow-up-right')}</a>
    </div>
    ${
      posts.length
        ? `<div class="recent-list">${posts
            .slice(0, 5)
            .map(
              row =>
                `<a href="post-edit.php?id=${encodeURIComponent(row.id)}"><span>${e(row.title)}</span><small>${e(dateText(row.date))}</small></a>`,
            )
            .join('')}</div>`
        : `<div class="empty"><p>Chưa có bài viết. Chia sẻ câu chuyện đầu tiên của CLB.</p><a class="button secondary" href="posts.php">Chọn loại bài viết ${icon('arrow-right')}</a></div>`
    }
  </section>
  <section class="panel">
    <div class="panel-heading"><h2>Quản lý nhanh</h2></div>
    <div class="quick-links">
      <a class="quick-link" href="post-edit.php?kind=activity">${icon('users-three')}<span><strong>Đăng hoạt động</strong><small>Chia sẻ hoạt động mới của CLB</small></span></a>
      <a class="quick-link" href="post-edit.php?kind=notification">${icon('megaphone')}<span><strong>Đăng thông báo</strong><small>Cập nhật thông tin chương trình</small></span></a>
      <a class="quick-link" href="team.php?type=board">${icon('users-three')}<span><strong>Ban điều hành</strong><small>Cập nhật hồ sơ và ảnh đại diện</small></span></a>
      <a class="quick-link" href="team.php?type=student">${icon('graduation-cap')}<span><strong>Sinh viên</strong><small>Quản lý thông tin sinh viên</small></span></a>
    </div>
  </section>
  <section class="panel">
    <div class="panel-heading">
      <h2>Thông tin hiện tại</h2>
      ${session.data.admin_role === 'admin' ? `<a href="settings.php">Chỉnh sửa ${icon('arrow-up-right')}</a>` : ''}
    </div>
    <div class="info-grid">
      <div><span>Tên website</span><strong>${e(settings.site_name || 'Chưa thiết lập')}</strong></div>
      <div><span>Thông báo</span><strong>${e(settings.notice || 'Chưa thiết lập')}</strong></div>
    </div>
  </section>`;
}
