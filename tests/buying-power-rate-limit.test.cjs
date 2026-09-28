const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { randomUUID } = require('node:crypto');
const { reserveSubmission } = require('../lib/buying-power/rate-limit.cjs');

// CI provides an isolated Redis service so these tests execute the actual Lua
// script, including Redis's atomicity, rather than reimplementing the limiter.
const port = Number(process.env.RATE_LIMIT_TEST_REDIS_PORT);
const redis = { eval(script, keys, args) {
  const command = ['EVAL', script, keys.length, ...keys, ...args].map(String);
  const request = `*${command.length}\r\n` + command.map(value => `$${Buffer.byteLength(value)}\r\n${value}\r\n`).join('');
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' });
    let response = '';
    socket.setTimeout(5000, () => socket.destroy(new Error('Redis test timed out')));
    socket.on('error', reject);
    socket.on('connect', () => socket.write(request));
    socket.on('data', chunk => {
      response += chunk.toString();
      if (!response.includes('\r\n')) return;
      socket.end();
      if (response[0] === ':') resolve(Number(response.slice(1).trim()));
      else reject(new Error(response.trim()));
    });
  });
} };

test('email limit survives an hour boundary and releases only expired submissions', { skip: !port }, async () => {
  const email = randomUUID(); const ip = randomUUID();
  const before = Date.parse('2026-09-28T15:59:59Z');
  for (let i = 0; i < 3; i++) assert.equal(await reserveSubmission(redis, ip, email, before), 0);
  assert.equal(await reserveSubmission(redis, ip, email, before + 2000), 3598);
  assert.equal(await reserveSubmission(redis, ip, email, before + 3599999), 1);
  assert.equal(await reserveSubmission(redis, ip, email, before + 3600000), 0);
});

test('IP limit applies across emails and concurrent function instances', { skip: !port }, async () => {
  const ip = randomUUID(); const now = Date.parse('2026-09-28T15:59:59Z');
  const results = await Promise.all(Array.from({ length: 20 }, () => reserveSubmission(redis, ip, randomUUID(), now)));
  assert.equal(results.filter(result => result === 0).length, 10);
  assert.equal(results.filter(result => result === 3600).length, 10);
  assert.equal(await reserveSubmission(redis, ip, randomUUID(), now + 2000), 3598);
  assert.equal(await reserveSubmission(redis, ip, randomUUID(), now + 3600000), 0);
});

test('email limit is shared across IPs and blocked requests do not consume the other limit', { skip: !port }, async () => {
  const email = randomUUID(); const now = Date.now();
  const results = await Promise.all(Array.from({ length: 10 }, () => reserveSubmission(redis, randomUUID(), email, now)));
  assert.equal(results.filter(result => result === 0).length, 3);
  const freshIp = randomUUID();
  for (let i = 0; i < 10; i++) assert.equal(await reserveSubmission(redis, freshIp, email, now), 3600);
  assert.equal(await reserveSubmission(redis, freshIp, randomUUID(), now), 0);
});
