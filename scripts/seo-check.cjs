#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const SITE = 'https://northsidegta.ca';
const ROUTES = [
  '/', '/buyers', '/sellers', '/communities', '/homeanalysis',
  '/communities/georgina', '/communities/georgina/living-in-georgina', '/communities/newmarket', '/communities/aurora',
  '/communities/stouffville', '/communities/uxbridge', '/communities/scugog',
  '/communities/east-gwillimbury', '/contact', '/about', '/sign', '/vip',
];
const HOME_TITLE = 'NorthSide GTA Real Estate | Finally Home Agents';
const NOINDEX = new Set(['/sign', '/vip']);

function fileForRoute(route) {
  return route === '/' ? path.join(BUILD_DIR, 'index.html') : path.join(BUILD_DIR, route.replace(/^\//, ''), 'index.html');
}
function get(doc, selector, attr = 'content') {
  const el = doc.querySelector(selector);
  if (!el) return '';
  return attr === 'text' ? el.text.trim() : (el.getAttribute(attr) || '').trim();
}
function assert(ok, message, errors) {
  if (!ok) errors.push(message);
}

let failures = 0;
for (const route of ROUTES) {
  const file = fileForRoute(route);
  const errors = [];
  if (!fs.existsSync(file)) {
    console.error(`❌ ${route}: missing ${path.relative(ROOT, file)}`);
    failures += 1;
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const doc = parse(html);
  const title = get(doc, 'title', 'text');
  const description = get(doc, 'meta[name="description"]');
  const canonical = get(doc, 'link[rel="canonical"]', 'href');
  const robots = get(doc, 'meta[name="robots"]');
  const ogUrl = get(doc, 'meta[property="og:url"]');
  const ogImage = get(doc, 'meta[property="og:image"]');
  const twitterImage = get(doc, 'meta[name="twitter:image"]');
  const jsonLdCount = doc.querySelectorAll('script[type="application/ld+json"]').length;
  const expectedCanonical = `${SITE}${route === '/' ? '/' : route}`;

  assert(Boolean(title), 'missing title', errors);
  assert(Boolean(description), 'missing description', errors);
  assert(canonical === expectedCanonical, `canonical mismatch: ${canonical}`, errors);
  assert(!canonical.includes('www.'), 'canonical uses www', errors);
  assert(ogUrl === canonical, `og:url mismatch: ${ogUrl}`, errors);
  assert(Boolean(ogImage), 'missing og:image', errors);
  assert(Boolean(twitterImage), 'missing twitter:image', errors);
  assert(!ogImage.includes('www.'), 'og:image uses www', errors);
  assert(!twitterImage.includes('www.'), 'twitter:image uses www', errors);
  assert(!/\.svg(?:$|[?#])/i.test(ogImage), `og:image uses SVG: ${ogImage}`, errors);
  assert(!/\.svg(?:$|[?#])/i.test(twitterImage), `twitter:image uses SVG: ${twitterImage}`, errors);
  assert(!doc.querySelector('meta[name="keywords"]'), 'meta keywords present', errors);
  assert(get(doc, 'meta[name="author"]') === 'Finally Home Agents', 'missing author', errors);
  assert(get(doc, 'meta[name="publisher"]') === 'Finally Home Agents', 'missing publisher', errors);
  assert(jsonLdCount > 0, 'missing JSON-LD', errors);

  if (NOINDEX.has(route)) {
    assert(/noindex/i.test(robots) && /follow/i.test(robots), `expected noindex, follow robots: ${robots}`, errors);
  } else {
    assert(/index/i.test(robots) && /follow/i.test(robots) && !/noindex/i.test(robots), `expected index, follow robots: ${robots}`, errors);
  }

  if (route.startsWith('/communities/')) {
    assert(canonical !== `${SITE}/`, 'town canonical points to homepage', errors);
    assert(title !== HOME_TITLE, 'town uses homepage title', errors);
  }

  if (errors.length) {
    failures += 1;
    console.error(`❌ ${route}: ${errors.join('; ')}`);
  } else {
    console.log(`✅ ${route}: ${title} | ${canonical}`);
  }
}

if (failures) {
  console.error(`SEO check failed for ${failures} route(s).`);
  process.exit(1);
}
console.log('SEO check passed.');
