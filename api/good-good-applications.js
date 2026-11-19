import crypto from 'node:crypto'
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'
import { sessionSecret, verifySession } from '../lib/life/core.js'

const PREFIX='good-good:v1:', STATUSES=new Set(['New','Reviewing','Conversation','Shortlisted','Accepted','Confirmed','Declined'])
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
// Keep the application, list summary and category reservation consistent across reviewers.
const reviewScript = `
local raw = redis.call('GET', KEYS[1])
local summaryRaw = redis.call('GET', KEYS[2])
if not raw or not summaryRaw then return {404, 'Application not found.'} end
local a = cjson.decode(raw)
local summary = cjson.decode(summaryRaw)
local request = cjson.decode(ARGV[1])
local offer = type(a.offer) == 'table' and a.offer or nil

if request.action == 'reserve' then
  if a.status == 'Accepted' or a.status == 'Confirmed' then
    return {409, 'This application already has an acceptance. Refresh the application.'}
  end
  if offer and not offer.closedAt then
    if offer.subject ~= request.subject or offer.body ~= request.body or offer.seat ~= request.seat then
      return {409, 'Retry the original email. Refresh the application to load the saved message.'}
    end
    if request.timestamp - offer.timestamp >= 82800000 then
      return {409, 'The email retry window has expired. Check the delivery record before following up.'}
    end
    return {200, raw}
  end

  local owner = redis.call('GET', request.seatKey)
  if owner and owner ~= a.id then return {409, 'This seat already has a pending offer or confirmed member.'} end
  -- Existing acceptances from before seat reservations still count.
  for _, id in ipairs(redis.call('ZRANGE', KEYS[3], 0, -1)) do
    if id ~= a.id then
      local entry = redis.call('GET', ARGV[2] .. 'summary:' .. id)
      if entry then
        local other = cjson.decode(entry)
        if type(other.category) == 'string' and not other.seat
          and (other.status == 'Accepted' or other.status == 'Confirmed') then
          -- Legacy category labels came from the ASCII application dropdown.
          local legacySeat = string.gsub(string.lower(other.category), '[^a-z0-9]', '')
          if legacySeat ~= 'other' and legacySeat == request.normalizedSeat then
            return {409, 'Another applicant already holds this category seat.'}
          end
        end
      end
    end
  end
  offer = {id = request.offerId, seat = request.seat, seatKey = request.seatKey, subject = request.subject,
    body = request.body, timestamp = request.timestamp, from = request.from, replyTo = request.replyTo}
  a.offer = offer
  redis.call('SET', offer.seatKey, a.id)
elseif request.action == 'resolve-offer' then
  if not offer or offer.id ~= request.offerId or offer.sentAt or offer.closedAt then
    return {409, 'The pending offer changed. Refresh the application.'}
  end
  -- Leave an hour after retries end for any in-flight request to finish.
  if request.timestamp - offer.timestamp < 86400000 then
    return {409, 'Wait until 24 hours after the first attempt to resolve this offer.'}
  end
  offer.resolvedAt = request.now
  offer.resolvedBy = request.who
  if request.outcome == 'sent' then
    a.status = 'Accepted'
  else
    offer.closedAt = request.now
    if redis.call('GET', offer.seatKey) == a.id then redis.call('DEL', offer.seatKey) end
  end
elseif request.action == 'sent' then
  if not offer or offer.id ~= request.offerId or offer.closedAt then return {409, 'The offer changed.'} end
  if not offer.sentAt then
    offer.sentAt = request.now
    offer.messageId = request.messageId
    a.status = 'Accepted'
  end
else
  local status = request.status ~= '' and request.status or a.status
  if status == 'Accepted' and a.status ~= 'Accepted' then return {409, 'Use Accept & email to offer this seat.'} end
  if status == 'Confirmed' and a.status ~= 'Accepted' and a.status ~= 'Confirmed' then
    return {409, 'Send an acceptance before confirming a member.'}
  end
  if offer and not offer.closedAt and not (offer.sentAt or offer.resolvedAt) and status ~= a.status then
    return {409, 'Resolve the pending email before changing the status.'}
  end
  if (a.status == 'Accepted' or a.status == 'Confirmed') and status ~= a.status and status ~= 'Confirmed' then
    if status ~= 'Declined' then return {409, 'Choose Declined to reopen the seat.'} end
    if offer then
      offer.closedAt = request.now
      if redis.call('GET', offer.seatKey) == a.id then redis.call('DEL', offer.seatKey) end
    end
  end
  a.status = status
  a.notes = request.notes
end
a.updatedAt = request.now
a.updatedBy = request.who
summary.status = a.status
summary.updatedAt = a.updatedAt
if offer and not offer.closedAt then
  summary.seat = offer.seat
  summary.offerPending = not (offer.sentAt or offer.resolvedAt)
else
  summary.seat = nil
  summary.offerPending = nil
end
local encoded = cjson.encode(a)
redis.call('MSET', KEYS[1], encoded, KEYS[2], cjson.encode(summary))
return {200, encoded}
`

