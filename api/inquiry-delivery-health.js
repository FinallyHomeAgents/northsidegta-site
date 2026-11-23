export default async function handler(req,res){
 const {createDeliveryHealthHandler}=await import('../lib/inquiry-delivery-health.mjs');
 return createDeliveryHealthHandler({outbox:async env=>(await import('../lib/headquarters-capture.mjs')).websiteOutbox(env)})(req,res);
}
