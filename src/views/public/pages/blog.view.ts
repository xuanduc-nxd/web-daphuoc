import { type Row } from '../../../core/config.ts';
import { type PublicPageModel } from '../../../models/types.ts';
import { e, icon, breadcrumb, heading, toolbar, card, collectionEnd, empty, postHref } from '../components.ts';

function blogShareForm(data: PublicPageModel): string {
  const fields = data.blogValues || { author: '', category: '', title: '', content: '' };
  const ready = Boolean(data.blogForm?.token);

  return `<section class="blog-share" id="chia-se" aria-labelledby="blog-share-title">
    <div class="blog-share-intro">
      <span class="blog-share-icon">${icon('hand-heart')}</span>
      <p class="eyebrow">Góc sẻ chia · We're Shining</p>
      <h2 id="blog-share-title">Câu chuyện của bạn cũng có thể tiếp thêm cảm hứng</h2>
      <p>Gửi cảm nghĩ hoặc lời cảm ơn đến CLB. Bạn không cần tạo tài khoản; bài viết sẽ được xem trước khi đăng công khai.</p>
    </div>
    <form class="blog-share-form" method="post" action="Blog.php#chia-se">
      <input type="hidden" name="started" value="${e(data.blogForm?.started || '')}">
      <input type="hidden" name="token" value="${e(data.blogForm?.token || '')}">
      <div class="blog-honeypot" aria-hidden="true">
        <label>Trang web của bạn<input name="website" tabindex="-1" autocomplete="off"></label>
      </div>
      ${data.blogSubmitted ? '<p class="blog-form-message success" role="status">Cảm ơn bạn đã chia sẻ! Bài viết đã được gửi đến CLB để xem trước khi đăng.</p>' : ''}
      ${data.blogError ? `<p class="blog-form-message error" role="alert">${e(data.blogError)}</p>` : ''}
      ${!ready ? '<p class="blog-form-message error">Tính năng gửi bài hiện chưa sẵn sàng. Vui lòng thử lại sau.</p>' : ''}
      <div class="blog-form-row">
        <label>Họ tên hoặc bút danh
          <input name="author" maxlength="80" minlength="2" required autocomplete="name" placeholder="Tên của bạn" value="${e(fields.author)}">
        </label>
        <label>Loại chia sẻ
          <select name="category" required>
            <option value="" ${fields.category ? '' : 'selected'} disabled>Chọn một loại</option>
            <option value="Cảm nghĩ" ${fields.category === 'Cảm nghĩ' ? 'selected' : ''}>Cảm nghĩ</option>
            <option value="Lời cảm ơn" ${fields.category === 'Lời cảm ơn' ? 'selected' : ''}>Lời cảm ơn</option>
          </select>
        </label>
      </div>
      <label>Tiêu đề
        <input name="title" maxlength="120" minlength="5" required placeholder="Điều bạn muốn chia sẻ" value="${e(fields.title)}">
      </label>
      <label>Nội dung
        <textarea name="content" maxlength="5000" minlength="30" rows="6" required placeholder="Hãy viết cảm nghĩ hoặc lời cảm ơn của bạn...">${e(fields.content)}</textarea>
      </label>
      <div class="blog-form-footer">
        <small>Tối đa 5.000 ký tự. Chỉ bài được CLB duyệt mới hiển thị.</small>
        <button class="button primary" type="submit" ${ready ? '' : 'disabled'}>Gửi bài viết ${icon('arrow-right')}</button>
      </div>
    </form>
  </section>`;
}

export function renderBlogPage(rows: Row[], data: PublicPageModel): string {
  const roles = [...new Set(rows.map(row => String(row.role || '')).filter(Boolean))];

  return `<main id="main-content" class="container listing-main">
    ${breadcrumb('Blog')}
    ${heading('Những câu chuyện đồng hành', 'Nơi những tâm hồn đồng điệu gửi gắm tâm tình và lan tỏa niềm tin.', 'notebook')}
    ${blogShareForm(data)}
    ${
      rows.length
        ? `<section class="section" data-collection data-page-size="6" aria-label="Danh sách bài Blog">
            ${toolbar(rows, 'Tìm câu chuyện, tác giả...', roles)}
            <div class="news-grid">${rows.map(row => card(row, postHref(row), String(row.role || 'Blog'))).join('')}</div>
            ${collectionEnd()}
          </section>`
        : `<div class="section">${empty('Câu chuyện mới đang chờ được chia sẻ', 'Chưa có bài viết được xuất bản. Hãy gửi câu chuyện đầu tiên của bạn ở biểu mẫu phía trên.', 'notebook')}</div>`
    }
  </main>`;
}
