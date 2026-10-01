const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeMedia } = require('../src/lib/mediaContent');
test('bad CMS shapes and unpublished or unsafe links are excluded', () => {
  for (const value of [undefined, null, {}, 'bad']) assert.deepEqual(normalizeMedia(value), []);
  assert.deepEqual(normalizeMedia([null, {url:'javascript:alert(1)'}, {url:'https://instagram.com.evil.test/reel/test'}, {url:'https://www.instagram.com/reel/hidden/',published:false}]), []);
});
test('published reels remain usable with missing dates and duplicate tracking URLs', () => {
  const result = normalizeMedia([
    {url:'https://www.instagram.com/reel/older/',date:'2024-01-01'},
    {url:'https://www.instagram.com/reel/newer/',date:'2025-01-01'},
    {url:'https://www.instagram.com/reel/newer/?utm_source=copy',date:'2025-01-01'},
    {url:'https://www.instagram.com/reel/pinned/',pin:true,date:'invalid'},
    {url:'https://www.instagram.com/reel/no-date/'},
  ]);
  assert.equal(result.length,4);
  assert.match(result[0].url,/pinned/);
  assert.match(result[1].url,/newer/);
  assert.match(result[3].url,/no-date/);
});
