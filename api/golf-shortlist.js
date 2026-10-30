export default async function handler(req,res){
 const {createGolfShortlistHandler}=await import('../lib/golf-shortlist/golf-shortlist.mjs');
 return createGolfShortlistHandler({env:{...process.env,NORTHSIDE_GOLF_SHORTLIST_ENABLED:process.env.NORTHSIDE_GOLF_SHORTLIST_ENABLED || 'true',NORTHSIDE_GOLF_FORMSPREE_ID:process.env.NORTHSIDE_GOLF_FORMSPREE_ID || 'mwpborow'},getOutbox:async()=>{
 const {websiteOutbox}=await import('../lib/golf-shortlist/headquarters-capture.mjs');
 const {measuredOutbox}=await import('../lib/campaign-metrics/metrics.mjs');
 const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
 return measuredOutbox(websiteOutbox(),{enabled:process.env.NORTHSIDE_GOLF_METRICS_ENABLED==='true',source:body.referral_source||'direct-or-search',placement:body.placement||'unspecified'});
 }})(req,res);
}
