// Staged Redis adapter. Supply the existing website's server-side Redis command client.
// Do not use the headquarters read-only credential or expose this adapter to the browser.
import {createHash} from 'node:crypto';
const prefix='northside:hq-outbox:v1:';
const due=prefix+'due';
const quarantine=prefix+'review';
const enqueueScript=`
local fingerprint=redis.call('GET',KEYS[3])
if fingerprint then
 if fingerprint~=ARGV[4] then return -1 end
 return 1
end
redis.call('SET',KEYS[1],ARGV[1])
redis.call('SET',KEYS[3],ARGV[4])
redis.call('ZADD',KEYS[2],ARGV[2],ARGV[3])
return 1`;
const ackScript=`
if redis.call('GET',KEYS[1])==ARGV[1] then
 redis.call('DEL',KEYS[1],KEYS[3])
 redis.call('ZREM',KEYS[2],ARGV[2])
 redis.call('ZREM',KEYS[4],ARGV[2])
 redis.call('EXPIRE',KEYS[5],604800)
 return 1
end
return 0`;
const failScript=`
if redis.call('GET',KEYS[1])~=ARGV[1] then return 0 end
local attempts=redis.call('INCR',KEYS[3])
if attempts>=10 then
 redis.call('ZREM',KEYS[2],ARGV[2])
 redis.call('ZADD',KEYS[4],ARGV[3],ARGV[2])
else
 local delay=math.min(3600000,60000*2^(attempts-1))
 redis.call('ZADD',KEYS[2],tonumber(ARGV[3])+delay,ARGV[2])
end
return attempts`;
export class InquiryOutbox {
 constructor(command,{now=Date.now}={}){this.command=command;this.now=now;}
 async enqueue(lead){
  if(!lead||typeof lead.source!=='string'||typeof lead.externalId!=='string'||!lead.externalId)throw Error('Stable source reference required.');
  const raw=JSON.stringify(lead);if(Buffer.byteLength(raw)>16000)throw Error('Inquiry exceeds size limit.');
  const id=createHash('sha256').update(lead.source+'\0'+lead.externalId).digest('hex');
  const fingerprint=createHash('sha256').update(JSON.stringify({...lead,receivedAt:''})).digest('hex');
  const result=await this.command(['EVAL',enqueueScript,3,prefix+id,due,prefix+id+':fingerprint',raw,this.now(),id,fingerprint]);
  if(result!==1)throw Error('Outbox reference conflict.');
  return id;
 }
 async status(){
  const [pending,needsReview]=await Promise.all([this.command(['ZCARD',due]),this.command(['ZCARD',quarantine])]);
  return {pending:Number(pending),needsReview:Number(needsReview)};
 }
 async requeue(id){
  if(!/^[a-f0-9]{64}$/.test(id))throw Error('Invalid inquiry reference.');
  return this.command(['EVAL',`if not redis.call('ZSCORE',KEYS[2],ARGV[1]) or not redis.call('GET',KEYS[1]) then return 0 end
redis.call('ZREM',KEYS[2],ARGV[1]);redis.call('DEL',KEYS[4]);redis.call('ZADD',KEYS[3],ARGV[2],ARGV[1]);return 1`,4,prefix+id,quarantine,due,prefix+id+':attempts',id,this.now()]);
 }
 async drain(deliver){
  // Bound each scheduled run to fit the function deadline during outages.
  const ids=await this.command(['ZRANGEBYSCORE',due,'-inf',this.now(),'LIMIT',0,5]);
  if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'||!/^[a-f0-9]{64}$/.test(id)))throw Error('Invalid outbox index.');
  let acknowledged=0,failed=0;
  for(const id of ids){
   const raw=await this.command(['GET',prefix+id]);
   if(typeof raw!=='string')throw Error('Outbox item missing; operator review required.');
   try{
    await deliver(JSON.parse(raw));
   }catch{
    await this.command(['EVAL',failScript,4,prefix+id,due,prefix+id+':attempts',quarantine,raw,id,this.now()]);
    failed++;continue;
   }
   await this.command(['EVAL',ackScript,5,prefix+id,due,prefix+id+':attempts',quarantine,prefix+id+':fingerprint',raw,id]);
   acknowledged++;
  }
  return {acknowledged,failed};
 }
}
// Concurrent workers may deliver twice: receiver idempotency is required.
// After ten unsuccessful attempts the original is retained for review, never deleted.
// Activation requires a durable scheduler, queue-depth alerts, a requeue control and
// an agreed retention policy. No interval in a serverless process is a scheduler.
