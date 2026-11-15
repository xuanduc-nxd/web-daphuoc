import { createHash, randomUUID } from 'node:crypto';
import { StorageError } from '../core/config.ts';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MANAGED_ROOT = 'clb-golf';

const imageProfiles: Record<string, { maximum: number; quality: number }> = {
  banner: { maximum: 2400, quality: 82 },
  hero: { maximum: 2400, quality: 82 },
  activity: { maximum: 2000, quality: 80 },
  gallery: { maximum: 2000, quality: 80 },
  post: { maximum: 2000, quality: 80 },
  team: { maximum: 1200, quality: 80 },
  sponsor: { maximum: 1200, quality: 80 },
};

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  apiBase: string;
}

function configuration(required = true): CloudinaryConfig | null {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();
  if (!cloudName && !apiKey && !apiSecret) {
    if (required) throw new StorageError('Chưa cấu hình Cloudinary để lưu ảnh.');
    return null;
  }
  if (
    !/^[a-zA-Z0-9_-]{1,100}$/.test(cloudName) ||
    !/^[a-zA-Z0-9_-]{1,200}$/.test(apiKey) ||
    !apiSecret ||
    /[\r\n]/.test(apiSecret)
  ) {
    throw new StorageError('Cấu hình Cloudinary chưa đầy đủ hoặc không hợp lệ.');
  }
  let apiBase = 'https://api.cloudinary.com';
  if (process.env.APP_ENV === 'test' && process.env.CLOUDINARY_API_BASE) {
    const local = new URL(process.env.CLOUDINARY_API_BASE);
    if (local.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(local.hostname)) {
      throw new StorageError('Địa chỉ Cloudinary kiểm thử không hợp lệ.');
    }
    apiBase = local.origin;
  }
  return { cloudName, apiKey, apiSecret, apiBase };
}

export function cloudinaryConfigured(): boolean {
  return configuration(false) !== null;
}

function signature(parameters: Record<string, string>, secret: string): string {
  const source = Object.entries(parameters)
    .filter(([, value]) => value !== '')
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return createHash('sha1').update(source + secret).digest('hex');
}

function errorCode(value: unknown): string {
  const text = String(value || '');
  return /^[a-zA-Z0-9_-]{1,80}$/.test(text) ? text : '';
}

async function responseError(response: Response, action: string): Promise<StorageError> {
  let code = '';
  try {
    const body = await response.json() as { error?: { http_code?: unknown }; code?: unknown };
    code = errorCode(body.code || body.error?.http_code);
  } catch {}
  console.error(`Cloudinary ${action} failed: HTTP ${response.status}${code ? `, code ${code}` : ''}`);
  return new StorageError(`Không ${action === 'upload' ? 'lưu được ảnh lên' : 'xóa được ảnh khỏi'} Cloudinary (HTTP ${response.status}${code ? `, mã ${code}` : ''}).`);
}

export async function uploadImage(prefix: string, mime: string, bytes: Buffer): Promise<string> {
  const config = configuration()!;
  const profile = imageProfiles[prefix];
  if (!profile || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mime) || bytes.length > MAX_UPLOAD_BYTES) {
    throw new StorageError('Ảnh tải lên không hợp lệ hoặc vượt quá 10 MB.');
  }

  const publicId = `${MANAGED_ROOT}/${prefix}/${randomUUID().replace(/-/g, '')}`;
  const parameters = {
    format: 'webp',
    overwrite: 'false',
    public_id: publicId,
    timestamp: String(Math.floor(Date.now() / 1000)),
    transformation: `c_limit,w_${profile.maximum},h_${profile.maximum}/q_${profile.quality}`,
  };
  const body = new FormData();
  body.append('file', new Blob([new Uint8Array(bytes)], { type: mime }), `${prefix}-upload`);
  for (const [key, value] of Object.entries(parameters)) body.append(key, value);
  body.append('api_key', config.apiKey);
  body.append('signature', signature(parameters, config.apiSecret));

  let response: Response;
  try {
    response = await fetch(`${config.apiBase}/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`, {
      method: 'POST',
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw new StorageError('Không kết nối được Cloudinary để lưu ảnh.');
  }
  if (!response.ok) throw await responseError(response, 'upload');

  let result: { secure_url?: unknown; public_id?: unknown; format?: unknown };
  try { result = await response.json() as typeof result; }
  catch { throw new StorageError('Cloudinary trả về dữ liệu ảnh không hợp lệ.'); }
  const secureUrl = String(result.secure_url || '');
  if (
    result.public_id !== publicId ||
    result.format !== 'webp' ||
    !secureUrl.startsWith(`https://res.cloudinary.com/${config.cloudName}/image/upload/`) ||
    managedPublicId(secureUrl) !== publicId
  ) {
    throw new StorageError('Cloudinary trả về dữ liệu ảnh không hợp lệ.');
  }
  return secureUrl;
}

export function managedPublicId(value: unknown): string | null {
  let config: CloudinaryConfig | null;
  try { config = configuration(false); } catch { return null; }
  if (!config) return null;
  let url: URL;
  try { url = new URL(String(value || '')); } catch { return null; }
  if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') return null;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== config.cloudName || parts[1] !== 'image' || parts[2] !== 'upload') return null;
  const version = parts.findIndex((part, index) => index > 2 && /^v\d+$/.test(part));
  if (version < 0 || version === parts.length - 1) return null;
  const encoded = parts.slice(version + 1).join('/').replace(/\.[a-zA-Z0-9]+$/, '');
  let publicId: string;
  try { publicId = decodeURIComponent(encoded); } catch { return null; }
  return publicId.startsWith(`${MANAGED_ROOT}/`) ? publicId : null;
}

async function destroyPublicId(publicId: string): Promise<void> {
  const config = configuration()!;
  const parameters = {
    invalidate: 'true',
    public_id: publicId,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const body = new URLSearchParams({
    ...parameters,
    api_key: config.apiKey,
    signature: signature(parameters, config.apiSecret),
  });
  let response: Response;
  try {
    response = await fetch(`${config.apiBase}/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new StorageError('Không kết nối được Cloudinary để xóa ảnh.');
  }
  if (!response.ok) throw await responseError(response, 'delete');
  let result = '';
  try { result = String((await response.json() as { result?: unknown }).result || ''); } catch {}
  if (!['ok', 'not found'].includes(result)) throw new StorageError('Cloudinary không xác nhận đã xóa ảnh.');
}

export async function deleteManagedImages(values: unknown[]): Promise<void> {
  const publicIds = [...new Set(values.map(managedPublicId).filter((value): value is string => Boolean(value)))];
  for (const publicId of publicIds) {
    try { await destroyPublicId(publicId); }
    catch (error) { console.error(error instanceof Error ? error.message : 'Không xóa được ảnh Cloudinary.'); }
  }
}
