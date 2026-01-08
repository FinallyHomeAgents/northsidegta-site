import React, { useMemo, useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import { buildBuyersPageSchema } from "./lib/structuredData/buyersPage";
import { trackEvent } from "./utils/analytics";

const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const phoneOk = (value) => value.replace(/\D/g, "").length >= 10;

const BUYERS_ROUTE_META = getStaticRouteMeta("/buyers") || {};

const US_PATH = [
  "Start with your goals and priorities before we open any doors.",
  "Build a focused plan with NorthSide GTA market insight.",
  "Get clear next steps for tours, offers, and timing.",
  "Move forward with confidence and calm communication.",
];

const THEM_PATH = [
  "Explore agent options independently.",
  "Rely on broad listing feeds and general outreach.",
  "Create your own approach without a defined strategy.",
  "Decide next steps as you go.",
];

const BENEFITS = [
  {
    title: "Goal-first clarity",
    detail: "We align on budget, lifestyle, and timeline so every decision serves your plan.",
  },
  {
    title: "NorthSide GTA intelligence",
    detail: "Local pricing context, neighbourhood nuance, and honest guidance for buyers moving north.",
  },
  {
    title: "Offer strategy",
    detail: "Clear paths for negotiation, conditions, and timing—before you submit anything.",
  },
  {
    title: "Communication you can count on",
    detail: "Structured updates, fast answers, and an agent who plays the long game with you.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We finally felt clear on where to buy. The strategy call turned our wish list into a real plan.",
    name: "Natalie & Amir, first-time buyers",
  },
  {
    quote:
      "Every step felt intentional. We knew why we were touring a home and what the next move was.",
    name: "Samantha P., NorthSide GTA move-up buyer",
  },
  {
    quote:
      "The process was calm and organized. We never felt rushed or unsure.",
    name: "Priya K., relocation buyer",
  },
];

const FAQS = [
  {
    question: "What happens after I submit the Buyer Brief?",
    answer:
      "We review your goals and follow up to confirm priorities, timing, and the right next steps for your search.",
  },
  {
    question: "Do I need to be pre-approved before we start?",
    answer:
      "Not required, but it helps. We can connect you with trusted lenders if you want a clearer budget range.",
  },
  {
    question: "How do you help me choose the right NorthSide GTA area?",
    answer:
      "We match lifestyle needs to local insights—commute, schools, price trends, and the feel of each town.",
  },
  {
    question: "Is there any pressure to buy right away?",
    answer:
      "No. The goal is clarity and a plan so you can move when the timing is right for you.",
  },
];

function BuyersHero({ onStartBrief, onBookCall }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(50,97,14,0.35),_transparent_70%)]" aria-hidden />
      <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl" aria-hidden />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-14 pt-20 sm:px-6 lg:px-8 lg:pt-24">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">Finally Home Agents</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Buy with purpose. Plan to win.
          </h1>
          <p className="mt-4 text-lg text-emerald-100/80">
            A focused buyer strategy built on clarity, confidence, and NorthSide GTA expertise. Winners focus on winning—
            strategy first, action second.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={onStartBrief}
            className="inline-flex items-center justify-center rounded-lg bg-[#32610E] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(50,97,14,0.4)] transition hover:bg-[#2b530c] focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Start Your Buyer Brief
          </button>
          <button
            type="button"
            onClick={onBookCall}
            className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            Book a Buyer Strategy Call
          </button>
        </div>
      </div>
    </section>
  );
}

