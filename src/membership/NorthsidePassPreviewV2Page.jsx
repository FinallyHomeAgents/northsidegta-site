import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "../components/HeaderShell";
import MembershipRegistrationBlockV2 from "./MembershipRegistrationBlockV2";
import PlaceholderMedia from "./PlaceholderMedia";

const tierCards = [
  {
    title: "Member (FREE)",
    bullets: ["TasteHub access", "Local Events", "Insights", "Newsletter + direct access to Finally Home Agents"],
    cta: "CLAIM PASS",
  },
  {
    title: "Founding Member (FREE FOR NOW)",
    bullets: [
      "TasteHub access",
      "Local Events",
      "Insights",
      "Newsletter + direct access to Finally Home Agents",
      "Help shape what this becomes (coming soon perks via partners)",
    ],
    cta: "CLAIM PASS",
  },
];

const features = [
  { title: "TasteHub", description: "Vote and see local rankings across the NorthSide GTA." },
  { title: "Local Events", description: "Stay tapped into what’s happening around the NorthSide." },
  { title: "Insights", description: "Guides and intel to help you pick the right town." },
  { title: "Direct Access", description: "Reach Finally Home Agents directly when you need us." },
];

const faqItems = [
  {
    question: "What is the NorthSide Pass?",
    answer:
      "A free membership for NorthSide GTA locals and future movers that unlocks our intel, events, and TasteHub access.",
  },
  {
    question: "Does it cost anything?",
    answer: "No. Both the Member and Founding Member tiers are free right now.",
  },
  {
    question: "What do I get today vs later?",
    answer:
      "Today you get TasteHub, event intel, insights, and direct updates. Perks roll out as we add partners across the region.",
  },
  {
    question: "Do I need to be buying/selling now?",
    answer: "No. It’s for anyone who wants trusted NorthSide community intel, whether you’re moving soon or not.",
  },
  {
    question: "Can I join if I’m working with another agent?",
    answer:
      "If you’re under contract with another brokerage we can’t add you to the list right now, but you can still explore our public resources.",
  },
];

// IMPORTANT: images are in public/Images (capital I), so URLs must be /Images/...
const HERO_IMAGE_MOBILE = "/Images/northside-pass-hero-v2.webp"; // mobile asset
const HERO_IMAGE_DESKTOP = "/Images/northside-pass-hero-v2-desktop.webp"; // desktop asset

