import React,{useEffect,useMemo,useRef,useState}from"react";
import{Helmet}from"react-helmet-async";
import{createPortal}from"react-dom";
import{trackEvent}from"./utils/analytics";
import"./PlayYourBudgetPage.css";


const BOARD_SPACES=[
["Toronto","toronto","From here to a bigger tomorrow"],
["Scugog","scugog","Space to breathe"],
["Uxbridge","uxbridge","Acreage living"],
["Georgina","georgina","Lake life"],
["East Gwillimbury","east","More space"],
["Newmarket","newmarket","Established & connected"],
["Aurora","aurora","Premium community"],
["Stouffville","stouffville","Small-town feel"]
];
const TOWNS=BOARD_SPACES.slice(1);
const BOARD_LABELS=BOARD_SPACES.map(([name,cls,tagline])=>({name,cls,tagline}));
const WANTS=["More space","Acreage","Pool","Waterfront","Newer home","Privacy","Better commute","Room for family"];
const COMMUNITY_SLUGS={Georgina:"georgina","East Gwillimbury":"east-gwillimbury",Newmarket:"newmarket",Aurora:"aurora",Stouffville:"stouffville",Uxbridge:"uxbridge",Scugog:"scugog"};
const MATCH_PROFILES={
 Georgina:{weights:{"More space":4,Acreage:2,Pool:2,Waterfront:6,"Newer home":1,Privacy:3,"Better commute":1,"Room for family":4},proof:["Lake-oriented lifestyle and waterfront possibilities","More freehold house for the budget than many York Region markets","Strong detached-home potential"]},
 Scugog:{weights:{"More space":5,Acreage:6,Pool:2,Waterfront:5,"Newer home":1,Privacy:6,"Better commute":0,"Room for family":4},proof:["Rural and larger-lot homes are a core strength","Strong privacy and space potential","Waterfront houses can enter the conversation at higher budgets"]},
 Uxbridge:{weights:{"More space":5,Acreage:7,Pool:3,Waterfront:0,"Newer home":1,Privacy:7,"Better commute":1,"Room for family":4},proof:["Excellent fit for rural and acreage homes","Strong detached-home market","Country setting with an established town centre"]},
 "East Gwillimbury":{weights:{"More space":6,Acreage:4,Pool:3,Waterfront:0,"Newer home":7,Privacy:3,"Better commute":4,"Room for family":6},proof:["Newer freehold homes are a major strength","Good balance of space and connectivity","Detached and freehold townhome options broaden as budget rises"]},
 Newmarket:{weights:{"More space":3,Acreage:0,Pool:2,Waterfront:0,"Newer home":2,Privacy:1,"Better commute":7,"Room for family":5},proof:["Established freehold neighbourhoods and amenities","Strong commuter connectivity","Townhouse, semi and detached options depending on budget"]},
 Aurora:{weights:{"More space":3,Acreage:1,Pool:4,Waterfront:0,"Newer home":2,Privacy:3,"Better commute":7,"Room for family":5},proof:["Premium freehold neighbourhoods","Excellent access and amenities","Freehold townhomes open the market before detached homes"]},
 Stouffville:{weights:{"More space":4,Acreage:3,Pool:3,Waterfront:1,"Newer home":6,Privacy:2,"Better commute":5,"Room for family":6},proof:["Strong freehold townhouse and detached market","Newer neighbourhoods and family-oriented housing","Rural homes become realistic as budget increases"]}
};

const PROPERTY_TYPES=[
 {key:"detached",label:"Detached"},
 {key:"semi",label:"Semi-detached"},
 {key:"townhouse",label:"Freehold townhouse"},
 {key:"acreage",label:"Rural / acreage home"},
 {key:"waterfront",label:"Waterfront home"}
];

