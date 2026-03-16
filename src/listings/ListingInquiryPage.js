import React, { useMemo, useState } from "react";
import HeaderShell from "../components/HeaderShell";
import Footer from "../Footer";
import DynamicMetaTags from "../components/seo/DynamicMetaTags";
import { getFormEndpoint } from "../components/contact/contactConfig";

const VALUE_POINTS = [
  "Prompt answers and straightforward communication",
  "Clear property information you can rely on",
  "Local market knowledge across NorthSide GTA communities",
  "Professional showing coordination",
  "Experienced guidance through practical next steps",
];

function DetailChip({ label, value }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function TeamContactCard({ team }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100/60">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Contact Finally Home Agents</p>
      <p className="mt-3 text-sm text-slate-700">
        Phone: <a className="font-semibold text-emerald-700 hover:text-emerald-800" href={`tel:${team.phone.replace(/[^\d+]/g, "")}`}>{team.phone}</a>
      </p>
      <p className="mt-1 text-sm text-slate-700">
        Email: <a className="font-semibold text-emerald-700 hover:text-emerald-800" href={`mailto:${team.email}`}>{team.email}</a>
      </p>
      <p className="mt-4 text-sm font-medium text-slate-800">{team.members.map((member) => member.name).join(" • ")}</p>
      <p className="text-sm text-slate-600">{team.brokerage}</p>
    </div>
  );
}

function ListingInquiryForm({ config, agentStatus }) {
  const endpoint = useMemo(() => getFormEndpoint(), []);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
    requestDetails: true,
    requestShowing: false,
    confirmNoOtherBrokerage: false,
  });
  const [state, setState] = useState({ submitting: false, success: false, error: "" });

  const onChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 10) return "Please enter a valid phone number.";
    if (!form.requestDetails && !form.requestShowing) return "Please choose at least one request option.";
    if (!form.confirmNoOtherBrokerage) return "Please confirm your brokerage status before submitting.";
    return "";
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (state.submitting) return;

    const validationError = validate();
    if (validationError) {
      setState({ submitting: false, success: false, error: validationError });
      return;
    }

    try {
      setState({ submitting: true, success: false, error: "" });
      const payload = new FormData();
      payload.append("first_name", form.firstName.trim());
      payload.append("last_name", form.lastName.trim());
      payload.append("email", form.email.trim());
      payload.append("phone", form.phone.trim());
      payload.append("message", form.notes.trim());
      payload.append("request_details", form.requestDetails ? "Yes" : "No");
      payload.append("request_showing", form.requestShowing ? "Yes" : "No");
      payload.append("brokerage_confirmation", form.confirmNoOtherBrokerage ? "Confirmed" : "Not confirmed");
      payload.append("property_address", config.property.headlineAddress);
      payload.append("property_city", config.property.cityLine);
      payload.append("property_province", config.property.province);
      payload.append("mls_number", config.property.mls);
      payload.append("source_page", config.route);
      payload.append("agent_status", agentStatus || "not-selected");
      payload.append("inquiry_type", "listing_inquiry");

      const response = await fetch(endpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Request failed");

      setState({ submitting: false, success: true, error: "" });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: "",
        requestDetails: true,
        requestShowing: false,
        confirmNoOtherBrokerage: false,
      });
    } catch {
      setState({
        submitting: false,
        success: false,
        error: "Something went wrong while sending your request. Please try again.",
      });
    }
  };

  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/50 sm:p-8" id="request-details">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Request details or a private showing</h2>
      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            First name
            <input name="firstName" value={form.firstName} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none ring-emerald-200 transition focus:border-emerald-500 focus:ring" autoComplete="given-name" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Last name
            <input name="lastName" value={form.lastName} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none ring-emerald-200 transition focus:border-emerald-500 focus:ring" autoComplete="family-name" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email
            <input name="email" type="email" value={form.email} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none ring-emerald-200 transition focus:border-emerald-500 focus:ring" autoComplete="email" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone
            <input name="phone" value={form.phone} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none ring-emerald-200 transition focus:border-emerald-500 focus:ring" autoComplete="tel" />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Questions or timing
          <textarea name="notes" value={form.notes} onChange={onChange} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none ring-emerald-200 transition focus:border-emerald-500 focus:ring" />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">What would you like next?</legend>
          <div className="mt-2 space-y-2">
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2">
              <input type="checkbox" name="requestDetails" checked={form.requestDetails} onChange={onChange} className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400" />
              <span className="text-sm text-slate-700">Send me the full listing details</span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2">
              <input type="checkbox" name="requestShowing" checked={form.requestShowing} onChange={onChange} className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400" />
              <span className="text-sm text-slate-700">I’d like to book a private showing</span>
            </label>
          </div>
        </fieldset>

        <div className="rounded-xl border border-slate-200 px-3 py-3">
          <label htmlFor="confirmNoOtherBrokerage" className="flex items-start gap-3 text-sm text-slate-700">
            <input
              id="confirmNoOtherBrokerage"
              type="checkbox"
              name="confirmNoOtherBrokerage"
              checked={form.confirmNoOtherBrokerage}
              onChange={onChange}
              required
              aria-required="true"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
            />
            <span>I confirm that I am not currently under contract with another real estate brokerage.</span>
          </label>
        </div>

        {state.error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{state.error}</p>}
        {state.success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Thanks — we received your request and will follow up shortly.</p>}

        <button type="submit" disabled={state.submitting} className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
          {state.submitting ? "Sending..." : "Send Request"}
        </button>
        <p className="text-xs text-slate-500">By submitting this form, you agree to be contacted regarding this property inquiry.</p>
      </form>
    </section>
  );
}

