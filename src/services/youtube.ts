const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;

export function youtubeVideoId(input: unknown): string {
  if (typeof input !== 'string' || input.length > 2048) return '';
  const raw = input.trim();
  if (videoIdPattern.test(raw)) return raw;
  let url: URL;
  try { url = new URL(raw); } catch { return ''; }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return '';
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);
  let id = '';
  if (host === 'youtu.be' && parts.length === 1) id = parts[0];
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
    else if (parts.length === 2 && ['shorts', 'live', 'embed'].includes(parts[0])) id = parts[1];
  } else if (['youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host) && parts.length === 2 && parts[0] === 'embed') {
    id = parts[1];
  }
  return videoIdPattern.test(id) ? id : '';
}

export function youtubeWatchUrl(id: unknown): string {
  return typeof id === 'string' && videoIdPattern.test(id) ? `https://www.youtube.com/watch?v=${id}` : '';
}

export function youtubeEmbedUrl(id: unknown): string {
  return typeof id === 'string' && videoIdPattern.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
}
