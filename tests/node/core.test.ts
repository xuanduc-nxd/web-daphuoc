import { test } from 'node:test';
import assert from 'node:assert/strict';
import { legacyDatasets } from '../../src/models/legacy.ts';
import { dateValue, imageValue } from '../../src/core/config.ts';
import { e, richText, srcset } from '../../src/views/public/components.ts';

test('legacy content is normalized without publishing the archive', () => {
  const data=legacyDatasets();
  assert.equal(data.posts.length,9);
  assert.equal(data.members.length,6);
  assert.equal(data.about_sections.length,18);
  assert.equal(data.posts.filter(row=>row.status==='published').length,1);
  assert(data.posts.some(row=>row.legacy_id && row.content_format==='html'));
});
test('dates reject impossible calendar values', () => {
  assert.equal(dateValue('24/10/2026'),'2026-10-24');
  assert.throws(()=>dateValue('31/02/2026'));
});
test('public HTML escapes input and restricts rich links', () => {
  assert.equal(e('<img src=x onerror=alert(1)>'),'&lt;img src=x onerror=alert(1)&gt;');
  const html=richText('<p onclick="alert(1)">Nội dung <strong>đậm</strong></p><script>alert(1)</script><a href="javascript:alert(2)">Liên kết</a>');
  assert(!html.includes('onclick') && !html.includes('<script') && !html.includes('javascript:'));
  assert(html.includes('<strong>đậm</strong>'));
  assert.throws(()=>imageValue('../secret'));
  assert(srcset('Image/act-1.jpg').includes('activity-480.webp'));
});
