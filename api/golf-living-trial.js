// The authorized one-inquiry launch test is complete. No active test pathway remains.
export default async function handler(req,res){res.setHeader('Cache-Control','no-store');return res.status(503).json({ok:false,error:'Test route disabled.'});}
