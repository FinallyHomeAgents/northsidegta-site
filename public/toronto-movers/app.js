const form=document.querySelector('#move-form'),complete=document.querySelector('#complete');
const card=document.querySelector('.card');const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');let lightFrame=0;card.addEventListener('pointermove',e=>{if(reducedMotion.matches||e.pointerType!=='mouse')return;cancelAnimationFrame(lightFrame);lightFrame=requestAnimationFrame(()=>{const r=card.getBoundingClientRect();card.style.setProperty('--light-x',`${e.clientX-r.left}px`);card.style.setProperty('--light-y',`${e.clientY-r.top}px`);});});form.querySelectorAll('input:not([type="checkbox"]),textarea').forEach(field=>field.addEventListener('input',()=>field.classList.toggle('field-ready',Boolean(field.value.trim())&&field.checkValidity())));
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');let sceneFrame=0;document.addEventListener('pointermove',e=>{if(reducedMotion.matches||!finePointer.matches||e.pointerType!=='mouse')return;cancelAnimationFrame(sceneFrame);sceneFrame=requestAnimationFrame(()=>{document.documentElement.style.setProperty('--scene-x',`${(e.clientX/window.innerWidth-.5)*-12}px`);document.documentElement.style.setProperty('--scene-y',`${(e.clientY/window.innerHeight-.5)*-8}px`);});});document.documentElement.addEventListener('pointerleave',()=>{cancelAnimationFrame(sceneFrame);document.documentElement.style.setProperty('--scene-x','0px');document.documentElement.style.setProperty('--scene-y','0px');});reducedMotion.addEventListener('change',()=>{document.documentElement.style.setProperty('--scene-x','0px');document.documentElement.style.setProperty('--scene-y','0px');});

const reviews=[{name:'Larissa Halko',quote:'Matt understood our priorities as a family and ensured that these priorities were held in high regard throughout the whole process.'},{name:'Kevin Hickey',quote:'He took me through 25+ homes that worked within my budget and geographic area.'},{name:'Glenn Tappenden',quote:'…always been impressed with their professionalism, availability and insight.'}];

let reviewIndex=0, reviewTimer, reviewFadeTimer, reviewPaused=false, reviewHovered=false, reviewFocused=false;
const reviewStage=document.querySelector('.review-stage'), reviewCard=document.querySelector('.review-card'), pauseReview=document.querySelector('#review-pause');
function scheduleReview(){clearTimeout(reviewTimer);reviewStage.setAttribute('aria-live',reviewPaused||reviewFocused||reducedMotion.matches?'polite':'off');if(!reviewPaused&&!reviewHovered&&!reviewFocused&&!document.hidden&&!reducedMotion.matches)reviewTimer=setTimeout(()=>showReview(1),10000);}
function showReview(direction){clearTimeout(reviewTimer);clearTimeout(reviewFadeTimer);reviewStage.classList.add('review-fading');reviewFadeTimer=setTimeout(()=>{reviewIndex=(reviewIndex+direction+reviews.length)%reviews.length;const review=reviews[reviewIndex];document.querySelector('#review-quote').textContent='“'+review.quote+'”';document.querySelector('#review-name').textContent=review.name;document.querySelector('#review-position').textContent=String(reviewIndex+1).padStart(2,'0')+' / 03';reviewStage.classList.remove('review-fading');scheduleReview();},reducedMotion.matches?0:300);}
function updatePause(){const paused=reviewPaused||reducedMotion.matches;pauseReview.setAttribute('aria-label',paused?'Resume review rotation':'Pause review rotation');pauseReview.querySelector('path').setAttribute('d',paused?'M8 5l11 7-11 7z':'M8 6h3v12H8zM14 6h3v12h-3z');pauseReview.hidden=reducedMotion.matches;}
pauseReview.addEventListener('click',()=>{reviewPaused=!reviewPaused;updatePause();scheduleReview();});
document.querySelector('#review-prev').addEventListener('click',()=>showReview(-1));document.querySelector('#review-next').addEventListener('click',()=>showReview(1));
reviewCard.addEventListener('mouseenter',()=>{reviewHovered=true;scheduleReview();});reviewCard.addEventListener('mouseleave',()=>{reviewHovered=false;scheduleReview();});reviewCard.addEventListener('focusin',()=>{reviewFocused=true;scheduleReview();});reviewCard.addEventListener('focusout',e=>{if(!reviewCard.contains(e.relatedTarget)){reviewFocused=false;scheduleReview();}});document.addEventListener('visibilitychange',scheduleReview);reducedMotion.addEventListener('change',()=>{updatePause();scheduleReview();});updatePause();scheduleReview();
// Keep the lead form ahead of supporting reviews on phones.
const mobileReviews=window.matchMedia('(max-width:700px)');
function placeReviews(){if(mobileReviews.matches){card.after(reviewCard);}else{document.querySelector('.intro').append(reviewCard);}}
mobileReviews.addEventListener('change',placeReviews);placeReviews();

