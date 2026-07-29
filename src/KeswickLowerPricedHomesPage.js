import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import { getFormEndpoint } from "./components/contact/contactConfig";
import { trackEvent, trackEventOnce } from "./utils/analytics";
import { CANONICAL_TESTIMONIALS } from "./data/testimonials";
import MARKET_DATA from "./data/marketData.json";

const priceBands = [
  { label: "Under $600K", copy: "Smaller homes, condos, townhomes, or properties with trade-offs." },
  { label: "$600K to $700K", copy: "A key range for buyers watching detached and semi-detached options." },
  { label: "$700K to $800K", copy: "Often where more detached options begin to appear." },
  { label: "$800K to $900K", copy: "More room to compare condition, lot, layout, and neighbourhood." },
  { label: "Price reductions", copy: "Homes where seller expectations may be adjusting." },
  { label: "First-time buyer options", copy: "Entry-level homes that need proper due diligence." },
];

const buyerInsights = [
  { title: "More price-band choice", copy: "Buyers who felt boxed out in other York Region communities may find a wider range of asking prices in Keswick and Georgina." },
  { title: "Some listings need context", copy: "A lower price can reflect size, condition, location, layout, timing, or seller motivation. The key is understanding why the price is lower." },
  { title: "Detached homes still matter", copy: "Keswick remains especially relevant for buyers who still want a detached home, yard, driveway, or more room than a condo or townhome may offer." },
  { title: "The best options move differently", copy: "Some homes sit. Some move quickly. The difference is usually price, condition, presentation, and how well the home matches buyer demand." },
];

const georginaMarket = MARKET_DATA.municipalities.georgina;
const marketStats = {
  cards: [
    { label: "Average sale price", text: georginaMarket.averageSalePrice },
    { label: "Sales count", text: String(georginaMarket.salesCount) },
    { label: "Avg. LDOM", text: String(georginaMarket.avgLdom) },
  ],
};

const lowerPricedMeaning = [
  "Smaller detached homes",
  "Older homes with renovation upside",
  "Townhomes and semis",
  "Bungalows and compact layouts",
  "Homes with location trade-offs",
  "Homes with condition questions",
];

const comparisonAreas = [
  { title: "Keswick vs Newmarket", copy: "Newmarket may offer more central amenities and GO access, while Keswick may open up different price and property-type options." },
  { title: "Keswick vs Aurora", copy: "Aurora often carries a different price profile. Keswick may be worth comparing for buyers who want York Region but need more room in the budget." },
  { title: "Keswick vs East Gwillimbury", copy: "Both can appeal to buyers moving north, but the housing mix, commute, and neighbourhood feel can differ significantly." },
  { title: "Keswick vs Innisfil", copy: "Both connect to Lake Simcoe lifestyle, but they sit in different regional markets with different buyer considerations." },
  { title: "Keswick vs Stouffville", copy: "Stouffville may appeal to buyers looking east of Markham, while Keswick often becomes relevant for buyers tracking the Highway 404 corridor north." },
];

const searchIntentBlocks = [
  ["Homes under $700K in Keswick", "Availability changes week to week, but this is one of the most important price bands for buyers watching Keswick and Georgina. The right options may include smaller detached homes, townhomes, semis, or homes needing updates."],
  ["Price-reduced homes in Keswick", "A price reduction does not automatically mean a deal. It can signal seller adjustment, market feedback, condition concerns, or a change in strategy. Each home needs to be reviewed individually."],
  ["First-time buyer homes in Georgina", "Keswick can be relevant for first-time buyers who want to stay within reach of York Region while exploring more approachable home types and price points."],
  ["Detached homes in Keswick", "Detached homes remain one of the main reasons buyers look at Keswick. The key is comparing lot, layout, condition, age, updates, and resale profile."],
  ["Keswick North vs Keswick South", "Both areas can appeal to buyers, but the right choice depends on your commute, lifestyle, home type, and specific street. A proper comparison matters."],
  ["Homes north of Toronto", "For buyers priced out farther south, communities along and beyond the Highway 404 corridor can create different trade-offs. Keswick is one of the areas worth watching."],
];

