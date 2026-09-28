const { randomUUID } = require('node:crypto');

// One atomic operation checks and reserves both limits, including concurrent
// requests handled by different function instances. Keys contain only hashes.
const ROLLING_LIMIT_SCRIPT = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local retry = 0
for i, key in ipairs(KEYS) do
  redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)
  if redis.call('ZCARD', key) >= tonumber(ARGV[i + 3]) then
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    retry = math.max(retry, tonumber(oldest[2]) + window - now)
  end
end
if retry > 0 then return math.ceil(retry / 1000) end
for _, key in ipairs(KEYS) do
  redis.call('ZADD', key, now, ARGV[3])
  redis.call('PEXPIRE', key, window)
end
return 0
`;

async function reserveSubmission(redis, ipHash, emailHash, timestamp) {
  return Number(await redis.eval(ROLLING_LIMIT_SCRIPT,
    [`bp:rolling:ip:${ipHash}`, `bp:rolling:email:${emailHash}`],
    [timestamp, 3600000, randomUUID(), 10, 3]));
}

module.exports = { reserveSubmission, ROLLING_LIMIT_SCRIPT };
