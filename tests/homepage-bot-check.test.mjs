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
function harness({ fail = false, delayed = false, result = { token: 'valid-session', readyAfterMs: 1000 } } = {}) {
  const form = new Element(); const button = new Element(); const requests = [];
  const timers = new Map(); let nextTimer = 0; let resolve;
  const win = { setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, {fn, delay}); return id; }, clearTimeout(id) { timers.delete(id); } };
  const reply = () => ({ ok: true, json: async () => result });
  const fetchImpl = (url, options) => { requests.push({url, options}); return delayed ? new Promise(r => { resolve = r; }) : fail ? Promise.reject(Error('offline')) : Promise.resolve(reply()); };
  const bot = mountHomepageBotCheck({ form, submitButton: button, win, doc: { createElement: () => new Element(), createTextNode: text => ({ text }) }, fetchImpl });
  return { bot, button, form, requests, timers, release() { resolve(reply()); }, fire(delay) { for (const [id,timer] of [...timers]) if (timer.delay === delay) { timers.delete(id); timer.fn(); } } };
}
test('same-origin challenge required and server readiness delay respected', async () => {
  const h = harness(); assert.equal(h.button.disabled, true); await flush();
  assert.equal(h.requests[0].url, '/api/homepage-challenge'); assert.equal(h.requests[0].options.credentials, 'same-origin');
  assert.equal(h.requests[0].options.cache, 'no-store'); assert.equal(h.requests[0].options.method, 'GET');
  assert.equal(h.bot.getToken(), ''); h.fire(1000);
  assert.equal(h.bot.getToken(), 'valid-session'); assert.equal(h.button.disabled, false);
});
test('busy state cannot be overridden by readiness callback', async () => {
  const h = harness(); await flush(); h.bot.setBusy(true); h.fire(1000); assert.equal(h.button.disabled, true);
  h.bot.reset(); await flush(); assert.equal(h.requests.length, 2); assert.equal(h.bot.getToken(), '');
  h.fire(1000); assert.equal(h.button.disabled, false);
});
test('expired session refreshes without requiring extra customer fields', async () => {
  const h = harness(); await flush(); h.fire(1000); h.fire(55 * 60 * 1000); await flush();
  assert.equal(h.requests.length, 2); assert.equal(h.button.disabled, true); h.fire(1000); assert.equal(h.button.disabled, false);
});
test('network error fails closed and offers retry/direct contact', async () => {
  const h = harness({fail: true}); await flush(); assert.equal(h.button.disabled, true);
  const [message,retry,fallback] = h.form.children[0].children;
  assert.match(message.textContent, /could not get ready/); assert.equal(retry.hidden, false);
  assert.equal(fallback.children[1].href, 'mailto:contact@finallyhomeagents.com');
  retry.handlers.click(); await flush(); assert.equal(h.requests.length, 2);
});
test('malformed challenge cannot enable submission', async () => {
  for (const result of [{ token: '', readyAfterMs: 1000 }, { token: 'x', readyAfterMs: -1 }, { token: 'x', readyAfterMs: '0' }, { token: 'x', readyAfterMs: 60001 }]) {
    const h = harness({result}); await flush(); assert.equal(h.button.disabled, true); assert.equal(h.bot.getToken(), '');
  }
});
test('unmount aborts request and prevents stale readiness', async () => {
  const h = harness({delayed:true}); h.bot.dispose(); h.release(); await flush();
  assert.equal(h.requests[0].options.signal.aborted, true); assert.equal(h.timers.size, 0); assert.equal(h.bot.getToken(), '');
  const ready = harness(); await flush(); ready.bot.dispose(); ready.fire(1000); assert.equal(ready.bot.getToken(), '');
});
test('homepage sends form token and keeps duplicate-click lock', async () => {
  const page = await readFile(new URL('../src/HomePage.js', import.meta.url), 'utf8');
  assert.match(page, /if \(sending \|\| disposed/); assert.match(page, /formData\.set\("formToken", formToken\)/);
  assert.match(page, /botCheck\.reset\(\)/); assert.match(page, /requestController\.abort\(\)/);
  assert.doesNotMatch(page, /TURNSTILE|turnstileToken/);
  assert.match(page, /result.preview === true/);
  assert.match(page, /Preview test passed. No inquiry was sent./);
  assert.match(page, /result.ok !== true/);
});
