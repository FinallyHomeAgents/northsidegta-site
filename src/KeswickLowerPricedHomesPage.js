import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import { getFormEndpoint } from "./components/contact/contactConfig";
import { trackEvent, trackEventOnce } from "./utils/analytics";

const priceBands = ["Under $600K", "$600K–$700K", "$700K–$800K", "Price-reduced homes", "First-time buyer options", "Move-up value picks"];
const listingIntentCards = [
  { title: "Homes under $700K", propertyType: "Detached / Townhome / Semi", area: "Keswick" },
  { title: "Price-reduced options", propertyType: "Mixed", area: "Keswick / Georgina" },
  { title: "Detached homes with upside", propertyType: "Detached", area: "Keswick North" },
  { title: "Bungalows and smaller homes", propertyType: "Bungalow / Compact detached", area: "Keswick South" },
];
const comparisonAreas = ["Newmarket", "Aurora", "East Gwillimbury", "Stouffville", "Bradford", "Innisfil"];
const faqItems = [
  ["Are there still homes under $700K in Keswick?", "Availability changes week to week. There are often lower price bands to watch in Keswick and Georgina, but the exact options depend on timing, property type, and condition. Ask for the current list and we’ll verify what is available."],
  ["Is Keswick cheaper than other York Region communities?", "Keswick and Georgina can offer different value compared with many areas farther south, but pricing depends on the property, neighbourhood, lot, condition, and market timing. Any comparison should be based on current data."],
  ["Is a lower-priced home always a good deal?", "No. A lower price can reflect size, condition, location, layout, renovation needs, or seller strategy. The goal is to separate real opportunity from costly compromise."],
  ["What areas should I compare with Keswick?", "Common comparisons include Newmarket, Aurora, East Gwillimbury, Stouffville, Bradford, Innisfil, and parts of Durham depending on commute and lifestyle."],
  ["Can you send me only homes that match my budget?", "Yes. Use the form and choose your budget range. We can send a focused list instead of everything on the market."],
  ["Do I need to be ready to buy right now?", "No. Many buyers use this page to monitor the market before they are ready. If you are early, we can help you understand price bands and timing."],
];

const keswickMarketStats = {
  lastUpdated: "May 2026",
  area: "Keswick / Georgina",
  notes: ["More choice than tighter markets", "Lower-price search demand", "Lake Simcoe lifestyle", "York Region location"],
};

