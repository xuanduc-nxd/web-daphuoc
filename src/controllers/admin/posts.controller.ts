import { InputError, ConflictError, adminDateValue, randomId, today, type Row } from '../../core/config.ts';
import { activityGallery, notificationVisible } from '../../core/content.ts';
import { type Form, type Session, value, values, checked } from '../../core/http.ts';
import { type RouteResult } from '../../models/types.ts';
import { posts, record, remove, save } from '../../models/repository.ts';
import { uploadedImage, uploadedImages } from '../../services/admin.ts';
import { postsView, postEditView } from '../../views/admin/pages/posts.view.ts';
import { scalar, integer, flashRedirect, errorMessage, fields, view } from './helpers.ts';

export async function handlePostsList(
  page: string,
  url: URL,
  session: Session,
): Promise<RouteResult> {
  const kind = ['activity', 'notification', 'blog'].includes(url.searchParams.get('kind') || '')
    ? url.searchParams.get('kind')!
    : null;
  return view(page, 'Bài viết', postsView(await posts(kind || undefined), kind, session), session);
}

export async function handlePostEdit(
  page: string,
  url: URL,
  method: string,
  form: Form,
  session: Session,
): Promise<RouteResult> {
  const id = (url.searchParams.get('id') || value(form, 'id')).trim();
  const existing = id ? await record('posts', id) : null;
  if (id && !existing) {
    return flashRedirect(session, 'posts.php', 'Không tìm thấy bài viết.', 'error');
  }

  const initialKind = ['activity', 'notification', 'blog'].includes(url.searchParams.get('kind') || '')
    ? url.searchParams.get('kind')
    : '';
  const post: Row = existing
    ? { ...existing }
    : {
        id: '',
        kind: initialKind,
        title: '',
        excerpt: '',
        content: '',
        content_format: 'plain',
        image: '',
        gallery: [],
        author: 'CLB Golf Đa Phước',
        role: 'CLB Golf Đa Phước',
        date: today(),
        status: 'draft',
        pinned: false,
        expires_on: null,
        version: 1,
      };

  let error = '';
  let removeImage = false;

  if (method === 'POST') {
    if (!session.check(form)) {
      return flashRedirect(
        session,
        'posts.php',
        'Phiên biểu mẫu đã hết hiệu lực. Mở lại trang đăng bài rồi thử lại.',
        'error',
      );
    }

    post.kind = existing?.kind || scalar(form, 'kind');
    for (const field of ['title', 'excerpt', 'content', 'author', 'role']) {
      post[field] = scalar(form, field);
    }
    post.date = scalar(form, 'date');
    post.status = value(form, 'status') === 'published' ? 'published' : 'draft';
    if (post.kind === 'notification') {
      post.pinned = checked(form, 'pinned');
      post.expires_on = scalar(form, 'expires_on');
    }
    post.version = integer(form, 'version');
    removeImage = Boolean(existing && checked(form, 'remove_image'));

    try {
      if (!['activity', 'notification', 'blog'].includes(post.kind)) {
        throw new InputError('Chọn loại bài hợp lệ.');
      }
      if (!post.title || [...post.title].length > 500) {
        throw new InputError('Tiêu đề cần từ 1 đến 500 ký tự.');
      }
      if (
        [...post.author].length > 200 ||
        [...post.role].length > 200 ||
        Buffer.byteLength(post.content, 'utf8') > 1_000_000
      ) {
        throw new InputError('Thông tin bài viết quá dài.');
      }
      if (existing && post.version !== Number(existing.version)) {
        throw new ConflictError('Nội dung đã được người khác sửa. Tải lại trang để xem bản mới nhất.');
      }

      const date = adminDateValue(post.date);

      if (post.kind === 'activity') {
        const available = activityGallery(existing || {});
        const kept = values(form, 'gallery_keep[]');
        const positions = values(form, 'gallery_position[]');
        const removed = values(form, 'gallery_remove[]');

        if (
          kept.length !== positions.length ||
          (existing && (kept.length !== available.length || new Set(kept).size !== available.length))
        ) {
          throw new InputError('Danh sách ảnh hiện có không đầy đủ.');
        }

        const ordered = new Map<string, { position: number; index: number }>();
        kept.forEach((urlItem, index) => {
          const position = positions[index];
          if (!available.includes(urlItem) || !/^[1-9]\d?$/.test(position) || Number(position) > 20) {
            throw new InputError('Album chứa ảnh không hợp lệ.');
          }
          if (!removed.includes(urlItem) && !ordered.has(urlItem)) {
            ordered.set(urlItem, { position: Number(position), index });
          }
        });

        const gallery = [...ordered]
          .sort((a, b) => a[1].position - b[1].position || a[1].index - b[1].index)
          .map(([urlItem]) => urlItem);
        const newImages = await uploadedImages(form, 'gallery[]', 'activity', 20 - gallery.length);
        gallery.push(...newImages);

        let cover = value(form, 'gallery_cover');
        const newMatch = cover.match(/^new:(\d{1,2})$/);
        if (newMatch) cover = newImages[Number(newMatch[1])] || '';
        post.gallery = gallery;
        post.image = gallery.includes(cover)
          ? cover
          : gallery.includes(existing?.image)
            ? existing!.image
            : gallery[0] || '';
      } else {
        const uploaded = await uploadedImage(form, 'post');
        if (uploaded) {
          post.image = uploaded;
          removeImage = false;
        } else if (removeImage) {
          post.image = '';
        }
      }

      if (post.kind === 'notification') {
        post.expires_on = adminDateValue(String(post.expires_on || ''));
      }

      const payload = fields(post, [
        'id',
        'kind',
        'title',
        'excerpt',
        'content',
        'content_format',
        'image',
        'gallery',
        'author',
        'role',
        'status',
        'pinned',
        'expires_on',
      ]);
      payload.id = existing ? id : randomId('post');
      payload.date = date;

      await save('posts', payload, existing ? post.version : undefined);
      return flashRedirect(session, `posts.php?kind=${post.kind}`, 'Đã lưu bài viết.');
    } catch (failure) {
      error = errorMessage(failure);
      if (post.kind === 'activity') {
        post.gallery = existing?.gallery || [];
        post.image = existing?.image || '';
      }
    }
  }

  return view(
    page,
    existing ? 'Sửa bài viết' : 'Đăng bài mới',
    postEditView(post, existing, error, session, removeImage),
    session,
  );
}

