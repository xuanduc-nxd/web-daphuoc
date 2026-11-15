import { test } from 'node:test';
import assert from 'node:assert/strict';
import { youtubeVideoId, youtubeEmbedUrl, youtubeWatchUrl } from '../../src/services/youtube.ts';
import { renderDetailPage } from '../../src/views/public/pages/detail.view.ts';

const id = 'M7lc1UVf-VE';

test('YouTube links resolve to one validated video ID', () => {
  for (const link of [
    `https://www.youtube.com/watch?v=${id}&t=12s`,
    `https://youtu.be/${id}?si=test`,
    `https://youtube.com/shorts/${id}`,
    `https://youtube.com/live/${id}`,
    `https://www.youtube.com/embed/${id}`,
  ]) assert.equal(youtubeVideoId(link), id);
  assert.equal(youtubeWatchUrl(id), `https://www.youtube.com/watch?v=${id}`);
  assert.equal(youtubeEmbedUrl(id), `https://www.youtube-nocookie.com/embed/${id}`);
});

test('non-YouTube and malformed links cannot enter the iframe', () => {
  for (const link of [
    `https://youtube.com.evil.example/watch?v=${id}`,
    `https://www.youtube.com/watch?v=${id}%22%20onload=alert(1)`,
    'javascript:alert(1)',
    'https://www.youtube.com/playlist?list=PL123',
    `http://www.youtube.com/watch?v=${id}`,
  ]) assert.equal(youtubeVideoId(link), '');
  assert.equal(youtubeEmbedUrl('<script>'), '');
  const article = { id: 'one', title: 'Hoạt động thử', date: '2026-10-14', content: 'Nội dung', video_uid: id };
  assert(renderDetailPage(article, 'activity', []).body.includes(youtubeEmbedUrl(id)));
  assert(!renderDetailPage(article, 'blog', []).body.includes('youtube-nocookie.com'));
});
