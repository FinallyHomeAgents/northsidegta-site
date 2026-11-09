export default async function handler(req,res){
const {createMetricsHandler}=await import('../lib/golf-course-living/metrics.mjs');
return createMetricsHandler({getCommand:async()=>{const {websiteOutbox}=await import('../lib/golf-course-living/headquarters-capture.mjs');const outbox=websiteOutbox();return c=>outbox.command(c);}})(req,res);
}
