import {createHash} from 'node:crypto';
// Persistent hash-only receipts. An uncertain send never automatically becomes sendable.
// Exactly-once external delivery is impossible without provider idempotency support.
const claimScript=`
local old=redis.call('GET',KEYS[1])
if old then
 local decoded=cjson.decode(old)
 if decoded.fingerprint~=ARGV[1] then return 'conflict' end
 return decoded.state
end
redis.call('SET',KEYS[1],ARGV[2])
return 'claimed'`;
const finishScript=`
if redis.call('GET',KEYS[1])~=ARGV[1] then return 0 end
redis.call('SET',KEYS[1],ARGV[2])
return 1`;
function canonical(fields){
 return JSON.stringify(Object.fromEntries(Object.keys(fields).sort().filter(key=>! /^(timestamp|submitted_at|submittedAt|_timestamp)$/i.test(key)).map(key=>[key,fields[key]])));
}
export async function reserveNotification(normalized,command){
 const identity=normalized.lead.source+'\0'+normalized.lead.externalId;
 const key='northside:form-notification:v1:'+createHash('sha256').update(identity).digest('hex');
 const fingerprint=createHash('sha256').update(normalized.destination+'\0'+canonical(normalized.fields)).digest('hex');
 const pending=JSON.stringify({fingerprint,state:'pending'});
 const state=await command(['EVAL',claimScript,1,key,fingerprint,pending]);
 if(!['claimed','pending','sent','unknown','conflict'].includes(state))throw Error('Invalid notification receipt');
 return {state,async finish(outcome){
  if(state!=='claimed'||!['sent','unknown'].includes(outcome))throw Error('Invalid notification transition');
  const result=await command(['EVAL',finishScript,1,key,pending,JSON.stringify({fingerprint,state:outcome})]);
  if(Number(result)!==1)throw Error('Notification acknowledgement not saved');
 }};
}