const faqItems = [
  ["Are there still homes under $700K in Keswick?", "Availability changes frequently. There are often lower price bands to watch in Keswick and Georgina, but the exact options depend on timing, property type, condition, and competition."],
  ["Is Keswick cheaper than Newmarket or Aurora?", "Keswick can offer different price and property-type options than many areas farther south, but the comparison depends on the exact home, neighbourhood, condition, and current market data."],
  ["Is a lower-priced home always a good deal?", "No. A lower price can reflect size, location, condition, layout, seller strategy, or market feedback. The goal is to separate real opportunity from costly compromise."],
  ["Why are some homes sitting longer?", "Homes can sit for many reasons, including pricing, presentation, condition, location, seasonality, financing conditions, or buyer demand. Each property needs to be reviewed individually."],
  ["Can you send me Keswick homes that match my budget?", "Yes. Submit your budget range and we can send a focused list of current Keswick and Georgina homes that match what you are watching."],
  ["Do I need to be ready to buy right now?", "No. Many buyers start by monitoring price bands and understanding the market before they are ready to make an offer."],
  ["What should I compare Keswick against?", "Common comparisons include Newmarket, Aurora, East Gwillimbury, Stouffville, Bradford, Innisfil, and parts of Durham depending on budget and commute."],
];

const trustCards = ["NorthSide GTA market focus", "Buyer strategy and negotiation", "Local comparison guidance", "RECO-compliant advice", "Clear next steps", "No-pressure monitoring"];
const lifestyleCards = ["Lake Simcoe proximity", "Established neighbourhoods", "Local shops and services", "Room to grow", "North of Toronto without leaving York Region", "Access to Georgina lifestyle"];

