// Browser-supplied attribution is a signal, never identity, consent or causation.
export function campaignTracking(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const {campaignId,source,medium}=value;
 if(typeof campaignId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(campaignId)||!['instagram','facebook'].includes(source)||medium!=='organic_social')return null;
 return {campaignId:campaignId.toLowerCase(),source,medium,evidence:'browser_reported'};
}
export function campaignTrackingFromUrl(value){try{const u=new URL(value);if(u.protocol!=='https:'||!['northsidegta.ca','www.northsidegta.ca'].includes(u.hostname)||u.port||u.username||u.password)return null;for(const key of ['utm_campaign','utm_source','utm_medium'])if(u.searchParams.getAll(key).length!==1)return null;return campaignTracking({campaignId:u.searchParams.get('utm_campaign'),source:u.searchParams.get('utm_source'),medium:u.searchParams.get('utm_medium')});}catch{return null;}}