async function reviewApplication(redis, req, res, who, action) {
  const id = clean(req.body?.id, 80)
  const timestamp = Date.now()
  const now = new Date(timestamp).toISOString()
  const keys = [PREFIX + 'application:' + id, PREFIX + 'summary:' + id, PREFIX + 'index']
  const apply = async (data) => {
    const [status, value] = await redis.eval(reviewScript, keys, [JSON.stringify({ ...data, now, timestamp, who }), PREFIX])
    return { status, value: status === 200 && typeof value === 'string' ? JSON.parse(value) : value }
  }
  const respond = ({ status, value }) => status === 200
    ? res.json({ ok: true, application: value })
    : res.status(status).json({ ok: false, error: value })

  if (action === 'update') {
    const status = clean(req.body?.status, 30)
    if (status && !STATUSES.has(status)) return res.status(400).json({ ok: false, error: 'Invalid status.' })
    return respond(await apply({ action, status, notes: clean(req.body?.notes, 6000) }))
  }

  if (action === 'resolve-offer') {
    const { outcome } = req.body || {}
    if (!['sent', 'unsent'].includes(outcome)) {
      return res.status(400).json({ ok: false, error: 'Choose the verified email outcome.' })
    }
    return respond(await apply({ action, outcome, offerId: clean(req.body?.offerId, 80) }))
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ ok: false, error: 'Acceptance email is not configured.' })
  }
  const application = await redis.get(keys[0])
  if (!application) return res.status(404).json({ ok: false, error: 'Application not found.' })
  const seat = application.category === 'Other' ? clean(req.body?.seat, 100) : application.category
  const subject = clean(req.body?.subject, 200)
  const body = clean(req.body?.body, 10000)
  const normalizedSeat = seat.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
  if (!normalizedSeat || (application.category === 'Other' && normalizedSeat === 'other') || !subject || !body) {
    return res.status(400).json({ ok: false, error: 'Enter a specific business category, subject and message.' })
  }

  const reservation = await apply({
    action: 'reserve', seat, normalizedSeat, seatKey: PREFIX + 'seat:' + normalizedSeat,
    subject, body, offerId: crypto.randomUUID(),
    from: process.env.FROM_EMAIL || 'GOOD GOOD Business Network <no-reply@northsidegta.ca>',
    replyTo: process.env.GOOD_GOOD_NOTIFY_EMAIL || 'contact@finallyhomeagents.com'
  })
  if (reservation.status !== 200) return respond(reservation)

  const { offer, email } = reservation.value
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const result = await resend.emails.send({
      from: offer.from, to: [email], replyTo: offer.replyTo, subject: offer.subject, text: offer.body
    }, { idempotencyKey: 'good-good-offer/' + offer.id })
    if (result.error || !result.data?.id) throw new Error(result.error?.name || 'Missing email ID')
    return respond(await apply({ action: 'sent', offerId: offer.id, messageId: result.data.id }))
  } catch (error) {
    console.error('[good-good] acceptance could not be recorded', error.name)
    return res.status(502).json({ ok: false, error: 'Email could not be confirmed. Retry the saved email safely from this application.' })
  }
}

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store'); if(!configured())return res.status(503).json({ok:false,error:'Application storage is not configured.'})
 const redis=db(), action=clean(req.query?.action||'submit',40)
 if(action!=='submit'){const who=user(req);if(!who)return res.status(401).json({ok:false,error:'Sign in to continue.'})
  if(req.method==='GET'&&action==='list'){const ids=await redis.zrange(PREFIX+'index',0,199,{rev:true});const applications=ids.length?(await redis.mget(...ids.map(id=>PREFIX+'summary:'+id))).filter(Boolean):[];return res.json({ok:true,applications})}
  if(req.method==='GET'&&action==='get'){const id=clean(req.query?.id,80),a=await redis.get(PREFIX+'application:'+id);return a?res.json({ok:true,application:a}):res.status(404).json({ok:false,error:'Application not found.'})}
  if (req.method === 'POST' && ['update', 'offer', 'resolve-offer'].includes(action)) {
    return reviewApplication(redis, req, res, who, action)
  }
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
 const id=crypto.randomUUID(),now=new Date().toISOString();delete b.offer;const a={...b,id,status:'New',notes:'',createdAt:now,updatedAt:now,ipHash:crypto.createHash('sha256').update(ip(req)).digest('hex')}
 await redis.set(PREFIX+'application:'+id,a);await redis.set(PREFIX+'summary:'+id,{id,name:a.name,company:a.company,category:a.category,millRun:a.millRun,email:a.email,phone:a.phone,status:a.status,createdAt:now,updatedAt:now});await redis.zadd(PREFIX+'index',{score:Date.now(),member:id});await redis.set(PREFIX+'email:'+a.email.toLowerCase(),id)
 let emailSent=false; if(process.env.RESEND_API_KEY){try{const resend=new Resend(process.env.RESEND_API_KEY),from=process.env.FROM_EMAIL||'GOOD GOOD Business Network <no-reply@northsidegta.ca>',to=process.env.GOOD_GOOD_NOTIFY_EMAIL||'contact@finallyhomeagents.com';await resend.emails.send({from,to:[to],replyTo:a.email,subject:`New GOOD GOOD Application — ${a.category} — ${a.name}`,html:emailHtml(a)});await resend.emails.send({from,to:[a.email],replyTo:to,subject:'We received your GOOD GOOD application',text:`Hi ${a.name.split(' ')[0]},\n\nYour application for the ${a.category} seat has been received. Applications are reviewed individually. If there may be a mutual fit, we'll contact you for a short conversation.\n\nGOOD GOOD Business Network\nMill Run`});emailSent=true}catch(e){console.error('[good-good] email failed',e)}}
 return res.status(201).json({ok:true,id,emailSent})
}
