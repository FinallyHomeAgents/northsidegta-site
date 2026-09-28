import { getRedisClient } from '../lib/communityRanking/kv-client.js';
import handlerModule from '../lib/buying-power/handler.cjs';
export default handlerModule.createHandler({ getRedis: getRedisClient });
