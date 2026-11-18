import {websiteOutbox} from '../lib/headquarters-capture.mjs';
import {prefix} from '../lib/toronto-movers-metrics.mjs';
const days=Number(process.argv[2]||7);if(!Number.isInteger(days)||days<1||days>90)throw Error('Choose 1–90 days');
const db=websiteOutbox(),rows=[];
for(let i=0;i<days;i++){const date=new Date(Date.now()-i*86400000).toISOString().slice(0,10);const raw=await db.command(['HGETALL',prefix()+date]);const counts=Array.isArray(raw)?Object.fromEntries(Array.from({length:raw.length/2},(_,j)=>[raw[j*2],Number(raw[j*2+1])])):raw;rows.push({date,...counts});}
console.log(JSON.stringify({environment:process.env.VERCEL_ENV||'local',timezone:'UTC',note:'Page views are loads, not unique people. Lead confirmations are server-accepted requests, not proof of inbox delivery. Privacy preferences and measurement failures can reduce counts. Retention: 90 days.',rows},null,2));
