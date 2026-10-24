import { today, type Row } from './config.ts';

export function notificationVisible(post: Row): boolean {
  return !post.expires_on || String(post.expires_on).slice(0, 10) >= today();
}

export function activityGallery(post: Row): string[] {
  const gallery = Array.isArray(post.gallery) ? post.gallery.filter((url: unknown) => typeof url === 'string' && url !== '') : [];
  if (!gallery.length && post.image) gallery.push(String(post.image));
  return [...new Set(gallery)];
}