/*
 Directional freehold-house guardrails, calibrated against current public listing
 evidence in September 2026. These are not advertised minimum prices and are
 intentionally conservative: "possible" means the search can reasonably begin;
 "strong" means the property type should be a meaningful part of the search.
 No condos, condo townhouses, vacant land, or raw land are included.
*/
const FREEHOLD_MARKET={
 Georgina:{
  detached:{possible:600000,strong:700000},
  semi:{possible:650000,strong:775000,rare:true},
  townhouse:{possible:650000,strong:775000},
  acreage:{possible:750000,strong:900000},
  waterfront:{possible:700000,strong:950000}
 },
 Scugog:{
  detached:{possible:675000,strong:800000},
  semi:{possible:725000,strong:850000,rare:true},
  townhouse:{possible:750000,strong:900000,rare:true},
  acreage:{possible:700000,strong:900000},
  waterfront:{possible:725000,strong:900000}
 },
 Uxbridge:{
  detached:{possible:825000,strong:950000},
  semi:{possible:850000,strong:950000,rare:true},
  townhouse:{possible:850000,strong:975000,rare:true},
  acreage:{possible:900000,strong:1100000},
  waterfront:null
 },
 "East Gwillimbury":{
  detached:{possible:900000,strong:1050000},
  semi:{possible:800000,strong:925000,rare:true},
  townhouse:{possible:775000,strong:900000},
  acreage:{possible:900000,strong:1150000},
  waterfront:null
 },
 Newmarket:{
  detached:{possible:700000,strong:900000},
  semi:{possible:725000,strong:850000},
  townhouse:{possible:675000,strong:800000},
  acreage:null,
  waterfront:null
 },
 Aurora:{
  detached:{possible:875000,strong:1050000},
  semi:{possible:850000,strong:975000,rare:true},
  townhouse:{possible:700000,strong:850000},
  acreage:{possible:1500000,strong:1850000,rare:true},
  waterfront:null
 },
 Stouffville:{
  detached:{possible:800000,strong:1000000},
  semi:{possible:850000,strong:975000,rare:true},
  townhouse:{possible:775000,strong:900000},
  acreage:{possible:1000000,strong:1250000},
  waterfront:{possible:1000000,strong:1300000,rare:true}
 }
};

const propertyFit=(budget,rule)=>{
 if(!rule)return {status:"Not typical",level:0};
 if(budget<rule.possible)return {status:"Unlikely",level:0};
 if(budget<rule.strong)return {status:rule.rare?"Limited / possible":"Possible",level:1};
 return {status:rule.rare?"Possible":"Strong option",level:2};
};
const propertyOptions=(name,budget)=>PROPERTY_TYPES.map(type=>{
 const rule=FREEHOLD_MARKET[name]?.[type.key]||null;
 return {...type,...propertyFit(budget,rule),rule};
});
const rankCommunities=(budget,wants)=>TOWNS.map(([name,cls,tagline],order)=>{
 const profile=MATCH_PROFILES[name];
 const options=propertyOptions(name,budget);
 const viable=options.filter(o=>o.level>0);
 const marketScore=options.reduce((sum,o)=>sum+(o.level===2?26:o.level===1?12:0),0);
 const priorityScore=wants.reduce((sum,w)=>sum+(profile.weights[w]||0)*4,0);
 const score=(viable.length?marketScore+priorityScore:-1000)-order*.001;
 const reasons=[...wants].sort((a,b)=>(profile.weights[b]||0)-(profile.weights[a]||0)).filter(w=>(profile.weights[w]||0)>=3).slice(0,2);
 return {name,cls,tagline,score,reasons,proof:profile.proof,options,hasFit:viable.length>0};
}).filter(item=>item.hasFit).sort((a,b)=>b.score-a.score);
const rollTotalForDistance=distance=>({0:8,1:9,2:10,3:11,4:12,5:5,6:6,7:7}[distance]||8);
const diceForTotal=total=>{
 const pairs=[];
 for(let a=1;a<=6;a+=1){const b=total-a;if(b>=1&&b<=6)pairs.push([a,b])}
 return pairs[Math.floor(Math.random()*pairs.length)]||[4,4];
};
const money=v=>v>=4000000?"$4M+":v>=1000000?`$${(v/1000000).toFixed(v%1000000?2:0)}M`:`$${v/1000}K`;