function ChoiceArchitecture() {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_32px_90px_rgba(4,17,12,0.45)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">Two Ways to Proceed</p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">A clear choice for serious buyers</h2>
          <p className="mt-3 text-base text-emerald-100/80">
            Choose the path that matches how you want to buy—structured strategy with Finally Home Agents, or a more
            independent route.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">US — Our Buyer Strategy Path</p>
          <ul className="mt-4 space-y-3 text-sm text-white">
            {US_PATH.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/70">THEM — Independent Buyer Path</p>
          <ul className="mt-4 space-y-3 text-sm text-emerald-100/80">
            {THEM_PATH.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function BuyerBriefForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    preferredAreas: "",
    budgetRange: "",
    timeframe: "",
    nickname: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef(null);

  const formspreeId = useMemo(() => {
    const fromEnv = (process.env.REACT_APP_FORMSPREE_BUYERS_ID || "").trim();
    return fromEnv || "xanbzajw";
  }, []);

  const requiredChecks = {
    fullName: !!form.fullName.trim(),
    email: !!form.email.trim() && emailOk(form.email),
    phone: !!form.phone.trim() && phoneOk(form.phone),
    preferredAreas: !!form.preferredAreas.trim(),
    budgetRange: !!form.budgetRange.trim(),
    timeframe: !!form.timeframe.trim(),
  };

  const requiredOk = Object.values(requiredChecks).every(Boolean);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (form.nickname) return;

    if (!requiredOk) {
      setError("Please complete the required fields.");
      errorRef.current?.focus();
      return;
    }

    if (!formspreeId) {
      setError("Form configuration is missing. Please try again later.");
      errorRef.current?.focus();
      return;
    }

    setSending(true);
    setError("");

    trackEvent("Buyer Brief Submitted", { route: "/buyers" });

    try {
      const endpoint = `https://formspree.io/f/${formspreeId}`;
      const payload = new FormData();
      payload.append("fullName", form.fullName.trim());
      payload.append("email", form.email.trim());
      payload.append("phone", form.phone.trim());
      payload.append("preferredAreas", form.preferredAreas.trim());
      payload.append("budgetRange", form.budgetRange.trim());
      payload.append("timeframe", form.timeframe.trim());
      payload.append("source", "buyer-brief");

      const response = await fetch(endpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setDone(true);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        preferredAreas: "",
        budgetRange: "",
        timeframe: "",
        nickname: "",
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
      errorRef.current?.focus();
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 text-white shadow-[0_24px_80px_rgba(4,17,12,0.4)] backdrop-blur">
        <h3 className="text-xl font-semibold">Thanks! Your buyer plan is in motion.</h3>
        <p className="mt-2 text-sm text-emerald-100/85">
          We’ll review your brief and follow up with next steps for a focused NorthSide GTA plan.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <label className="block text-sm">
        <span className="text-emerald-100/80">Full Name *</span>
        <input
          name="fullName"
          value={form.fullName}
          onChange={updateField}
          className="mt-1 w-full rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-emerald-100/80">Email *</span>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={updateField}
          className="mt-1 w-full rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-emerald-100/80">Phone *</span>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={updateField}
          className="mt-1 w-full rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-emerald-100/80">Preferred Area(s) *</span>
        <input
          name="preferredAreas"
          value={form.preferredAreas}
          onChange={updateField}
          className="mt-1 w-full rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Uxbridge, Stouffville, Georgina…"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-emerald-100/80">Budget Range *</span>
        <input
          name="budgetRange"
          value={form.budgetRange}
          onChange={updateField}
          className="mt-1 w-full rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="$750k–$950k"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-emerald-100/80">Timeframe to Buy *</span>
        <select
          name="timeframe"
          value={form.timeframe}
          onChange={updateField}
          className="mt-1 w-full rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          required
        >
          <option value="">Select one</option>
          <option value="0-3 months">0–3 months</option>
          <option value="3-6 months">3–6 months</option>
          <option value="6-12 months">6–12 months</option>
          <option value="12+ months">12+ months</option>
        </select>
      </label>
      <label className="hidden">
        <span>Nickname</span>
        <input name="nickname" value={form.nickname} onChange={updateField} />
      </label>

      {error && (
        <p ref={errorRef} tabIndex={-1} className="text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center rounded-lg bg-[#32610E] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(50,97,14,0.35)] transition hover:bg-[#2b530c] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Submitting…" : "Begin My Buyer Plan"}
        </button>
        <p className="text-xs text-emerald-100/70">
          Your information is private. We follow best practice standards and only contact you about your buyer goals.
        </p>
      </div>
    </form>
  );
}

function PhilosophySection() {
  return (
    <section className="grid gap-8 rounded-[32px] border border-white/10 bg-white/5 p-8 md:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">Strategic Philosophy</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          The athlete–agent mindset: plan with purpose before action.
        </h2>
        <p className="mt-4 text-base text-emerald-100/80">
          We treat your buying process like preparing for a championship — strategy first, clarity always. Winners
          focus on winning, and your plan is built before you step into competition.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-6 text-sm text-emerald-100/85">
        <p className="text-base font-semibold text-white">"Plan with purpose before action."</p>
        <p className="mt-3">
          That means clear goals, confident timelines, and a structured game plan tailored to the NorthSide GTA market.
        </p>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">How we help buyers</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Clarity, strategy, and local insight</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
            <p className="mt-2 text-sm text-emerald-100/80">{benefit.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">Buyer testimonials</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Clarity and confidence from real buyers</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-emerald-100/85">
            <p className="text-base text-white">“{item.quote}”</p>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-emerald-100/70">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">FAQ</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Process questions, answered</h2>
      </div>
      <div className="space-y-4">
        {FAQS.map((item) => (
          <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-base font-semibold text-white">{item.question}</h3>
            <p className="mt-2 text-sm text-emerald-100/80">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StrategyCallSection({ onBookCall }) {
  return (
    <section id="strategy-call" className="rounded-[28px] border border-white/10 bg-white/5 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Prefer a live strategy session?</h2>
          <p className="mt-2 text-sm text-emerald-100/80">
            Get guided clarity before you submit a brief. We’ll confirm a time that works for you.
          </p>
        </div>
        <a
          href="/contact?intent=buyer-strategy-call"
          onClick={onBookCall}
          className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          Schedule a Buyer Strategy Call
        </a>
      </div>
    </section>
  );
}

function StickyCtaBar({ onStartBrief, onBookCall }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      if (maxScroll <= 0) {
        setVisible(false);
        return;
      }
      setVisible(scrollTop >= maxScroll * 0.2);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:pb-6">
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-[#05180f]/95 p-4 text-white shadow-[0_20px_60px_rgba(4,17,12,0.55)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-emerald-50/90 sm:text-base">Ready for a focused buyer plan?</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onStartBrief}
            className="inline-flex items-center justify-center rounded-lg bg-[#32610E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(50,97,14,0.35)] transition hover:bg-[#2b530c] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Start Your Buyer Plan
          </button>
          <button
            type="button"
            onClick={onBookCall}
            className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            Book Strategy Call
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuyersPage() {
  const buyersSchema = useMemo(() => buildBuyersPageSchema(), []);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleStartBrief = () => {
    trackEvent("Buyer Brief Started", { route: "/buyers" });
    scrollToId("buyer-brief");
  };

  const handleBookCall = (event) => {
    trackEvent("Buyer Strategy Call Clicked", { route: "/buyers" });
    if (event?.currentTarget?.tagName !== "A") {
      scrollToId("strategy-call");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#04110c] text-white">
      <HeaderShell />
      <DynamicMetaTags {...BUYERS_ROUTE_META}>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name:
              BUYERS_ROUTE_META.title ||
              "Buy a Home in the NorthSide GTA | Town Match, VIP Alerts & Expert Agents",
            url: BUYERS_ROUTE_META.canonicalUrl || "https://northsidegta.ca/buyers",
            description:
              "Focused buyer strategy, NorthSide GTA expertise, and clarity-first planning from Finally Home Agents.",
            about: {
              "@type": "RealEstateAgent",
              name: "Finally Home Agents",
              areaServed: [
                "Georgina",
                "East Gwillimbury",
                "Newmarket",
                "Aurora",
                "Stouffville",
                "Uxbridge",
                "Scugog",
              ],
              url: "https://northsidegta.ca",
              brand: "Finally Home Agents",
            },
          })}
        </script>
      </DynamicMetaTags>

      {buyersSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(buyersSchema, null, 2)}</script>
        </Helmet>
      )}

      <main className="relative pb-24">
        <BuyersHero onStartBrief={handleStartBrief} onBookCall={handleBookCall} />

        <div className="relative z-10">
          <div className="mx-auto w-full max-w-6xl space-y-16 px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
            <ChoiceArchitecture />

            <section id="buyer-brief" className="scroll-mt-28 space-y-6">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">Primary Buyer Brief</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  We start with your goals so we can tailor your plan.
                </h2>
              </div>
              <div className="rounded-[28px] border border-white/15 bg-white/8 p-6 shadow-[0_24px_80px_rgba(4,17,12,0.4)] backdrop-blur sm:p-8">
                <BuyerBriefForm />
              </div>
            </section>

            <StrategyCallSection onBookCall={handleBookCall} />

            <PhilosophySection />

            <BenefitsSection />

            <TestimonialsSection />

            <FaqSection />
          </div>
        </div>

        <StickyCtaBar onStartBrief={handleStartBrief} onBookCall={handleBookCall} />
      </main>

      <Footer />
    </div>
  );
}