form.elements.phone.addEventListener('input',()=>form.elements.phone.setCustomValidity(''));
let submissionId=crypto.randomUUID(),lastFields='',sending=false;
const errorBox=document.querySelector('#form-error'),submitButton=form.querySelector('[type="submit"]');
form.elements.phone.addEventListener('input',()=>form.elements.phone.setCustomValidity(''));
form.addEventListener('submit',async event=>{
 event.preventDefault();if(sending)return;
 const digits=form.elements.phone.value.replace(/\D/g,'');
 form.elements.phone.setCustomValidity(form.elements.phone.value.trim()&&(!/^[+\d().\s-]+$/.test(form.elements.phone.value)||digits.length<10||digits.length>15)?'Please enter a valid phone number.':'');
 form.elements.name.setCustomValidity(form.elements.name.value.trim()?'':'Please enter your name.');
 if(!form.reportValidity())return;
 const fields={name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),phone:form.elements.phone.value.trim(),needs:form.elements.needs.value.trim(),consent:form.elements.consent.checked,'bot-field':form.elements['bot-field'].value};
 const key=JSON.stringify(fields);if(lastFields&&lastFields!==key)submissionId=crypto.randomUUID();lastFields=key;
 sending=true;submitButton.disabled=true;form.setAttribute('aria-busy','true');errorBox.hidden=true;
 try{
  const challenge=await fetch('/api/homepage-challenge',{headers:{Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000)});
  const token=await challenge.json();if(!challenge.ok||!token.token)throw Error(token.error||'The form check is unavailable. Please try again.');
  await new Promise(resolve=>setTimeout(resolve,Math.min(5000,Math.max(1100,Number(token.readyAfterMs)||1100))));
  const response=await fetch('/api/toronto-movers-lead',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...fields,submissionId,formToken:token.token}),signal:AbortSignal.timeout(20000)});
  const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'Unable to confirm delivery. Please contact contact@finallyhomeagents.com before retrying.');
  complete.querySelector('.confirmation').textContent=result.preview?'Preview check complete.':'Your request is received.';
  document.querySelector('#receipt-message').textContent=result.preview?'No lead was sent or saved. When launched, Matthew or Landon will email your personal Move Analysis within two business days.':'Matthew or Landon will email your personal Move Analysis within two business days, covering community recommendations, relevant home examples and key trade-offs. If we need more detail, we’ll contact you.';
  form.hidden=true;complete.hidden=false;complete.focus();
 }catch(error){errorBox.textContent=error.name==='TimeoutError'?'Delivery could not be confirmed. Please contact contact@finallyhomeagents.com before retrying.':error.message;errorBox.hidden=false;}
 finally{sending=false;submitButton.disabled=false;form.removeAttribute('aria-busy');}
});
form.elements.name.addEventListener('input',()=>form.elements.name.setCustomValidity(''));
document.querySelector('#edit').addEventListener('click',()=>{complete.hidden=true;form.hidden=false;form.elements.name.focus();});

if(['localhost','127.0.0.1'].includes(location.hostname)){document.querySelector('.note').textContent='Private test preview · Nothing is sent or saved.';}
