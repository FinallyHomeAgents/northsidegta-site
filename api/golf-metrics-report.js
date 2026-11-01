export default async function handler(req,res){
 const {createReportHandler}=await import('../lib/campaign-metrics/report.mjs');
 return createReportHandler({getCommand:async()=>{const {websiteOutbox}=await import('../lib/golf-shortlist/headquarters-capture.mjs');const outbox=websiteOutbox();return c=>outbox.command(c);}})(req,res);
}
