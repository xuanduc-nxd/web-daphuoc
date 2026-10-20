const rawOrigin = process.env.RENDER_ORIGIN?.trim();

if (!rawOrigin) {
  throw new Error('Thiếu RENDER_ORIGIN. Đặt URL Render trong Environment của Vercel.');
}

let origin;
try {
  const url = new URL(rawOrigin);
  if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.onrender\.com$/i.test(url.hostname) || url.port
      || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('invalid origin');
  }
  origin = url.origin;
} catch {
  throw new Error('RENDER_ORIGIN cần có dạng https://ten-dich-vu.onrender.com, không thêm đường dẫn.');
}

export const config = {
  rewrites: [
    { source: '/', destination: `${origin}/` },
    { source: '/:path*', destination: `${origin}/:path*` },
  ],
};
