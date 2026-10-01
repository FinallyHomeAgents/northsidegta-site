import { getRedisClient } from '../lib/communityRanking/kv-client.js';
import { sessionSecret, verifySession } from '../lib/life/core.js';
import handlerModule from '../lib/play-your-budget/handler.cjs';
import cmsSession from '../lib/play-your-budget/session.cjs';

const authorize = req => {
  if (cmsSession.verifySession(req, process.env)) return true;
  const token = String(req.headers?.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('life_session='))?.slice(13);
  return Boolean(verifySession(token, sessionSecret(process.env)));
};
export default handlerModule.createHandler({ getRedis: getRedisClient, authorize });
