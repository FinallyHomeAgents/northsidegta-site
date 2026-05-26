import React, { useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";

const PAGE_STYLE = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --green:#1e4d0f;--green2:#2d6b18;--green3:#4a8f2a;
  --gpale:#eef5e8;--gsoft:#d4e8c2;--gborder:rgba(30,77,15,0.18);
  --gold:#c8831a;--goldm:#e8b84a;
  --ink:#181816;--ink2:#3d3d38;--ink3:#6e6e66;--ink4:#9e9e94;
  --cream:#f8f6f1;--paper:#fff;
  --border:rgba(0,0,0,0.09);--border2:rgba(0,0,0,0.15);
  --sh:0 1px 4px rgba(0,0,0,0.07),0 4px 16px rgba(0,0,0,0.06);
  --shm:0 4px 20px rgba(0,0,0,0.10);--shl:0 12px 40px rgba(0,0,0,0.13);
  --r:8px;--rl:14px;--rxl:20px;
  --fd:'Playfair Display',Georgia,serif;--fb:'Inter',system-ui,sans-serif;--t:0.18s;
}
html{scroll-behavior:smooth;}
body{font-family:var(--fb);background:var(--cream);color:var(--ink);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased;}
a{color:var(--green);text-decoration:none;}
a:hover{text-decoration:underline;}
img{max-width:100%;display:block;}

