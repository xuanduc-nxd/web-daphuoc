import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { cloudinaryConfigured, deleteManagedImages, managedPublicId, uploadImage } from '../../src/models/cloudinary.ts';

const originalFetch = globalThis.fetch;
const originalEnv = {
  APP_ENV: process.env.APP_ENV,
  CLOUDINARY_API_BASE: process.env.CLOUDINARY_API_BASE,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

beforeEach(() => {
  process.env.APP_ENV = 'test';
  process.env.CLOUDINARY_API_BASE = 'http://127.0.0.1:9999';
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.CLOUDINARY_API_KEY = 'test-key';
  process.env.CLOUDINARY_API_SECRET = 'test-secret';
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('Cloudinary upload is signed, optimized and restricted to managed images', async () => {
  let uploadedPublicId = '';
  let destroyedPublicId = '';
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith('/image/upload')) {
      assert(init?.body instanceof FormData);
      const body = init.body;
      uploadedPublicId = String(body.get('public_id'));
      assert.match(uploadedPublicId, /^clb-golf\/activity\/[a-f0-9]{32}$/);
      assert.equal(body.get('format'), 'webp');
      assert.equal(body.get('overwrite'), 'false');
      assert.equal(body.get('transformation'), 'c_limit,w_2000,h_2000/q_80');
      assert.match(String(body.get('signature')), /^[a-f0-9]{40}$/);
      return Response.json({
        secure_url: `https://res.cloudinary.com/test-cloud/image/upload/v1770000000/${uploadedPublicId}.webp`,
        public_id: uploadedPublicId,
        format: 'webp',
      });
    }
    assert(url.endsWith('/image/destroy'));
    assert(init?.body instanceof URLSearchParams);
    destroyedPublicId = String(init.body.get('public_id'));
    assert.equal(init.body.get('invalidate'), 'true');
    assert.match(String(init.body.get('signature')), /^[a-f0-9]{40}$/);
    return Response.json({ result: 'ok' });
  };

  assert.equal(cloudinaryConfigured(), true);
  const url = await uploadImage('activity', 'image/png', Buffer.from('fixture'));
  assert.equal(managedPublicId(url), uploadedPublicId);
  assert.equal(managedPublicId(url.replace('/test-cloud/', '/another-cloud/')), null);
  assert.equal(managedPublicId('https://res.cloudinary.com/test-cloud/image/upload/v1/not-managed/image.webp'), null);
  await deleteManagedImages([url, url, 'https://example.com/image.webp']);
  assert.equal(destroyedPublicId, uploadedPublicId);
});

test('Cloudinary rejects oversized and unsupported uploads before the network call', async () => {
  globalThis.fetch = async () => { throw new Error('fetch should not run'); };
  await assert.rejects(uploadImage('activity', 'image/png', Buffer.alloc(10 * 1024 * 1024 + 1)), /10 MB/);
  await assert.rejects(uploadImage('unknown', 'image/png', Buffer.from('fixture')), /không hợp lệ/);
  await assert.rejects(uploadImage('post', 'image/svg+xml', Buffer.from('<svg/>')), /không hợp lệ/);
});
