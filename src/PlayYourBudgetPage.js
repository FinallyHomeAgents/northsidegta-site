import React,{useEffect,useMemo,useRef,useState}from"react";
import{Helmet}from"react-helmet-async";
import"./PlayYourBudgetPage.css";


const TOWNS=[
["Georgina","georgina","Lake living · space · waterfront possibilities"],
["East Gwillimbury","east","Newer homes · space · family living"],
["Newmarket","newmarket","Connected · established · amenities"],
["Aurora","aurora","Established · premium · connected"],
["Stouffville","stouffville","Community · newer neighbourhoods · access"],
["Uxbridge","uxbridge","Country living · acreage · privacy"],
["Scugog","scugog","Small-town life · lake · larger properties"]];
const WANTS=["More space","Acreage","Pool","Waterfront","Newer home","Privacy","Better commute","Room for family"];
const money=v=>v>=4000000?"$4M+":v>=1000000?`$${(v/1000000).toFixed(v%1000000?2:0)}M`:`$${v/1000}K`;

function Dice({rolling}){return <div className={"pyb-dice "+(rolling?"rolling":"")} aria-hidden="true"><div className="die">⚄</div><div className="die">⚂</div></div>}

const FOCUSABLE='button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
export default function PlayYourBudgetPage(){
 const modalRef=useRef(null),rollTriggerRef=useRef(null),previousFocusRef=useRef(null);
 const[budget,setBudget]=useState(1500000),[wants,setWants]=useState(["More space","Privacy"]),[gate,setGate]=useState(false),[rolling,setRolling]=useState(false),[revealed,setRevealed]=useState(false),[lead,setLead]=useState({name:"",email:"",phone:""});
 const label=useMemo(()=>money(budget),[budget]);
 useEffect(()=>{if(!gate)return undefined;previousFocusRef.current=document.activeElement;const old=document.body.style.overflow;document.body.style.overflow="hidden";const key=e=>{if(e.key==="Escape"){setGate(false);return}if(e.key!=="Tab")return;const els=Array.from(modalRef.current?.querySelectorAll(FOCUSABLE)||[]).filter(el=>!el.disabled&&el.getAttribute("aria-hidden")!=="true");if(!els.length){e.preventDefault();return}const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};window.addEventListener("keydown",key);return()=>{document.body.style.overflow=old;window.removeEventListener("keydown",key);previousFocusRef.current?.focus?.()}},[gate]);
 const toggle=w=>setWants(a=>a.includes(w)?a.filter(x=>x!==w):a.length<4?[...a,w]:a);
 const roll=e=>{e.preventDefault();if(!lead.name||!lead.email)return;setGate(false);setRevealed(false);setRolling(true);setTimeout(()=>{setRolling(false);setRevealed(true);document.querySelector("#pyb-board")?.scrollIntoView({behavior:"smooth",block:"center"})},1600)};
 return <main className="pyb">
  <Helmet><title>Play Your Budget | NorthSide GTA</title><meta name="description" content="Set your budget, choose what matters, and roll to see where we'd start your NorthSide GTA home search."/><link rel="canonical" href="https://northsidegta.ca/play-your-budget"/></Helmet>
  <section className="pyb-hero">
   <img className="pyb-logo" src="/Images/northsidegta-logo.svg" alt="NorthSide GTA"/>
   <p className="eyebrow">YOUR BUDGET · YOUR WISH LIST · YOUR NEXT MOVE</p>
   <h1>What could your next home look like <em>up here?</em></h1>
   <p className="intro">Set the number. Tell us what matters. Then roll the dice and we'll show you where we'd start the search.</p>
   <div className="budget"><div><span>YOUR BUDGET</span><strong>{label}</strong></div><input aria-label="Home budget" type="range" min="500000" max="4000000" step="50000" value={budget} onChange={e=>setBudget(+e.target.value)}/><small><b>$500K</b><b>$4M+</b></small></div>
   <div className="wants"><span className="step">01</span><div><h2>What should your next home give you?</h2><p>Pick up to four.</p></div><div className="chips">{WANTS.map(w=><button key={w} className={wants.includes(w)?"active":""} onClick={()=>toggle(w)}>{w}</button>)}</div></div>
  </section>
  <section className="table table-3d"><div id="pyb-board" className={"board3d-shell "+(revealed?"revealed":"")}><div className="board3d-copy"><span>THE NORTHSIDE BOARD</span><strong>{label}</strong><small>{wants.length?wants.join(" · "):"Set your priorities above"}</small></div><div className={"pyb-visual-board "+(rolling?"is-rolling ":"")+(revealed?"is-revealed":"")} aria-label="Interactive NorthSide property board">
<div className="vboard-lake"><span>LAKE SIMCOE</span></div>
<div className="vboard-path"/>
{TOWNS.map(([name,cls],i)=><div className={"vboard-space v-"+cls} key={name} style={{"--i":i}}><span className="vbar"/><div className="vhouse"><i/><b/><em/></div><strong>{name}</strong></div>)}
<div className="vboard-start"><small>START HERE</small><strong>TORONTO</strong><b>↑</b></div>
<div className="vboard-deck"><small>WHAT'S</small><strong>POSSIBLE?</strong><span>NORTHSIDE GTA</span></div>
<div className="real-dice" aria-hidden="true"><div className="real-die die-one"><i/><i/><i/><i/><i/></div><div className="real-die die-two"><i/><i/><i/></div></div>
</div>{revealed&&<div className="reveal reveal-3d"><small>YOUR SEARCH STARTS HERE</small><strong>Now let us find the actual homes.</strong><p>We'll personally search what's for sale right now around your {label} budget and priorities.</p></div>}</div></section>
  <section className="roll-panel"><span className="step">02</span><div><p className="eyebrow">READY TO MAKE YOUR MOVE?</p><h2>Roll to reveal your NorthSide.</h2><p>The roll is the fun part. Your budget and wish list guide where we'd start looking.</p></div><button ref={rollTriggerRef} className="roll-btn" onClick={()=>setGate(true)}>ROLL THE DICE <span>↗</span></button></section>
  <section className="human"><span className="step">03</span><div><p className="eyebrow">THEN WE TAKE OVER</p><h2>Not an automated list. A real search.</h2><p>We'll use what you told us to personally find the NorthSide homes we'd actually want you to see.</p></div></section>
  {gate&&<div className="modal-bg" onMouseDown={()=>setGate(false)}><div ref={modalRef} className="modal" role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={()=>setGate(false)}>×</button><p className="eyebrow">ONE MOVE LEFT</p><h2>Unlock your roll.</h2><p>Tell us where to send the homes we uncover for you.</p><form onSubmit={roll}><label>First name<input required autoFocus value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})}/></label><label>Email<input required type="email" value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})}/></label><label>Phone <small>optional</small><input type="tel" value={lead.phone} onChange={e=>setLead({...lead,phone:e.target.value})}/></label><button>UNLOCK MY ROLL →</button></form><small className="privacy">This starts a real home-search conversation with Finally Home Agents.</small></div></div>}
 </main>
}