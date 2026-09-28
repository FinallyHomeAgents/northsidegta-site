import React,{useEffect,useMemo,useRef,useState}from"react";
import{Helmet}from"react-helmet-async";
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
 Georgina:{range:[650000,1650000],weights:{"More space":4,Acreage:2,Pool:2,Waterfront:6,"Newer home":1,Privacy:3,"Better commute":1,"Room for family":4},proof:["Lake access and waterfront options","More house and lot for the budget","Strong family-space potential"]},
 Scugog:{range:[650000,1550000],weights:{"More space":5,Acreage:6,Pool:2,Waterfront:4,"Newer home":1,Privacy:6,"Better commute":0,"Room for family":4},proof:["Larger lots are more attainable","Privacy and acreage are core strengths","Small-town living with lake access"]},
 Uxbridge:{range:[850000,2000000],weights:{"More space":5,Acreage:7,Pool:3,Waterfront:1,"Newer home":1,Privacy:7,"Better commute":1,"Room for family":4},proof:["Excellent acreage and privacy fit","Strong detached-home options","Country setting while staying connected"]},
 "East Gwillimbury":{range:[900000,1900000],weights:{"More space":6,Acreage:3,Pool:3,Waterfront:0,"Newer home":7,Privacy:3,"Better commute":4,"Room for family":6},proof:["Newer-home inventory is a major strength","Good balance of space and connectivity","Strong fit for growing families"]},
 Newmarket:{range:[900000,1850000],weights:{"More space":3,Acreage:0,Pool:2,Waterfront:0,"Newer home":2,Privacy:1,"Better commute":7,"Room for family":5},proof:["Established neighbourhoods and amenities","Strong commuter connectivity","Broad detached-home selection"]},
 Aurora:{range:[1100000,2700000],weights:{"More space":3,Acreage:1,Pool:4,Waterfront:0,"Newer home":2,Privacy:3,"Better commute":7,"Room for family":5},proof:["Premium detached-home options","Excellent access and amenities","Strong fit at higher budgets"]},
 Stouffville:{range:[900000,1900000],weights:{"More space":4,Acreage:2,Pool:3,Waterfront:0,"Newer home":6,Privacy:2,"Better commute":5,"Room for family":6},proof:["Newer neighbourhoods and family homes","Good Toronto access","More space without going fully rural"]}
};
const budgetScore=(budget,[min,max])=>{
 if(budget>=min&&budget<=max)return 28;
 const gap=budget<min?min-budget:budget-max;
 const span=max-min;
 return Math.max(0,28-(gap/Math.max(span,.01))*32);
};
const rankCommunities=(budget,wants)=>TOWNS.map(([name,cls,tagline],order)=>{
 const profile=MATCH_PROFILES[name];
 const priorityScore=wants.reduce((sum,w)=>sum+(profile.weights[w]||0)*4,0);
 const score=budgetScore(budget,profile.range)+priorityScore-order*.001;
 const reasons=[...wants].sort((a,b)=>(profile.weights[b]||0)-(profile.weights[a]||0)).filter(w=>(profile.weights[w]||0)>=3).slice(0,2);
 return {name,cls,tagline,score,reasons,proof:profile.proof};
}).sort((a,b)=>b.score-a.score);
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
 const modalRef=useRef(null),rollTriggerRef=useRef(null),previousFocusRef=useRef(null);
 const[budget,setBudget]=useState(1500000),[wants,setWants]=useState(["More space","Privacy"]),[gate,setGate]=useState(false),[rolling,setRolling]=useState(false),[revealed,setRevealed]=useState(false),[lead,setLead]=useState({name:"",email:"",phone:""}),[dice,setDice]=useState([5,3]),[position,setPosition]=useState(0),[moving,setMoving]=useState(false),[landed,setLanded]=useState(null),[stepTick,setStepTick]=useState(0),[artReady,setArtReady]=useState(false);
 const label=useMemo(()=>money(budget),[budget]);
 const landedSpace=useMemo(()=>BOARD_SPACES.find(([name])=>name===landed),[landed]);
 const rankedMatches=useMemo(()=>rankCommunities(budget,wants),[budget,wants]);
 const bestMatch=rankedMatches[0];
 useEffect(()=>{if(!gate)return undefined;previousFocusRef.current=document.activeElement;const old=document.body.style.overflow;document.body.style.overflow="hidden";const key=e=>{if(e.key==="Escape"){setGate(false);return}if(e.key!=="Tab")return;const els=Array.from(modalRef.current?.querySelectorAll(FOCUSABLE)||[]).filter(el=>!el.disabled&&el.getAttribute("aria-hidden")!=="true");if(!els.length){e.preventDefault();return}const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};window.addEventListener("keydown",key);return()=>{document.body.style.overflow=old;window.removeEventListener("keydown",key);previousFocusRef.current?.focus?.()}},[gate]);
 const toggle=w=>setWants(a=>a.includes(w)?a.filter(x=>x!==w):a.length<4?[...a,w]:a);
 const runRoll=()=>{if(rolling||moving||!bestMatch)return;setLanded(null);setRevealed(false);const target=BOARD_SPACES.findIndex(([name])=>name===bestMatch.name);const distance=(target-position+BOARD_SPACES.length)%BOARD_SPACES.length;const total=rollTotalForDistance(distance);const[a,b]=diceForTotal(total);setDice([a,b]);setRolling(true);setTimeout(()=>{setRolling(false);setMoving(true);let step=0;const timer=setInterval(()=>{step+=1;setPosition(prev=>{const next=(prev+1)%BOARD_SPACES.length;if(step>=total){clearInterval(timer);setMoving(false);setRevealed(true);setLanded(BOARD_SPACES[next][0]);setStepTick(t=>t+1)}return next})},310)},1450)};
 const roll=e=>{e.preventDefault();if(!lead.name||!lead.email)return;setGate(false);setTimeout(runRoll,260)};
 return <main className="pyb">
  <Helmet><title>Play Your Budget | NorthSide GTA</title><meta name="description" content="Set your budget, choose what matters, and roll to see where we'd start your NorthSide GTA home search."/><link rel="canonical" href="https://northsidegta.ca/play-your-budget"/></Helmet>
  <section id="pyb-controls" className="pyb-hero">
   <img className="pyb-logo" src="/Images/northsidegta-logo.svg" alt="NorthSide GTA"/>
   <p className="eyebrow">YOUR BUDGET · YOUR WISH LIST · YOUR NEXT MOVE</p>
   <h1>What could your next home look like <em>up here?</em></h1>
   <p className="intro">Set the number. Tell us what matters. We’ll find your strongest NorthSide fit — then the dice reveal it.</p>
   <div className="budget"><div><span>YOUR BUDGET</span><strong>{label}</strong></div><input aria-label="Home budget" type="range" min="500000" max="4000000" step="50000" value={budget} onChange={e=>setBudget(+e.target.value)}/><small><b>$500K</b><b>$4M+</b></small></div>
   <div className="wants"><span className="step">01</span><div><h2>What should your next home give you?</h2><p>Pick up to four.</p></div><div className="chips">{WANTS.map(w=><button key={w} className={wants.includes(w)?"active":""} onClick={()=>toggle(w)}>{w}</button>)}</div></div>
  </section>
  <section className="table table-3d">
   <div id="pyb-board" className={"pyb-board-stage premium-game "+(rolling?"is-rolling ":"")+(moving?"is-moving ":"")+(revealed?"is-revealed ":"")+(artReady?"has-board-art":"")}>
    <div className="board3d-copy"><span>THE NORTHSIDE BOARD</span><strong>{label}</strong><small>{wants.length?wants.join(" · "):"Set your priorities above"}</small></div>
    <div className="pyb-game-status" aria-live="polite"><span>{rolling?"MATCH LOCKED · ROLLING…":moving?"REVEALING YOUR MATCH":landed?"YOUR MATCH · "+landed:"MATCH READY"}</span><strong>{rolling||moving||landed?dice[0]+" + "+dice[1]+" = "+(dice[0]+dice[1]):bestMatch?.name}</strong></div>
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
    {revealed&&landedSpace&&<div className="reveal reveal-3d premium-card">
      <small>YOUR NORTHSIDE MATCH</small>
      <strong>{landedSpace[0]}</strong>
      <em>{label} · {wants.length?wants.join(" · "):"Your selected priorities"}</em>
      <div className="match-summary"><span>WHY IT FITS</span><b>{bestMatch?.reasons.length?bestMatch.reasons.join(" + "):"Budget fit"}</b></div>
      <ul className="match-proof">{bestMatch?.proof.slice(0,3).map(item=><li key={item}>{item}</li>)}</ul>
      <p>This is where we’d start the search based on what you told us — not a random town.</p>
      <div className="match-actions"><a className="match-primary" href={"/communities/"+COMMUNITY_SLUGS[landedSpace[0]]}>EXPLORE {landedSpace[0].toUpperCase()} →</a><button type="button" onClick={()=>document.getElementById("pyb-controls")?.scrollIntoView({behavior:"smooth"})}>ADJUST MY MATCH</button></div>
     </div>}
   </div>
  </section>
  <section className="roll-panel"><span className="step">02</span><div><p className="eyebrow">READY TO MAKE YOUR MOVE?</p><h2>Roll to reveal your NorthSide.</h2><p>Your budget and priorities determine the match. The roll is how we reveal it.</p></div><button ref={rollTriggerRef} className="roll-btn" onClick={()=>lead.email?runRoll():setGate(true)} disabled={rolling||moving}>{landed?"REVEAL MY UPDATED MATCH":"REVEAL MY MATCH"} <span>↗</span></button></section>
  <section className="human"><span className="step">03</span><div><p className="eyebrow">THEN WE TAKE OVER</p><h2>Not an automated list. A real search.</h2><p>We'll use what you told us to personally find the NorthSide homes we'd actually want you to see.</p></div></section>
  {gate&&<div className="modal-bg" onMouseDown={()=>setGate(false)}><div ref={modalRef} className="modal" role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={()=>setGate(false)}>×</button><p className="eyebrow">ONE MOVE LEFT</p><h2>Unlock your roll.</h2><p>Tell us where to send the homes we uncover for you.</p><form onSubmit={roll}><label>First name<input required autoFocus value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})}/></label><label>Email<input required type="email" value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})}/></label><label>Phone <small>optional</small><input type="tel" value={lead.phone} onChange={e=>setLead({...lead,phone:e.target.value})}/></label><button>UNLOCK MY ROLL →</button></form><small className="privacy">This starts a real home-search conversation with Finally Home Agents.</small></div></div>}
 </main>
}