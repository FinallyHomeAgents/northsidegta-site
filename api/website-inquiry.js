export default async function handler(req,res){
 const {createWebsiteInquiryHandler}=await import('../lib/website-inquiry.mjs');
 return createWebsiteInquiryHandler({getOutbox:async()=>{
  const {websiteOutbox}=await import('../lib/headquarters-capture.mjs');
  return websiteOutbox();
 }})(req,res);
}
