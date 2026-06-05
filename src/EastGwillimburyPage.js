import React, { useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";

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
  --town-color:#3a1e0a;
}
html{scroll-behavior:smooth;}
body{font-family:var(--fb);background:var(--cream);color:var(--ink);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased;}
a{color:var(--green);text-decoration:none;}a:hover{text-decoration:underline;}
img{max-width:100%;display:block;}
.topnav{background:var(--green);padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:52px;position:sticky;top:0;z-index:300;box-shadow:0 2px 8px rgba(0,0,0,0.2);}
.topnav-logo{font-family:var(--fd);font-size:17px;font-weight:700;color:#fff;letter-spacing:-0.01em;}
.topnav-logo span{color:var(--goldm);}
.topnav-right{display:flex;align-items:center;gap:16px;}
.topnav-link{font-size:12px;color:rgba(255,255,255,0.72);transition:color var(--t);}
.topnav-link:hover{color:#fff;text-decoration:none;}
.topnav-cta{font-size:12px;font-weight:600;background:rgba(255,255,255,0.12);color:#fff;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.2);transition:all var(--t);}
.topnav-cta:hover{background:rgba(255,255,255,0.2);text-decoration:none;}
/* HERO */
.hero{position:relative;height:440px;overflow:hidden;background:var(--town-color);}
.hero-img{width:100%;height:100%;object-fit:cover;object-position:center;display:block;}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(10,20,5,0.78) 0%,rgba(10,20,5,0.5) 55%,rgba(10,20,5,0.2) 100%);}
.hero-content{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:flex-end;padding:36px 40px 40px;}
.hero-eyebrow{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:12px;}
.hero h1{font-family:var(--fd);font-size:clamp(30px,4.5vw,48px);font-weight:700;color:#fff;line-height:1.1;margin-bottom:12px;letter-spacing:-0.02em;max-width:600px;}
.hero-sub{font-size:15px;color:rgba(255,255,255,0.75);max-width:540px;line-height:1.7;margin-bottom:22px;}
.hero-stats{display:flex;gap:0;background:rgba(0,0,0,0.3);backdrop-filter:blur(8px);border-radius:12px;overflow:hidden;width:fit-content;}
.hstat{padding:12px 18px;text-align:center;border-right:1px solid rgba(255,255,255,0.1);}
.hstat:last-child{border-right:none;}
.hstat-val{font-family:var(--fd);font-size:19px;font-weight:600;color:#fff;}
.hstat-lbl{font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.07em;margin-top:2px;}
/* LAYOUT */
.container{max-width:1100px;margin:0 auto;padding:0 24px;}
.breadcrumb{font-size:12px;color:var(--ink4);padding:16px 0 0;}
.breadcrumb a{color:var(--green);}
.breadcrumb span{margin:0 5px;}
.page-grid{display:grid;grid-template-columns:1fr 300px;gap:32px;align-items:start;padding:28px 0 60px;}
.sec{background:var(--paper);border-radius:var(--rxl);border:1px solid var(--border);padding:24px;margin-bottom:20px;box-shadow:var(--sh);}
.sec h2{font-family:var(--fd);font-size:20px;font-weight:700;color:var(--ink);margin-bottom:14px;letter-spacing:-0.01em;}
.sec-eyebrow{font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:var(--green3);margin-bottom:6px;}
.sec-h2{font-family:var(--fd);font-size:clamp(22px,3vw,30px);font-weight:700;color:var(--ink);letter-spacing:-0.02em;}
.sec-sub{font-size:14px;color:var(--ink3);line-height:1.7;margin-top:6px;}
/* TOWN BADGE */
.town-badge{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.6);}
/* SCHOOLS */
.school-table{width:100%;border-collapse:collapse;font-size:13px;}
.school-table th{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.07em;color:var(--ink4);padding:8px 10px;text-align:left;background:var(--cream);border-bottom:1px solid var(--border);}
.school-table td{padding:9px 10px;border-bottom:1px solid var(--border);vertical-align:top;}
.school-table tr:last-child td{border-bottom:none;}
.school-name{font-weight:500;color:var(--ink);font-size:13px;}
.school-type{font-size:11px;color:var(--ink4);}
.school-rating{font-weight:600;color:var(--green);white-space:nowrap;font-size:13px;}
.school-note{font-size:11px;color:var(--ink3);}
/* RESTS */
.rest-item{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);}
.rest-item:last-child{border-bottom:none;}
.rest-name{font-weight:500;font-size:13px;color:var(--ink);}
.rest-desc{font-size:12px;color:var(--ink3);margin-top:2px;}
/* HIGHLIGHTS */
.highlight-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;}
.hl-item{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--ink2);padding:9px 12px;background:var(--cream);border-radius:var(--r);border:1px solid var(--border);}
.hl-check{width:18px;height:18px;background:var(--gpale);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.hl-check svg{width:10px;height:10px;stroke:var(--green);stroke-width:2.5;fill:none;}
/* DAY IN LIFE */
.dil-block{background:linear-gradient(135deg,#3a1e0a12,#3a1e0a06);border-left:3px solid #3a1e0a;padding:18px 20px;border-radius:0 var(--r) var(--r) 0;font-size:13.5px;color:var(--ink2);line-height:1.8;}
/* FAQ */
.faq-item{border-bottom:1px solid var(--border);}
.faq-item:last-child{border-bottom:none;}
.faq-summary{font-size:14px;font-weight:500;color:var(--ink);padding:14px 0;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px;}
.faq-summary::-webkit-details-marker{display:none;}
.faq-icon{width:20px;height:20px;border-radius:50%;background:var(--gpale);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;color:var(--green);transition:transform var(--t);}
details[open] .faq-icon{transform:rotate(45deg);}
.faq-answer{font-size:13px;color:var(--ink2);line-height:1.75;padding-bottom:14px;}
/* TASTEHUB */
.th-section{background:var(--gpale);border:1px solid var(--gborder);border-radius:var(--rxl);padding:28px;margin-bottom:20px;}
.th-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap;}
.th-lockup{font-family:var(--fd);font-size:13px;font-weight:700;color:var(--green);}
.th-lockup span{color:var(--gold);}
.th-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:14px;}
.th-card{background:var(--paper);border-radius:var(--rl);border:1px solid var(--border);overflow:hidden;box-shadow:var(--sh);transition:all var(--t);}
.th-card:hover{box-shadow:var(--shm);transform:translateY(-2px);}
.th-card-img{width:100%;height:120px;object-fit:cover;background:var(--gsoft);}
.th-card-body{padding:11px 13px;}
.th-card-town{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:var(--ink4);margin-bottom:4px;}
.th-card-title{font-size:13px;font-weight:600;color:var(--ink);line-height:1.4;margin-bottom:5px;}
.th-card-cta{font-size:12px;color:var(--green);font-weight:500;}
.th-fallback{background:var(--paper);border-radius:var(--rl);border:1px dashed var(--gborder);padding:22px;text-align:center;color:var(--ink3);font-size:13px;line-height:1.6;}
/* TOWNS NAV */
.towns-nav{display:flex;flex-wrap:wrap;gap:8px;}
.town-nav-chip{display:flex;align-items:center;gap:8px;padding:7px 13px;border-radius:30px;border:1px solid var(--border2);background:var(--paper);font-size:12px;font-weight:500;color:var(--ink2);transition:all var(--t);}
.town-nav-chip:hover{border-color:var(--green);background:var(--gpale);text-decoration:none;color:var(--green);}
.town-nav-chip.current{background:var(--green);border-color:var(--green);color:#fff;}
.town-nav-chip img{width:20px;height:20px;border-radius:50%;object-fit:cover;}
/* SIDEBAR */
.price-card{background:var(--town-color);border-radius:var(--rxl);padding:22px;margin-bottom:16px;}
.price-card h3{font-family:var(--fd);font-size:16px;font-weight:600;color:#fff;margin-bottom:14px;}
.prow{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.12);font-size:13px;}
.prow:last-child{border-bottom:none;}
.pk{color:rgba(255,255,255,0.6);}
.pv{font-weight:600;color:#fff;}
.mkt-pill{display:inline-block;font-size:10px;padding:3px 9px;border-radius:8px;background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.2);font-weight:500;}
.onemil-box{background:linear-gradient(135deg,#3a1e0a18,#3a1e0a08);border:1px solid #3a1e0a35;border-radius:var(--rl);padding:18px;margin-bottom:16px;}
.onemil-price{font-family:var(--fd);font-size:15px;font-weight:700;color:var(--green);margin-bottom:8px;}
.onemil-desc{font-size:12.5px;color:var(--ink2);line-height:1.65;}
/* CTA CARD */
.cta-card{background:var(--green);border-radius:var(--rxl);padding:22px;}
.cta-card h3{font-family:var(--fd);font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;}
.cta-card p{font-size:13px;color:rgba(255,255,255,0.72);margin-bottom:16px;line-height:1.65;}
.agent-sm{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;}
.asm{background:rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;}
.asm-name{font-weight:600;font-size:13px;color:#fff;}
.asm-role{font-size:11px;color:rgba(255,255,255,0.6);}
.asm-brok{font-size:11px;color:#e8b84a;font-weight:500;margin-top:2px;}
.cta-form input,.cta-form select{width:100%;margin-bottom:8px;font-family:var(--fb);font-size:13px;border:none;border-radius:8px;padding:10px 12px;color:var(--ink);background:#fff;outline:none;}
.cta-submit{width:100%;background:#e8b84a;color:var(--ink);border:none;border-radius:30px;padding:12px;font-family:var(--fb);font-size:13px;font-weight:600;cursor:pointer;transition:all var(--t);}
.cta-submit:hover{background:#f4c040;}
.sms-box{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:14px;margin-top:12px;}
.sms-box p{font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:8px;}
.sms-row{display:flex;gap:6px;}
.sms-row input{flex:1;font-family:var(--fb);font-size:12px;border:none;border-radius:7px;padding:8px 10px;color:var(--ink);outline:none;}
.sms-btn{background:#e8b84a;color:var(--ink);border:none;border-radius:7px;padding:8px 12px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;}
.reco-note{font-size:10px;color:rgba(255,255,255,0.38);margin-top:10px;line-height:1.6;}
/* COMPLIANCE */
.compliance{background:#f0ede8;border-top:1px solid var(--border);padding:24px;font-size:11px;color:var(--ink4);line-height:1.8;}
.compliance strong{color:var(--ink2);}
.compliance a{color:var(--green);}
.compliance-inner{max-width:1100px;margin:0 auto;}
/* BUYER FIT */
.fit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.fit-item{padding:14px;border-radius:var(--r);border:1px solid var(--border);font-size:13px;}
.fit-good{background:#f0fdf4;border-color:#bbf7d0;}
.fit-good .fit-label{font-weight:600;color:#14532d;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;}
.fit-watch{background:#fffbeb;border-color:#fde68a;}
.fit-watch .fit-label{font-weight:600;color:#78350f;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;}
.fit-item p{color:var(--ink2);line-height:1.6;}
@media(max-width:760px){.page-grid{grid-template-columns:1fr;}.hero-content{padding:24px 20px 28px;}.hero-stats{flex-wrap:wrap;}.highlight-grid{grid-template-columns:1fr;}.fit-grid{grid-template-columns:1fr;}}
@media(max-width:640px){.container{padding:0 16px;}.topnav{padding:0 16px;}.topnav-right .topnav-link{display:none;}.hero{height:360px;}}
`;
const PAGE_SCHEMA = `{
  "@context":"https://schema.org",
  "@graph":[
    {
      "@type":"Article",
      "headline":"Living in East Gwillimbury, Ontario | Real Estate & Neighbourhood Guide",
      "description":"Large lots, new estate builds, fast growth, and Highway 404 access across Sharon, Queensville, and Holland Landing.",
      "url":"https://northsidegta.ca/communities/east-gwillimbury",
      "dateModified":"2026-05-24",
      "author":[
        {"@type":"Person","name":"Matthew Mulhall","jobTitle":"Sales Representative","worksFor":{"@type":"Organization","name":"HomeLife Optimum Realty"}},
        {"@type":"Person","name":"Landon Mulhall","jobTitle":"Sales Representative","worksFor":{"@type":"Organization","name":"HomeLife Optimum Realty"}}
      ],
      "publisher":{"@type":"Organization","name":"Finally Home Agents Team","url":"https://northsidegta.ca"},
      "about":{"@type":"City","name":"East Gwillimbury","containedInPlace":{"@type":"AdministrativeArea","name":"York Region, Ontario"}}
    },
    {
      "@type":"FAQPage",
      "mainEntity":[{"@type":"Question","name":"What is East Gwillimbury Ontario like?","acceptedAnswer":{"@type":"Answer","text":"East Gwillimbury is York Region's fastest-growing municipality, spanning Sharon, Queensville, Holland Landing, and Mount Albert. It is known for larger new-construction homes, significant infrastructure investment, and the HALP recreation centre opened in 2025."}},{"@type":"Question","name":"Is East Gwillimbury a good place to buy?","acceptedAnswer":{"@type":"Answer","text":"For buyers who want newer construction and larger lots at a reasonable York Region price point, East Gwillimbury offers strong value compared with nearby options. It is currently a buyer's market with approximately 4.5 months of inventory. Daily commuting requires car travel."}},{"@type":"Question","name":"Does East Gwillimbury have GO Train service?","acceptedAnswer":{"@type":"Answer","text":"No — East Gwillimbury does not currently have a GO Train station. The closest stations are in Aurora and Newmarket. Residents primarily commute via Highway 404. The Bradford bypass is improving east-west access."}}]
    },
    {
      "@type":"RealEstateAgent",
      "name":"Finally Home Agents Team",
      "url":"https://northsidegta.ca",
      "employee":[
        {"@type":"Person","name":"Matthew Mulhall","jobTitle":"Sales Representative"},
        {"@type":"Person","name":"Landon Mulhall","jobTitle":"Sales Representative"}
      ]
    }
  ]
}`;
const PAGE_BODY_HTML = `


<!-- HERO -->
<header class="hero" role="banner">
  <img src="/Images/eastgwillimbury-banner.jpg" alt="Neighbourhood streetscape in East Gwillimbury" class="hero-img" loading="eager">
  <div class="hero-overlay" aria-hidden="true"></div>
  <div class="hero-content">
    <div class="hero-eyebrow">
      <img src="/assets/town-logos/east-gwillimbury.webp" alt="East Gwillimbury NorthSide GTA town badge" class="town-badge">
      <span>York Region &middot; NorthSide GTA</span>
    </div>
    <h1>Living in East Gwillimbury</h1>
    <p class="hero-sub">Newer communities, larger lots, family-focused growth, and quick access to Highway 404 across Sharon, Queensville, Holland Landing, and Mount Albert.</p>
    <div class="hero-stats">
      <div class="hstat"><div class="hstat-val">$1150K</div><div class="hstat-lbl">Avg. sold</div></div>
      <div class="hstat"><div class="hstat-val">50 min</div><div class="hstat-lbl">Off-peak to DVP</div></div>
      <div class="hstat"><div class="hstat-val">30d</div><div class="hstat-lbl">Avg. on mkt</div></div>
      <div class="hstat"><div class="hstat-val">4.5 mo</div><div class="hstat-lbl">Inventory</div></div>
    </div>
  </div>
</header>

<!-- BODY -->
<div class="container">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="https://northsidegta.ca">Home</a><span>&rsaquo;</span>
    <a href="https://northsidegta.ca/neighbourhood-guide">Neighbourhood guide</a><span>&rsaquo;</span>
    <span>East Gwillimbury</span>
  </nav>
  <div class="page-grid">

    <!-- MAIN COLUMN -->
    <div>

      <!-- INTRO -->
      <div class="sec">
        <div class="sec-eyebrow">About East Gwillimbury</div>
        <p style="font-size:14px;color:var(--ink2);line-height:1.8;">East Gwillimbury is a practical choice for buyers who are prioritising home size, lot size, and newer construction over commute convenience. Communities like Sharon, Queensville, and Holland Landing are growing quickly, with meaningful infrastructure investment underway. The trade-off is clear: daily driving is required, and the local amenity base is still developing.</p>
        <div style="margin-top:14px;display:flex;gap:6px;flex-wrap:wrap;">
          <a href="#contact" class="btn-primary" style="font-size:13px;padding:10px 20px;">Get local guidance</a>
          <a href="https://northsidegta.ca/neighbourhood-guide" class="btn-secondary" style="font-size:13px;padding:9px 18px;">Compare all towns</a>
        </div>
      </div>

      <!-- SUB-COMMUNITIES -->
      <div class="sec" id="neighbourhoods">
        <h2>Neighbourhoods &amp; areas in East Gwillimbury</h2>
        <div style="margin-bottom:12px;"><span style="font-size:12px;padding:4px 11px;border-radius:8px;background:var(--gpale);border:1px solid var(--gborder);color:var(--green2);font-weight:500;display:inline-block;margin:3px 4px 3px 0;">Holland Landing</span><span style="font-size:12px;padding:4px 11px;border-radius:8px;background:var(--gpale);border:1px solid var(--gborder);color:var(--green2);font-weight:500;display:inline-block;margin:3px 4px 3px 0;">Sharon</span><span style="font-size:12px;padding:4px 11px;border-radius:8px;background:var(--gpale);border:1px solid var(--gborder);color:var(--green2);font-weight:500;display:inline-block;margin:3px 4px 3px 0;">Queensville</span><span style="font-size:12px;padding:4px 11px;border-radius:8px;background:var(--gpale);border:1px solid var(--gborder);color:var(--green2);font-weight:500;display:inline-block;margin:3px 4px 3px 0;">Mount Albert</span><span style="font-size:12px;padding:4px 11px;border-radius:8px;background:var(--gpale);border:1px solid var(--gborder);color:var(--green2);font-weight:500;display:inline-block;margin:3px 4px 3px 0;">Rural East Gwillimbury</span></div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;">Each area within East Gwillimbury has its own character, price range, and feel. Talk to Matthew or Landon about which sub-community fits your lifestyle and budget best.</p>
      </div>

      <!-- SCHOOLS & COMMUTE -->
      <div class="sec" id="schools">
        <h2>Schools</h2>
        <table class="school-table" aria-label="Schools">
      <thead><tr><th>School</th><th>Rating</th><th>Notes</th></tr></thead>
      <tbody><tr>
      <td><div class="school-name">Sharon Public School</div><div class="school-type">Public Elementary</div></td>
      <td class="school-rating">7.8/10</td>
      <td class="school-note">Highest-rated in EG — Fraser Institute 2024</td>
    </tr><tr>
      <td><div class="school-name">Queensville Public School</div><div class="school-type">Public Elementary</div></td>
      <td class="school-rating">7.5/10</td>
      <td class="school-note">Newer school serving fast-growing community</td>
    </tr><tr>
      <td><div class="school-name">Dr. John M. Denison SS</div><div class="school-type">Secondary (Newmarket)</div></td>
      <td class="school-rating">7.2/10</td>
      <td class="school-note">Primary secondary school for EG residents</td>
    </tr><tr>
      <td><div class="school-name">Sacred Heart Catholic Elementary</div><div class="school-type">Catholic Elementary</div></td>
      <td class="school-rating">7.6/10</td>
      <td class="school-note">York Catholic District School Board</td>
    </tr></tbody>
    </table>
    <p style="font-size:11px;color:var(--ink4);margin-top:10px;line-height:1.65;">Ratings from Fraser Institute Ontario School Report Cards 2024/2025. School boundaries can change — verify directly with the relevant school board before making a property decision.</p>
        <div style="margin-top:18px;">
          <h2 style="font-size:18px;margin-bottom:10px;">Commute from East Gwillimbury</h2>
          <div style="background:var(--cream);border-radius:var(--r);padding:14px 16px;font-size:13px;color:var(--ink2);line-height:1.75;">
            <div><strong>Distance to DVP/401:</strong> 60 km</div>
            <div><strong>Off-peak drive time:</strong> approximately 50 minutes</div>
            <div><strong>Transit:</strong> Highway 404 and Bradford bypass — no GO Train station</div>
            <div style="margin-top:8px;font-size:12px;color:var(--ink4);">Drive times are off-peak estimates. Peak-hour commute times are typically 30–60% longer depending on conditions.</div>
          </div>
        </div>
      </div>

      <!-- RESTAURANTS / LOCAL LIFESTYLE -->
      <div class="sec" id="restaurants">
        <h2>Local restaurants &amp; cafés</h2>
        <div class="rest-item">
      <div><div class="rest-name">Sharon village cafés</div><div class="rest-desc">Independent cafés in the heritage village core</div></div>
    </div><div class="rest-item">
      <div><div class="rest-name">Holland Landing diners</div><div class="rest-desc">Small-town diner options along Yonge St</div></div>
    </div><div class="rest-item">
      <div><div class="rest-name">HALP Aquatics Café</div><div class="rest-desc">Café inside the HALP recreation centre (opened 2025)</div></div>
    </div><div class="rest-item">
      <div><div class="rest-name">Newmarket dining — 15 min south</div><div class="rest-desc">Full restaurant and retail corridor</div></div>
    </div><p style="font-size:11px;color:var(--ink4);margin-top:10px;">Included for community context. Not ranked or endorsed by Finally Home Agents.</p>
      </div>

      <!-- TASTEHUB -->
      <section class="th-section" aria-labelledby="th-h-east-gwillimbury">
  <div class="th-header">
    <div>
      <div class="sec-eyebrow">Community-powered local food picks</div>
      <h2 class="sec-h2" id="th-h-east-gwillimbury" style="font-size:20px;">NorthSide TasteHub Local Favourites in East Gwillimbury</h2>
      <p class="sec-sub" style="font-size:13px;margin-top:6px;">From Sharon to Queensville, Holland Landing, and Mount Albert, TasteHub helps buyers discover local cafés, takeout spots, and community favourites.</p>
      <p style="font-size:11px;color:var(--ink4);margin-top:6px;">TasteHub results are community-powered and are not paid rankings or endorsements.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">
      <a href="/tastehub?town=east-gwillimbury" class="btn-primary" style="font-size:12px;padding:9px 18px;">See East Gwillimbury favourites</a>
      <a href="/tastehub" class="btn-secondary" style="font-size:12px;padding:8px 16px;">Vote on TasteHub</a>
    </div>
  </div>
  <div id="th-polls-east-gwillimbury" class="th-cards">
    <!-- TasteHub polls load here -->
    <div class="th-fallback">
      <p style="margin-bottom:8px;font-weight:500;">TasteHub polls for East Gwillimbury are coming soon.</p>
      <p style="margin-bottom:14px;">Explore live TasteHub voting across the NorthSide GTA.</p>
      <a href="/tastehub" class="btn-secondary" style="font-size:12px;">See all TasteHub polls</a>
    </div>
  </div>
</section>


      <!-- WHY PEOPLE CHOOSE -->
      <div class="sec" id="lifestyle">
        <h2>Why people choose East Gwillimbury</h2>
        <div class="highlight-grid"><div class="hl-item"><div class="hl-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div><span>HALP Aquatic and Recreation Centre (opened 2025)</span></div><div class="hl-item"><div class="hl-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div><span>Sharon heritage village</span></div><div class="hl-item"><div class="hl-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div><span>Bradford bypass road improvements</span></div><div class="hl-item"><div class="hl-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div><span>Estate subdivisions in Sharon</span></div><div class="hl-item"><div class="hl-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div><span>Fastest-growing municipality in York Region</span></div><div class="hl-item"><div class="hl-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div><span>Holland Landing Conservation Area</span></div></div>
      </div>

      <!-- BUYER FIT -->
      <div class="sec" id="buyer-fit">
        <h2>Is East Gwillimbury the right fit?</h2>
        <div class="fit-grid">
          <div class="fit-item fit-good">
            <div class="fit-label">Well suited for</div>
            <p>Buyers prioritising space, newer construction, and home size. Families with flexible or remote work arrangements. Upsizers from Newmarket, Aurora, or Barrie.</p>
          </div>
          <div class="fit-item fit-watch">
            <div class="fit-label">Things to weigh up</div>
            <p>East Gwillimbury is car-dependent. There is no GO Train station. Daily commuting requires highway driving, typically 45 to 60 minutes off-peak to central Toronto.</p>
          </div>
        </div>
        <div style="margin-top:12px;background:var(--cream);border-radius:var(--r);padding:13px 15px;font-size:13px;color:var(--ink2);">
          <strong>Market note:</strong> Significant municipal infrastructure investment underway. The HALP recreation centre opened in 2025. Long-term value picture is positive as the area matures, though the current market offers buyer-side leverage.
        </div>
      </div>

      <!-- DAY IN LIFE -->
      <div class="sec" id="day-in-life">
        <h2>A day in East Gwillimbury</h2>
        <div class="dil-block">Morning school drop-off is around the corner — the subdivision layout makes it quick. The 404 south takes 45 to 60 minutes off-peak depending on where you're headed in the city. Pull into the three-car garage in the evening. After dinner: HALP Aquatics with the kids, or a walk in the new trails behind the Sharon expansion. The home is larger and newer than most of what's available further south at this price.</div>
      </div>

      <!-- FAQ -->
      <div class="sec" id="faq">
        <h2>Frequently asked questions</h2>
        <details class="faq-item">
      <summary class="faq-summary">What is East Gwillimbury Ontario like? <span class="faq-icon">+</span></summary>
      <div class="faq-answer">East Gwillimbury is York Region's fastest-growing municipality, spanning Sharon, Queensville, Holland Landing, and Mount Albert. It is known for larger new-construction homes, significant infrastructure investment, and the HALP recreation centre opened in 2025.</div>
    </details><details class="faq-item">
      <summary class="faq-summary">Is East Gwillimbury a good place to buy? <span class="faq-icon">+</span></summary>
      <div class="faq-answer">For buyers who want newer construction and larger lots at a reasonable York Region price point, East Gwillimbury offers strong value compared with nearby options. It is currently a buyer's market with approximately 4.5 months of inventory. Daily commuting requires car travel.</div>
    </details><details class="faq-item">
      <summary class="faq-summary">Does East Gwillimbury have GO Train service? <span class="faq-icon">+</span></summary>
      <div class="faq-answer">No — East Gwillimbury does not currently have a GO Train station. The closest stations are in Aurora and Newmarket. Residents primarily commute via Highway 404. The Bradford bypass is improving east-west access.</div>
    </details>
      </div>

      <!-- OTHER COMMUNITIES -->
      <div class="sec">
        <h2>Other NorthSide GTA communities</h2>
        <div class="towns-nav"><a href="/communities/aurora" class="town-nav-chip">
      <img src="/assets/town-logos/aurora.webp" alt="Aurora NorthSide GTA town badge" width="20" height="20" loading="lazy">
      Aurora
    </a><a href="/communities/newmarket" class="town-nav-chip">
      <img src="/assets/town-logos/newmarket.webp" alt="Newmarket NorthSide GTA town badge" width="20" height="20" loading="lazy">
      Newmarket
    </a><a href="/communities/stouffville" class="town-nav-chip">
      <img src="/assets/town-logos/stouffville.webp" alt="Stouffville NorthSide GTA town badge" width="20" height="20" loading="lazy">
      Stouffville
    </a><a href="/communities/east-gwillimbury" class="town-nav-chip current">
      <img src="/assets/town-logos/east-gwillimbury.webp" alt="East Gwillimbury NorthSide GTA town badge" width="20" height="20" loading="lazy">
      East Gwillimbury
    </a><a href="/communities/georgina" class="town-nav-chip">
      <img src="/assets/town-logos/georgina.webp" alt="Georgina NorthSide GTA town badge" width="20" height="20" loading="lazy">
      Georgina
    </a><a href="/communities/uxbridge" class="town-nav-chip">
      <img src="/assets/town-logos/uxbridge.webp" alt="Uxbridge NorthSide GTA town badge" width="20" height="20" loading="lazy">
      Uxbridge
    </a><a href="/communities/scugog" class="town-nav-chip">
      <img src="/assets/town-logos/scugog.webp" alt="Scugog NorthSide GTA town badge" width="20" height="20" loading="lazy">
      Scugog
    </a></div>
        <p style="margin-top:14px;font-size:13px;"><a href="https://northsidegta.ca/neighbourhood-guide" style="font-weight:500;">Compare all seven communities side by side &rarr;</a></p>
      </div>

    </div><!-- /main col -->

    <!-- SIDEBAR -->
    <div id="contact">

      <!-- PRICE SNAPSHOT -->
      <div class="price-card">
        <h3>Market snapshot</h3>
        <div class="prow"><span class="pk">All types avg.</span><span class="pv">$1150K</span></div>
        <div class="prow"><span class="pk">Detached avg.</span><span class="pv">$1550K</span></div>
        <div class="prow"><span class="pk">Townhouse avg.</span><span class="pv">$890K</span></div>
        <div class="prow"><span class="pk">Condo / apt avg.</span><span class="pv">$680K</span></div>
        <div class="prow"><span class="pk">Days on market</span><span class="pv">30d</span></div>
        <div class="prow"><span class="pk">Sale / list ratio</span><span class="pv">98%</span></div>
        <div class="prow"><span class="pk">Months inventory</span><span class="pv">4.5</span></div>
        <div class="prow"><span class="pk">Market type</span><span class="pv"><span class="mkt-pill">Buyer's market</span></span></div>
        <p style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:10px;line-height:1.6;">TRREB MLS® 2025–2026. Not an appraisal. Confirm with a registered agent before decisions.</p>
      </div>

      <!-- WHAT $1M BUYS -->
      <div class="onemil-box">
        <div class="onemil-price">What does $1M buy in East Gwillimbury?</div>
        <p class="onemil-desc">A 4 to 5 bed estate detached on a 50 to 60 ft lot in Queensville or Sharon — typically 2,600 to 3,200 sq ft, three-car garage, large backyard, built within the last five years. More home per dollar than most of York Region.</p>
        <p style="font-size:10px;color:var(--ink4);margin-top:8px;">Based on active listings Q1–Q2 2026. Properties vary.</p>
      </div>

      <!-- CTA -->
      <div class="cta-card">
        <h3>Talk to a local real estate agent</h3>
        <p>We can help you compare neighbourhoods, understand current pricing, and decide whether East Gwillimbury fits your lifestyle, budget, and timing.</p>
        <div class="agent-sm">
          <div class="asm"><div class="asm-name">Matthew Mulhall</div><div class="asm-role">Sales Representative</div><div class="asm-brok">HomeLife Optimum Realty</div></div>
          <div class="asm"><div class="asm-name">Landon Mulhall</div><div class="asm-role">Sales Representative</div><div class="asm-brok">HomeLife Optimum Realty</div></div>
        </div>
        <div class="cta-form">
          <input type="text" id="sf_name_east-gwillimbury" placeholder="Your name" autocomplete="name">
          <input type="email" id="sf_email_east-gwillimbury" placeholder="Email address" autocomplete="email">
          <input type="tel" id="sf_phone_east-gwillimbury" placeholder="Phone (optional)" autocomplete="tel">
          <select id="sf_tl_east-gwillimbury">
            <option value="">Timeline</option>
            <option>Ready now</option>
            <option>1–3 months</option>
            <option>3–6 months</option>
            <option>6–12 months</option>
            <option>Just researching</option>
          </select>
          <button class="cta-submit" onclick="submitTownLead('east-gwillimbury','East Gwillimbury')">Get local guidance &rarr;</button>
        </div>
        <div class="sms-box">
          <p>Want listings for East Gwillimbury? Get quiet text alerts.</p>
          <p style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:8px;">No spam. Just relevant listings and local updates.</p>
          <div class="sms-row">
            <input type="tel" id="sms_east-gwillimbury" placeholder="Your phone number">
            <button class="sms-btn" onclick="submitSMSTown('east-gwillimbury','East Gwillimbury')">Set alerts</button>
          </div>
        </div>
        <p class="reco-note">By submitting you consent to being contacted by Matthew Mulhall and Landon Mulhall, Sales Representatives, Finally Home Agents Team, HomeLife Optimum Realty, Brokerage, under TRESA, governed by RECO. For SMS: standard msg &amp; data rates may apply. Reply STOP to unsubscribe.</p>
      </div>

    </div><!-- /sidebar -->
  </div><!-- /grid -->
</div><!-- /container -->

<footer class="compliance" role="contentinfo">
  <div class="compliance-inner">
    <p><strong>Market data disclaimer:</strong> Market information is provided for general guidance only and may change. Buyers should confirm current pricing, availability, school boundaries, commute times, and property details before making decisions. Average sold prices sourced from TRREB MLS® data and regional market reports (Q3 2025–Q2 2026). Drive times are off-peak estimates via Hwy 404 to the DVP/401 interchange. <strong>TasteHub disclaimer:</strong> TasteHub results are community-powered and are not paid rankings or endorsements. <strong>Restaurant disclaimer:</strong> Local favourites are included for community context only and are not ranked by Finally Home Agents unless clearly identified as community voting results. <strong>School disclaimer:</strong> School ratings from Fraser Institute 2024/2025. School ratings and boundaries can change. Buyers should verify directly with the relevant school board before purchasing. <strong>Registrant information (TRESA):</strong> <strong>Matthew Mulhall</strong> and <strong>Landon Mulhall</strong>, Sales Representatives, Finally Home Agents Team, <strong>HomeLife Optimum Realty, Brokerage</strong>, regulated by the <strong>Real Estate Council of Ontario (RECO)</strong> under the <em>Trust in Real Estate Services Act, 2002 (TRESA)</em>. MLS® is a registered trademark of CREA. © 2026 Finally Home Agents Team | HomeLife Optimum Realty, Brokerage | <a href="https://northsidegta.ca">northsidegta.ca</a></p>
  </div>
</footer>


`;

export default function EastGwillimburyPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const townName = "East Gwillimbury";
    const container = containerRef.current?.querySelector("#th-polls-east-gwillimbury");
    if (!container) return;
    fetch("/api/tastehub/polls", { credentials: "same-origin" })
      .then((r) => { if (!r.ok) throw new Error("no polls"); return r.json(); })
      .then((data) => {
        const polls = Array.isArray(data) ? data : data.polls || [];
        const live = polls.filter((p) => p.status === "live" && p.town && p.town.toLowerCase() === townName.toLowerCase()).slice(0, 3);
        if (!live.length) return;
        container.innerHTML = live.map((p) => {
          const href = p.slug ? `/tastehub/${p.slug}` : "/tastehub";
          const img = p.image || "/seo/tastehub-default-poll-share.jpg";
          return `<a href="${href}" class="th-card" style="text-decoration:none;color:inherit;"><img src="${img}" alt="${p.title || "TasteHub poll"}" class="th-card-img" loading="lazy"><div class="th-card-body"><div class="th-card-town">${townName}</div><div class="th-card-title">${p.title || "Local favourite"}</div><div class="th-card-cta">Vote now &rarr;</div></div></a>`;
        }).join("");
      })
      .catch(() => {});
  }, []);

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
      <title>Living in East Gwillimbury, Ontario | Real Estate &amp; Neighbourhood Guide | Finally Home Agents</title>
      <meta name="description" content="Explore East Gwillimbury, Ontario with Finally Home Agents. Compare neighbourhoods, home prices, commute, schools, parks, local favourites, and whether East Gwillimbury is the right fit for your move north of Toronto." />
      <meta property="og:title" content="Living in East Gwillimbury, Ontario | NorthSide GTA Guide" />
      <meta property="og:description" content="Compare lifestyle, commute, home prices, schools, neighbourhoods, and local favourites in East Gwillimbury. A practical buyer guide from Finally Home Agents." />
      <meta property="og:type" content="article" />
      <meta property="og:url" content="https://northsidegta.ca/communities/east-gwillimbury" />
      <meta property="og:image" content="https://northsidegta.ca/Images/eastgwillimbury-banner.jpg" />
      <link rel="canonical" href="https://northsidegta.ca/communities/east-gwillimbury" />
      <script type="application/ld+json">{JSON.stringify(schemaObject)}</script>
    </Helmet><HeaderShell /><style>{PAGE_STYLE}</style><div ref={containerRef} dangerouslySetInnerHTML={{ __html: PAGE_BODY_HTML }} /></>);
}
