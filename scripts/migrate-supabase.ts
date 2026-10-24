import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileTypeFromFile } from 'file-type';
import { imageSize } from 'image-size';
import { ROOT, StorageError, type Table, type Row } from '../src/core/config.ts';
import { legacyDatasets } from '../src/models/legacy.ts';
import { uploadDir } from '../src/models/repository.ts';
import { supabaseConfigured, select, importRows, uploadFile } from '../src/models/supabase.ts';

const args=process.argv.slice(2);
const option=(name:string)=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined;};
const dry=args.includes('--dry-run'),apply=args.includes('--apply');
if (dry===apply) {console.error('Dùng --dry-run để kiểm tra, hoặc --apply để nhập dữ liệu vào Supabase.');process.exit(1);}
const source=option('--source-dir') || resolve(ROOT,'data');
const uploads=option('--uploads-dir') || uploadDir();
try {
  const datasets=legacyDatasets(source);
  const images=new Map<string,string>();
  for (const rows of Object.values(datasets)) for (const row of rows) for (const field of ['image','hero_image']) {
    const url=String(row[field] || '');
    const match=url.match(/^(?:media\.php\?file=|uploads\/)([a-zA-Z0-9_-]+\.(?:jpg|png|webp|gif))$/);
    if (match) images.set(url,match[1]);
  }
  console.log(`Nguồn nhập (chỉ đọc): ${source}`);
  for (const [table,rows] of Object.entries(datasets)) if (table!=='admin_users') console.log(`${table}: ${rows.length}`);
  console.log(`Ảnh tải lên cần chuyển: ${images.size}`);
  const missing=[...images.values()].filter(name=>!existsSync(resolve(uploads,name)));
  if (missing.length) throw new StorageError(`Thiếu ảnh trong thư mục uploads: ${missing.join(', ')}`);
  if (dry) {console.log('Kiểm tra nguồn thành công. Chưa gửi dữ liệu hoặc ảnh lên Supabase.');process.exit(0);}
  if (!supabaseConfigured()) throw new StorageError('Tạo project, chạy SQL và cấu hình .env trước khi nhập dữ liệu.');
  for (const table of Object.keys(datasets) as Table[]) if (table!=='admin_users') await select(table,{},'id.asc','id,version',1);
  console.log(`Đích Supabase: ${new URL(process.env.SUPABASE_URL!).hostname}`);
  const urls=new Map<string,string>();
  for (const [old,name] of images) {
    const path=resolve(uploads,name),bytes=readFileSync(path),detected=await fileTypeFromFile(path);
    if (!detected || !['image/jpeg','image/png','image/webp','image/gif'].includes(detected.mime)) throw new StorageError(`Ảnh nguồn không hợp lệ: ${name}`);
    try {const size=imageSize(bytes);if(!size.width||!size.height)throw new Error();} catch {throw new StorageError(`Ảnh nguồn không hợp lệ: ${name}`);}
    urls.set(old,await uploadFile(name,detected.mime,bytes,true));
  }
  for (const [table,rows] of Object.entries(datasets) as [Table,Row[]][]) {
    if (table==='admin_users') continue;
    const transformed=rows.map(row=>{const copy={...row};for(const field of ['image','hero_image'])if(urls.has(copy[field]))copy[field]=urls.get(copy[field]);return copy;});
    const created=await importRows(table,transformed);
    console.log(`${table}: tạo ${created}, giữ ${rows.length-created} bản ghi đã có.`);
  }
  console.log('Đã nhập xong. File nguồn được giữ nguyên. Chạy check-supabase rồi tạo tài khoản quản trị.');
} catch(error) {console.error(error instanceof Error?error.message:error);process.exitCode=1;}