export default function KeswickLowerPricedHomesPage() {
  const meta = getStaticRouteMeta("/keswick-lower-priced-homes");
  const [form, setForm] = useState({ name: "", email: "", phone: "", budget: "", homeType: "", timeline: "", honeypot: "", intent: "General" });
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const formEndpoint = useMemo(() => getFormEndpoint(), []);

  useEffect(() => {
    trackEventOnce("keswick_page_view", { route: "/keswick-lower-priced-homes" });
    if (typeof window?.fbq === "function") window.fbq("track", "ViewContent", { content_name: "keswick-lower-priced-homes" });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return setError("Please complete name and email.");
    trackEvent("keswick_form_start", { route: "/keswick-lower-priced-homes" });
    setSending(true); setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => v && payload.append(k, v));
      const res = await fetch(formEndpoint, { method: "POST", body: payload, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("failed");
      setSuccess(true);
      trackEvent("keswick_lead_submit", { budget: form.budget, timeline: form.timeline });
      if (typeof window?.fbq === "function") window.fbq("track", "Lead", { content_name: "keswick-lower-priced-homes" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setSending(false); }
  };

  const jumpToForm = (intent) => {
    setForm((prev) => ({ ...prev, intent }));
    trackEvent("keswick_price_band_click", { intent });
    if (typeof window?.fbq === "function") window.fbq("track", "Search", { search_string: intent });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <div className="bg-[#f7f6f1] text-[#0f1f17]"><DynamicMetaTags {...meta} />
    <Helmet><script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage",name:"Lower-Priced Keswick Homes",url:"https://www.northsidegta.ca/keswick-lower-priced-homes",description:meta.description})}</script>
    <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:"https://www.northsidegta.ca/"},{"@type":"ListItem",position:2,name:"Keswick lower-priced homes",item:"https://www.northsidegta.ca/keswick-lower-priced-homes"}]})}</script>
    </Helmet>
    <HeaderShell />
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <section className="rounded-3xl bg-[#13261c] p-8 text-white"><p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Keswick Buyer Opportunity</p><h1 className="mt-2 text-4xl font-semibold">Lower-Priced Homes in Keswick Are Getting Attention</h1><p className="mt-4 max-w-3xl text-emerald-50">If you’re looking north of Toronto, Keswick is one of the places worth watching. See current lower-priced listings, price-band opportunities, and local guidance before the best options move.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={()=>jumpToForm("Get list")} className="rounded-full bg-white px-6 py-3 font-semibold text-[#13261c]">Get Today’s Keswick List</button><button onClick={()=>document.getElementById("price-bands")?.scrollIntoView({behavior:"smooth"})} className="rounded-full border border-white/50 px-6 py-3">Browse Price Bands</button></div><p className="mt-4 text-sm text-emerald-100">Listings and prices change frequently. We’ll help you verify what is currently available.</p><p className="mt-4 text-xs tracking-wide text-emerald-200">NorthSide GTA • Finally Home Agents • HomeLife Optimum Realty, Brokerage</p></section>
      <section id="price-bands" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{priceBands.map((band)=><button key={band} onClick={()=>jumpToForm(band)} className="rounded-2xl border border-[#1f3b2c]/20 bg-white p-4 text-left font-medium hover:border-[#1f3b2c]">{band}</button>)}</section>
      <section ref={formRef} className="mt-10 rounded-3xl bg-white p-6 shadow"><h2 className="text-2xl font-semibold">Get the current Keswick lower-price list</h2>{success ? <p className="mt-4 rounded-xl bg-emerald-50 p-4">Request received. We’ll send the current Keswick list and any relevant lower-price opportunities that match your range.</p> : <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">{['name','email','phone'].map((f)=><label key={f} className="text-sm">{f[0].toUpperCase()+f.slice(1)}{f==='phone'?' (optional)':''}<input className="mt-1 w-full rounded-lg border p-2" value={form[f]} onChange={(e)=>setForm({...form,[f]:e.target.value})} /></label>)}<label className="text-sm">Budget range<select className="mt-1 w-full rounded-lg border p-2" value={form.budget} onChange={(e)=>setForm({...form,budget:e.target.value})}><option>Under $600K</option><option>$600K–$700K</option><option>$700K–$800K</option><option>$800K–$900K</option><option>Not sure yet</option></select></label><label className="text-sm">Desired home type<select className="mt-1 w-full rounded-lg border p-2" value={form.homeType} onChange={(e)=>setForm({...form,homeType:e.target.value})}><option>Detached</option><option>Townhome</option><option>Semi-detached</option><option>Bungalow</option><option>Investment / rental potential</option><option>Not sure yet</option></select></label><label className="text-sm">Timeline<select className="mt-1 w-full rounded-lg border p-2" value={form.timeline} onChange={(e)=>setForm({...form,timeline:e.target.value})}><option>Now</option><option>1–3 months</option><option>3–6 months</option><option>Just watching</option></select></label><input type="text" className="hidden" value={form.honeypot} onChange={(e)=>setForm({...form,honeypot:e.target.value})}/><div className="md:col-span-2"><p className="text-xs text-gray-600">By submitting this form, you agree that Finally Home Agents may contact you about your home search. You can unsubscribe or opt out anytime.</p>{error && <p className="mt-2 text-sm text-red-700">{error}</p>}<button className="mt-3 rounded-full bg-[#13261c] px-6 py-3 font-semibold text-white">{sending?"Sending...":"Send Me the Keswick List"}</button></div></form>}</section>
      <section className="mt-12"><h2 className="text-2xl font-semibold">Current Keswick Opportunities by Price Band</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{listingIntentCards.map((card)=><article key={card.title} className="rounded-2xl border bg-white p-5"><h3 className="font-semibold">{card.title}</h3><p className="text-sm">{card.propertyType} • {card.area}</p><button className="mt-3 text-sm underline" onClick={()=>{trackEvent("keswick_listing_intent_click",{intent:card.title});jumpToForm(card.title);}}>Send me matching homes</button></article>)}</div></section>
      <section className="mt-12"><h2 className="text-2xl font-semibold">Why Keswick Is Showing Up on Buyer Shortlists</h2><p className="mt-3">Keswick is not just a price conversation...</p><div className="mt-4 grid gap-3 md:grid-cols-4">{keswickMarketStats.notes.map((n)=><div key={n} className="rounded-xl border bg-white p-4 text-sm font-medium">{n}</div>)}</div><p className="mt-3 text-xs text-gray-600">Market figures are based on publicly available listing and market data and should be verified before making real estate decisions. Listing availability and prices change frequently. Last updated: {keswickMarketStats.lastUpdated}.</p></section>
      <section className="mt-12"><h2 className="text-2xl font-semibold">Compared with areas farther south, Keswick can open up different options</h2><p className="mt-2">For many buyers searching across York Region and the north GTA, Keswick can introduce homes and lots that may not be available in the same way farther south.</p><p className="mt-2 text-sm">Compare areas: {comparisonAreas.join(", ")}.</p><button onClick={()=>{trackEvent("keswick_compare_click",{});if(typeof window?.fbq==='function')window.fbq('track','Contact',{content_name:'compare-options'});jumpToForm('Compare options')}} className="mt-3 rounded-full border px-5 py-2">Compare My Options</button></section>
      <section className="mt-12"><h2 className="text-2xl font-semibold">FAQ</h2><div className="mt-4 space-y-3">{faqItems.map(([q,a])=><details key={q} className="rounded-xl border bg-white p-4"><summary className="font-medium">{q}</summary><p className="mt-2 text-sm">{a}</p></details>)}</div></section>
      <section className="mt-12 rounded-3xl bg-[#13261c] p-7 text-white"><h2 className="text-2xl font-semibold">Start watching Keswick properly</h2><p className="mt-2 text-emerald-100">Get a focused list of current lower-priced Keswick homes, price reductions, and buyer opportunities that match your budget.</p><div className="mt-4 flex gap-3"><button onClick={()=>jumpToForm('Final CTA')} className="rounded-full bg-white px-5 py-2 text-[#13261c]">Send Me the Current List</button><a href="/contact" onClick={()=>trackEvent("keswick_book_call_click",{})} className="rounded-full border border-white/60 px-5 py-2">Book a Buyer Strategy Call</a></div></section>
      <section className="mt-10 text-xs text-gray-700">Finally Home Agents | Matthew Mulhall, Real Estate Agent | Landon Mulhall, Real Estate Agent | HomeLife Optimum Realty, Brokerage. Not intended to solicit buyers or sellers currently under contract. Listing data, market figures, and availability are subject to change and should be independently verified.</section>
    </main><Footer /></div>;
}