/* NAV */
.topnav{background:var(--green);padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:52px;position:sticky;top:0;z-index:300;box-shadow:0 2px 8px rgba(0,0,0,0.2);}
.topnav-logo{font-family:var(--fd);font-size:17px;font-weight:700;color:#fff;letter-spacing:-0.01em;}
.topnav-logo span{color:var(--goldm);}
.topnav-right{display:flex;align-items:center;gap:16px;}
.topnav-link{font-size:12px;color:rgba(255,255,255,0.72);transition:color var(--t);}
.topnav-link:hover{color:#fff;text-decoration:none;}
.topnav-cta{font-size:12px;font-weight:600;background:rgba(255,255,255,0.12);color:#fff;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.2);transition:all var(--t);}
.topnav-cta:hover{background:rgba(255,255,255,0.2);text-decoration:none;}

/* HERO */
.hero{position:relative;height:480px;overflow:hidden;background:var(--green);}
.hero-img{width:100%;height:100%;object-fit:cover;object-position:center 35%;display:block;}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(8,18,4,0.82) 0%,rgba(8,18,4,0.55) 55%,rgba(8,18,4,0.25) 100%);}
.hero-content{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;padding:40px 48px;}
.hero-eyebrow{font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.hero h1{font-family:var(--fd);font-size:clamp(32px,5vw,56px);font-weight:700;color:#fff;line-height:1.08;margin-bottom:16px;letter-spacing:-0.025em;max-width:640px;}
.hero-sub{font-size:15px;color:rgba(255,255,255,0.72);max-width:540px;line-height:1.75;margin-bottom:28px;}
.hero-btns{display:flex;gap:10px;flex-wrap:wrap;}
.btn-primary{display:inline-block;background:#fff;color:var(--green);font-family:var(--fb);font-size:13px;font-weight:600;padding:11px 22px;border-radius:30px;border:none;cursor:pointer;transition:all var(--t);text-decoration:none;}
.btn-primary:hover{background:var(--gsoft);text-decoration:none;color:var(--green2);}
.btn-secondary{display:inline-block;background:transparent;color:#fff;font-family:var(--fb);font-size:13px;font-weight:500;padding:10px 20px;border-radius:30px;border:1.5px solid rgba(255,255,255,0.4);cursor:pointer;transition:all var(--t);text-decoration:none;}
.btn-secondary:hover{background:rgba(255,255,255,0.1);text-decoration:none;color:#fff;}
.btn-green{display:inline-block;background:var(--green);color:#fff;font-family:var(--fb);font-size:13px;font-weight:600;padding:11px 22px;border-radius:30px;border:none;cursor:pointer;transition:all var(--t);text-decoration:none;}
.btn-green:hover{background:var(--green2);text-decoration:none;color:#fff;}
.btn-outline{display:inline-block;background:transparent;color:var(--green);font-family:var(--fb);font-size:13px;font-weight:500;padding:10px 20px;border-radius:30px;border:1.5px solid var(--gborder);cursor:pointer;transition:all var(--t);text-decoration:none;}
.btn-outline:hover{background:var(--gpale);text-decoration:none;}

/* LAYOUT */
.container{max-width:1120px;margin:0 auto;padding:0 24px;}

/* INTRO SECTION */
.intro-section{padding:40px 0 32px;}
.intro-card{background:var(--paper);border-radius:var(--rxl);border:1px solid var(--gborder);padding:36px 40px;max-width:820px;box-shadow:var(--sh);border-left:4px solid var(--green);}
.intro-eyebrow{font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:var(--green3);margin-bottom:10px;}
.intro-h{font-family:var(--fd);font-size:clamp(22px,3vw,32px);font-weight:700;color:var(--ink);margin-bottom:14px;letter-spacing:-0.02em;line-height:1.2;}
.intro-body{font-size:14px;color:var(--ink2);line-height:1.8;margin-bottom:18px;}
.intro-body p+p{margin-top:10px;}

/* CONTROLS */
.controls{background:var(--paper);border-bottom:1px solid var(--border);padding:11px 24px;position:sticky;top:52px;z-index:200;box-shadow:var(--sh);}
.ctrl-inner{max-width:1120px;margin:0 auto;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;}
.filter-group{display:flex;flex-wrap:wrap;gap:5px;}
.fbtn{padding:5px 13px;border-radius:20px;border:1.5px solid var(--border2);background:transparent;color:var(--ink3);font-family:var(--fb);font-size:12px;cursor:pointer;transition:all var(--t);white-space:nowrap;}
.fbtn:hover{background:var(--gpale);border-color:var(--green);color:var(--green);}
.fbtn.on{background:var(--green);border-color:var(--green);color:#fff;}
.ctrl-right{display:flex;gap:8px;align-items:center;}
.view-tog{display:flex;border:1px solid var(--border2);border-radius:8px;overflow:hidden;}
.vtb{padding:5px 13px;font-family:var(--fb);font-size:12px;border:none;background:transparent;color:var(--ink3);cursor:pointer;transition:all var(--t);}
.vtb.on{background:var(--green);color:#fff;}
.ctrl-select{font-family:var(--fb);font-size:12px;border:1px solid var(--border2);border-radius:8px;padding:5px 10px;background:var(--paper);color:var(--ink);cursor:pointer;outline:none;}

/* TOWN CARDS */
.cards-section{padding:28px 0 20px;}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;}
.tc{background:var(--paper);border-radius:var(--rxl);border:1.5px solid var(--border);overflow:hidden;transition:all var(--t);position:relative;box-shadow:var(--sh);}
.tc:hover{border-color:rgba(30,77,15,0.3);box-shadow:var(--shm);transform:translateY(-2px);}
.tc.sel{border:2px solid var(--green);box-shadow:0 0 0 3px rgba(30,77,15,0.1);}

/* Card image area */
.tc-img-wrap{position:relative;height:180px;overflow:hidden;background:var(--green);}
.tc-img{width:100%;height:100%;object-fit:cover;object-position:center;display:block;transition:transform 0.4s ease;}
.tc:hover .tc-img{transform:scale(1.03);}
.tc-img-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,18,4,0.6) 0%,rgba(8,18,4,0.1) 60%,transparent 100%);}
.tc-badge-wrap{position:absolute;bottom:12px;left:12px;display:flex;align-items:center;gap:8px;}
.tc-badge{width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.7);flex-shrink:0;}
.tc-badge-name{font-family:var(--fd);font-size:16px;font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.5);}
.tc-region{position:absolute;top:10px;left:10px;font-size:10px;font-weight:500;letter-spacing:0.06em;padding:3px 9px;border-radius:10px;text-transform:uppercase;}
.region-york{background:rgba(20,60,130,0.85);color:#fff;}
.region-durham{background:rgba(110,45,8,0.88);color:#fff;}
.selbadge{position:absolute;top:10px;right:10px;background:var(--green);color:#fff;font-size:10px;font-weight:500;padding:3px 9px;border-radius:10px;}

/* Card body */
.tc-body{padding:16px 18px;}
.tc-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
.tc-positioning{font-size:13px;color:var(--ink2);line-height:1.55;margin-bottom:10px;}
.tc-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:12px;}
.tc-stat{background:var(--cream);border-radius:var(--r);padding:7px 8px;text-align:center;}
.tc-stat-val{font-size:13px;font-weight:600;color:var(--ink);}
.tc-stat-lbl{font-size:10px;color:var(--ink4);margin-top:1px;}
.tc-pills{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;}
.pill{font-size:11px;padding:3px 9px;border-radius:8px;font-weight:500;}
.p-go{background:#dbeafe;color:#1e3a8a;}
.p-lake{background:#d1fae5;color:#064e3b;}
.p-trail{background:#dcfce7;color:#14532d;}
.p-school{background:#ede9fe;color:#4c1d95;}
.p-new{background:#fef3c7;color:#78350f;}
.p-val{background:#f0fdf4;color:#14532d;}
.p-her{background:#fef3c7;color:#78350f;}
.p-arts{background:#fce7f3;color:#701a4a;}
.p-buyer{background:#f0fdf4;color:#14532d;border:1px solid #bbf7d0;}
.p-bal{background:#fffbeb;color:#78350f;border:1px solid #fde68a;}
.tc-actions{display:flex;gap:8px;align-items:center;}
.tc-view-link{font-size:12px;font-weight:600;color:var(--green);display:flex;align-items:center;gap:4px;transition:color var(--t);}
.tc-view-link:hover{color:var(--green2);text-decoration:none;}
.tc-view-link i{font-size:11px;}

/* Expanded card */
.tc-expanded{border-top:1px solid var(--border);padding:14px 18px;}
.xdata-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px;}
.xrow{display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--border);}
.xrow:last-child{border-bottom:none;}
.xk{color:var(--ink3);}.xv{font-weight:500;color:var(--ink);}
.xalert{margin-top:8px;padding:9px 11px;border-radius:8px;font-size:12px;line-height:1.55;}
.xalert-warn{background:#fffbeb;color:#78350f;border-left:3px solid #f59e0b;}
.xalert-inv{background:var(--gpale);color:#14532d;border-left:3px solid var(--green3);}
.tc-expand-btn{width:100%;text-align:center;padding:8px;font-size:12px;color:var(--green);background:none;border:none;border-top:1px solid var(--border);cursor:pointer;font-weight:500;font-family:var(--fb);}
.tc-expand-btn:hover{background:var(--gpale);}

/* Sub-communities */
.subs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;}
.sub{font-size:10px;padding:2px 8px;border-radius:6px;background:var(--cream);border:1px solid var(--border2);color:var(--ink3);}

/* Mobile tab system */
.tc-tabs{display:flex;border-bottom:1px solid var(--border);overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.tc-tabs::-webkit-scrollbar{display:none;}
.tc-tab{flex-shrink:0;font-size:11px;padding:7px 10px;border:none;background:none;cursor:pointer;color:var(--ink3);border-bottom:2px solid transparent;transition:all var(--t);font-family:var(--fb);}
.tc-tab.on{color:var(--green);border-bottom-color:var(--green);font-weight:600;}
.tc-panel{display:none;padding:12px 18px;}
.tc-panel.on{display:block;}
.school-mini{font-size:12px;}
.school-mini-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);}
.school-mini-row:last-child{border-bottom:none;}
.school-mini-name{font-weight:500;color:var(--ink);}
.school-mini-type{font-size:10px;color:var(--ink4);}
.school-mini-r{font-weight:600;color:var(--green);font-size:12px;}
.rest-mini{font-size:12px;}
.rest-mini-row{display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);}
.rest-mini-row:last-child{border-bottom:none;}
.rest-mini-name{font-weight:500;color:var(--ink);}
.rest-mini-desc{font-size:11px;color:var(--ink3);margin-top:1px;}
.dil-mini{font-size:12.5px;color:var(--ink2);line-height:1.75;border-left:3px solid var(--gborder);padding:10px 12px;}

/* Cards action row */
.cards-action{text-align:center;margin-top:20px;}
.cards-action .cab{background:var(--green);color:#fff;border:none;border-radius:30px;padding:11px 28px;font-family:var(--fb);font-size:13px;font-weight:600;cursor:pointer;transition:all var(--t);}
.cards-action .cab:hover{background:var(--green2);}
.sel-hint{text-align:center;font-size:12px;color:var(--ink4);margin-top:12px;}

/* TASTEHUB SECTION */
.th-section{background:var(--paper);border-radius:var(--rxl);border:1px solid var(--gborder);padding:36px 40px;margin:36px 0;box-shadow:var(--sh);}
.th-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:24px;flex-wrap:wrap;}
.th-lockup{font-family:var(--fd);font-size:13px;font-weight:700;color:var(--green);letter-spacing:-0.01em;}
.th-lockup span{color:var(--gold);}
.th-eyebrow{font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:var(--green3);margin-bottom:6px;}
.th-heading{font-family:var(--fd);font-size:clamp(20px,2.5vw,26px);font-weight:700;color:var(--ink);margin-bottom:8px;letter-spacing:-0.02em;}
.th-body{font-size:14px;color:var(--ink2);line-height:1.75;max-width:620px;}
.th-actions{display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;align-items:center;}
.th-towns{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:20px;}
.th-town-chip{display:flex;flex-direction:column;align-items:center;gap:7px;padding:14px 12px;background:var(--cream);border-radius:var(--rl);border:1px solid var(--border);text-align:center;transition:all var(--t);text-decoration:none;color:var(--ink2);}
.th-town-chip:hover{border-color:var(--gborder);background:var(--gpale);text-decoration:none;color:var(--green);}
.th-town-chip img{width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--gsoft);}
.th-town-chip-name{font-size:13px;font-weight:500;color:var(--ink);}
.th-town-chip-label{font-size:10px;color:var(--ink4);}
.th-town-chip-cta{font-size:11px;color:var(--green);font-weight:500;}
.th-disclaimer{font-size:11px;color:var(--ink4);margin-top:14px;line-height:1.65;border-top:1px solid var(--border);padding-top:12px;}

/* MAP */
.map-section{padding:20px 0 16px;}
.map-section-hdr{margin-bottom:16px;}
.map-section-hdr h2{font-family:var(--fd);font-size:24px;font-weight:700;color:var(--ink);}
.map-section-hdr p{font-size:13px;color:var(--ink3);margin-top:4px;}
.map-outer{background:var(--paper);border-radius:var(--rxl);border:1px solid var(--border);overflow:hidden;box-shadow:var(--sh);}
#mapsvg{width:100%;display:block;cursor:default;}
.map-legend{display:flex;flex-wrap:wrap;gap:14px;padding:10px 16px;border-top:1px solid var(--border);font-size:11px;color:var(--ink3);}
.mleg{display:flex;align-items:center;gap:5px;}
.mleg-line{width:24px;height:3px;border-radius:2px;}
#maptip{position:fixed;background:rgba(8,18,4,0.92);color:#fff;font-size:12px;padding:8px 13px;border-radius:10px;pointer-events:none;z-index:999;opacity:0;transition:opacity 0.15s;max-width:200px;line-height:1.5;backdrop-filter:blur(4px);}

/* COMPARE TABLE */
.cmp-section{padding:20px 0 40px;}
.cmp-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px;}
.cmp-title{font-family:var(--fd);font-size:24px;font-weight:700;color:var(--ink);}
.back-btn{font-family:var(--fb);font-size:13px;color:var(--green);background:var(--gpale);border:none;border-radius:8px;padding:7px 16px;cursor:pointer;transition:background var(--t);}
.back-btn:hover{background:var(--gsoft);}
.ctable{background:var(--paper);border-radius:var(--rxl);border:1px solid var(--border);overflow:hidden;box-shadow:var(--sh);}
.crow{display:grid;border-bottom:1px solid var(--border);}
.crow:last-child{border-bottom:none;}
.csec{background:var(--green);padding:7px 16px;font-size:11px;font-weight:500;color:rgba(255,255,255,0.8);letter-spacing:0.1em;text-transform:uppercase;}
.clbl{background:var(--cream);padding:9px 13px;font-size:12px;color:var(--ink2);display:flex;align-items:center;gap:7px;border-right:1px solid var(--border);}
.clbl i{font-size:12px;color:var(--green3);}
.ccell{padding:9px 9px;font-size:12px;color:var(--ink);text-align:center;vertical-align:middle;}
.ccell.best{color:var(--green);font-weight:600;}
.cch{padding:11px 9px;font-size:13px;font-weight:600;text-align:center;background:var(--cream);border-bottom:2px solid var(--green);color:var(--green);font-family:var(--fd);}
.btr{height:4px;background:var(--border);border-radius:2px;margin-top:3px;}
.bfl{height:4px;border-radius:2px;background:var(--gsoft);}
.bfl.bb{background:var(--green);}
.cins{font-size:11.5px;color:var(--ink2);text-align:left;padding:9px 11px;line-height:1.5;}
.cleg{font-size:11px;color:var(--ink3);text-align:center;padding:9px;background:var(--cream);}

/* ONE MIL SECTION */
.onemil-section{padding:20px 0 0;}
.onemil-section h2{font-family:var(--fd);font-size:26px;font-weight:700;color:var(--ink);margin-bottom:6px;}
.onemil-section .sub{font-size:14px;color:var(--ink3);margin-bottom:22px;line-height:1.65;}
.onemil-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;}
.omc{background:var(--paper);border-radius:var(--rl);border:1px solid var(--border);padding:18px;box-shadow:var(--sh);transition:all var(--t);position:relative;overflow:hidden;}
.omc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--omc-c,var(--green));}
.omc:hover{border-color:rgba(30,77,15,0.25);box-shadow:var(--shm);transform:translateY(-2px);}
.omc-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.omc-badge{width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gsoft);}
.omc-town{font-family:var(--fd);font-size:15px;font-weight:700;color:var(--ink);}
.omc-price{font-size:11px;font-weight:600;color:var(--green);margin-bottom:8px;}
.omc-desc{font-size:12px;color:var(--ink2);line-height:1.65;}
.omc-link{display:inline-block;margin-top:10px;font-size:11px;color:var(--green);font-weight:500;}
.omc-link:hover{text-decoration:underline;}

/* SMS SECTION */
.sms-section{background:var(--green);padding:36px 24px;margin:0;}
.sms-inner{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
@media(max-width:680px){.sms-inner{grid-template-columns:1fr;gap:20px;}}
.sms-copy strong{font-family:var(--fd);font-size:22px;font-weight:700;color:#fff;display:block;margin-bottom:8px;letter-spacing:-0.01em;}
.sms-copy p{font-size:14px;color:rgba(255,255,255,0.68);line-height:1.7;}
.sms-form-wrap{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:var(--rxl);padding:22px;}
.sms-form-wrap p{font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:12px;line-height:1.6;}
.sms-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;}
@media(max-width:500px){.sms-fields{grid-template-columns:1fr;}}
.sms-input{font-family:var(--fb);font-size:13px;padding:10px 13px;border:none;border-radius:8px;outline:none;color:var(--ink);width:100%;}
.sms-submit{width:100%;background:var(--goldm);color:var(--ink);border:none;border-radius:30px;padding:11px;font-family:var(--fb);font-size:13px;font-weight:600;cursor:pointer;transition:all var(--t);margin-top:2px;}
.sms-submit:hover{background:#f4c040;}
.sms-disc{font-size:10px;color:rgba(255,255,255,0.35);margin-top:10px;line-height:1.65;}

/* LEAD FORM */
.lead-section{background:linear-gradient(135deg,var(--green) 0%,#264e12 100%);padding:60px 24px;position:relative;overflow:hidden;}
.lead-section::before{content:'';position:absolute;top:-80px;right:-80px;width:320px;height:320px;border-radius:50%;background:rgba(255,255,255,0.03);}
.lead-inner{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start;position:relative;z-index:1;}
@media(max-width:780px){.lead-inner{grid-template-columns:1fr;gap:32px;}}
.lc h2{font-family:var(--fd);font-size:clamp(24px,3.5vw,38px);font-weight:700;color:#fff;line-height:1.15;margin-bottom:12px;letter-spacing:-0.02em;}
.lc p{font-size:14px;color:rgba(255,255,255,0.7);line-height:1.75;margin-bottom:14px;}
.agents{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px;}
@media(max-width:480px){.agents{grid-template-columns:1fr;}}
.asm{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:13px 14px;}
.asm-name{font-weight:600;font-size:14px;color:#fff;}
.asm-role{font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;}
.asm-brok{font-size:11px;color:var(--goldm);font-weight:500;margin-top:3px;}
.trust-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;}
.tr-it{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,0.62);}
.tr-it i{color:var(--goldm);}
.form-card{background:var(--paper);border-radius:var(--rxl);padding:28px;box-shadow:var(--shl);}
.form-card h3{font-family:var(--fd);font-size:20px;font-weight:700;color:var(--ink);margin-bottom:4px;}
.form-sub{font-size:12px;color:var(--ink3);margin-bottom:20px;}
.frow2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
@media(max-width:480px){.frow2{grid-template-columns:1fr;}}
.fg2{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;}
.fg2 label{font-size:11px;font-weight:500;color:var(--ink2);text-transform:uppercase;letter-spacing:0.06em;}
.fg2 input,.fg2 select,.fg2 textarea{font-family:var(--fb);font-size:13px;border:1.5px solid var(--border2);border-radius:8px;padding:9px 12px;color:var(--ink);background:var(--paper);outline:none;transition:border-color var(--t);}
.fg2 input:focus,.fg2 select:focus,.fg2 textarea:focus{border-color:var(--green);}
.fg2 textarea{resize:vertical;min-height:65px;}
.pchk-grp{display:flex;flex-wrap:wrap;gap:5px;}
.pchk{display:none;}
.pchk+label{font-size:11px;padding:4px 10px;border-radius:20px;border:1.5px solid var(--border2);cursor:pointer;transition:all var(--t);color:var(--ink2);}
.pchk:checked+label{background:var(--green);border-color:var(--green);color:#fff;}
.sbtn{width:100%;background:linear-gradient(135deg,var(--green),var(--green2));color:#fff;border:none;border-radius:30px;padding:13px;font-family:var(--fb);font-size:14px;font-weight:600;cursor:pointer;transition:all var(--t);margin-top:12px;display:flex;align-items:center;justify-content:center;gap:8px;}
.sbtn:hover{opacity:0.9;transform:translateY(-1px);}
.reco-note{font-size:10px;color:var(--ink4);text-align:center;margin-top:10px;line-height:1.6;}
.fsucc{text-align:center;padding:24px 0;display:none;}
.fsucc .ck{font-size:44px;display:block;margin-bottom:12px;}
.fsucc h4{font-family:var(--fd);font-size:20px;color:var(--green);margin-bottom:8px;}
.fsucc p{font-size:13px;color:var(--ink3);}

/* FAQ */
.faq-section{padding:28px 0;}
.faq-section h2{font-family:var(--fd);font-size:24px;font-weight:700;color:var(--ink);margin-bottom:16px;}
.faq-wrap{background:var(--paper);border-radius:var(--rxl);border:1px solid var(--border);overflow:hidden;box-shadow:var(--sh);}
.faq-item{border-bottom:1px solid var(--border);}
.faq-item:last-child{border-bottom:none;}
.faq-summary{font-size:14px;font-weight:500;color:var(--ink);padding:16px 20px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px;}
.faq-summary::-webkit-details-marker{display:none;}
.faq-icon{width:20px;height:20px;border-radius:50%;background:var(--gpale);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;color:var(--green);transition:transform var(--t);}
details[open] .faq-icon{transform:rotate(45deg);}
.faq-answer{font-size:13px;color:var(--ink2);line-height:1.75;padding:0 20px 16px;}

/* COMPLIANCE */
.compliance{background:#f0ede8;border-top:1px solid var(--border);padding:24px;font-size:11px;color:var(--ink4);line-height:1.8;}
.compliance strong{color:var(--ink2);}
.compliance a{color:var(--green);}
.compliance-inner{max-width:1120px;margin:0 auto;}

/* FLOATING BTNS */
.float-bar{position:fixed;bottom:22px;right:22px;z-index:300;display:flex;flex-direction:column;gap:10px;}
.fl-btn{width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:var(--shm);transition:all var(--t);position:relative;}
.fl-btn:hover{transform:scale(1.07);}
.fl-call{background:var(--green);color:#fff;}
.fl-msg{background:var(--gold);color:#fff;}
.fl-tip{position:absolute;right:58px;background:var(--ink);color:#fff;font-size:11px;padding:4px 10px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity var(--t);}
.fl-btn:hover .fl-tip{opacity:1;}

/* EMPTY STATE */
.empty{text-align:center;padding:48px;color:var(--ink4);font-size:14px;}
.sel-action{text-align:center;margin-top:16px;}

@media(max-width:768px){
  .hero{height:360px;}
  .hero-content{padding:28px 22px;}
  .container{padding:0 16px;}
  .intro-card{padding:24px 22px;}
  .tc-img-wrap{height:160px;}
}
@media(max-width:640px){
  .controls{padding:10px 16px;}
  .th-section{padding:22px 20px;}
  .lead-section{padding:40px 16px;}
  .form-card{padding:20px;}
}
`;
const PAGE_SCHEMA = `{
  "@context":"https://schema.org",
  "@graph":[
    {
      "@type":"WebPage",
      "name":"NorthSide GTA Neighbourhood Guide",
      "description":"A practical neighbourhood guide for buyers looking north of Toronto. Compare Aurora, Newmarket, Stouffville, East Gwillimbury, Georgina, Uxbridge, and Scugog.",
      "url":"https://northsidegta.ca/neighbourhood-guide",
      "dateModified":"2026-05-24",
      "publisher":{
        "@type":"RealEstateAgent",
        "name":"Finally Home Agents Team",
        "url":"https://northsidegta.ca",
        "employee":[
          {"@type":"Person","name":"Matthew Mulhall","jobTitle":"Sales Representative","worksFor":{"@type":"Organization","name":"HomeLife Optimum Realty"}},
          {"@type":"Person","name":"Landon Mulhall","jobTitle":"Sales Representative","worksFor":{"@type":"Organization","name":"HomeLife Optimum Realty"}}
        ]
      }
    },
    {
      "@type":"FAQPage",
      "mainEntity":[
        {"@type":"Question","name":"What is the average home price in Aurora Ontario 2026?","acceptedAnswer":{"@type":"Answer","text":"The average sold price in Aurora is approximately $1,122,000 across all home types (TRREB MLS Q1 2026). Detached homes average around $1,561,000. It is currently a buyer's market with approximately 4.2 months of inventory."}},
        {"@type":"Question","name":"Which towns north of Toronto have GO Train access?","acceptedAnswer":{"@type":"Answer","text":"Aurora and Newmarket are served by the GO Barrie line with service to Union Station. Stouffville is served by the GO Stouffville line. East Gwillimbury, Georgina, Uxbridge, and Scugog are car-dependent for Toronto commuting."}},
        {"@type":"Question","name":"What is Georgina Ontario known for?","acceptedAnswer":{"@type":"Answer","text":"Georgina is known for Lake Simcoe waterfront living across communities including Keswick, Sutton, and Jackson's Point. It is one of York Region's most affordable municipalities and is popular with remote workers and buyers seeking waterfront access."}},
        {"@type":"Question","name":"What is the most affordable town north of Toronto?","acceptedAnswer":{"@type":"Answer","text":"Georgina has the lowest average sold price among the NorthSide GTA communities at approximately $875,000 (TRREB 2025–2026). Scugog ($960,000) and Uxbridge ($990,000) are also below the $1M average mark."}},
        {"@type":"Question","name":"What is Uxbridge Ontario known for?","acceptedAnswer":{"@type":"Answer","text":"Uxbridge is officially Canada's Trail Capital, with over 300 kilometres of trails on the Oak Ridges Moraine. It is also known for its equestrian community, heritage downtown, Dagmar Ski Resort, and active arts and theatre scene."}}
      ]
    }
  ]
}`;
const PAGE_BODY_HTML = `

<div id="maptip" role="tooltip" aria-live="polite"></div>

<!-- FLOATING BTNS -->
<div class="float-bar" aria-label="Quick contact">
  <div style="position:relative;">
    <button class="fl-btn fl-call" onclick="scrollToLead()" aria-label="Talk to a local real estate agent">
      <i class="fas fa-phone" aria-hidden="true"></i>
      <span class="fl-tip">Talk to an agent</span>
    </button>
  </div>
  <div style="position:relative;">
    <button class="fl-btn fl-msg" onclick="scrollToLead()" aria-label="Send an enquiry">
      <i class="fas fa-comment-dots" aria-hidden="true"></i>
      <span class="fl-tip">Send an enquiry</span>
    </button>
  </div>
</div>

<!-- NAV -->
<nav class="topnav" role="navigation" aria-label="Site navigation">
  <a href="https://northsidegta.ca" class="topnav-logo">NorthSide <span>GTA</span></a>
  <div class="topnav-right">
    <a href="/tastehub" class="topnav-link">TasteHub</a>
    <a href="https://northsidegta.ca/listings" class="topnav-link">Listings</a>
    <a href="#lead-form" class="topnav-cta" onclick="scrollToLead();return false;">Get local guidance</a>
  </div>
</nav>

<!-- HERO -->
<header class="hero" role="banner">
  <img src="/uploads/northside-gta-finally-home-agents-hero.jpg"
       onerror="this.src='https://northsidegta.ca/uploads/northside-gta-finally-home-agents-hero.jpg'"
       alt="Aerial view of communities along the NorthSide GTA corridor" class="hero-img" loading="eager">
  <div class="hero-overlay" aria-hidden="true"></div>
  <div class="hero-content">
    <div class="hero-eyebrow">
      <i class="fas fa-map-pin" aria-hidden="true"></i>
      Finally Home Agents &middot; NorthSide GTA
    </div>
    <h1>Compare the<br>NorthSide GTA</h1>
    <p class="hero-sub">A practical guide to Aurora, Newmarket, Stouffville, East Gwillimbury, Georgina, Uxbridge, and Scugog. Compare prices, commute, schools, lifestyle, local favourites, and the trade-offs that matter before you start booking showings.</p>
    <div class="hero-btns">
      <a href="#town-cards" class="btn-primary" onclick="document.getElementById('town-cards').scrollIntoView({behavior:'smooth'});return false;">Compare the towns</a>
      <a href="#lead-form" class="btn-secondary" onclick="scrollToLead();return false;">Get local guidance</a>
    </div>
  </div>
</header>

<!-- INTRO / WHY THIS GUIDE -->
<section class="intro-section container" aria-labelledby="intro-h">
  <div class="intro-card">
    <div class="intro-eyebrow">Buyer guide</div>
    <h2 class="intro-h" id="intro-h">Moving north of Toronto is not one decision.</h2>
    <div class="intro-body">
      <p>Aurora, Newmarket, Stouffville, East Gwillimbury, Georgina, Uxbridge, and Scugog each offer a different version of life north of the city. Some are stronger for GO access. Some offer more space. Some lean into waterfront, trails, schools, new builds, heritage streets, or a slower pace.</p>
      <p>This guide helps you compare the trade-offs before you start booking showings.</p>
    </div>
    <a href="#town-cards" class="btn-green" onclick="document.getElementById('town-cards').scrollIntoView({behavior:'smooth'});return false;">Start comparing</a>
  </div>
</section>

<!-- CONTROLS -->
<nav class="controls" aria-label="Filter and sort communities" id="controls">
  <div class="ctrl-inner">
    <div class="filter-group" id="filterBar" role="group" aria-label="Filter communities"></div>
    <div class="ctrl-right">
      <select class="ctrl-select" id="sortSel" onchange="render()" aria-label="Sort communities">
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="commute">Closest to Toronto</option>
        <option value="alpha">A to Z</option>
      </select>
      <div class="view-tog" role="group" aria-label="View mode">
        <button class="vtb on" id="btnCards" onclick="setView('cards')">Cards</button>
        <button class="vtb" id="btnCompare" onclick="setView('compare')">Compare</button>
      </div>
    </div>
  </div>
</nav>

<!-- MAIN CONTENT -->
<main class="container" id="mainContent" aria-live="polite"></main>

<!-- TASTEHUB -->
<section class="container" aria-labelledby="th-main-h">
  <div class="th-section">
    <div class="th-top">
      <div>
        <div class="th-eyebrow">Community-powered local food picks</div>
        <div class="th-lockup">NorthSide <span>TasteHub</span>&#8482;</div>
        <h2 class="th-heading" id="th-main-h">Local Favourites</h2>
        <p class="th-body">Buying into a town is not just about the house. It is also about where you get coffee, where you grab pizza, where you take the kids, and where locals actually go. NorthSide TasteHub helps buyers explore the food scene across the NorthSide GTA through community voting.</p>
        <p style="font-size:11px;color:var(--ink4);margin-top:8px;">TasteHub results are community-powered and are not paid rankings or endorsements.</p>
      </div>
      <div class="th-actions">
        <a href="/tastehub" class="btn-green" style="font-size:13px;">Explore TasteHub</a>
        <a href="/tastehub" class="btn-outline" style="font-size:13px;">Vote for local favourites</a>
      </div>
    </div>
    <div class="th-towns">
      <a href="/tastehub?town=aurora" class="th-town-chip">
        <img src="/Images/towns/aurora.jpg" alt="Aurora NorthSide GTA town badge" width="36" height="36" loading="lazy">
        <div class="th-town-chip-name">Aurora</div>
        <div class="th-town-chip-label">Local food voting</div>
        <div class="th-town-chip-cta">See favourites &rarr;</div>
      </a>
      <a href="/tastehub?town=newmarket" class="th-town-chip">
        <img src="/Images/towns/newmarket.jpg" alt="Newmarket NorthSide GTA town badge" width="36" height="36" loading="lazy">
        <div class="th-town-chip-name">Newmarket</div>
        <div class="th-town-chip-label">Local food voting</div>
        <div class="th-town-chip-cta">See favourites &rarr;</div>
      </a>
      <a href="/tastehub?town=stouffville" class="th-town-chip">
        <img src="/Images/towns/stouffville.jpg" alt="Stouffville NorthSide GTA town badge" width="36" height="36" loading="lazy">
        <div class="th-town-chip-name">Stouffville</div>
        <div class="th-town-chip-label">Local food voting</div>
        <div class="th-town-chip-cta">See favourites &rarr;</div>
      </a>
      <a href="/tastehub?town=east-gwillimbury" class="th-town-chip">
        <img src="/Images/towns/east-gwillimbury.jpg" alt="East Gwillimbury NorthSide GTA town badge" width="36" height="36" loading="lazy">
        <div class="th-town-chip-name">East Gwillimbury</div>
        <div class="th-town-chip-label">Local food voting</div>
        <div class="th-town-chip-cta">See favourites &rarr;</div>
      </a>
      <a href="/tastehub?town=georgina" class="th-town-chip">
        <img src="/Images/towns/georgina.jpg" alt="Georgina NorthSide GTA town badge" width="36" height="36" loading="lazy">
        <div class="th-town-chip-name">Georgina</div>
        <div class="th-town-chip-label">Local food voting</div>
        <div class="th-town-chip-cta">See favourites &rarr;</div>
      </a>
      <a href="/tastehub?town=uxbridge" class="th-town-chip">
        <img src="/Images/towns/uxbridge.jpg" alt="Uxbridge NorthSide GTA town badge" width="36" height="36" loading="lazy">
        <div class="th-town-chip-name">Uxbridge</div>
        <div class="th-town-chip-label">Local food voting</div>
        <div class="th-town-chip-cta">See favourites &rarr;</div>
      </a>
      <a href="/tastehub?town=scugog" class="th-town-chip">
        <img src="/Images/towns/scugog.jpg" alt="Scugog NorthSide GTA town badge" width="36" height="36" loading="lazy">
        <div class="th-town-chip-name">Scugog</div>
        <div class="th-town-chip-label">Local food voting</div>
        <div class="th-town-chip-cta">See favourites &rarr;</div>
      </a>
    </div>
    <p class="th-disclaimer">TasteHub results are community-powered and are not paid rankings or endorsements. Local favourites are included for community context only and are not ranked by Finally Home Agents.</p>
  </div>
</section>

<!-- MAP -->
<section class="container map-section" id="map-sec" aria-labelledby="map-h">
  <div class="map-section-hdr">
    <h2 id="map-h">All along the 404 corridor</h2>
    <p>From the DVP/401 interchange north. Drive times are off-peak estimates via Hwy 404. Click any marker to jump to that community.</p>
  </div>
  <div class="map-outer">
    <svg id="mapsvg" viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Interactive map of NorthSide GTA communities north of Toronto">
      <defs>
        <radialGradient id="bgr" cx="55%" cy="85%" r="70%">
          <stop offset="0%" stop-color="#1a2a0e"/>
          <stop offset="40%" stop-color="#0e1a08"/>
          <stop offset="100%" stop-color="#060d04"/>
        </radialGradient>
        <radialGradient id="tglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f4c04a" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#f4c04a" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="h404" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f8d060"/>
          <stop offset="100%" stop-color="#f4a940"/>
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="900" height="520" fill="url(#bgr)"/>
      <!-- City lights texture -->
      <g opacity="0.2">
        <rect x="300" y="400" width="2" height="2" fill="#f4d060" rx="1"/>
        <rect x="330" y="410" width="1.5" height="1.5" fill="#f4d060" rx="1"/>
        <rect x="360" y="405" width="2" height="2" fill="#f4d060" rx="1"/>
        <rect x="390" y="415" width="1.5" height="1.5" fill="#f4d060" rx="1"/>
        <rect x="420" y="408" width="2" height="2" fill="#f4d060" rx="1"/>
        <rect x="450" y="402" width="1.5" height="1.5" fill="#f4d060" rx="1"/>
        <rect x="480" y="412" width="2" height="2" fill="#f4d060" rx="1"/>
        <rect x="510" y="406" width="1.5" height="1.5" fill="#f4d060" rx="1"/>
        <rect x="540" y="416" width="2" height="2" fill="#f4d060" rx="1"/>
        <rect x="570" y="409" width="1.5" height="1.5" fill="#f4d060" rx="1"/>
      </g>
      <!-- Lake Ontario -->
      <path d="M 0 490 Q 200 475 450 484 Q 650 492 900 476 L 900 520 L 0 520 Z" fill="#0a2a4a" opacity="0.85"/>
      <text x="448" y="510" font-family="Georgia,serif" font-size="12" fill="#4a9ac8" text-anchor="middle" font-style="italic" opacity="0.7">Lake Ontario</text>
      <!-- Lake Simcoe -->
      <ellipse cx="490" cy="65" rx="175" ry="50" fill="#0a2a4a" opacity="0.85"/>
      <text x="490" y="69" font-family="Georgia,serif" font-size="12" fill="#4a9ac8" text-anchor="middle" font-style="italic" opacity="0.85">Lake Simcoe</text>
      <!-- Lake Scugog -->
      <ellipse cx="750" cy="282" rx="52" ry="36" fill="#0a2a4a" opacity="0.7"/>
      <text x="750" y="286" font-family="Georgia,serif" font-size="9" fill="#4a9ac8" text-anchor="middle" font-style="italic" opacity="0.8">Lake Scugog</text>
      <!-- Hwy 404 / DVP spine -->
      <path d="M 445 485 C 447 445 449 395 452 345 C 455 295 457 245 459 195 C 461 145 463 108 465 82" stroke="url(#h404)" stroke-width="5" fill="none" filter="url(#glow)" opacity="0.95"/>
      <path d="M 445 485 C 447 445 449 395 452 345 C 455 295 457 245 459 195 C 461 145 463 108 465 82" stroke="#f4c04a" stroke-width="12" fill="none" opacity="0.1"/>
      <rect x="455" y="296" width="34" height="18" fill="rgba(8,18,4,0.85)" rx="4" stroke="#f4c04a" stroke-width="1"/>
      <text x="472" y="308" font-family="sans-serif" font-size="10" fill="#f4c04a" text-anchor="middle" font-weight="bold">404</text>
      <!-- Hwy 400 -->
      <path d="M 278 485 C 280 445 282 395 284 345 C 286 295 288 248 290 198" stroke="#e8a840" stroke-width="3" fill="none" opacity="0.55"/>
      <text x="296" y="295" font-family="sans-serif" font-size="9" fill="#d4903a" text-anchor="middle" opacity="0.8">400</text>
      <!-- Hwy 407 -->
      <path d="M 148 380 Q 300 370 450 375 Q 600 380 748 370" stroke="#e8a840" stroke-width="2.5" fill="none" stroke-dasharray="8,4" opacity="0.52"/>
      <text x="175" y="366" font-family="sans-serif" font-size="9" fill="#e8a840" opacity="0.7">407 ETR</text>
      <!-- Hwy 48 -->
      <path d="M 526 432 Q 576 372 618 312 Q 658 252 698 202" stroke="#d4903a" stroke-width="2.5" fill="none" stroke-dasharray="6,4" opacity="0.48"/>
      <text x="658" y="243" font-family="sans-serif" font-size="8" fill="#d4903a" opacity="0.7" transform="rotate(-40,658,243)">Hwy 48</text>
      <!-- Toronto marker -->
      <ellipse cx="445" cy="458" rx="28" ry="10" fill="rgba(244,192,74,0.1)"/>
      <circle cx="445" cy="452" r="7" fill="#f4c04a" opacity="0.9"/>
      <rect x="378" y="464" width="134" height="26" fill="rgba(8,18,4,0.88)" rx="6" stroke="rgba(244,192,74,0.3)" stroke-width="1"/>
      <text x="445" y="474" font-family="sans-serif" font-size="9" fill="#f4d070" text-anchor="middle" font-weight="bold">TORONTO / DVP + 401</text>
      <text x="445" y="484" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.45)" text-anchor="middle">Heart of It All</text>
      <!-- Town markers (JS fills these) -->
      <g id="townMarkers"></g>
      <!-- Scale -->
      <rect x="18" y="498" width="60" height="2" fill="rgba(255,255,255,0.25)" rx="1"/>
      <text x="18" y="495" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.35)">approx. 20 km</text>
      <text x="882" y="514" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.18)" text-anchor="end">northsidegta.ca</text>
    </svg>
    <div class="map-legend">
      <div class="mleg"><div class="mleg-line" style="background:#f4c04a;"></div>Hwy 404/DVP</div>
      <div class="mleg"><div class="mleg-line" style="background:#d4903a;"></div>Hwy 400 / 48</div>
      <div class="mleg"><div class="mleg-line" style="background:#e8a840;border-top:1px dashed #e8a840;height:0;"></div>Hwy 407 ETR</div>
      <div style="margin-left:auto;font-size:11px;color:var(--ink4);font-style:italic;">Click any marker to jump to that community</div>
    </div>
  </div>
</section>

<!-- WHAT $1M BUYS -->
<section class="container onemil-section" aria-labelledby="onemil-h" id="onemil">
  <h2 id="onemil-h">What does $1M buy you?</h2>
  <p class="sub">The same budget looks very different depending on which community you choose. Here is what $1,000,000 typically gets you across the NorthSide GTA as of Q1–Q2 2026.</p>
  <div class="onemil-grid">
    <div class="omc" style="--omc-c:#1a4a6b;">
      <div class="omc-header">
        <img src="/Images/towns/aurora.jpg" alt="Aurora NorthSide GTA town badge" class="omc-badge" loading="lazy">
        <div class="omc-town">Aurora</div>
      </div>
      <div class="omc-price">At $1,000,000</div>
      <p class="omc-desc">A well-maintained 3-bed detached on a 40-ft lot in Aurora Heights or Bayview Wellington — 1980s–90s build, mature street, walking distance to schools. Budget for updates.</p>
      <a href="/communities/aurora" class="omc-link">View Aurora guide &rarr;</a>
    </div>
    <div class="omc" style="--omc-c:#3a2060;">
      <div class="omc-header">
        <img src="/Images/towns/newmarket.jpg" alt="Newmarket NorthSide GTA town badge" class="omc-badge" loading="lazy">
        <div class="omc-town">Newmarket</div>
      </div>
      <div class="omc-price">At $1,000,000</div>
      <p class="omc-desc">A 4-bed detached in Stonehaven-Wyndham or Armitage — 2000s build, double garage, finished basement, strong school catchment. Strong value compared with nearby options.</p>
      <a href="/communities/newmarket" class="omc-link">View Newmarket guide &rarr;</a>
    </div>
    <div class="omc" style="--omc-c:#1a4a1a;">
      <div class="omc-header">
        <img src="/Images/towns/stouffville.jpg" alt="Stouffville NorthSide GTA town badge" class="omc-badge" loading="lazy">
        <div class="omc-town">Stouffville</div>
      </div>
      <div class="omc-price">At $1,000,000</div>
      <p class="omc-desc">A brand-new 4-bed, 3-bath detached in a new subdivision — 2,200–2,600 sq ft, double garage, modern finishes. Everything new. You choose the colours.</p>
      <a href="/communities/stouffville" class="omc-link">View Stouffville guide &rarr;</a>
    </div>
    <div class="omc" style="--omc-c:#4a2a1a;">
      <div class="omc-header">
        <img src="/Images/towns/east-gwillimbury.jpg" alt="East Gwillimbury NorthSide GTA town badge" class="omc-badge" loading="lazy">
        <div class="omc-town">East Gwillimbury</div>
      </div>
      <div class="omc-price">At $1,000,000</div>
      <p class="omc-desc">A 4–5 bed estate home on a 55-ft lot in Queensville or Sharon — 2,600–3,000 sq ft, 3-car garage. More home per dollar than most of York Region.</p>
      <a href="/communities/east-gwillimbury" class="omc-link">View East Gwillimbury guide &rarr;</a>
    </div>
    <div class="omc" style="--omc-c:#0a3a4a;">
      <div class="omc-header">
        <img src="/Images/towns/georgina.jpg" alt="Georgina NorthSide GTA town badge" class="omc-badge" loading="lazy">
        <div class="omc-town">Georgina</div>
      </div>
      <div class="omc-price">At $1,000,000</div>
      <p class="omc-desc">A waterfront or near-waterfront property on Lake Simcoe — large lot, private dock. Or a newer 5-bed detached in Keswick North with a triple garage. One of the strongest value plays in York Region at this price point.</p>
      <a href="/communities/georgina" class="omc-link">View Georgina guide &rarr;</a>
    </div>
    <div class="omc" style="--omc-c:#2a3a1a;">
      <div class="omc-header">
        <img src="/Images/towns/uxbridge.jpg" alt="Uxbridge NorthSide GTA town badge" class="omc-badge" loading="lazy">
        <div class="omc-town">Uxbridge</div>
      </div>
      <div class="omc-price">At $1,000,000</div>
      <p class="omc-desc">A 4-bed on a half-acre lot with character, or a small equestrian property with a barn on 2–5 acres. Properties simply unavailable at this price closer to the city.</p>
      <a href="/communities/uxbridge" class="omc-link">View Uxbridge guide &rarr;</a>
    </div>
    <div class="omc" style="--omc-c:#3a1a0a;">
      <div class="omc-header">
        <img src="/Images/towns/scugog.jpg" alt="Scugog NorthSide GTA town badge" class="omc-badge" loading="lazy">
        <div class="omc-town">Scugog</div>
      </div>
      <div class="omc-price">At $1,000,000</div>
      <p class="omc-desc">A restored Victorian century home steps from Port Perry's Main St and the waterfront, or a 4-bed on Lake Scugog with a dock. Heritage properties unavailable elsewhere at this price.</p>
      <a href="/communities/scugog" class="omc-link">View Scugog guide &rarr;</a>
    </div>
  </div>
  <p style="font-size:12px;color:var(--ink4);margin-top:14px;text-align:center;">Based on active market conditions Q1–Q2 2026. Properties vary. Market information is provided for general guidance and may change. <button onclick="scrollToLead()" style="background:none;border:none;color:var(--green);font-size:12px;cursor:pointer;font-family:var(--fb);font-weight:500;">Contact Matthew or Landon for a current shortlist.</button></p>
</section>

<!-- SMS SECTION -->
<section class="sms-section" id="sms-section" aria-labelledby="sms-h">
  <div class="sms-inner">
    <div class="sms-copy">
      <strong id="sms-h">Want listings for one town? Get quiet text alerts.</strong>
      <p>No spam. Just relevant NorthSide GTA listings and local updates — for the community you're watching.</p>
    </div>
    <div class="sms-form-wrap">
      <p>Choose a community, enter your number, and we'll text you when something relevant hits the market.</p>
      <div class="sms-fields">
        <input class="sms-input" type="tel" id="sms_phone" placeholder="Phone number" autocomplete="tel">
        <select class="sms-input" id="sms_town" style="cursor:pointer;">
          <option value="">Choose a community</option>
          <option>Aurora</option>
          <option>Newmarket</option>
          <option>Stouffville</option>
          <option>East Gwillimbury</option>
          <option>Georgina</option>
          <option>Uxbridge</option>
          <option>Scugog</option>
          <option>All NorthSide GTA</option>
        </select>
      </div>
      <button class="sms-submit" id="smsSubmitBtn" onclick="submitSMSMain()">Set my town alerts</button>
      <p class="sms-disc">By opting in you consent to receive SMS listing alerts from Matthew Mulhall and Landon Mulhall, Sales Representatives, Finally Home Agents Team, HomeLife Optimum Realty, Brokerage, under TRESA, governed by RECO. Standard message and data rates may apply. Reply STOP to unsubscribe at any time.</p>
    </div>
  </div>
</section>

<!-- LEAD FORM -->
<section id="lead-form" class="lead-section" aria-labelledby="lead-h">
  <div class="lead-inner">
    <div class="lc">
      <h2 id="lead-h">Not sure which town fits?</h2>
      <p>Tell us what matters most: commute, schools, budget, space, walkability, waterfront, trails, or timing. We'll help you narrow the search before you start chasing listings.</p>
      <p style="font-size:13px;">No pressure. No spam. Just a practical conversation with people who know these communities.</p>
      <div class="agents">
        <div class="asm">
          <div class="asm-name">Matthew Mulhall</div>
          <div class="asm-role">Sales Representative</div>
          <div class="asm-brok">HomeLife Optimum Realty</div>
        </div>
        <div class="asm">
          <div class="asm-name">Landon Mulhall</div>
          <div class="asm-role">Sales Representative</div>
          <div class="asm-brok">HomeLife Optimum Realty</div>
        </div>
      </div>
      <div class="trust-row">
        <div class="tr-it"><i class="fas fa-shield-halved" aria-hidden="true"></i>RECO registered</div>
        <div class="tr-it"><i class="fas fa-map-pin" aria-hidden="true"></i>NorthSide GTA focused</div>
        <div class="tr-it"><i class="fas fa-clock" aria-hidden="true"></i>Responds within 2 hours</div>
        <div class="tr-it"><i class="fas fa-lock" aria-hidden="true"></i>Your info stays private</div>
      </div>
    </div>
    <div class="form-card">
      <h3>Help me compare towns</h3>
      <p class="form-sub">A few details helps us give you a useful answer rather than a generic one.</p>
      <div id="leadFormBody">
        <div class="frow2">
          <div class="fg2"><label for="f_fn">First name</label><input type="text" id="f_fn" placeholder="Jane" autocomplete="given-name" required></div>
          <div class="fg2"><label for="f_ln">Last name</label><input type="text" id="f_ln" placeholder="Smith" autocomplete="family-name" required></div>
        </div>
        <div class="frow2">
          <div class="fg2"><label for="f_em">Email</label><input type="email" id="f_em" placeholder="jane@email.com" autocomplete="email" required></div>
          <div class="fg2"><label for="f_ph">Phone</label><input type="tel" id="f_ph" placeholder="(416) 555-0100" autocomplete="tel"></div>
        </div>
        <div class="fg2">
          <label for="f_tl">Buying timeline</label>
          <select id="f_tl">
            <option value="">Select your timeline</option>
            <option>Ready now</option>
            <option>1–3 months</option>
            <option>3–6 months</option>
            <option>6–12 months</option>
            <option>Just researching for now</option>
          </select>
        </div>
        <div class="fg2">
          <label for="f_bg">Budget range</label>
          <select id="f_bg">
            <option value="">Select budget</option>
            <option>Under $800K</option>
            <option>$800K – $1M</option>
            <option>$1M – $1.3M</option>
            <option>$1.3M – $1.7M</option>
            <option>$1.7M – $2.5M</option>
            <option>$2.5M+</option>
          </select>
        </div>
        <div class="fg2">
          <label>Communities of interest</label>
          <div class="pchk-grp">
            <input type="checkbox" class="pchk" id="pc1" value="Aurora"><label for="pc1">Aurora</label>
            <input type="checkbox" class="pchk" id="pc2" value="Newmarket"><label for="pc2">Newmarket</label>
            <input type="checkbox" class="pchk" id="pc3" value="Stouffville"><label for="pc3">Stouffville</label>
            <input type="checkbox" class="pchk" id="pc4" value="East Gwillimbury"><label for="pc4">East Gwillimbury</label>
            <input type="checkbox" class="pchk" id="pc5" value="Georgina"><label for="pc5">Georgina</label>
            <input type="checkbox" class="pchk" id="pc6" value="Uxbridge"><label for="pc6">Uxbridge</label>
            <input type="checkbox" class="pchk" id="pc7" value="Scugog"><label for="pc7">Scugog</label>
            <input type="checkbox" class="pchk" id="pc8" value="Not sure yet"><label for="pc8">Not sure yet</label>
          </div>
        </div>
        <div class="fg2"><label for="f_nt">What matters most to you? (optional)</label><textarea id="f_nt" placeholder="e.g. We need a GO Train commute for my partner, top schools, and more space than we have in Leaside..."></textarea></div>
        <button class="sbtn" id="leadSubmitBtn" onclick="submitLead()">
          <i class="fas fa-arrow-right" aria-hidden="true"></i> Help me compare towns
        </button>
        <p class="reco-note">By submitting you consent to being contacted by Matthew Mulhall and Landon Mulhall, Sales Representatives, Finally Home Agents Team, HomeLife Optimum Realty, Brokerage, under TRESA, governed by RECO. Your information will not be sold or shared with third parties. <a href="/privacy" style="color:var(--ink3);">Privacy policy</a>.</p>
      </div>
      <div class="fsucc" id="formSuccess">
        <span class="ck" aria-hidden="true">&#10003;</span>
        <h4>We'll be in touch.</h4>
        <p>Matthew or Landon will respond within 2 hours with something practical rather than a generic follow-up.</p>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="container faq-section" aria-labelledby="faq-h">
  <h2 id="faq-h">Frequently asked questions</h2>
  <div class="faq-wrap">
    <details class="faq-item">
      <summary class="faq-summary">What is the average home price in Aurora, Ontario in 2026? <span class="faq-icon">+</span></summary>
      <p class="faq-answer">The average sold price in Aurora is approximately $1,122,000 across all home types (TRREB MLS Q1 2026). Detached homes average around $1,561,000 and townhomes around $918,000. It is currently a buyer's market with approximately 4.2 months of inventory.</p>
    </details>
    <details class="faq-item">
      <summary class="faq-summary">Which towns north of Toronto have GO Train access? <span class="faq-icon">+</span></summary>
      <p class="faq-answer">Aurora and Newmarket are served by the GO Barrie line with trains to Union Station. Stouffville is served by the GO Stouffville line. East Gwillimbury, Georgina, Uxbridge, and Scugog do not have GO Train stations and are car-dependent for Toronto commuting.</p>
    </details>
    <details class="faq-item">
      <summary class="faq-summary">Which community north of Toronto is most affordable? <span class="faq-icon">+</span></summary>
      <p class="faq-answer">Georgina has the lowest average sold price among these seven communities at approximately $875,000 (TRREB 2025–2026). Scugog ($960,000) and Uxbridge ($990,000) are also below the $1M average. All three are currently in buyer's market conditions.</p>
    </details>
    <details class="faq-item">
      <summary class="faq-summary">How long is the commute from these communities to Toronto? <span class="faq-icon">+</span></summary>
      <p class="faq-answer">Off-peak drive times to the DVP/401 interchange vary: Aurora approximately 35 minutes (46 km), Newmarket approximately 45 minutes (55 km), Stouffville approximately 40 minutes (48 km), East Gwillimbury approximately 50 minutes, Uxbridge approximately 60 minutes, Georgina approximately 65 minutes, and Scugog approximately 75 minutes. Peak-hour times are typically 30–60% longer. GO Train options are available from Aurora, Newmarket, and Stouffville.</p>
    </details>
    <details class="faq-item">
      <summary class="faq-summary">What is Uxbridge known for? <span class="faq-icon">+</span></summary>
      <p class="faq-answer">Uxbridge is officially Canada's Trail Capital with over 300 kilometres of trails on the Oak Ridges Moraine, including the Trans Canada Trail and Durham Forest. It is also known for its equestrian community, heritage downtown, Dagmar Ski Resort, and active arts and theatre scene.</p>
    </details>
    <details class="faq-item">
      <summary class="faq-summary">What areas are within Georgina? <span class="faq-icon">+</span></summary>
      <p class="faq-answer">Georgina includes Keswick (the largest urban centre), Keswick South, Keswick North, Sutton, Jackson's Point, Pefferlaw, Baldwin, Belhaven, Virginia, and historic lakeshore communities. Sutton and Jackson's Point are popular waterfront areas along Lake Simcoe.</p>
    </details>
  </div>
</section>

<!-- COMPLIANCE -->
<footer class="compliance" role="contentinfo">
  <div class="compliance-inner">
    <p><strong>Market data disclaimer:</strong> Market information is provided for general guidance only and may change. Buyers should confirm current pricing, availability, school boundaries, commute times, and property details before making decisions. Average sold prices sourced from TRREB MLS® data and regional market reports (Q3 2025–Q2 2026). Drive times are off-peak estimates via Hwy 404 to the DVP/401 interchange — peak-hour times are typically 30–60% longer. <strong>TasteHub disclaimer:</strong> TasteHub results are community-powered and are not paid rankings or endorsements. <strong>Restaurant disclaimer:</strong> Local favourites are included for community context only and are not ranked by Finally Home Agents unless clearly identified as community voting results. <strong>School disclaimer:</strong> School ratings from Fraser Institute 2024/2025. School ratings and boundaries can change. Buyers should verify directly with the relevant school board before purchasing. <strong>Registrant information (TRESA):</strong> <strong>Matthew Mulhall</strong> and <strong>Landon Mulhall</strong>, Sales Representatives, Finally Home Agents Team, <strong>HomeLife Optimum Realty, Brokerage</strong>, regulated by the <strong>Real Estate Council of Ontario (RECO)</strong> under the <em>Trust in Real Estate Services Act, 2002 (TRESA)</em>. MLS® is a registered trademark of CREA. © 2026 Finally Home Agents Team | HomeLife Optimum Realty, Brokerage | <a href="https://northsidegta.ca">northsidegta.ca</a></p>
  </div>
</footer>


`;

export default function NeighbourhoodGuidePage() {
  const containerRef = useRef(null);

  useEffect(() => {
    window.submitTownLead = (id, town) => {
      const n = document.getElementById(`sf_name_${id}`)?.value.trim();
      const em = document.getElementById(`sf_email_${id}`)?.value.trim();
      if (!n || !em) { alert("Please enter your name and email."); return; }
      const payload = { name: n, email: em, phone: document.getElementById(`sf_phone_${id}`)?.value, timeline: document.getElementById(`sf_tl_${id}`)?.value, town, source: `NorthSide GTA Neighbourhood Guide v4 — ${town} town page`, timestamp: new Date().toISOString() };
      fetch("/api/send-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, casl: true, notRepresented: true, title: `NorthSide GTA local guidance — ${town}`, realmLink: window.location.href }), credentials: "same-origin" }).catch(() => {});
      const btn = document.querySelector(".cta-submit"); if (btn) { btn.textContent = "✓ Request sent"; btn.disabled = true; }
    };
    window.submitSMSTown = (id, town) => {
      const phone = document.getElementById(`sms_${id}`)?.value.trim();
      if (!phone) { alert("Please enter your phone number."); return; }
      const payload = { phone, town, source: `NorthSide SMS opt-in — ${town}`, timestamp: new Date().toISOString() };
      fetch("/api/sms-optin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials: "same-origin" }).catch(() => {});
      const smsBox = document.getElementById(`sms_${id}`)?.closest(".sms-box");
      if (smsBox) smsBox.innerHTML = `<p style="color:rgba(255,255,255,0.8);font-size:13px;">&#10003; You're in. We'll text you new ${town} listings. Reply STOP to unsubscribe.</p>`;
    };
    return () => { delete window.submitTownLead; delete window.submitSMSTown; };
  }, []);
  const schemaObject = useMemo(() => JSON.parse(PAGE_SCHEMA), []);
  return (<><Helmet>
      <title>NorthSide GTA Neighbourhood Guide | Compare Aurora, Newmarket, Stouffville, East Gwillimbury, Georgina, Uxbridge & Scugog | Finally Home Agents</title>
      <meta name="description" content="A practical neighbourhood guide for buyers looking north of Toronto. Compare home prices, commute times, schools, lifestyle, and local favourites for Aurora, Newmarket, Stouffville, East Gwillimbury, Georgina, Uxbridge, and Scugog." />
      <meta property="og:title" content="NorthSide GTA Neighbourhood Guide | Finally Home Agents" />
      <meta property="og:description" content="Compare Aurora, Newmarket, Stouffville, East Gwillimbury, Georgina, Uxbridge, and Scugog. Prices, commutes, schools, and the trade-offs that matter." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://northsidegta.ca/neighbourhood-guide" />
      <meta property="og:image" content="https://northsidegta.ca/uploads/northside-gta-finally-home-agents-hero.jpg" />
      <link rel="canonical" href="https://northsidegta.ca/neighbourhood-guide" />
      <script type="application/ld+json">{JSON.stringify(schemaObject)}</script>
    </Helmet><style>{PAGE_STYLE}</style><div ref={containerRef} dangerouslySetInnerHTML={{ __html: PAGE_BODY_HTML }} /></>);
}
