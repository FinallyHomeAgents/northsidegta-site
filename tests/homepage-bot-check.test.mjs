import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../src/lib/homepageBotCheck.js', import.meta.url), 'utf8');
const { mountHomepageBotCheck } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
class Element {
  children = []; handlers = {}; hidden = false; textContent = ''; style = {}; disabled = false;
  append(...items) { this.children.push(...items); }
  appendChild(item) { this.children.push(item); }
  insertBefore(item) { this.children.push(item); }
  setAttribute() {}
  addEventListener(name, fn) { this.handlers[name] = fn; }
  removeEventListener(name) { delete this.handlers[name]; }
  remove() { this.removed = true; }
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function harness({ siteKey = 'test-key', loadError = false, delayed = false } = {}) {
  const form = new Element(); const button = new Element();
  let options; let renders = 0; let resets = 0; let removes = 0; let resolve;
  const api = { render(el, opts) { options = opts; renders++; return 'widget'; }, reset() { resets++; }, remove() { removes++; } };
  const load = () => delayed ? new Promise(r => { resolve = r; }) : loadError ? Promise.reject(Error('offline')) : Promise.resolve(api);
  const bot = mountHomepageBotCheck({ form, submitButton: button, siteKey, win: {}, doc: { createElement: () => new Element(), createTextNode: text => ({ text }) }, load });
  return { bot, button, form, api, release() { resolve(api); }, get options() { return options; }, get renders() { return renders; }, get resets() { return resets; }, get removes() { return removes; } };
}
test('missing configuration blocks submit and supplies direct contact', async () => {
  const h = harness({ siteKey: '' }); await flush();
  assert.equal(h.renders, 0); assert.equal(h.button.disabled, true); assert.equal(h.bot.getToken(), '');
  assert.match(h.form.children[0].children[1].textContent, /email us directly/);
  assert.equal(h.form.children[0].children[3].children[1].href, 'mailto:contact@finallyhomeagents.com');
});
test('server-bound token only enables submit once verified; busy cannot be overridden', async () => {
  const h = harness(); assert.equal(h.button.disabled, true); await flush();
  assert.equal(h.options.action, 'homepage_lead'); assert.equal(h.options['response-field'], false);
  h.options.callback('valid-token'); assert.equal(h.bot.getToken(), 'valid-token'); assert.equal(h.button.disabled, false);
  h.bot.setBusy(true); h.options.callback('another-token'); assert.equal(h.button.disabled, true);
  h.bot.reset(); assert.equal(h.bot.getToken(), ''); assert.equal(h.button.disabled, true); assert.equal(h.resets, 1);
  h.options.callback('new-token'); assert.equal(h.button.disabled, false);
});
test('expiration, timeout and widget failure invalidate token and show retry', async () => {
  const h = harness(); await flush();
  for (const event of ['expired-callback', 'timeout-callback', 'error-callback']) {
    h.options.callback('valid'); h.options[event]();
    assert.equal(h.bot.getToken(), ''); assert.equal(h.button.disabled, true);
    assert.equal(h.form.children[0].children[2].hidden, false);
  }
  h.form.children[0].children[2].handlers.click(); await flush(); assert.equal(h.renders, 2); assert.equal(h.removes, 1);
});
test('script error fails closed with useful fallback', async () => {
  const h = harness({ loadError: true }); await flush();
  assert.equal(h.button.disabled, true); assert.match(h.form.children[0].children[1].textContent, /could not load/);
});
test('unmount prevents delayed render and stale callbacks', async () => {
  const h = harness({ delayed: true }); h.bot.dispose(); h.release(); await flush(); assert.equal(h.renders, 0);
  const ready = harness(); await flush(); ready.bot.dispose(); ready.options.callback('stale');
  assert.equal(ready.bot.getToken(), ''); assert.equal(ready.removes, 1); ready.bot.dispose(); assert.equal(ready.removes, 1);
});
test('homepage sends required token and keeps a duplicate-click lock', async () => {
  const page = await readFile(new URL('../src/HomePage.js', import.meta.url), 'utf8');
  assert.match(page, /if \(sending \|\| disposed/); assert.match(page, /formData\.set\("turnstileToken", turnstileToken\)/);
  assert.match(page, /botCheck\.reset\(\)/); assert.match(page, /requestController\.abort\(\)/);
});
