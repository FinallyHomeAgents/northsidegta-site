import React, { useMemo, useState } from "react";
import HeaderShell from "../components/HeaderShell";
import Footer from "../Footer";
import DynamicMetaTags from "../components/seo/DynamicMetaTags";
import { getFormEndpoint } from "../components/contact/contactConfig";

const ROUTE = "/listings/5670-thomas-drive-baldwin";
const CANONICAL = `https://www.northsidegta.ca${ROUTE}`;
const VIDEO_URL = "https://listings.wylieford.com/videos/019e1822-d5e0-70a4-bcad-11c5e77acb82";
const BRAND_URL = "https://listings.wylieford.com/sites/5670-thomas-drive-baldwin-on-l0e-1a0-24719268/branded";
const OG_IMAGE = "https://www.northsidegta.ca/Images/n12542736_1.jpg";

const statPills = [
  ["Bedrooms", "2"],
  ["Bathrooms", "1"],
  ["Property Type", "Detached Bungalow"],
  ["Parking", "5 spaces + detached garage"],
  ["Lot", "188.6 x 91.04 ft"],
  ["Taxes", "$4,334 / year"],
  ["Basement", "Unfinished"],
];

const detailsSections = [
  {
    title: "Property Details",
    rows: [["Address", "5670 Thomas Drive, Baldwin, ON L0E 1A0"], ["Price", "$724,999"], ["MLS®", "N13113298"], ["Community", "Baldwin, Georgina"]],
  },
  {
    title: "Interior",
    rows: [["Bedrooms", "2"], ["Bathrooms", "1"], ["Basement", "Unfinished"], ["Laundry", "Main floor"]],
  },
  {
    title: "Exterior / Lot",
    rows: [["Style", "Detached bungalow"], ["Lot Size", "188.6 x 91.04 ft"], ["Parking", "5 total spaces"], ["Garage", "Detached garage with separate workshop/storage"]],
  },
  {
    title: "Utilities / Systems",
    rows: [["Heating", "Forced-air propane (high efficiency furnace)"], ["Cooling", "Central air"], ["Windows / Updates", "Windows updated in 2020"]],
  },
  {
    title: "MLS Remarks / Description",
    rows: [["Summary", "Updated bungalow with 2+1 bedrooms, modern eat-in kitchen, large family room, enclosed mudroom, main floor laundry, private yard space, and detached garage/workshop."], ["Noted updates", "Bathroom, flooring, paint, windows, and furnace updates noted in listing history; kitchen update noted in 2025."]],
  },
];

