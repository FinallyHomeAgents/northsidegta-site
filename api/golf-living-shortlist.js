export default async function handler(req,res){
const {createGolfLivingHandler}=await import('../lib/golf-course-living/form.mjs');
return createGolfLivingHandler({env:{...process.env,NORTHSIDE_GOLF_FORMSPREE_ID:process.env.NORTHSIDE_GOLF_FORMSPREE_ID||'mwpborow'},getOutbox:async()=>{
const {websiteOutbox}=await import('../lib/golf-course-living/headquarters-capture.mjs');
const {measuredOutbox}=await import('../lib/golf-course-living/metrics.mjs');
const b=typeof req.body==='string'?JSON.parse(req.body):req.body;
return measuredOutbox(websiteOutbox(),{enabled:process.env.NORTHSIDE_GOLF_LIVING_METRICS_ENABLED==='true',source:b.referral_source||'direct-or-search',placement:b.placement||'unspecified'});
}})(req,res);}
