import { fileTypeFromBuffer } from 'file-type';
import { imageSize } from 'image-size';
import { StorageError, type Row, type Table } from '../src/core/config.ts';
import { cloudinaryConfigured, deleteManagedImages, uploadImage } from '../src/models/cloudinary.ts';
import { change, select } from '../src/models/supabase.ts';

const apply = process.argv.includes('--apply');
const sourceRoot = `${(process.env.SUPABASE_URL || '').replace(/\/$/, '')}/storage/v1/object/public/site-media/`;

interface SourceImage { url: string; prefix: string }
interface PendingRow { table: Table; row: Row; updates: Row }

function sourceImage(value: unknown): string | null {
  const url = String(value || '');
  return sourceRoot !== '/storage/v1/object/public/site-media/' && url.startsWith(sourceRoot) ? url : null;
}

function replace(value: unknown, urls: Map<string,string>): unknown {
  return urls.get(String(value || '')) || value;
}

async function download(url: string): Promise<{ bytes: Buffer; mime: string }> {
  let response: Response;
  try { response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30000) }); }
  catch { throw new StorageError(`Không tải được ảnh nguồn: ${url}`); }
  if (!response.ok) throw new StorageError(`Không tải được ảnh nguồn (HTTP ${response.status}): ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 10 * 1024 * 1024) throw new StorageError(`Ảnh nguồn vượt quá 10 MB, cần nén thủ công trước khi chuyển: ${url}`);
  const detected = await fileTypeFromBuffer(bytes);
  const mime = detected?.mime || '';
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(mime)) throw new StorageError(`Ảnh nguồn không hợp lệ: ${url}`);
  try { const size = imageSize(bytes); if (!size.width || !size.height) throw new Error(); }
  catch { throw new StorageError(`Ảnh nguồn không hợp lệ: ${url}`); }
  return { bytes, mime };
}

async function main(): Promise<void> {
  if (!sourceRoot.startsWith('https://')) throw new StorageError('Chưa cấu hình SUPABASE_URL hợp lệ.');
  if (apply && !cloudinaryConfigured()) throw new StorageError('Chưa cấu hình Cloudinary.');

  const [posts, members, sponsors, settings] = await Promise.all([
    select('posts'), select('members'), select('sponsors'), select('settings'),
  ]);
  const sources = new Map<string,SourceImage>();
  const include = (value: unknown, prefix: string) => {
    const url = sourceImage(value);
    if (url && !sources.has(url)) sources.set(url,{url,prefix});
  };
  for (const row of posts) {
    const prefix = row.kind === 'activity' ? 'activity' : 'post';
    include(row.image,prefix);
    for (const image of Array.isArray(row.gallery) ? row.gallery : []) include(image,'activity');
  }
  for (const row of members) include(row.image,'team');
  for (const row of sponsors) include(row.image,'sponsor');
  for (const row of settings) {
    include(row.banner_image,'banner');
    include(row.hero_image,'hero');
    for (const image of Array.isArray(row.gallery) ? row.gallery : []) include(image,'gallery');
  }

  console.log(`Ảnh Supabase cần chuyển sang Cloudinary: ${sources.size}`);
  if (!apply) {
    console.log('Chỉ kiểm tra. Chạy lại với --apply sau khi đã sao lưu database và Storage.');
    return;
  }

  const urls = new Map<string,string>();
  const uploaded: string[] = [];
  try {
    for (const source of sources.values()) {
      const image = await download(source.url);
      const target = await uploadImage(source.prefix,image.mime,image.bytes);
      urls.set(source.url,target);
      uploaded.push(target);
      console.log(`Đã tải lên Cloudinary: ${source.prefix} (${urls.size}/${sources.size})`);
    }
  } catch (error) {
    await deleteManagedImages(uploaded);
    throw error;
  }

  const pending: PendingRow[] = [];
  for (const row of posts) {
    const image = replace(row.image,urls);
    const gallery = (Array.isArray(row.gallery) ? row.gallery : []).map(value => replace(value,urls));
    if (image !== row.image || gallery.some((value,index) => value !== row.gallery[index])) pending.push({table:'posts',row,updates:{image,gallery}});
  }
  for (const [table, rows] of [['members',members],['sponsors',sponsors]] as const) {
    for (const row of rows) {
      const image = replace(row.image,urls);
      if (image !== row.image) pending.push({table,row,updates:{image}});
    }
  }
  for (const row of settings) {
    const bannerImage = replace(row.banner_image,urls);
    const heroImage = replace(row.hero_image,urls);
    const gallery = (Array.isArray(row.gallery) ? row.gallery : []).map(value => replace(value,urls));
    if (bannerImage !== row.banner_image || heroImage !== row.hero_image || gallery.some((value,index) => value !== row.gallery[index])) {
      pending.push({table:'settings',row,updates:{banner_image:bannerImage,hero_image:heroImage,gallery}});
    }
  }

  for (const item of pending) {
    await change(item.table,String(item.row.id),Number(item.row.version),item.updates);
  }
  console.log(`Hoàn tất: ${urls.size} ảnh và ${pending.length} bản ghi đã được chuyển.`);
  console.log('Ảnh nguồn trên Supabase chưa bị xóa. Hãy kiểm tra website và sao lưu trước khi xóa bucket cũ.');
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode=1; });
