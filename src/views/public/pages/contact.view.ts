import { type Row } from '../../../core/config.ts';
import { e, icon, srcset, breadcrumb, heading } from '../components.ts';

export function renderContactPage(site: Row): string {
  return `<main id="main-content" class="container listing-main">
    ${breadcrumb('Liên hệ')}
    ${heading('Cùng kết nối với CLB', 'Liên hệ để tìm hiểu hoạt động, chia sẻ câu chuyện hoặc đồng hành cùng các chương trình học bổng.', 'paper-plane-tilt')}
    <div class="contact-layout">
      <div class="contact-list">
        ${
          site.phone
            ? `<section class="contact-item">
                ${icon('phone')}
                <div>
                  <h2>Điện thoại</h2>
                  <a href="tel:${e(String(site.phone).replace(/[^0-9+]/g, ''))}">${e(site.phone)}</a>
                </div>
              </section>`
            : ''
        }
        ${
          site.email
            ? `<section class="contact-item">
                ${icon('envelope')}
                <div>
                  <h2>Email</h2>
                  <a href="mailto:${e(site.email)}">${e(site.email)}</a>
                </div>
              </section>`
            : ''
        }
        <section class="contact-item">
          ${icon('map-pin')}
          <div>
            <h2>Khu vực hoạt động</h2>
            <p>${e(site.location)}</p>
          </div>
        </section>
        ${
          site.facebook
            ? `<section class="contact-item">
                ${icon('facebook-logo')}
                <div>
                  <h2>Facebook</h2>
                  <a href="${e(site.facebook)}" target="_blank" rel="noopener noreferrer">Mở trang Facebook ${icon('arrow-up-right')}</a>
                </div>
              </section>`
            : ''
        }
      </div>
      <div class="contact-photo">
        <img src="Image/act-1.jpg" srcset="${e(srcset('Image/act-1.jpg'))}" sizes="(max-width:767px) calc(100vw - 36px), 600px" width="900" height="675" alt="Hoạt động trao học bổng của CLB Golf Đa Phước">
        <p>CLB Golf Đa Phước và những người bạn, đồng hành cùng thế hệ trẻ Đà Nẵng.</p>
      </div>
    </div>
    <section class="contact-faq">
      <h2>Câu hỏi thường gặp</h2>
      <details>
        <summary>Tôi xem thông tin học bổng ở đâu?</summary>
        <p>Các thông tin về chương trình học bổng được đăng trong mục <a class="text-link" href="Notifications.php">Thông báo</a> và <a class="text-link" href="Students.php">Hỗ trợ sinh viên</a>.</p>
      </details>
      ${
        site.email
          ? `<details>
              <summary>Tôi muốn gửi một câu chuyện cho Blog.</summary>
              <p>Bạn có thể gửi trực tiếp tại biểu mẫu trên trang <a class="text-link" href="Blog.php#chia-se">Blog sẻ chia</a> hoặc qua email cho CLB.</p>
            </details>`
          : ''
      }
      <details>
        <summary>Tôi muốn đồng hành hoặc tài trợ.</summary>
        <p>Liên hệ trực tiếp với CLB qua điện thoại, email hoặc Facebook trên trang này để trao đổi thông tin đồng hành.</p>
      </details>
    </section>
  </main>`;
}
