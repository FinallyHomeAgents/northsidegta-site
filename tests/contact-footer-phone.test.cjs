require('@babel/register')({ babelrc: false, configFile: false, presets: ['@babel/preset-env', '@babel/preset-react'] });
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Footer = require('../src/components/contact/ContactFooterBand').default;
const config = require('../public/data/contact-page.json');
for (const channels of [[], [{ key: 'call', href: 'tel:+16476684646' }]]) {
  test(`agent call destinations match labels with ${channels.length ? 'shared channel' : 'no shared channel'}`, () => {
    const html = renderToStaticMarkup(React.createElement(Footer, { config, channels }));
    assert.match(html, /href="tel:\+14164554594"[^>]*>[\s\S]*?416-455-4594/);
    assert.match(html, /href="tel:\+16476684646"[^>]*>[\s\S]*?647-668-4646/);
  });
}
