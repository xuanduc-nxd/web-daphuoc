import { test } from 'node:test';
import assert from 'node:assert/strict';
import { legacyDatasets } from '../../src/models/legacy.ts';
import { dateValue, imageValue } from '../../src/core/config.ts';
import { e, richText, srcset } from '../../src/views/public/components.ts';
import { renderExecutiveBoardPage } from '../../src/views/public/pages/executive-board.view.ts';

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

test('board page orders advisors, current board and previous terms', () => {
  const html = renderExecutiveBoardPage([
    { name: 'Khóa cũ A', position: 'Ban điều hành', board_term: 'Khóa I', term_order: 2020 },
    { name: 'Khóa hiện tại', position: 'Ban điều hành', board_term: 'current' },
    { name: 'Cố vấn', position: 'Ban cố vấn' },
    { name: 'Khóa cũ B', position: 'Ban điều hành', board_term: 'Khóa II', term_order: 2022 },
  ], 'Khóa 2026–2027');
  const names = ['Cố vấn', 'Khóa hiện tại', 'Khóa cũ B', 'Khóa cũ A'];
  assert(names.every((name, index) => index === 0 || html.indexOf(names[index - 1]) < html.indexOf(name)));
  assert(html.includes('Ban điều hành các khóa trước'));
  assert(html.includes('Khóa 2026–2027'));
  assert(html.includes('<details class="team-term-panel"'));
});