export default function KeswickLowerPricedHomesPage() {
  const meta = getStaticRouteMeta("/keswick-lower-priced-homes");
  const [form, setForm] = useState({ name: "", email: "", phone: "", budget: "", homeType: "", timeline: "", intent: "General", workingWithAgent: "No", honeypot: "" });
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const formEndpoint = useMemo(() => getFormEndpoint(), []);

  useEffect(() => {
    trackEventOnce("keswick_page_view", { route: "/keswick-lower-priced-homes" });
    if (typeof window?.fbq === "function") window.fbq("track", "ViewContent", { content_name: "keswick-lower-priced-homes" });
    const onScroll = () => {
      const d = document.documentElement;
      const p = ((window.scrollY + window.innerHeight) / d.scrollHeight) * 100;
      if (p >= 75) trackEventOnce("keswick_scroll_75", { route: "/keswick-lower-priced-homes" });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jumpToForm = (intent) => {
    setForm((prev) => ({ ...prev, intent }));
    trackEvent("keswick_price_band_click", { intent });
    if (typeof window?.fbq === "function") window.fbq("track", "Search", { search_string: intent });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return setError("Please complete name and email.");
    trackEvent("keswick_form_start", { route: "/keswick-lower-priced-homes" });
    setSending(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => v && payload.append(k, v));
      const res = await fetch(formEndpoint, { method: "POST", body: payload, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("failed");
      setSuccess(true);
      trackEvent("keswick_lead_submit", { budget: form.budget, timeline: form.timeline, intent: form.intent });
      if (typeof window?.fbq === "function") window.fbq("track", "Lead", { content_name: "keswick-lower-priced-homes" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return <div className="bg-[#f7f6f1] pb-20 text-[#102218] md:pb-0"><DynamicMetaTags {...meta} />
    <Helmet>
      {/* TODO: if /Images/seo/keswick-lower-priced-homes-og.jpg is unavailable, configure a safe fallback OG image in staticRouteMetaConfigs.mjs. */}
      <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage",name:"More Buyers Are Suddenly Looking at Keswick",url:"https://northsidegta.ca/keswick-lower-priced-homes",description:meta.description})}</script>
      <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:"https://northsidegta.ca/"},{"@type":"ListItem",position:2,name:"Keswick Lower Priced Homes",item:"https://northsidegta.ca/keswick-lower-priced-homes"}]})}</script>
      <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"RealEstateAgent",name:"Finally Home Agents",alternateName:"NorthSide GTA",legalName:"Finally Home Agents | HomeLife Optimum Realty, Brokerage",areaServed:["Keswick","Georgina","York Region"],url:"https://northsidegta.ca"})}</script>
    </Helmet>
    <HeaderShell />
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-8 md:py-12">
      <section className="grid gap-6 rounded-3xl bg-[#12261c] p-6 text-white md:grid-cols-2 md:p-10">
        <div><p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Keswick Buyer Opportunity</p><h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">More Buyers Are Suddenly Looking at Keswick</h1><p className="mt-4 text-emerald-50">Some homes in Keswick and Georgina are now showing up in price ranges many GTA buyers stopped expecting to see in York Region. For buyers who have been priced out farther south, this is one of the NorthSide GTA markets worth watching closely.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => jumpToForm("Get Today’s Lower-Price Keswick List")} className="rounded-full bg-white px-6 py-3 font-semibold text-[#12261c]">Get Today’s Lower-Price Keswick List</button><button onClick={() => document.getElementById("price-bands")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full border border-white/60 px-6 py-3">Browse Price Bands</button></div><p className="mt-4 text-sm text-emerald-100">The right home still needs the right condition, location, and resale profile. Low price alone is not the strategy.</p><p className="mt-4 text-xs text-emerald-200">NorthSide GTA • Finally Home Agents • HomeLife Optimum Realty, Brokerage</p><p className="mt-2 text-xs text-emerald-100">Listings, prices, and availability change frequently. We will help you verify what is currently available before you make decisions.</p></div>
        <aside className="rounded-2xl border border-white/20 bg-white/10 p-6"><p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Current Buyer Watchlist</p><ul className="mt-4 space-y-2 text-sm">{["Lower price bands", "Price reductions", "Detached options", "First-time buyer fit", "York Region value", "Lake Simcoe lifestyle"].map((item) => <li key={item}>• {item}</li>)}</ul></aside>
      </section>

      <section id="price-bands"><h2 className="text-3xl font-semibold">Start with your budget</h2><p className="mt-2 max-w-3xl text-[#38453f]">The strongest opportunities usually become clearer when you look by price band, not just by town.</p><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{priceBands.map((band) => <article key={band.label} className="rounded-2xl border bg-white p-5"><h3 className="font-semibold">{band.label}</h3><p className="mt-2 text-sm text-[#48534e]">{band.copy}</p><button onClick={() => jumpToForm(band.label)} className="mt-4 text-sm font-medium underline">Send me matching homes</button></article>)}</div></section>

      <section ref={formRef} className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[1.4fr_1fr]"><div><h2 className="text-3xl font-semibold">Get the current Keswick lower-price list</h2><p className="mt-2 text-[#48534e]">Tell us your budget and we will send a focused list of current Keswick and Georgina homes that match what you are watching.</p>{success ? <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm">Request received. We will send the current Keswick list and any relevant lower-price opportunities that match your range.</p> : <form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-2">{["name", "email", "phone"].map((f) => <label key={f} className="text-sm">{f[0].toUpperCase() + f.slice(1)}{f === "phone" ? " (optional)" : ""}<input required={f !== "phone"} className="mt-1 w-full rounded-lg border p-2" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} /></label>)}<label className="text-sm">Budget range<select className="mt-1 w-full rounded-lg border p-2" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}><option value="">Select</option><option>Under $600K</option><option>$600K to $700K</option><option>$700K to $800K</option><option>$800K to $900K</option><option>Not sure yet</option></select></label><label className="text-sm">Desired home type<select className="mt-1 w-full rounded-lg border p-2" value={form.homeType} onChange={(e) => setForm({ ...form, homeType: e.target.value })}><option value="">Select</option><option>Detached</option><option>Semi-detached</option><option>Townhome</option><option>Bungalow</option><option>Condo</option><option>Not sure yet</option></select></label><label className="text-sm">Timeline<select className="mt-1 w-full rounded-lg border p-2" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })}><option value="">Select</option><option>Now</option><option>1–3 months</option><option>3–6 months</option><option>6+ months</option></select></label><label className="text-sm">Are you already working with a real estate agent?<select className="mt-1 w-full rounded-lg border p-2" value={form.workingWithAgent} onChange={(e) => setForm({ ...form, workingWithAgent: e.target.value })}><option>No</option><option>Yes</option></select></label>{form.workingWithAgent === "Yes" && <p className="md:col-span-2 rounded-lg bg-amber-50 p-3 text-sm">If you are already under contract with another real estate professional, please continue working with them directly.</p>}<input type="text" className="hidden" value={form.intent} readOnly name="selected_interest" /><input type="text" className="hidden" value={form.honeypot} onChange={(e) => setForm({ ...form, honeypot: e.target.value })} /><div className="md:col-span-2"><p className="text-xs text-gray-600">By submitting this form, you agree that Finally Home Agents may contact you about your home search. You can unsubscribe or opt out anytime.</p>{error && <p className="mt-1 text-sm text-red-700">{error}</p>}<button className="mt-3 rounded-full bg-[#12261c] px-6 py-3 font-semibold text-white">{sending ? "Sending..." : "Send Me the Keswick List"}</button></div></form>}</div><aside className="rounded-2xl border bg-[#f7f6f1] p-5 text-sm"><p className="font-semibold">Why buyers use this form</p><ul className="mt-3 space-y-2">{["No spam.", "Current listings only.", "Budget-specific.", "Local guidance.", "RECO-compliant advice."].map((item) => <li key={item}>• {item}</li>)}</ul></aside></section>

      <section><h2 className="text-3xl font-semibold">What buyers are noticing in Keswick right now</h2><p className="mt-2 text-[#3d4c45]">The opportunity is not that every home is a deal. It is that more buyers are comparing Keswick because the inventory mix can create options that feel harder to find farther south.</p><div className="mt-5 grid gap-4 md:grid-cols-2">{buyerInsights.map((item) => <article key={item.title} className="rounded-2xl border bg-white p-5"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm text-[#48534e]">{item.copy}</p></article>)}</div><blockquote className="mt-5 rounded-xl border-l-4 border-[#12261c] bg-white p-4 italic">Low price alone is not the strategy. The strategy is knowing which lower-priced homes are actually worth pursuing.</blockquote></section>

      <section><h2 className="text-3xl font-semibold">Georgina market snapshot · {MARKET_DATA.period}</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{marketStats.cards.map((card) => <article key={card.label} className="rounded-2xl border bg-white p-4"><p className="text-xs uppercase tracking-wide text-[#4f6058]">{card.label}</p><p className="mt-2 text-sm">{card.text}</p></article>)}</div><p className="mt-3 text-xs text-gray-600">Source: {MARKET_DATA.source}. {MARKET_DATA.homeType}. Keswick is included within the Georgina municipality figures. Confirm property-specific data before relying on it.</p></section>

      <section><h2 className="text-3xl font-semibold">What “lower-priced” really means in Keswick</h2><p className="mt-2 text-[#3d4c45]">A lower asking price can mean opportunity, but it can also mean trade-offs. Some homes need updates. Some have location compromises. Some are smaller than buyers expect. Some are simply priced closer to where today’s buyers are willing to act.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{lowerPricedMeaning.map((item) => <div key={item} className="rounded-xl border bg-white p-4 text-sm font-medium">{item}</div>)}</div><button onClick={() => jumpToForm("Help me separate opportunity from risk")} className="mt-4 rounded-full border border-[#12261c] px-5 py-2">Help me separate opportunity from risk</button></section>

      <section><h2 className="text-3xl font-semibold">Where Keswick sits in the NorthSide GTA</h2><p className="mt-2 text-[#3d4c45]">Keswick sits at the north end of the Highway 404 story, near Lake Simcoe and within Georgina. For buyers expanding their search north of Newmarket, it can change what their budget is able to do.</p><div className="mt-4 rounded-2xl border bg-white p-6"><div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">{["Toronto", "Highway 404", "Newmarket", "Aurora", "East Gwillimbury", "Keswick", "Lake Simcoe", "Georgina"].map((n) => <div key={n} className="rounded-lg bg-[#f7f6f1] p-3">{n}</div>)}</div></div><button onClick={() => jumpToForm("Compare my NorthSide options")} className="mt-4 rounded-full border px-5 py-2">Compare my NorthSide options</button></section>

      <section><h2 className="text-3xl font-semibold">Keswick vs. other north GTA options</h2><p className="mt-2 text-[#3d4c45]">The right choice depends on your budget, commute, home type, and lifestyle. Keswick should usually be compared against several nearby markets before you decide.</p><div className="mt-4 grid gap-4 md:grid-cols-2">{comparisonAreas.map((area) => <article key={area.title} className="rounded-2xl border bg-white p-4"><h3 className="font-semibold">{area.title}</h3><p className="mt-2 text-sm">{area.copy}</p></article>)}</div><button onClick={() => { trackEvent("keswick_compare_click", {}); if (typeof window?.fbq === "function") window.fbq("track", "Contact", { content_name: "compare-options" }); jumpToForm("Compare these areas for my budget"); }} className="mt-4 rounded-full border px-5 py-2">Compare these areas for my budget</button></section>

      <section><h2 className="text-3xl font-semibold">Why Keswick is more than a price conversation</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{lifestyleCards.map((item) => <div key={item} className="rounded-xl border bg-white p-4">{item}</div>)}</div></section>

      <section><h2 className="text-3xl font-semibold">Local guidance from Finally Home Agents</h2><p className="mt-2 text-[#3d4c45]">NorthSide GTA was built to help buyers understand the communities north of Toronto with more clarity. Finally Home Agents guide buyers through pricing, neighbourhood trade-offs, due diligence, offer strategy, and long-term fit.</p><p className="mt-2 text-sm">Matthew Mulhall, Real Estate Agent<br />Landon Mulhall, Real Estate Agent<br />HomeLife Optimum Realty, Brokerage</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{trustCards.map((item) => <div key={item} className="rounded-xl border bg-white p-4 text-sm">{item}</div>)}</div></section>

      <section><h2 className="text-3xl font-semibold">What clients value about working with us</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{CANONICAL_TESTIMONIALS.slice(0, 4).map((item) => <article key={item.id} className="rounded-2xl border bg-white p-5"><p className="text-sm">“{item.quote}”</p><p className="mt-3 text-xs text-gray-600">{item.name} • {item.date}</p></article>)}</div></section>

      <section className="rounded-3xl bg-[#12261c] p-6 text-white"><h2 className="text-3xl font-semibold">Want the actual list instead of scrolling portals?</h2><p className="mt-2 text-emerald-100">Tell us your price range and we will send current Keswick and Georgina homes that match what you are watching.</p><div className="mt-4 flex flex-wrap gap-3"><button onClick={() => jumpToForm("Send Me the Current List")} className="rounded-full bg-white px-5 py-2 font-medium text-[#12261c]">Send Me the Current List</button><a href="/contact" onClick={() => trackEvent("keswick_book_call_click", {})} className="rounded-full border border-white/60 px-5 py-2">Book a Buyer Strategy Call</a></div></section>

      <section><h2 className="text-3xl font-semibold">Popular Keswick searches buyers are making</h2><div className="mt-4 space-y-3">{searchIntentBlocks.map(([q, a]) => <details key={q} className="rounded-xl border bg-white p-4"><summary className="font-medium">{q}</summary><p className="mt-2 text-sm">{a}</p></details>)}</div></section>
      <section><h2 className="text-3xl font-semibold">FAQ</h2><div className="mt-4 space-y-3">{faqItems.map(([q, a]) => <details key={q} className="rounded-xl border bg-white p-4"><summary className="font-medium">{q}</summary><p className="mt-2 text-sm">{a}</p></details>)}</div></section>

      <section className="rounded-3xl bg-[#12261c] p-7 text-white"><h2 className="text-3xl font-semibold">Start watching Keswick properly</h2><p className="mt-2 text-emerald-100">Get a focused list of current lower-priced Keswick homes, price reductions, and buyer opportunities that match your budget.</p><div className="mt-4 flex flex-wrap gap-3"><button onClick={() => jumpToForm("Get Today’s Keswick List")} className="rounded-full bg-white px-5 py-2 text-[#12261c]">Get Today’s Keswick List</button><button onClick={() => jumpToForm("Talk Through My Budget")} className="rounded-full border border-white/60 px-5 py-2">Talk Through My Budget</button></div><p className="mt-5 text-xs text-emerald-100">Finally Home Agents | Matthew Mulhall, Real Estate Agent | Landon Mulhall, Real Estate Agent | HomeLife Optimum Realty, Brokerage. Not intended to solicit buyers or sellers currently under contract. Listing availability, prices, and market conditions change frequently and should be independently verified.</p></section>
    </main>

    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 md:hidden"><div className="mx-auto flex max-w-6xl gap-2"><button onClick={() => jumpToForm("Sticky Get List")} className="flex-1 rounded-full bg-[#12261c] px-3 py-2 text-sm font-medium text-white">Get List</button><a href="/contact" onClick={() => { trackEvent("keswick_book_call_click", { type: "phone" }); if (typeof window?.fbq === "function") window.fbq("track", "Contact", { channel: "phone" }); }} className="flex-1 rounded-full border px-3 py-2 text-center text-sm">Call</a><button onClick={() => jumpToForm("Sticky Compare Areas")} className="flex-1 rounded-full border px-3 py-2 text-sm">Compare Areas</button></div></div>
    <Footer />
  </div>;
}
