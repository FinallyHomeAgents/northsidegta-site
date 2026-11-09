export default async function handler(req,res){
const {createReportHandler}=await import('../lib/golf-course-living/report.mjs');
return createReportHandler({getCommand:async()=>{const {websiteOutbox}=await import('../lib/golf-course-living/headquarters-capture.mjs');const outbox=websiteOutbox();return c=>outbox.command(c);}})(req,res);
}
