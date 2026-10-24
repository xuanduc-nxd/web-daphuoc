import bcrypt from 'bcryptjs';
import { randomId, StorageError } from '../src/core/config.ts';
import { supabaseConfigured, select, insert } from '../src/models/supabase.ts';

const args=process.argv.slice(2);
const option=(name:string)=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined;};
const username=String(option('--username') || '').trim().toLowerCase();
const role=option('--role') || 'admin';
const password=process.env.ADMIN_SETUP_PASSWORD || '';
try {
  if (!/^[a-z0-9_.-]{3,64}$/.test(username) || !['admin','editor'].includes(role)) throw new Error('Dùng --username ten_dang_nhap [--name "Họ tên"] [--role admin|editor].');
  if ([...password].length<12 || Buffer.byteLength(password,'utf8')>72) throw new Error('Mật khẩu cần ít nhất 12 ký tự và tối đa 72 byte. Dùng create-admin.ps1 để nhập kín.');
  if (!supabaseConfigured()) throw new StorageError('Chưa cấu hình Supabase.');
  if ((await select('admin_users',{username:`eq.${username}`},'id.asc','id',1)).length) throw new StorageError('Tên đăng nhập đã tồn tại. Không ghi đè tài khoản đã có.');
  await insert('admin_users',{id:randomId('admin'),username,display_name:option('--name') || username,password_hash:await bcrypt.hash(password,12),role,disabled:false});
  console.log(`Đã tạo tài khoản ${username} với quyền ${role}. Không có mật khẩu mặc định.`);
} catch(error) {console.error(error instanceof Error?error.message:error);process.exitCode=1;}
