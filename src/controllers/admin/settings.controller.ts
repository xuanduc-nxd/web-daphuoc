import { InputError, imageValue } from '../../core/config.ts';
import { type Form, type Session, values } from '../../core/http.ts';
import { type RouteResult } from '../../models/types.ts';
import { settings, save } from '../../models/repository.ts';
import { deleteManagedImages } from '../../models/cloudinary.ts';
import { uploadedImage, uploadedImages } from '../../services/admin.ts';
import { settingsView } from '../../views/admin/pages/settings.view.ts';
import { scalar, integer, flashRedirect, errorMessage, fields, view } from './helpers.ts';

export async function handleSettings(
  page: string,
  method: string,
  form: Form,
  session: Session,
): Promise<RouteResult> {
  const site = await settings();
  const previousBanner = site.banner_image;
  const previousAboutBanner = site.about_banner_image;
  const previousHero = site.hero_image;
  const previousAboutHero = site.about_hero_image;
  const previousGallery = Array.isArray(site.gallery)
    ? [...new Set(site.gallery.filter((url: unknown): url is string => typeof url === 'string' && Boolean(url)))]
    : [];
  site.gallery = previousGallery;
  const previousImages = [previousBanner, previousAboutBanner, previousHero, previousAboutHero, ...previousGallery];
  let error = '';
  const uploadedThisRequest: string[] = [];

  if (method === 'POST') {
    if (!session.check(form)) {
      return flashRedirect(session, 'settings.php', 'Yêu cầu không hợp lệ.', 'error');
    }

    site.version = integer(form, 'version');
    for (const field of [
      'site_name',
      'header_label',
      'header_title',
      'banner_image',
      'about_banner_image',
      'notice',
      'contact',
      'phone',
      'email',
      'location',
      'facebook',
      'instagram',
      'tiktok',
      'threads',
      'hero_image',
      'about_hero_image',
      'current_board_label',
    ]) {
      site[field] = scalar(form, field);
    }

    try {
      if (!site.site_name || [...site.site_name].length > 80) {
        throw new InputError('Tên website cần từ 1 đến 80 ký tự.');
      }
      if (!site.header_label || [...site.header_label].length > 60) {
        throw new InputError('Dòng chữ nhỏ ở đầu trang cần từ 1 đến 60 ký tự.');
      }
      if (!site.header_title || [...site.header_title].length > 120) {
        throw new InputError('Tên lớn ở đầu trang cần từ 1 đến 120 ký tự.');
      }
      if ([...site.current_board_label].length > 100) throw new InputError('Tên khóa hiện tại quá dài.');
      if (site.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)) {
        throw new InputError('Email không hợp lệ.');
      }
      if (site.phone && !/^[0-9+(). \-]{6,30}$/.test(site.phone)) {
        throw new InputError('Số điện thoại không hợp lệ.');
      }
      for (const field of ['facebook', 'instagram', 'tiktok', 'threads']) {
        if (site[field] && (!URL.canParse(site[field]) || new URL(site[field]).protocol !== 'https:')) {
          throw new InputError('Liên kết mạng xã hội cần bắt đầu bằng https://.');
        }
      }

      site.hero_image = imageValue(site.hero_image);
      site.banner_image = imageValue(site.banner_image);
      site.about_hero_image = imageValue(site.about_hero_image);
      site.about_banner_image = imageValue(site.about_banner_image);
      const kept = values(form, 'gallery_keep[]');
      const positions = values(form, 'gallery_position[]');
      const removed = values(form, 'gallery_remove[]');
      if (
        kept.length !== positions.length ||
        kept.length !== previousGallery.length ||
        new Set(kept).size !== previousGallery.length
      ) {
        throw new InputError('Danh sách album hiện có không đầy đủ.');
      }
      const ordered = new Map<string, { position: number; index: number }>();
      kept.forEach((url, index) => {
        const position = positions[index];
        if (!previousGallery.includes(url) || !/^[1-9]\d?$/.test(position) || Number(position) > 20) {
          throw new InputError('Album website chứa ảnh không hợp lệ.');
        }
        if (!removed.includes(url) && !ordered.has(url)) ordered.set(url,{position:Number(position),index});
      });
      const gallery = [...ordered]
        .sort((left,right) => left[1].position - right[1].position || left[1].index - right[1].index)
        .map(([url]) => url);
      const bannerUpload = await uploadedImage(form, 'banner', 'banner_upload');
      if (bannerUpload) { uploadedThisRequest.push(bannerUpload); site.banner_image = bannerUpload; }
      const aboutBannerUpload = await uploadedImage(form, 'banner', 'about_banner_upload');
      if (aboutBannerUpload) { uploadedThisRequest.push(aboutBannerUpload); site.about_banner_image = aboutBannerUpload; }
      const uploaded = await uploadedImage(form, 'hero');
      if (uploaded) { uploadedThisRequest.push(uploaded); site.hero_image = uploaded; }
      const aboutHeroUpload = await uploadedImage(form, 'hero', 'about_hero_upload');
      if (aboutHeroUpload) { uploadedThisRequest.push(aboutHeroUpload); site.about_hero_image = aboutHeroUpload; }
      const newGallery = await uploadedImages(form, 'gallery[]', 'gallery', 20 - gallery.length);
      uploadedThisRequest.push(...newGallery);
      gallery.push(...newGallery);
      site.gallery = gallery;

      await save(
        'settings',
        fields(site, [
          'id',
          'site_name',
          'header_label',
          'header_title',
          'banner_image',
          'about_banner_image',
          'notice',
          'contact',
          'phone',
          'email',
          'location',
          'facebook',
          'instagram',
          'tiktok',
          'threads',
          'hero_image',
          'about_hero_image',
          'gallery',
          'current_board_label',
        ]),
        site.version,
      );
      const currentImages = [site.banner_image, site.about_banner_image, site.hero_image, site.about_hero_image, ...gallery];
      await deleteManagedImages(previousImages.filter(value => value && !currentImages.includes(value)));
      return flashRedirect(session, 'settings.php', 'Đã cập nhật thông tin website.');
    } catch (failure) {
      await deleteManagedImages(uploadedThisRequest);
      site.banner_image = previousBanner;
      site.about_banner_image = previousAboutBanner;
      site.hero_image = previousHero;
      site.about_hero_image = previousAboutHero;
      site.gallery = previousGallery;
      error = errorMessage(failure);
    }
  }

  return view(page, 'Thông tin website', settingsView(site, error, session), session);
}
