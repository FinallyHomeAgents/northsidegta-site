// Read-only report. Run with the existing website Redis environment; never print credentials.
import {websiteOutbox} from '../lib/golf-shortlist/headquarters-capture.mjs';
const days=Number(process.argv[2]||7);
if(!Number.isInteger(days)||days<1||days>90)throw Error('Choose 1–90 days.');
const outbox=websiteOutbox(),rows=[];
for(let i=0;i<days;i++){
 const date=new Date(Date.now()-i*86400000).toISOString().slice(0,10);
 const values=await outbox.command(['HGETALL','northside:golf-metrics:v1:'+date]);
 const pairs=Array.isArray(values)?Array.from({length:values.length/2},(_,j)=>[values[j*2],values[j*2+1]]):Object.entries(values||{});
 for(const [key,count]of pairs){const [source,placement,event]=key.split('|');rows.push({date,source,placement,event,count:Number(count)});}
}
console.log(JSON.stringify({timezone:'UTC',note:'Page views are not unique visitors. Saved inquiries are queue confirmations, not guaranteed email delivery. Tests excluded; privacy preferences may reduce measured visits.',rows},null,2));
