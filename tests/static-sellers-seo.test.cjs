const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const { parse } = require('node-html-parser');

const ROOT = path.resolve(__dirname, '..');
const APPROVED_TITLE = 'Sell Your Home North of Toronto | NorthSide GTA | Finally Home Agents';
const APPROVED_DESCRIPTION = 'Considering selling in Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, or Scugog? Finally Home Agents provides strategic pricing, professional marketing, and personal guidance from first conversation to closing.';
const CANONICAL = 'https://northsidegta.ca/sellers';
const SOCIAL_IMAGE = 'https://northsidegta.ca/uploads/sellers-page-seo.jpg';
const SOCIAL_IMAGE_ALT = 'Bright living room with NorthSide GTA and Finally Home Agents branding';
const OUTDATED_FAQS = [
  'How do you price homes for NorthSide GTA sellers?',
  'What marketing do you include?',
  'Do you manage showings and feedback?',
  'How do you negotiate offers?',
];

async function loadSellersMeta() {
  const mod = await import(pathToFileURL(path.join(ROOT, 'src/components/seo/staticRouteMetaConfigs.mjs')).href);
  return mod.getStaticRouteMeta('/sellers');
}

function get(doc, selector, attr = 'content') {
  const el = doc.querySelector(selector);
  if (!el) return '';
  return attr === 'text' ? el.text.trim() : (el.getAttribute(attr) || '').trim();
}

function count(doc, selector) {
  return doc.querySelectorAll(selector).length;
}

test('sellers metadata source emits complete normalized static tags', async () => {
  const meta = await loadSellersMeta();
  const { buildHeadFragments } = require('../scripts/generate-static-route-html.js');
  const html = buildHeadFragments('<!doctype html><html><head><title>Home</title><meta name="description" content="home" /><meta name="keywords" content="stale" /></head><body><div id="root"></div></body></html>', '<!doctype html>', [], meta);
  const doc = parse(html);

  assert.equal(get(doc, 'title', 'text'), APPROVED_TITLE);
  assert.equal(get(doc, 'meta[name="description"]'), APPROVED_DESCRIPTION);
  assert.equal(get(doc, 'link[rel="canonical"]', 'href'), CANONICAL);
  assert.equal(get(doc, 'meta[property="og:type"]'), 'website');
  assert.equal(get(doc, 'meta[property="og:title"]'), APPROVED_TITLE);
  assert.equal(get(doc, 'meta[property="og:description"]'), APPROVED_DESCRIPTION);
  assert.equal(get(doc, 'meta[property="og:url"]'), CANONICAL);
  assert.equal(get(doc, 'meta[property="og:image"]'), SOCIAL_IMAGE);
  assert.equal(get(doc, 'meta[property="og:image:width"]'), '1200');
  assert.equal(get(doc, 'meta[property="og:image:height"]'), '630');
  assert.equal(get(doc, 'meta[property="og:image:alt"]'), SOCIAL_IMAGE_ALT);
  assert.equal(get(doc, 'meta[property="og:site_name"]'), 'NorthSide GTA');
  assert.equal(get(doc, 'meta[name="twitter:card"]'), 'summary_large_image');
  assert.equal(get(doc, 'meta[name="twitter:title"]'), APPROVED_TITLE);
  assert.equal(get(doc, 'meta[name="twitter:description"]'), APPROVED_DESCRIPTION);
  assert.equal(get(doc, 'meta[name="twitter:image"]'), SOCIAL_IMAGE);
  assert.equal(get(doc, 'meta[name="twitter:image:alt"]'), SOCIAL_IMAGE_ALT);
  assert.equal(get(doc, 'meta[name="robots"]'), 'index, follow');
  assert.equal(count(doc, 'title'), 1);
  assert.equal(count(doc, 'meta[name="description"]'), 1);
  assert.equal(count(doc, 'link[rel="canonical"]'), 1);
  ['og:type','og:title','og:description','og:url','og:image','og:image:width','og:image:height','og:image:alt','og:site_name'].forEach((property) => {
    assert.equal(count(doc, `meta[property="${property}"]`), 1, property);
  });
  ['twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt'].forEach((name) => {
    assert.equal(count(doc, `meta[name="${name}"]`), 1, name);
  });
  assert.equal(count(doc, 'meta[name="keywords"]'), 0);
  assert.ok(!get(doc, 'link[rel="canonical"]', 'href').includes('www.'));
});

test('sellers schema aligns with metadata and approved shared FAQ source', async () => {
  const meta = await loadSellersMeta();
  const { sellersFaq } = require('../src/lib/structuredData/faqs.js');
  const schema = meta.schema;
  const graph = schema['@graph'];
  const webpage = graph.find((node) => node['@type'] === 'WebPage');
  const faqPage = graph.find((node) => node['@type'] === 'FAQPage');
  const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList');
  const service = graph.find((node) => node['@type'] === 'Service');

  assert.equal(webpage.url, CANONICAL);
  assert.equal(webpage.name, APPROVED_TITLE);
  assert.equal(webpage.description, APPROVED_DESCRIPTION);
  assert.ok(breadcrumb);
  assert.ok(service);
  assert.equal(sellersFaq.length, 9);
  assert.equal(faqPage.mainEntity.length, 9);
  assert.deepEqual(faqPage.mainEntity.map((item) => item.name), sellersFaq.map((item) => item.question));
  assert.deepEqual(faqPage.mainEntity.map((item) => item.acceptedAnswer.text), sellersFaq.map((item) => item.answer));
  OUTDATED_FAQS.forEach((question) => {
    assert.ok(!JSON.stringify(faqPage).includes(question), question);
  });
});

test('sellers visible FAQ imports the same shared source used by schema', () => {
  const source = fs.readFileSync(path.join(ROOT, 'src/SellersPage.js'), 'utf8');
  assert.match(source, /import \{ sellersFaq \} from "\.\/lib\/structuredData\/faqs"/);
  assert.match(source, /sellersFaq\.map/);
  assert.doesNotMatch(source, /const qs=\[/);
  assert.doesNotMatch(source, /Every situation is different, but the best next step/);
});

test('/sellers is indexable in sitemap and static route generation', async () => {
  const sitemap = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/northsidegta\.ca\/sellers<\/loc>/);
  const robots = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8');
  assert.doesNotMatch(robots, /Disallow:\s*\/sellers\b/i);
  const meta = await loadSellersMeta();
  assert.equal(meta.canonicalUrl, CANONICAL);
  assert.notEqual(meta.title, 'NorthSide GTA Real Estate | Finally Home Agents');
});
