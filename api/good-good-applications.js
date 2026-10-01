import crypto from 'node:crypto'
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'
import { sessionSecret, verifySession } from '../lib/life/core.js'

const PREFIX='good-good:v1:', STATUSES=new Set(['New','Reviewing','Conversation','Shortlisted','Accepted','Declined'])
const required=['name','company','email','phone','category','millRun','business','why','contribution','example','connections','whyYou','sixMonths','goal','commit']
const clean=(v,n=4000)=>typeof v==='string'?v.trim().slice(0,n):''
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const configured=()=>Boolean((process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL)&&(process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN))
const db=()=>new Redis({url:process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL,token:process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN})
const user=req=>{const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('life_session='))?.slice(13);return verifySession(token,sessionSecret(process.env))}
const ip=req=>String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim().slice(0,100)
const emailOk=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
async function limit(redis,key,max,sec){const n=await redis.incr(PREFIX+'limit:'+key);if(n===1)await redis.expire(PREFIX+'limit:'+key,sec);return n<=max}
function sanitize(b){const out={};for(const [k,v] of Object.entries(b||{}))out[k]=typeof v==='boolean'?v:clean(v,k==='email'||k==='phone'?250:4000);return out}
function emailHtml(a){const rows=Object.entries(a).filter(([k])=>!['id','notes','ipHash'].includes(k)).map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`).join('');return `<div style="font-family:Arial,sans-serif;color:#17251e"><h2>New GOOD GOOD application</h2><p><b>${esc(a.name)}</b> · ${esc(a.category)}</p><table style="border-collapse:collapse">${rows}</table></div>`}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store'); if(!configured())return res.status(503).json({ok:false,error:'Application storage is not configured.'})
 const redis=db(), action=clean(req.query?.action||'submit',40)
 if(action!=='submit'){const who=user(req);if(!who)return res.status(401).json({ok:false,error:'Sign in to continue.'})
  if(req.method==='GET'&&action==='list'){const ids=await redis.zrange(PREFIX+'index',0,199,{rev:true});const applications=ids.length?(await redis.mget(...ids.map(id=>PREFIX+'summary:'+id))).filter(Boolean):[];return res.json({ok:true,applications})}
  if(req.method==='GET'&&action==='get'){const id=clean(req.query?.id,80),a=await redis.get(PREFIX+'application:'+id);return a?res.json({ok:true,application:a}):res.status(404).json({ok:false,error:'Application not found.'})}
  if(req.method==='POST'&&action==='update'){const id=clean(req.body?.id,80),a=await redis.get(PREFIX+'application:'+id);if(!a)return res.status(404).json({ok:false,error:'Application not found.'});const status=clean(req.body?.status,30);if(status&&!STATUSES.has(status))return res.status(400).json({ok:false,error:'Invalid status.'});a.status=status||a.status;a.notes=clean(req.body?.notes,6000);a.updatedAt=new Date().toISOString();a.updatedBy=who;await redis.set(PREFIX+'application:'+id,a);await redis.set(PREFIX+'summary:'+id,{id:a.id,name:a.name,company:a.company,category:a.category,millRun:a.millRun,email:a.email,phone:a.phone,status:a.status,createdAt:a.createdAt,updatedAt:a.updatedAt});return res.json({ok:true,application:a})}
  return res.status(405).json({ok:false,error:'Method not allowed.'})
 }
 if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed.'})
 const b=sanitize(req.body);if(b.nickname)return res.json({ok:true})
 if(!(await limit(redis,'ip:'+crypto.createHash('sha256').update(ip(req)).digest('hex'),5,3600)))return res.status(429).json({ok:false,error:'Too many applications from this connection. Please try again later.'})
 if(required.some(k=>!b[k]))return res.status(400).json({ok:false,error:'Please complete all required fields.'})
 if(!emailOk(b.email))return res.status(400).json({ok:false,error:'Please enter a valid email address.'})
 if(String(b.phone).replace(/\D/g,'').length<10)return res.status(400).json({ok:false,error:'Please enter a valid phone number.'})
 if(b.agree!==true)return res.status(400).json({ok:false,error:'Please accept the membership acknowledgement.'})
 const duplicate=await redis.get(PREFIX+'email:'+b.email.toLowerCase());if(duplicate)return res.status(409).json({ok:false,error:'An application from this email address has already been received.'})
 const id=crypto.randomUUID(),now=new Date().toISOString();const a={...b,id,status:'New',notes:'',createdAt:now,updatedAt:now,ipHash:crypto.createHash('sha256').update(ip(req)).digest('hex')}
 await redis.set(PREFIX+'application:'+id,a);await redis.set(PREFIX+'summary:'+id,{id,name:a.name,company:a.company,category:a.category,millRun:a.millRun,email:a.email,phone:a.phone,status:a.status,createdAt:now,updatedAt:now});await redis.zadd(PREFIX+'index',{score:Date.now(),member:id});await redis.set(PREFIX+'email:'+a.email.toLowerCase(),id)
 let emailSent=false; if(process.env.RESEND_API_KEY){try{const resend=new Resend(process.env.RESEND_API_KEY),from=process.env.FROM_EMAIL||'GOOD GOOD Business Network <no-reply@northsidegta.ca>',to=process.env.GOOD_GOOD_NOTIFY_EMAIL||'contact@finallyhomeagents.com';await resend.emails.send({from,to:[to],replyTo:a.email,subject:`New GOOD GOOD Application — ${a.category} — ${a.name}`,html:emailHtml(a)});await resend.emails.send({from,to:[a.email],replyTo:to,subject:'We received your GOOD GOOD application',text:`Hi ${a.name.split(' ')[0]},\n\nYour application for the ${a.category} seat has been received. Applications are reviewed individually. If there may be a mutual fit, we'll contact you for a short conversation.\n\nGOOD GOOD Business Network\nMill Run`});emailSent=true}catch(e){console.error('[good-good] email failed',e)}}
 return res.status(201).json({ok:true,id,emailSent})
}