import React, { useMemo, useState } from "react";
import HeaderShell from "../components/HeaderShell";
import Footer from "../Footer";
import DynamicMetaTags from "../components/seo/DynamicMetaTags";
import { getFormEndpoint } from "../components/contact/contactConfig";

const ROUTE = "/listings/5670-thomas-drive-baldwin";
const CANONICAL = `https://www.northsidegta.ca${ROUTE}`;
const VIDEO_URL = "https://listings.wylieford.com/videos/019e1822-d5e0-70a4-bcad-11c5e77acb82";
const BRAND_URL = "https://listings.wylieford.com/sites/5670-thomas-drive-baldwin-on-l0e-1a0-24719268/branded";
const OG_IMAGE = "/Images/og-home.jpg";

const highlights = [
  ["Price", "$724,999"],
  ["MLS®", "N13113298"],
  ["Address", "5670 Thomas Drive, Baldwin, ON L0E 1A0"],
  ["Community", "Baldwin, Georgina"],
];

function ShowingForm() {
  const endpoint = useMemo(() => getFormEndpoint(), []);
  const [form, setForm] = useState({ name: "", email: "", phone: "", showingTime: "", notes: "", hasRealtor: "" });
  const [state, setState] = useState({ submitting: false, success: false, error: "" });

  const onChange = (event) => setForm((c) => ({ ...c, [event.target.name]: event.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 10) return "Please enter a valid phone number.";
    if (!form.showingTime.trim()) return "Please share your preferred showing day/time.";
    if (!form.hasRealtor) return "Please let us know whether you're working with a Realtor.";
    return "";
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (state.submitting) return;
    const validationError = validate();
    if (validationError) return setState({ submitting: false, success: false, error: validationError });
    if (form.hasRealtor === "yes") {
      return setState({
        submitting: false,
        success: false,
        error: "Since you’re already working with a Realtor, please contact your agent directly to arrange a showing for this property.",
      });
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
      payload.append("property_city", "Baldwin, Georgina");
      payload.append("property_province", "Ontario");
      payload.append("mls_number", "N13113298");
      payload.append("source_page", ROUTE);
      payload.append("lead_type", "Showing Request");
      payload.append("agent_status", "no");
      payload.append("inquiry_type", "listing_showing_request");

      const response = await fetch(endpoint, { method: "POST", body: payload, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Request failed");
      setState({ submitting: false, success: true, error: "" });
      setForm({ name: "", email: "", phone: "", showingTime: "", notes: "", hasRealtor: "" });
    } catch {
      setState({ submitting: false, success: false, error: "Something went wrong while sending your request. Please try again." });
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" name="name" placeholder="Name" value={form.name} onChange={onChange} />
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" name="email" placeholder="Email" type="email" value={form.email} onChange={onChange} />
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" name="showingTime" placeholder="Preferred showing day/time" value={form.showingTime} onChange={onChange} />
      </div>
      <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2.5" rows={4} name="notes" placeholder="Message / notes" value={form.notes} onChange={onChange} />
      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Are you currently working with another Realtor?</legend>
        <div className="mt-2 flex gap-4 text-sm">
          <label><input type="radio" name="hasRealtor" value="no" checked={form.hasRealtor === "no"} onChange={onChange} className="mr-2" />No</label>
          <label><input type="radio" name="hasRealtor" value="yes" checked={form.hasRealtor === "yes"} onChange={onChange} className="mr-2" />Yes</label>
        </div>
      </fieldset>
      {form.hasRealtor === "yes" && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Since you’re already working with a Realtor, please contact your agent directly to arrange a showing for this property.</p>}
      {state.error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.error}</p>}
      {state.success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Thanks — your showing request has been sent.</p>}
      <button type="submit" disabled={state.submitting || form.hasRealtor === "yes"} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{state.submitting ? "Sending..." : "Request a Showing"}</button>
    </form>
  );
}

export default function ThomasDriveListingPage() {
  return (
    <>
      <DynamicMetaTags route={ROUTE} documentTitle="5670 Thomas Drive, Baldwin | Presented by Finally Home Agents" title="5670 Thomas Drive, Baldwin | Presented by Finally Home Agents" description="Explore 5670 Thomas Drive in Baldwin, Georgina. View the walkthrough video, photos, floor plans, listing details, and request a showing with Finally Home Agents." canonicalUrl={CANONICAL} ogType="website" ogImage={OG_IMAGE} twitterCard="summary_large_image" twitterImage={OG_IMAGE} />
      <HeaderShell />
      <main className="bg-slate-950 text-white">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Presented by Finally Home Agents • NorthSide GTA</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">5670 Thomas Drive, Baldwin</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">A polished NorthSide listing experience featuring media, floor plans, and direct showing requests for MLS N13113298.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#request-showing" className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950">Request a Showing</a>
            <a href="#video" className="rounded-full border border-white/30 px-6 py-3 font-semibold">Watch the Video</a>
          </div>
        </section>

        <section id="video" className="bg-black/40 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold">Walkthrough Video</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <iframe title="5670 Thomas Drive walkthrough" src={VIDEO_URL} className="aspect-video w-full" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" />
            </div>
          </div>
        </section>

        <section className="bg-white py-14 text-slate-900">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold">Listing Highlights</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{highlights.map(([l,v]) => <div key={l} className="rounded-2xl border border-slate-200 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">{l}</p><p className="mt-2 font-semibold">{v}</p></div>)}</div>
            <p className="mt-4 text-sm text-slate-600">Additional property details, photos, and floor plans are available in the branded listing media package.</p>
          </div>
        </section>

        <section className="bg-slate-100 py-14 text-slate-900">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold">Photos & Floor Plans</h2>
            <p className="mt-3 max-w-3xl text-slate-700">Browse the full photo gallery and floor plans from the official branded media page.</p>
            <a href={BRAND_URL} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 font-semibold text-white">Open Branded Media Gallery</a>
          </div>
        </section>

        <section className="bg-white py-14 text-slate-900">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <h2 className="text-2xl font-semibold">Property Story</h2>
              <p className="mt-4 text-slate-700">5670 Thomas Drive offers a rare Baldwin setting with practical ownership value in Georgina. This page is designed to help you review the walkthrough, media, and showing logistics in one place before booking your visit.</p>
              <h3 className="mt-8 text-xl font-semibold">Location</h3>
              <p className="mt-3 text-slate-700">Set in Baldwin within Georgina, the property gives you NorthSide GTA access with a quieter pace and room to breathe, while still keeping everyday connections to surrounding communities.</p>
            </div>
            <div id="request-showing" className="rounded-3xl border border-slate-200 p-6 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Showing Request</p>
              <h2 className="mt-2 text-2xl font-semibold">Book your private showing</h2>
              <p className="mt-2 text-sm text-slate-600">Presented by Matthew Mulhall and Landon Mulhall, Finally Home Agents — HomeLife Optimum Realty.</p>
              <div className="mt-6"><ShowingForm /></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