const NorthsidePassPreviewV2Page = () => {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const container = carouselRef.current;
    if (!container) return;
    const cardWidth = container.firstChild?.getBoundingClientRect().width || 1;
    const offset = container.scrollLeft;
    const index = Math.round(offset / cardWidth);
    setActiveIndex(Math.max(0, Math.min(index, tierCards.length - 1)));
  };

  const scrollToForm = () => {
    document.getElementById("membership-register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;
    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, []);

  const maxWidthClass = "max-w-[560px] mx-auto";
  const registrationWrapperClass = "mx-auto max-w-[1100px] px-0 lg:px-6 flex flex-col gap-6";

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <Helmet>
        <title>NorthSide Pass — Preview V2</title>
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview-v2" />
      </Helmet>

      <HeaderShell />

      <main className="pb-16">
        {/* HERO */}
        <section className="relative overflow-hidden px-4 pt-6 pb-10">
          {/* Ambient background */}
          <div className="absolute inset-0 bg-[#05070d]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.20),transparent_38%),radial-gradient(circle_at_75%_10%,rgba(59,130,246,0.14),transparent_40%),radial-gradient(circle_at_70%_85%,rgba(16,185,129,0.10),transparent_45%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/60" />

          {/* MOBILE: full-bleed hero image behind text */}
          <div className="absolute inset-2 overflow-hidden rounded-[32px] lg:hidden" aria-hidden="true">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${HERO_IMAGE_MOBILE})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_40%),radial-gradient(circle_at_70%_10%,rgba(59,130,246,0.12),transparent_40%)]" />
          </div>

          {/* Content wrapper */}
          <div className="relative mx-auto max-w-[1200px]">
            {/* Desktop topline */}
            <div className="hidden lg:flex items-center justify-between px-2 pb-6">
              <div className="flex items-center gap-3 text-[12px] tracking-[0.32em] uppercase text-white/60">
                {/* removed ( MAIN SCREEN ) / ( NORTHSIDE PASS ) / ( PREVIEW ) */}
              </div>

              <div className="flex items-center gap-3 text-[13px] tracking-[0.24em] uppercase text-white/80">
                <span className="text-white/70">NorthSide GTA</span>
                <span className="text-white font-semibold">NORTHSIDE PASS</span>
              </div>
            </div>

            {/* Desktop split layout */}
            <div className="hidden lg:grid grid-cols-12 gap-10 items-center min-h-[78vh]">
              {/* Left: copy */}
              <div className="col-span-5">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs tracking-[0.28em] uppercase text-white/70">
                      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">NorthSide GTA</span>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-200 px-3 py-1">
                        Claim your Pass
                      </span>
                    </div>

                    <h1 className="text-[52px] leading-[1.05] font-black tracking-tight">
                      Claim your <span className="text-white">NorthSide Pass</span>
                    </h1>

                    <p className="text-base text-white/80 leading-relaxed max-w-[520px]">
                      Free membership for locals and future NorthSide GTA movers. Get our best community finds and direct
                      access to Finally Home Agents.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={scrollToForm}
                      className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-3 text-base font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_rgba(16,185,129,0.5)]"
                    >
                      Claim your Pass
                    </button>

                    <div className="hidden xl:flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/55">
                      <span className="text-white/60">Scroll</span>
                      <span className="text-white/60">⌄</span>
                    </div>
                  </div>

                  <div className="pt-8 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-white/55">Today</p>
                      <p className="mt-2 text-sm text-white/75 leading-relaxed">
                        TasteHub, Local Events, Insights, and direct updates.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-white/55">Next</p>
                      <p className="mt-2 text-sm text-white/75 leading-relaxed">
                        Partner perks roll out as we add local businesses across the region.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: framed 16:9 hero panel */}
              <div className="col-span-7">
                <div className="relative">
                  {/* glow halo */}
                  <div className="absolute -inset-10 bg-[radial-gradient(circle_at_55%_40%,rgba(16,185,129,0.20),transparent_55%)] blur-2xl" />
                  <div className="absolute -inset-10 bg-[radial-gradient(circle_at_65%_25%,rgba(59,130,246,0.12),transparent_55%)] blur-2xl" />

                  {/* frame */}
                  <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black shadow-[0_28px_110px_rgba(0,0,0,0.70)]">
                    {/* NOTE: we intentionally do NOT rely on `aspect-video` here */}
                    <div className="relative w-full pt-[56.25%]">
                      <img
                        src={HERO_IMAGE_DESKTOP}
                        alt="NorthSide Pass hero"
                        className="absolute inset-0 h-full w-full object-cover"
                        decoding="async"
                        loading="eager"
                        onError={(e) => {
                          e.currentTarget.style.opacity = "0";
                          const el = document.getElementById("ns-pass-desktop-hero-fallback");
                          if (el) el.style.display = "flex";
                          // eslint-disable-next-line no-console
                          console.warn("Desktop hero image failed to load:", HERO_IMAGE_DESKTOP);
                        }}
                      />

                      <div
                        id="ns-pass-desktop-hero-fallback"
                        style={{ display: "none" }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs uppercase tracking-[0.2em] text-white/70"
                      >
                        Missing desktop hero image: {HERO_IMAGE_DESKTOP}
                      </div>

                      {/* overlays */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.06),transparent_40%)]" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile hero content (centered) */}
            <div
              className={`relative z-10 flex w-full flex-col items-center gap-12 ${maxWidthClass} lg:hidden min-h-screen justify-center`}
            >
              <div className="flex w-full items-center justify-between text-[13px] tracking-[0.24em] uppercase text-white/80">
                <span className="text-white/70">NorthSide GTA</span>
                <span className="text-white font-semibold">NORTHSIDE PASS</span>
              </div>

              <div className="flex flex-col items-center text-center gap-3">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Claim your NorthSide Pass</h1>
                <p className="text-base sm:text-lg text-white/85 max-w-2xl">
                  Free membership for locals and future NorthSide GTA movers. Get our best community finds and direct
                  access to Finally Home Agents.
                </p>
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_rgba(16,185,129,0.5)]"
                >
                  Claim your Pass
                </button>
              </div>

              <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
                <span className="text-lg">⌄</span>
                <span>Scroll</span>
              </div>
            </div>
          </div>
        </section>

        {/* Everything below this stays the same */}
        <section className="px-4 py-12 sm:py-14">
          <div className={`${maxWidthClass} space-y-4`}>
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">Membership tiers</p>
              <h2 className="text-3xl font-bold">Claim your NorthSide Pass</h2>
              <p className="text-white/70">Swipe between Member and Founding Member options.</p>
            </div>

            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {tierCards.map((card) => (
                <div
                  key={card.title}
                  className="snap-center shrink-0 w-[85vw] max-w-[420px] rounded-[28px] border border-white/15 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex items-center justify-between text-sm uppercase tracking-[0.18em] text-white/80">
                    <span>{card.title}</span>
                    <span className="text-emerald-200">NorthSide GTA</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-base text-white/85">
                    {card.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 leading-relaxed">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={scrollToForm}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-3 text-base font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_rgba(16,185,129,0.5)]"
                  >
                    {card.cta}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2">
              {tierCards.map((_, index) => (
                <span
                  key={index}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    activeIndex === index ? "bg-emerald-400" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className={registrationWrapperClass}>
            <MembershipRegistrationBlockV2
              className="bg-transparent text-white"
              tone="dark"
              innerClassName="w-full"
              contentWrapperClassName="[&>.mt-8]:w-full lg:[&>.mt-8]:grid lg:[&>.mt-8]:grid-cols-[1.05fr_0.95fr] lg:[&>.mt-8]:gap-8 lg:[&>.mt-8]:items-start lg:[&>.mt-8]:min-w-0 lg:[&>.mt-8>*]:min-w-0 lg:[&>.mt-8>*:last-child]:flex lg:[&>.mt-8>*:last-child]:justify-center"
              previewWrapperClassName="bg-slate-950/80 border border-white/10 w-full max-w-[520px] xl:static xl:top-auto xl:relative"
              brevoSource="pass-preview-v2"
            />
          </div>
        </section>

        <section className="px-4 pb-12 sm:pb-14">
          <div className={`${maxWidthClass} space-y-6`}>
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">What the Pass gets you</p>
              <h3 className="text-3xl font-bold">NorthSide tools at a glance</h3>
            </div>

            <div className="space-y-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[26px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 shadow-[0_18px_70px_rgba(0,0,0,0.55)]"
                >
                  <div className="flex items-center gap-4">
                    <PlaceholderMedia
                      shape="circle"
                      label="CIRCLE PHOTO (1000x1000)"
                      className="flex-none w-24 h-24"
                    />
                    <div className="space-y-1">
                      <h4 className="text-xl font-semibold">{feature.title}</h4>
                      <p className="text-sm text-white/75 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:pb-14">
          <div className={`${maxWidthClass} space-y-5`}>
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-4 text-lg font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_rgba(16,185,129,0.5)]"
            >
              CLAIM YOUR PASS
            </button>

            <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4 shadow-[0_18px_70px_rgba(0,0,0,0.55)] space-y-3">
              <PlaceholderMedia shape="banner" label="PROMO BANNER (1600x900)" />
              <p className="text-center text-sm text-white/75">Restaurant perks coming as we partner through TasteHub.</p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14">
          <div className={`${maxWidthClass} rounded-[30px] border border-blue-200/10 bg-gradient-to-br from-sky-900 via-slate-900 to-black p-8 shadow-[0_28px_100px_rgba(14,165,233,0.25)] text-center space-y-4`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl text-emerald-200">
              ⚡
            </div>
            <h3 className="text-3xl font-bold">How it works</h3>
            <p className="text-base text-white/80 leading-relaxed">
              Claim your pass, get your member number, and start using the tools now. Perks and partners roll out over
              time with community input.
            </p>
            <div className="mx-auto inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-[0.18em] uppercase text-white/80">
              northsidegta.ca
            </div>
          </div>
        </section>

        <section className="px-4 pb-14">
          <div className={`${maxWidthClass} space-y-6`}>
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">NorthSide Pass FAQs</p>
              <h3 className="text-3xl font-bold">Questions, answered</h3>
            </div>

            <div className="overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
              {faqItems.map((item, index) => (
                <FaqRow key={item.question} item={item} isLast={index === faqItems.length - 1} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16" id="membership" />
      </main>
    </div>
  );
};

const FaqRow = ({ item, isLast }) => {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);

  const contentId = useMemo(() => item.question.replace(/\s+/g, "-").toLowerCase(), [item.question]);

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-lg font-semibold text-white"
      >
        <span>{item.question}</span>
        <span className={`text-emerald-200 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <div id={contentId} className="px-5 pb-4 text-sm text-white/75 leading-relaxed">
          {item.answer}
        </div>
      )}
      {!isLast && <div className="mx-5 h-px bg-white/10" aria-hidden="true" />}
    </div>
  );
};

export default NorthsidePassPreviewV2Page;
