export default async function handler(req,res){
 const {createMetricsHandler}=await import('../lib/campaign-metrics/metrics.mjs');
 return createMetricsHandler({getCommand:async()=>{const {websiteOutbox}=await import('../lib/golf-shortlist/headquarters-capture.mjs');const outbox=websiteOutbox();return c=>outbox.command(c);}})(req,res);
}