export async function handlePostStatus(
  method: string,
  form: Form,
  session: Session,
): Promise<RouteResult> {
  if (method !== 'POST') return { location: 'posts.php' };
  if (!session.check(form, 'status')) {
    return flashRedirect(session, 'posts.php', 'Yêu cầu không hợp lệ.', 'error');
  }

  const id = scalar(form, 'id');
  const post = await record('posts', id);
  if (!post) return flashRedirect(session, 'posts.php', 'Không tìm thấy bài viết.', 'error');

  try {
    const status = post.status === 'published' ? 'draft' : 'published';
    await save('posts', { id, status }, integer(form, 'version'));
    const message =
      status === 'draft'
        ? 'Đã ẩn bài viết khỏi website.'
        : status === 'published' && post.kind === 'notification' && !notificationVisible(post)
          ? 'Thông báo đã xuất bản nhưng đã hết hạn. Hãy gia hạn để hiển thị công khai.'
          : 'Đã hiển thị bài viết trên website.';
    return flashRedirect(session, `posts.php?kind=${post.kind}`, message);
  } catch (failure) {
    return flashRedirect(session, 'posts.php', errorMessage(failure), 'error');
  }
}

export async function handlePostDelete(
  method: string,
  form: Form,
  session: Session,
): Promise<RouteResult> {
  if (method !== 'POST') return { location: 'posts.php' };
  if (!session.check(form)) {
    return flashRedirect(session, 'posts.php', 'Yêu cầu không hợp lệ.', 'error');
  }

  try {
    await remove('posts', scalar(form, 'id'), integer(form, 'version'));
    return flashRedirect(session, 'posts.php', 'Đã xóa bài viết.');
  } catch (failure) {
    return flashRedirect(session, 'posts.php', errorMessage(failure), 'error');
  }
}