export default function ListingInquiryPage({ config }) {
  const [agentStatus, setAgentStatus] = useState("");

  const showExpandedContent = agentStatus === "no";
  const showAgentMessage = agentStatus === "yes";

  return (
    <>
      <DynamicMetaTags
        route={config.route}
        documentTitle={config.pageTitle}
        title={config.pageTitle}
        description={config.seoDescription}
        canonicalUrl={`https://northsidegta.ca${config.route}`}
        ogType="website"
        ogImage={config.ogImage}
        twitterCard="summary_large_image"
        twitterImage={config.ogImage}
      />
      <HeaderShell />
      <main className="bg-slate-50 pb-20">
        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50 p-6 shadow-2xl shadow-emerald-100/50 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Property Inquiry</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{config.intro.title}</h1>
                <p className="mt-4 max-w-2xl text-base text-slate-700 sm:text-lg">{config.intro.subtitle}</p>
                <p className="mt-4 text-sm font-medium text-slate-600">{config.intro.prompt}</p>
              </div>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
                {config.property.imageSrc ? (
                  <img
                    src={config.property.imageSrc}
                    alt={config.property.imageAlt || `${config.property.headlineAddress} listing photo`}
                    className="h-40 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800" aria-hidden />
                )}
                <div className="mt-4 grid gap-3">
                  <DetailChip label="Address" value={config.property.headlineAddress} />
                  <DetailChip label="Location" value={`${config.property.cityLine}, ${config.property.province}`} />
                  <DetailChip label="MLS®" value={config.property.mls} />
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Are you currently working with a real estate agent?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                className={`rounded-2xl border p-5 text-left transition ${agentStatus === "yes" ? "border-emerald-600 bg-emerald-50 shadow-md" : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"}`}
                onClick={() => setAgentStatus("yes")}
              >
                <p className="text-base font-semibold text-slate-900">Yes, I’m already working with an agent</p>
              </button>
              <button
                type="button"
                className={`rounded-2xl border p-5 text-left transition ${agentStatus === "no" ? "border-emerald-600 bg-emerald-50 shadow-md" : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"}`}
                onClick={() => setAgentStatus("no")}
              >
                <p className="text-base font-semibold text-slate-900">No, I’m not currently represented</p>
              </button>
            </div>

            {showAgentMessage && (
              <div className="mt-6 space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                <p className="text-sm leading-6 text-slate-700">No problem — if you’re already working with a real estate agent, please have them contact us directly and we’ll be happy to provide full details and arrange a showing.</p>
                <TeamContactCard team={config.team} />
              </div>
            )}
          </div>
        </section>

        <div className={`mx-auto mt-10 max-w-6xl space-y-8 px-4 transition-all duration-500 sm:px-6 lg:px-8 ${showExpandedContent ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Important information about this property</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700 sm:text-base">
              <p>Finally Home Agents represent the seller of this property. If you choose to pursue this home, our role in the transaction may differ from the role we would have when exclusively representing a buyer.</p>
              <p>We are happy to answer questions, provide information about the property, and help arrange a showing.</p>
              <p>Representation relationships, including any required disclosures and consents, would be explained clearly before any offer is submitted.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">What you can expect from us</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {VALUE_POINTS.map((point) => (
                <div key={point} className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-slate-700">{point}</div>
              ))}
            </div>
          </section>

          <ListingInquiryForm config={config} agentStatus={agentStatus} />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Finally Home Agents</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">{config.team.summary}</p>
            <p className="mt-3 text-sm font-medium text-slate-700">{config.team.brokerage}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {config.team.members.map((member) => (
                <article key={member.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {member.imageSrc ? (
                    <img
                      src={member.imageSrc}
                      alt={member.imageAlt || `Headshot of ${member.name}`}
                      className="h-auto w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-32 rounded-xl border border-dashed border-slate-300 bg-white" aria-label={`${member.name} headshot placeholder`} />
                  )}
                  <p className="mt-3 text-base font-semibold text-slate-900">{member.name}</p>
                  <p className="text-sm text-slate-600">{member.role}</p>
                </article>
              ))}
            </div>
          </section>

          <p className="pb-2 text-center text-xs text-slate-500 sm:text-sm">Representation relationships will be explained in accordance with Ontario real estate rules before any offer is submitted.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