const PIP_MAP={
  1:[5],
  2:[1,9],
  3:[1,5,9],
  4:[1,3,7,9],
  5:[1,3,5,7,9],
  6:[1,3,4,6,7,9]
};
function RealDie({value,className=""}){
 const active=new Set(PIP_MAP[value]||[]);
 return <div className={"real-die "+className} aria-label={value+" on die"}>{Array.from({length:9},(_,i)=><span key={i} className={"pip "+(active.has(i+1)?"on":"")}/>)}</div>
}

const FOCUSABLE='button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
export default function PlayYourBudgetPage(){
 const resultRef=useRef(null),modalRef=useRef(null),rollTriggerRef=useRef(null),previousFocusRef=useRef(null);
 const[budget,setBudget]=useState(1500000),[wants,setWants]=useState(["More space","Privacy"]),[gate,setGate]=useState(false),[rolling,setRolling]=useState(false),[revealed,setRevealed]=useState(false),[lead,setLead]=useState({name:"",email:"",phone:"",consent:false,botField:""}),[formStatus,setFormStatus]=useState({loading:false,error:""}),[lastSubmittedSignature,setLastSubmittedSignature]=useState(""),[dice,setDice]=useState([5,3]),[position,setPosition]=useState(0),[moving,setMoving]=useState(false),[landed,setLanded]=useState(null),[stepTick,setStepTick]=useState(0),[artReady,setArtReady]=useState(false);
 const[homeRequest,setHomeRequest]=useState("match");
 const label=useMemo(()=>money(budget),[budget]);
 const landedSpace=useMemo(()=>BOARD_SPACES.find(([name])=>name===landed),[landed]);
 const rankedMatches=useMemo(()=>rankCommunities(budget,wants),[budget,wants]);
 const bestMatch=rankedMatches[0]||null;
 const noFreeholdMatch=!bestMatch;
 const matchOptions=bestMatch?.options||[];
 useEffect(()=>{if(revealed){trackEvent("pyb_match_revealed",{budget,match:landed||"no-match",priority_count:wants.length})}},[revealed,landed,budget,wants.length]);
 useEffect(()=>{if(!revealed){setHomeRequest("match");return undefined}if(typeof window==="undefined")return undefined;const old=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=old}},[revealed]);
 useEffect(()=>{if(!gate)return undefined;previousFocusRef.current=document.activeElement;const old=document.body.style.overflow;document.body.style.overflow="hidden";const key=e=>{if(e.key==="Escape"){setGate(false);return}if(e.key!=="Tab")return;const els=Array.from(modalRef.current?.querySelectorAll(FOCUSABLE)||[]).filter(el=>!el.disabled&&el.getAttribute("aria-hidden")!=="true");if(!els.length){e.preventDefault();return}const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};window.addEventListener("keydown",key);return()=>{document.body.style.overflow=old;window.removeEventListener("keydown",key);previousFocusRef.current?.focus?.()}},[gate]);
 useEffect(()=>{
  if(!revealed)return undefined;
  const previous=document.activeElement;
  const card=resultRef.current;
  if(!card)return undefined;
  const focusable=()=>Array.from(card?.querySelectorAll(FOCUSABLE)||[]).filter(el=>!el.disabled&&el.offsetParent!==null);
  (homeRequest==="form"?card?.querySelector('input:not([tabindex="-1"])'):card)?.focus();
  const onKey=e=>{
   if(e.key==="Escape"){if(!formStatus.loading)setRevealed(false);return}
   if(e.key!=="Tab")return;
   const els=focusable(),first=els[0],last=els[els.length-1];
   if(!first){e.preventDefault();return}
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===card)){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===card)){e.preventDefault();first.focus()}
  };
  window.addEventListener("keydown",onKey);
  return()=>{window.removeEventListener("keydown",onKey);previous?.focus?.()};
 },[revealed,homeRequest,formStatus.loading]);
 const toggle=w=>setWants(a=>{const next=a.includes(w)?a.filter(x=>x!==w):a.length<4?[...a,w]:a;trackEvent("pyb_priority_change",{priority:w,selected:next.includes(w),selected_count:next.length});return next});
 const runRoll=()=>{if(rolling||moving)return;setLanded(null);setRevealed(false);if(!bestMatch){setRevealed(true);return}const target=BOARD_SPACES.findIndex(([name])=>name===bestMatch.name);const distance=(target-position+BOARD_SPACES.length)%BOARD_SPACES.length;const total=rollTotalForDistance(distance);const[a,b]=diceForTotal(total);setDice([a,b]);setRolling(true);setTimeout(()=>{setRolling(false);setMoving(true);let step=0;const timer=setInterval(()=>{step+=1;setPosition(prev=>{const next=(prev+1)%BOARD_SPACES.length;if(step>=total){clearInterval(timer);setMoving(false);setRevealed(true);setLanded(BOARD_SPACES[next][0]);setStepTick(t=>t+1)}return next})},310)},1450)};
 const leadSignature=()=>JSON.stringify({budget,wants,match:bestMatch?.name||"no-match"});
 const sendLead=async(requestType="match")=>{
  if(formStatus.loading||!lead.name||!lead.email||!lead.consent)return false;
  setFormStatus({loading:true,error:""});
  const payload={
   requestType,
   name:lead.name,
   email:lead.email,
   phone:lead.phone,
   consent:lead.consent,
   botField:lead.botField,
   budget,
   budgetLabel:label,
   priorities:wants,
   recommendedCommunity:bestMatch?.name||"",
   propertyTypes:(bestMatch?.options||[]).map(({label,status})=>({label,status})),
   pageUrl:typeof window!=="undefined"?window.location.href:"",
   submittedAt:new Date().toISOString()
  };
  try{
   const response=await fetch("/api/play-your-budget-lead",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload)});
   const body=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(body.error||"Unable to send your request.");
   setLastSubmittedSignature(leadSignature());
   setFormStatus({loading:false,error:""});
   trackEvent("pyb_lead_submit",{budget,priority_count:wants.length,match:bestMatch?.name||"no-match"});
   return true;
  }catch(error){
   setFormStatus({loading:false,error:error?.message||"Something went wrong. Please try again."});
   return false;
  }
 };
 const roll=async e=>{
  e.preventDefault();
  const sent=await sendLead();
  if(!sent)return;
  setGate(false);
  setTimeout(runRoll,260);
 };
 const requestHomes=async e=>{
  e.preventDefault();
  if(await sendLead("homes")){
   setHomeRequest("sent");
   trackEvent("pyb_home_request_submit",{community:landedSpace?.[0],budget});
  }
 };
 const revealFromButton=async()=>{
  trackEvent("pyb_reveal_click",{budget,priority_count:wants.length});
  if(!lead.email||!lead.consent){
   trackEvent("pyb_lead_open",{budget,priority_count:wants.length});
   setGate(true);
   return;
  }
  if(lastSubmittedSignature!==leadSignature()){
   const sent=await sendLead();
   if(!sent){setGate(true);return}
  }
  runRoll();
 };
 return <main className="pyb">
  <Helmet><title>Play Your Budget | NorthSide GTA</title><meta name="description" content="Set your budget, choose what matters, and roll to see where we'd start your NorthSide GTA home search."/><link rel="canonical" href="https://northsidegta.ca/play-your-budget"/></Helmet>
  <section id="pyb-controls" className="pyb-hero">
   <div className="pyb-hero-inner">
    <div className="pyb-hero-copy">
     <p className="eyebrow">PLAY YOUR BUDGET · NORTHSIDE GTA</p>
     <h1>What could your next home look like <em>up here?</em></h1>
     <p className="intro">Set your budget. Pick what matters. We’ll calculate your strongest freehold-house fit — then the dice reveal it.</p>
    </div>
    <div className="pyb-control-panel">
     <div className="pyb-budget-control">
      <div className="control-kicker">YOUR BUDGET</div>
      <div className="budget-value">{label}</div>
      <input aria-label="Home budget" type="range" min="500000" max="4000000" step="50000" value={budget} onChange={e=>setBudget(+e.target.value)} onPointerUp={()=>trackEvent("pyb_budget_change",{budget})} onKeyUp={()=>trackEvent("pyb_budget_change",{budget})}/>
      <div className="budget-range"><span>$500K</span><span>$4M+</span></div>
     </div>
     <div className="pyb-priority-control">
      <div className="control-head"><div><span className="control-kicker">WHAT MATTERS MOST?</span><small>Choose up to four</small></div><b>{wants.length}/4</b></div>
      <div className="chips">{WANTS.map(w=><button type="button" key={w} className={wants.includes(w)?"active":""} onClick={()=>toggle(w)}>{w}</button>)}</div>
     </div>
     <div className="pyb-action-control">
      <button className="roll-btn hero-roll-btn" onClick={revealFromButton} disabled={rolling||moving||formStatus.loading}>{noFreeholdMatch?"CHECK MY FREEHOLD OPTIONS":landed?"REVEAL MY UPDATED MATCH":"REVEAL MY MATCH"} <span>↗</span></button>
      <p className={noFreeholdMatch?"is-tight":""}>{noFreeholdMatch?"At this budget, realistic freehold-house options are extremely limited. We won’t force a fake match.":"Freehold houses only · No condos, condo townhouses or vacant land"}</p>
     </div>
    </div>
   </div>
  </section>
  <section className="table table-3d">
   <div id="pyb-board" className={"pyb-board-stage premium-game "+(rolling?"is-rolling ":"")+(moving?"is-moving ":"")+(revealed?"is-revealed ":"")+(artReady?"has-board-art":"")}>
    <div className="board3d-copy"><span>THE NORTHSIDE BOARD</span><strong>{label}</strong><small>{wants.length?wants.join(" · "):"Set your priorities above"}</small></div>
    <div className="pyb-game-status" aria-live="polite"><span>{noFreeholdMatch?"BUDGET REALITY CHECK":rolling?"MATCH LOCKED · ROLLING…":moving?"REVEALING YOUR MATCH":landed?"YOUR MATCH · "+landed:"READY TO MATCH"}</span><strong>{noFreeholdMatch?label:rolling||moving?dice[0]+" + "+dice[1]+" = "+(dice[0]+dice[1]):landed?landed:"Roll to reveal"}</strong></div>
    <div className="pyb-board-surface">
     <img className="pyb-board-art" src="/Images/play-your-budget-board.webp" alt="" onLoad={()=>setArtReady(true)} onError={()=>setArtReady(false)}/>
     <div className="vboard-lake"><span>LAKE SIMCOE</span></div>
     {TOWNS.map(([name,cls])=><div className={"vboard-space v-"+cls} key={name}><span className="vbar"/><div className="vhouse"><i/><b/><em/></div><strong>{name}</strong></div>)}
     <div className="board-art-labels" aria-hidden="true">{BOARD_LABELS.map(({name,cls,tagline})=><div className={"board-art-label art-label-"+cls} key={name}><strong>{name}</strong><small>{tagline}</small></div>)}</div>
     <div className="vboard-start"><small>START HERE</small><strong>TORONTO</strong><b>↑</b></div>
     <div className="vboard-deck"><small>WHAT'S</small><strong>POSSIBLE?</strong><span>NORTHSIDE GTA</span></div>
     {BOARD_SPACES.map(([name,cls],i)=><div key={name} className={"board-hotspot hotspot-"+i+(position===i?" is-current":"")} aria-hidden="true"><span>{name}</span></div>)}
     <div key={stepTick} className={"game-token premium-token token-pos-"+position+(moving?" moving":"")} aria-label={"Game piece on "+BOARD_SPACES[position][0]}><span><b>⌂</b></span></div>
     <div className="real-dice premium-dice" aria-hidden="true"><RealDie value={dice[0]} className="die-one"/><RealDie value={dice[1]} className="die-two"/><div className="dice-shadow shadow-one"/><div className="dice-shadow shadow-two"/></div>
    </div>
    {revealed&&noFreeholdMatch&&typeof document!=="undefined"&&createPortal(<div className="result-layer" role="presentation" onMouseDown={()=>setRevealed(false)}><div className="reveal reveal-3d premium-card no-match-card" onMouseDown={e=>e.stopPropagation()}>
      <button className="result-close" type="button" aria-label="Close result" disabled={formStatus.loading} onClick={()=>setRevealed(false)}>×</button>
      <small>FREEHOLD REALITY CHECK</small>
      <strong>{label}</strong>
      <em>No forced match.</em>
      <p>At this budget, we would not tell you there is a strong freehold-house fit anywhere on the NorthSide board. A one-off opportunity can appear, but it would be highly property-specific.</p>
      <div className="match-actions"><a className="match-primary" href="/contact" onClick={()=>trackEvent("pyb_reality_check_contact",{budget})}>ASK US WHAT’S ACTUALLY POSSIBLE →</a><button type="button" onClick={()=>document.getElementById("pyb-controls")?.scrollIntoView({behavior:"smooth"})}>ADJUST BUDGET</button></div>
      <small className="market-disclaimer">Freehold houses only. No condos, condo townhouses, vacant land or raw land.</small>
     </div></div>,document.body)}
    {revealed&&landedSpace&&typeof document!=="undefined"&&createPortal(<div className="result-layer" role="presentation" onMouseDown={()=>!formStatus.loading&&setRevealed(false)}><div ref={resultRef} className="reveal reveal-3d premium-card" role="dialog" aria-modal="true" aria-labelledby="pyb-result-title" tabIndex={-1} onMouseDown={e=>e.stopPropagation()}>
      <button className="result-close" type="button" aria-label="Close result" disabled={formStatus.loading} onClick={()=>setRevealed(false)}>×</button>
      <small>YOUR NORTHSIDE MATCH</small>
      <strong id="pyb-result-title">{landedSpace[0]}</strong>
      <em>{label} · {wants.length?wants.join(" · "):"Your selected priorities"}</em>
      {homeRequest==="match"?<><div className="match-summary"><span>WHY IT FITS</span><b>{bestMatch?.reasons.length?bestMatch.reasons.join(" + "):"Freehold budget fit"}</b></div>
      <div className="property-fit">
       <span className="property-fit-title">WHAT YOUR BUDGET CAN TARGET</span>
       <div className="property-fit-grid">{matchOptions.map(option=><div className={"property-fit-row level-"+option.level} key={option.key}><span>{option.label}</span><b>{option.status}</b></div>)}</div>
      </div>
      <ul className="match-proof">{bestMatch?.proof.slice(0,3).map(item=><li key={item}>{item}</li>)}</ul>
      <p>This is where we’d start a freehold-house search based on your budget and priorities. It is a market guide, not a promise of live inventory.</p>
      <div className="match-actions match-actions-three"><button type="button" className="match-primary" onClick={()=>{trackEvent("pyb_show_homes",{community:landedSpace[0],budget});setFormStatus({loading:false,error:""});setHomeRequest("form")}}>SHOW ME HOMES AROUND {label} →</button><a className="match-secondary" href={"/communities/"+COMMUNITY_SLUGS[landedSpace[0]]} onClick={()=>trackEvent("pyb_explore_community",{community:landedSpace[0],budget})}>EXPLORE {landedSpace[0]}</a><button type="button" className="match-adjust" onClick={()=>{setRevealed(false);document.getElementById("pyb-controls")?.scrollIntoView({behavior:"smooth"})}}>ADJUST MY MATCH</button></div>
      </>:homeRequest==="sent"?<div className="home-request-success" role="status" tabIndex={-1}>
       <h3>Your request is in.</h3>
       <p>Matthew or Landon will follow up with homes to consider in {landedSpace[0]} around {label}.</p>
       <div className="match-actions"><button type="button" className="match-primary" onClick={()=>setRevealed(false)}>DONE</button></div>
      </div>:<form className="home-request-form" onSubmit={requestHomes}>
       <h3>Let’s find your next home.</h3>
       <p>Confirm your details and we’ll look for homes that fit your budget and priorities.</p>
       <label>First name<input required autoComplete="given-name" value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})}/></label>
       <label>Email<input required type="email" autoComplete="email" value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})}/></label>
       <label>Phone <small>optional</small><input type="tel" autoComplete="tel" value={lead.phone} onChange={e=>setLead({...lead,phone:e.target.value})}/></label>
       <label className="home-request-consent"><input required type="checkbox" checked={lead.consent} onChange={e=>setLead({...lead,consent:e.target.checked})}/><span>I agree that Finally Home Agents may contact me about this home search.</span></label>
       <label className="hp-field" aria-hidden="true">Company<input tabIndex="-1" autoComplete="off" value={lead.botField} onChange={e=>setLead({...lead,botField:e.target.value})}/></label>
       {formStatus.error&&<p className="home-request-error" role="alert">{formStatus.error}</p>}
       <div className="match-actions"><button type="submit" className="match-primary" disabled={formStatus.loading}>{formStatus.loading?"SENDING…":"SEND ME MATCHING HOMES →"}</button><button type="button" disabled={formStatus.loading} onClick={()=>setHomeRequest("match")}>BACK TO MY MATCH</button></div>
      </form>}
      <small className="market-disclaimer">Freehold houses only · No condos or vacant land · Market-calibrated Sep 2026</small>
     </div></div>,document.body)}
   </div>
  </section>
  <section className="human"><span className="step">03</span><div><p className="eyebrow">THEN WE TAKE OVER</p><h2>Your match is the starting point.</h2><p>Matthew or Landon can turn your budget, priorities and community match into a real freehold-home search.</p></div></section>
  {gate&&<div className="modal-bg" onMouseDown={()=>!formStatus.loading&&setGate(false)}><div ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="pyb-modal-title" onMouseDown={e=>e.stopPropagation()}><button className="close" aria-label="Close" disabled={formStatus.loading} onClick={()=>setGate(false)}>×</button><p className="eyebrow">ONE MOVE LEFT</p><h2 id="pyb-modal-title">See your NorthSide match.</h2><p>We’ll use your budget and priorities to show where we’d start — and what freehold house types your budget can realistically target.</p><form onSubmit={roll}>
<label>First name<input required autoFocus autoComplete="given-name" value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})}/></label>
<label>Email<input required type="email" autoComplete="email" value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})}/></label>
<label>Phone <small>optional</small><input type="tel" autoComplete="tel" value={lead.phone} onChange={e=>setLead({...lead,phone:e.target.value})}/></label>
<label className="modal-consent"><input required type="checkbox" checked={lead.consent} onChange={e=>setLead({...lead,consent:e.target.checked})}/><span>I agree that Finally Home Agents may contact me about this home search.</span></label>
<label className="hp-field" aria-hidden="true">Company<input tabIndex="-1" autoComplete="off" value={lead.botField} onChange={e=>setLead({...lead,botField:e.target.value})}/></label>
<button disabled={formStatus.loading}>{formStatus.loading?"MATCHING…":"SHOW ME MY MATCH →"}</button>
{formStatus.error&&<p className="modal-error" role="alert">{formStatus.error}</p>}
</form><small className="privacy">No spam. Matthew or Landon will follow up personally if there are homes worth showing you.</small></div></div>}
 </main>
}