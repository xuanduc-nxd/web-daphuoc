import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, StorageError, dateValue, imageValue, type Row, type Table } from '../core/config.ts';

export function defaultSettings(): Row {
  return { id: 'main', site_name: 'CLB Golf Đa Phước', notice: 'Đồng hành cùng thế hệ trẻ Đà Nẵng', contact: '', phone: '', email: '', location: 'Đà Nẵng, Việt Nam', facebook: '', instagram: '', tiktok: '', threads: '', hero_image: 'Image/act-1.jpg' };
}
function read(root: string, file: string): any {
  try { return JSON.parse(readFileSync(resolve(root, file), 'utf8')); }
  catch (error: any) { if (error.code === 'ENOENT') return []; throw new StorageError(`File dữ liệu nguồn không hợp lệ: ${file}`); }
}
export function legacyDatasets(root = process.env.APP_PREVIEW_DATA_DIR || resolve(ROOT, 'data')): Record<Table, Row[]> {
  const datasets: Record<Table, Row[]> = { posts: [], members: [], sponsors: [], about_sections: [], settings: [], admin_users: [] };
  for (const [file, kind, prefix] of [
    ['posts.json', 'blog', ''], ['sheets/activities.json', 'activity', 'activity_'],
    ['sheets/notifications.json', 'notification', 'notification_'], ['sheets/blog.json', 'blog', 'legacy_blog_'],
  ]) {
    const source = read(root, file);
    if (!Array.isArray(source)) throw new StorageError(`File dữ liệu nguồn không phải danh sách: ${file}`);
    for (const post of source) {
      if (!post || !post.id || !String(post.title || '').trim()) throw new StorageError(`Bài viết nguồn thiếu id hoặc tiêu đề: ${file}`);
      datasets.posts.push({
        id: prefix + post.id, legacy_id: prefix ? String(post.id) : null, kind, title: String(post.title).trim(),
        excerpt: String(post.excerpt || ''), content: String(post.content || ''), content_format: prefix ? 'html' : 'plain',
        image: imageValue(post.image || ''), gallery: [], author: String(post.author || 'CLB Golf Đa Phước'), role: String(post.role || 'CLB Golf Đa Phước'),
        date: dateValue(String(post.date || '')), status: (post.status || (!prefix || file === 'sheets/blog.json' ? 'draft' : 'published')) === 'published' ? 'published' : 'draft',
        pinned: false, expires_on: null,
      });
    }
  }
  const team = read(root, 'team.json');
  if (!Array.isArray(team)) throw new StorageError('File team.json không phải danh sách.');
  team.forEach((member: Row, index: number) => {
    if (!member?.id || !member?.name) throw new StorageError('Hồ sơ nguồn thiếu id hoặc họ tên.');
    datasets.members.push({ id: String(member.id), type: member.type === 'student' ? 'student' : 'board', name: String(member.name), position: String(member.position || ''), school: String(member.school || ''), major: String(member.major || ''), detail: String(member.detail || ''), direction: String(member.direction || ''), support_needs: String(member.support_needs || ''), expertise: String(member.expertise || ''), image: imageValue(member.image || ''), sort_order: index });
  });
  for (const [file, table] of [['sheets/sponsors.json','sponsors'],['sheets/abouts.json','about_sections']] as const) {
    const list = read(root,file);
    if (!Array.isArray(list)) throw new StorageError(`File ${file} không phải danh sách.`);
    list.forEach((row: Row, index: number) => {
      if (table === 'sponsors') datasets.sponsors.push({ id: String(row.id || `sponsor_${index}`), title: String(row.title || ''), excerpt: String(row.excerpt || ''), content: String(row.content || ''), image: imageValue(row.image || ''), date: dateValue(String(row.date || '')), sort_order: index });
      else datasets.about_sections.push({ id: String(row.id || `about_${index}`), section_key: String(row.section_key || ''), category: String(row.category || ''), content: String(row.content || ''), sort_order: index });
    });
  }
  const settings = defaultSettings();
  const sourceSettings = read(root, 'settings.json');
  for (const [field,value] of Object.entries(sourceSettings)) {
    if (field in settings && field !== 'id' && typeof value === 'string' && (value || !['facebook','instagram','tiktok','threads','hero_image'].includes(field))) settings[field] = value;
  }
  const defaults = read(root, 'sheets/defaults.json');
  if (defaults?.[0]?.link) settings.hero_image = imageValue(String(defaults[0].link));
  datasets.settings.push(settings);
  for (const [table, rows] of Object.entries(datasets)) {
    const ids = new Set<string>();
    for (const row of rows) { if (ids.has(row.id)) throw new StorageError(`Dữ liệu nguồn bị trùng id trong bảng ${table}`); ids.add(row.id); }
  }
  return datasets;
}