function ShowingForm() {
  const endpoint = useMemo(() => getFormEndpoint(), []);
  const [form, setForm] = useState({ name: "", email: "", phone: "", showingTime: "", notes: "", hasRealtor: "" });
  const [state, setState] = useState({ submitting: false, success: false, error: "" });
  const onChange = (event) => setForm((c) => ({ ...c, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    if (state.submitting) return;
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim()) || form.phone.replace(/\D/g, "").length < 10 || !form.showingTime.trim() || !form.hasRealtor) {
      return setState({ submitting: false, success: false, error: "Please complete all required fields with valid contact details." });
    }
    if (form.hasRealtor === "yes") {
      return setState({ submitting: false, success: false, error: "Since you’re already working with a Realtor, please contact your agent directly to arrange a showing for this property." });
    }
    try {
      setState({ submitting: true, success: false, error: "" });
      const payload = new FormData();
      payload.append("first_name", form.name.trim().split(" ")[0] || form.name.trim());
      payload.append("last_name", form.name.trim().split(" ").slice(1).join(" "));
      payload.append("email", form.email.trim());
      payload.append("phone", form.phone.trim());
      payload.append("message", `Preferred showing day/time: ${form.showingTime.trim()}\n\nNotes: ${form.notes.trim()}`);
      payload.append("property_address", "5670 Thomas Drive");
      payload.append("mls_number", "N13113298");
      payload.append("source_page", ROUTE);
      payload.append("lead_type", "Showing Request");
      payload.append("inquiry_type", "listing_showing_request");
      const response = await fetch(endpoint, { method: "POST", body: payload, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Request failed");
      setState({ submitting: false, success: true, error: "" });
      setForm({ name: "", email: "", phone: "", showingTime: "", notes: "", hasRealtor: "" });
    } catch {
      setState({ submitting: false, success: false, error: "Something went wrong while sending your request. Please try again." });
    }
  };

  return <form className="space-y-4" onSubmit={onSubmit}>{/* inputs */}
    <div className="grid gap-4 sm:grid-cols-2">
      <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" name="name" placeholder="Name" value={form.name} onChange={onChange} />
      <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" name="email" placeholder="Email" type="email" value={form.email} onChange={onChange} />
      <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
      <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" name="showingTime" placeholder="Preferred day/time" value={form.showingTime} onChange={onChange} />
    </div>
    <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2.5" rows={4} name="notes" placeholder="Message / notes" value={form.notes} onChange={onChange} />
    <fieldset><legend className="text-sm font-semibold text-slate-700">Are you currently working with another Realtor?</legend><div className="mt-2 flex gap-4"><label><input type="radio" name="hasRealtor" value="no" checked={form.hasRealtor === "no"} onChange={onChange} className="mr-2"/>No</label><label><input type="radio" name="hasRealtor" value="yes" checked={form.hasRealtor === "yes"} onChange={onChange} className="mr-2"/>Yes</label></div></fieldset>
    {form.hasRealtor === "yes" && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Since you’re already working with a Realtor, please contact your agent directly to arrange a showing for this property.</p>}
    {state.error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.error}</p>}
    {state.success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Thanks — your showing request has been sent.</p>}
    <button type="submit" disabled={state.submitting || form.hasRealtor === "yes"} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{state.submitting ? "Sending..." : "Request a Showing"}</button>
  </form>;
}

export default function ThomasDriveListingPage() {
  const seoTitle = "5670 Thomas Drive, Baldwin ON Detached Bungalow for Sale | Finally Home Agents";
  const seoDescription =
    "Discover 5670 Thomas Drive in Baldwin (Georgina): a detached bungalow on a generous lot with updated kitchen and windows, detached garage/workshop, and practical main-floor living. Watch the video tour, browse photos, and request your private showing with Finally Home Agents.";
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        "@id": `${CANONICAL}#listing`,
        url: CANONICAL,
        name: "5670 Thomas Drive, Baldwin ON - Detached Bungalow for Sale",
        description: seoDescription,
        datePosted: "2026-05-12",
        image: [OG_IMAGE],
        mainEntity: { "@id": `${CANONICAL}#residence` },
        offers: {
          "@type": "Offer",
          price: 724999,
          priceCurrency: "CAD",
          availability: "https://schema.org/InStock",
          url: CANONICAL,
        },
        provider: {
          "@type": "RealEstateAgent",
          name: "Finally Home Agents",
          url: "https://www.northsidegta.ca/",
        },
      },
      {
        "@type": "SingleFamilyResidence",
        "@id": `${CANONICAL}#residence`,
        name: "5670 Thomas Drive, Baldwin ON",
        description: "Detached bungalow in Baldwin, Georgina with detached garage/workshop.",
        image: [OG_IMAGE],
        numberOfBedrooms: 2,
        numberOfBathroomsTotal: 1,
        address: {
          "@type": "PostalAddress",
          streetAddress: "5670 Thomas Drive",
          addressLocality: "Baldwin",
          addressRegion: "ON",
          postalCode: "L0E 1A0",
          addressCountry: "CA",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${CANONICAL}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.northsidegta.ca/" },
          { "@type": "ListItem", position: 2, name: "Listings", item: "https://www.northsidegta.ca/listings" },
          { "@type": "ListItem", position: 3, name: "5670 Thomas Drive, Baldwin", item: CANONICAL },
        ],
      },
    ],
  };

  return <>
    <DynamicMetaTags
      route={ROUTE}
      documentTitle={seoTitle}
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={CANONICAL}
      ogType="website"
      ogImage={OG_IMAGE}
      ogImageAlt="Front exterior of 5670 Thomas Drive, Baldwin ON detached bungalow for sale."
      twitterCard="summary_large_image"
      twitterImage={OG_IMAGE}
      twitterTitle={seoTitle}
      twitterDescription={seoDescription}
      additionalMeta={[{ property: "og:url", content: CANONICAL }]}
    >
      <script type="application/ld+json">{JSON.stringify(schemaGraph)}</script>
    </DynamicMetaTags>
    <HeaderShell />
    <main className="bg-slate-950 text-white pb-16">
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Presented by Finally Home Agents • NorthSide GTA</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">5670 Thomas Drive, Baldwin ON Detached Bungalow for Sale</h1>
            <p className="mt-4 text-3xl font-bold text-emerald-300">$724,999</p>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-slate-300">MLS N13113298</p>
            <p className="mt-4 max-w-xl text-slate-200">A detached bungalow in Baldwin, Georgina featuring an updated eat-in kitchen, modernized windows, detached garage/workshop, and a large lot with private outdoor space designed for practical everyday living.</p>
            <div className="mt-6 flex flex-wrap gap-3"><a href="#request-showing" className="rounded-full bg-emerald-400 px-5 py-2.5 font-semibold text-slate-950">Request a Showing</a><a href="#video" className="rounded-full border border-white/25 px-5 py-2.5 font-semibold">Watch Video</a><a href={BRAND_URL} target="_blank" rel="noreferrer" className="rounded-full border border-white/25 px-5 py-2.5 font-semibold">View Photos</a></div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">{statPills.map(([k,v]) => <div key={k} className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{k}</p><p className="mt-1 text-sm font-semibold">{v}</p></div>)}</div>
          </div>
          <div id="video" className="rounded-2xl border border-white/20 bg-black/60 p-3 shadow-2xl shadow-black/50"><div className="overflow-hidden rounded-xl border border-white/10"><iframe title="5670 Thomas Drive walkthrough" src={VIDEO_URL} className="aspect-video w-full lg:aspect-[4/3]" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" /></div></div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Listing Details</h2>
        <p className="mt-2 text-sm text-slate-300">Structured fields and remarks are shown from the public listing data available for MLS N13113298 and related listing feeds.</p>
        <div className="mt-6 space-y-3">{detailsSections.map((section) => <details key={section.title} className="rounded-xl border border-white/15 bg-white/5 p-4"><summary className="cursor-pointer list-none text-base font-semibold">{section.title}</summary><div className="mt-4 grid gap-2 sm:grid-cols-2">{section.rows.map(([k,v]) => <div key={k} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2"><p className="text-xs uppercase tracking-[0.14em] text-slate-400">{k}</p><p className="mt-1 text-sm text-slate-100">{v}</p></div>)}</div></details>)}</div>
      </section>

      <section className="mx-auto mt-14 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold">Location</h2>
          <p className="mt-3 text-slate-300">Baldwin sits within Georgina’s northside area, offering a quieter setting with larger properties while still connecting easily to nearby communities for schools, shopping, and daily amenities.</p>
          <a href={BRAND_URL} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 font-semibold text-slate-900">Open full branded media package</a>
        </div>
        <div id="request-showing" className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Showing Request</p>
          <h2 className="mt-2 text-2xl font-semibold">Request your private showing</h2>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Presented by Finally Home Agents</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <article className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <img src="/Images/matthew.jpg" alt="Headshot of Matthew Mulhall." className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Matthew Mulhall</p>
                  <p className="text-xs text-slate-600">Real Estate Agent</p>
                </div>
              </article>
              <article className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <img src="/Images/landon.jpg" alt="Headshot of Landon Mulhall." className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Landon Mulhall</p>
                  <p className="text-xs text-slate-600">Real Estate Agent</p>
                </div>
              </article>
            </div>
            <p className="mt-3 text-xs text-slate-600">HomeLife Optimum Realty</p>
          </div>
          <div className="mt-5"><ShowingForm /></div>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
