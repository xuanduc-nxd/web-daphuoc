import { createHmac, timingSafeEqual } from 'node:crypto';
import { InputError, RateLimitError, StorageError, randomId, today } from '../core/config.ts';
import { type Form, value } from '../core/http.ts';
import { save } from '../models/repository.ts';
import { supabaseConfigured, supabaseRequest } from '../models/supabase.ts';

export interface BlogSubmission { author: string; category: string; title: string; content: string; }

function signature(started: string): string {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new StorageError('Chưa cấu hình Supabase để nhận bài viết.');
  return createHmac('sha256', secret).update(`public-blog-form:${started}`).digest('hex');
}

export function blogFormToken(): {started:string;token:string} {
  const started=String(Date.now());
  return {started,token:supabaseConfigured() ? signature(started) : ''};
}

function validForm(form: Form): void {
  const started=value(form,'started');
  const token=value(form,'token');
  if (!/^\d{13}$/.test(started) || !/^[a-f0-9]{64}$/.test(token)) throw new InputError('Biểu mẫu đã hết hiệu lực. Vui lòng tải lại trang.');
  const expected=signature(started);
  if (!timingSafeEqual(Buffer.from(token,'hex'),Buffer.from(expected,'hex'))) throw new InputError('Biểu mẫu đã hết hiệu lực. Vui lòng tải lại trang.');
  const age=Date.now()-Number(started);
  if (age<2000 || age>2*60*60*1000) throw new InputError('Vui lòng đợi vài giây rồi gửi, hoặc tải lại trang nếu biểu mẫu đã mở quá lâu.');
}

export async function submitPublicBlog(form: Form, remoteAddress: string): Promise<void> {
  if (!supabaseConfigured()) throw new StorageError('Chưa cấu hình Supabase để nhận bài viết.');
  validForm(form);
  // This field is hidden from people, but common spam bots fill every input.
  if (value(form,'website').trim()) return;
  const author=value(form,'author').trim().replace(/\s+/g,' ');
  const category=value(form,'category').trim();
  const title=value(form,'title').trim().replace(/\s+/g,' ');
  const content=value(form,'content').trim().replace(/\r\n?/g,'\n');
  if ([...author].length<2 || [...author].length>80) throw new InputError('Tên của bạn cần từ 2 đến 80 ký tự.');
  if (!['Cảm nghĩ','Lời cảm ơn'].includes(category)) throw new InputError('Vui lòng chọn loại chia sẻ.');
  if ([...title].length<5 || [...title].length>120) throw new InputError('Tiêu đề cần từ 5 đến 120 ký tự.');
  if ([...content].length<30 || [...content].length>5000) throw new InputError('Nội dung cần từ 30 đến 5.000 ký tự.');

  const secret=process.env.SUPABASE_SECRET_KEY!;
  const attemptKey=createHmac('sha256',secret).update(`public-blog-author:${remoteAddress}:${author.toLocaleLowerCase('vi-VN')}`).digest('hex');
  const networkKey=createHmac('sha256',secret).update(`public-blog-network:${remoteAddress}`).digest('hex');
  const response=await supabaseRequest('POST','/rest/v1/rpc/consume_public_blog_submission',JSON.stringify({attempt_key:attemptKey,network_key:networkKey}));
  if (!response.ok) throw new StorageError('Chưa bật tính năng nhận bài viết. Chạy file supabase-public-blog.sql trong Supabase SQL Editor.');
  if (await response.json() !== true) throw new RateLimitError('Bạn đã gửi quá nhiều bài. Vui lòng thử lại sau một giờ.');
  await save('posts',{
    id:randomId('post'),kind:'blog',title,excerpt:[...content].slice(0,180).join(''),content,content_format:'plain',
    image:'',gallery:[],author,role:category,date:today(),status:'draft',pinned:false,expires_on:null,
  });
}
