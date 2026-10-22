import {campaignTrackingFromUrl} from './campaign-tracking.mjs';
// In-memory only: no cookies, local/session storage, identifiers or cross-tab history.
// Survives SPA navigation, expires after 30 minutes, resets on full page reload.
export function createCampaignJourney({clock=Date.now,maxAgeMs=30*60*1000}={}){
 let entry=null;
 function current(href){
  let url;try{url=new URL(href);}catch{return null;}
  if(url.protocol!=='https:'||!['northsidegta.ca','www.northsidegta.ca'].includes(url.hostname)||url.port||url.username||url.password){entry=null;return null;}
  const now=clock();
  if(entry&&(!Number.isFinite(now)||now<entry.at||now-entry.at>maxAgeMs))entry=null;
  const tags=campaignTrackingFromUrl(href);
  // Explicit but invalid campaign tags must not borrow an older campaign identity.
  if(['utm_campaign','utm_source','utm_medium'].some(key=>url.searchParams.has(key))){
   if(!tags){entry=null;return null;}
   if(!entry||JSON.stringify(entry.tags)!==JSON.stringify(tags))entry={tags,at:now};
  }
  return entry?{...entry.tags}:null;
 }
 return {current,clear(){entry=null;},page(href){
  let url;try{url=new URL(href);}catch{return '';}
  const tags=current(href);
  if(url.protocol!=='https:'||!['northsidegta.ca','www.northsidegta.ca'].includes(url.hostname)||url.port||url.username||url.password)return '';
  const safe=new URL(url.origin+url.pathname);
  if(tags){safe.searchParams.set('utm_campaign',tags.campaignId);safe.searchParams.set('utm_source',tags.source);safe.searchParams.set('utm_medium',tags.medium);}
  return safe.href;
 }};
}
export const campaignJourney=createCampaignJourney();
export function captureCampaignArrival(){if(typeof window!=='undefined')campaignJourney.current(window.location.href);}
export function trackedInquiryPage(){return typeof window==='undefined'?'':campaignJourney.page(window.location.href);}
