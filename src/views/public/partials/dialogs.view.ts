import { icon } from '../components.ts';

export function renderPublicDialogs(): string {
  return `<dialog class="image-dialog" id="image-dialog" aria-labelledby="image-dialog-caption">
    <button class="icon-button dialog-close" type="button" data-close-dialog aria-label="Đóng ảnh">${icon('x')}</button>
    <img id="image-dialog-image" src="" alt="">
    <div class="image-dialog-controls">
      <button type="button" data-gallery-previous aria-label="Ảnh trước" hidden>${icon('caret-left')}</button>
      <p id="image-dialog-caption"></p>
      <button type="button" data-gallery-next aria-label="Ảnh tiếp theo" hidden>${icon('caret-right')}</button>
    </div>
  </dialog>
  <div class="toast" id="ui-toast" role="status" aria-live="polite" hidden></div>`;
}
