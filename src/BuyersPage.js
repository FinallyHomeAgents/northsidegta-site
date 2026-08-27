// src/BuyersPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "./Footer";
import { getFormEndpoint } from "./components/contact/contactConfig";
import { BUYER_FAQS, BUYERS_SCHEMA, BUYERS_SEO } from "./components/seo/buyersSchema.mjs";
import MARKET_DATA from "./data/marketData.json";

const COMMUNITIES = [
  "Aurora",
  "Newmarket",
  "Stouffville",
  "Uxbridge",
  "Georgina",
  "East Gwillimbury",
  "Scugog",
];

const MOVING_FROM_TORONTO_GUIDES = [
  { town: "Georgina", href: "/moving-to-georgina-from-toronto" },
  { town: "East Gwillimbury", href: "/moving-to-east-gwillimbury-from-toronto" },
  { town: "Uxbridge", href: "/moving-to-uxbridge-from-toronto" },
  { town: "Newmarket", href: "/moving-to-newmarket-from-toronto" },
  { town: "Aurora", href: "/moving-to-aurora-from-toronto" },
  { town: "Stouffville", href: "/moving-to-stouffville-from-toronto" },
  { town: "Scugog", href: "/moving-to-port-perry-scugog-from-toronto" },
];

const TOWN_DATA = {
  Aurora: {
    slug: "aurora",
    reasons: [
      "Top school catchments in York Region",
      "GO Train + Hwy 404 for daily commuters",
      "Established family neighbourhoods and mature streetscapes",
    ],
  },
  Newmarket: {
    slug: "newmarket",
    reasons: [
      "Historic Main Street — walkable shops, restaurants, errands",
      "GO Train to Union Station under 60 min",
      "Strong schools and full municipal services",
    ],
  },
  Stouffville: {
    slug: "stouffville",
    reasons: [
      "Village main street with GO Train access",
      "Active trail system through town",
      "Strong family community and newer builds",
    ],
  },
  Uxbridge: {
    slug: "uxbridge",
    reasons: [
      "Trail Capital of Canada — 10,000+ acres of protected trails",
      "Most space per dollar in the NorthSide GTA",
      "Heritage downtown with real small-town character",
    ],
  },
  Georgina: {
    slug: "georgina",
    reasons: [
      "Lake Simcoe waterfront — Keswick and Sutton",
      "Most affordable avg. price in the NorthSide GTA",
      "Growing fast with new amenities",
    ],
  },
  "East Gwillimbury": {
    slug: "east-gwillimbury",
    reasons: [
      "Strong Hwy 404 corridor access",
      "Larger lots and newer builds",
      "Growing community — Holland Landing and beyond",
    ],
  },
  Scugog: {
    slug: "scugog",
    reasons: [
      "Port Perry waterfront and heritage main street",
      "Lake Scugog — boating, fishing, four seasons",
      "True small-town pace, away from the suburban sprawl",
    ],
  },
};

const QUESTIONS = [
  {
    question: "What matters most to your family right now?",
    options: [
      { value: "schools", label: "Top-rated schools" },
      { value: "trails", label: "Trails & outdoor space" },
      { value: "walkable", label: "Walkable main street" },
      { value: "quiet", label: "Quiet & privacy" },
      { value: "commute", label: "Fast commute access" },
    ],
  },
  {
    question: "How would you describe your ideal pace of life?",
    options: [
      { value: "suburban", label: "Suburban — amenities close by" },
      { value: "smalltown", label: "Small town — know your neighbours" },
      { value: "rural", label: "Rural — space and quiet" },
      { value: "active", label: "Active — trails and lake access" },
      { value: "urbanedge", label: "Urban edge — city feel, more space" },
    ],
  },
  {
    question: "What's your relationship with Toronto going forward?",
    options: [
      { value: "daily", label: "Daily commute still likely" },
      { value: "fewweek", label: "A few times a week" },
      { value: "occasional", label: "Occasional — weekends only" },
      { value: "cutting", label: "Cutting ties completely" },
      { value: "wfh", label: "Working from home full-time" },
    ],
  },
];

const SCORE_MATRIX = {
  schools: { Aurora: 3, Newmarket: 2, Stouffville: 2 },
  trails: { Uxbridge: 3, Georgina: 2, Scugog: 2, "East Gwillimbury": 1 },
  walkable: { Newmarket: 3, Aurora: 2, Stouffville: 2, Scugog: 1 },
  quiet: { Scugog: 3, Uxbridge: 2, Georgina: 2 },
  commute: { Aurora: 3, Newmarket: 3, Stouffville: 2, "East Gwillimbury": 2 },
  suburban: { Aurora: 3, Newmarket: 2, "East Gwillimbury": 2 },
  smalltown: { Scugog: 3, Uxbridge: 2, Stouffville: 2 },
  rural: { Uxbridge: 3, Scugog: 2, Georgina: 2 },
  active: { Uxbridge: 3, Georgina: 3, Scugog: 2 },
  urbanedge: { Newmarket: 3, Aurora: 2, Stouffville: 2 },
  daily: { Aurora: 3, Newmarket: 3, Stouffville: 2 },
  fewweek: { Newmarket: 2, Aurora: 2, Stouffville: 2, "East Gwillimbury": 2 },
  occasional: { Scugog: 3, Uxbridge: 2, Georgina: 2 },
  cutting: { Scugog: 3, Uxbridge: 3, Georgina: 2 },
  wfh: { "East Gwillimbury": 3, Uxbridge: 2, Scugog: 2, Georgina: 2 },
};

const HERO_ROTATION = [
  {
    src: "/uploads/sold-home-newmarket-finally-home-agents.webp",
    caption: "Sold · Newmarket",
    sub: "Another family finally home",
    alt: "Sold With Finally Home Agents sign in front of a brick two-storey home in Newmarket, Ontario",
  },
  {
    src: "/uploads/coming-soon-home-east-gwillimbury-finally-home-agents.webp",
    caption: "Coming soon · East Gwillimbury",
    sub: "Real listings, real streets",
    alt: "Finally Home Agents coming soon sign in front of a two-storey brick home in East Gwillimbury, Ontario",
  },
  {
    src: "/uploads/matthew-landon-mulhall-finally-home-agents.webp",
    caption: "Matt & Landon",
    sub: "Your agents up here",
    alt: "Matthew and Landon Mulhall of Finally Home Agents",
  },
  {
    src: "/uploads/coming-soon-bungalow-georgina-finally-home-agents.webp",
    caption: "Coming soon · Georgina",
    sub: "Every price point, every town",
    alt: "Finally Home Agents coming soon sign on the lawn of a bungalow in Georgina, Ontario",
  },
  {
    src: "/uploads/finally-home-cup-trophy-mill-run-golf-club-uxbridge.webp",
    caption: "The Finally Home Cup · Uxbridge",
    sub: "We live here too",
    alt: "Finally Home Cup golf trophy on the fairway at Mill Run Golf Club in Uxbridge, Ontario",
  },
];

const PROOF_CARDS = [
  {
    image: "/uploads/finally-home-agents-just-sold-door-hanger.webp",
    position: "center 45%",
    label: "Step 1 — boots on the ground",
    sublabel: "Local outreach puts your home in front of neighbourhood buyers",
    alt: "Finally Home Agents door hanger used for local neighbourhood real estate outreach",
  },
  {
    image: "/uploads/coming-soon-sign-newmarket-finally-home-agents.webp",
    position: "center 40%",
    label: "Step 2 — Coming Soon · Newmarket",
    sublabel: "Positioned and marketed before it hits the MLS",
    alt: "Finally Home Agents coming soon sign in front of a brick two-storey home in Newmarket, Ontario",
  },
  {
    image: "/uploads/sold-home-newmarket-finally-home-agents.webp",
    position: "center 40%",
    label: "Step 3 — SOLD · same house",
    sublabel: "From sign-up to sold, start to finish",
    alt: "Sold With Finally Home Agents sign in front of the same Newmarket home",
  },
];

const COMMUNITY_MEDIA = [
  {
    type: "image",
    src: "/uploads/finally-home-cup-team-finally-mill-run-uxbridge.webp",
    position: "center 42%",
    label: "Team Finally · the Finally Home Cup",
    alt: "Finally Home Cup golf tournament team photo at Mill Run Golf Club in Uxbridge",
    span: "wide",
  },
  {
    type: "video",
    src: "/uploads/golf-carts-finally-home-cup-mill-run-uxbridge.mp4",
    poster: "/uploads/golf-carts-finally-home-cup-mill-run-uxbridge-poster.webp",
    label: "Cup day at Mill Run · Uxbridge",
    alt: "Golf carts lined up for the Finally Home Cup tournament",
    span: "tall",
  },
  {
    type: "image",
    src: "/uploads/matthew-mulhall-mill-run-cup-champion-uxbridge.webp",
    position: "center 8%",
    label: "Matthew with the Mill Run Cup",
    alt: "Matthew Mulhall holding the Mill Run Cup trophy in Uxbridge, Ontario",
  },
  {
    type: "image",
    src: "/uploads/golf-swing-sunset-mill-run-golf-club-uxbridge.webp",
    position: "center 45%",
    label: "League nights at Mill Run",
    alt: "Golfer teeing off at sunset at Mill Run Golf Club in Uxbridge, Ontario",
    span: "wide",
  },
  {
    type: "image",
    src: "/uploads/finally-home-cup-mill-run-golf-club-sign-uxbridge.webp",
    position: "center 55%",
    label: "Our tournament takes over Mill Run every summer",
    alt: "Mill Run Golf Club marquee sign displaying Finally Home Cup in Uxbridge, Ontario",
  },
];

const MARKET_WATCH_TOWNS = MARKET_DATA.municipalities;
const MARKET_SNAPSHOT = COMMUNITIES.map((town) => {
  const townMarket = MARKET_WATCH_TOWNS[TOWN_DATA[town].slug];
  return {
    town,
    price: townMarket.averageSalePrice,
    sales: `Sales count ${townMarket.salesCount}`,
    avgLdom: `Avg. LDOM ${townMarket.avgLdom}`,
  };
});

const PROCESS_STEPS = [
  ["01", "Town strategy", "We map lifestyle, commute, school needs, and budget to the right shortlist before you chase listings."],
  ["02", "Focused showing plan", "We build efficient showing days around homes that actually fit your criteria and shortlisted towns."],
  ["03", "Offer strategy", "We read each micro-market, structure the offer, and negotiate so you can move with confidence."],
  ["04", "Closing support", "Trades, schools, lawyers, neighbours — we stay close through closing and the first weeks after."],
];

const REVIEWS = [
  ["Devin Tappenden", "Buyer · Uxbridge", "Matthew and the team really took the time and care to help us find the right place. He made the sometimes overwhelming burden of moving seem so smooth."],
  ["Larissa Halko", "Buyer & Seller", "What really stood out was that Matt understood our priorities as a family and ensured these were held in high regard throughout the whole process."],
  ["Susan Booth", "Seller · Holland Landing", "Their professionalism and personal attention set them apart. Throughout the entire process these Finally Home Agents exceeded our expectations."],
];

const FAQ_TOWN_LINKS = {
  Aurora: "/communities/aurora",
  Newmarket: "/communities/newmarket",
  Stouffville: "/communities/stouffville",
  Uxbridge: "/communities/uxbridge",
  Georgina: "/communities/georgina",
  "East Gwillimbury": "/communities/east-gwillimbury",
  Scugog: "/communities/scugog",
};

const LINKED_TOWNS_PATTERN = new RegExp(
  `\\b(${Object.keys(FAQ_TOWN_LINKS).sort((a, b) => b.length - a.length).join("|")})\\b`,
  "g"
);

function applyInitialFaqOpen(node, index) {
  if (!node || index !== 0 || node.dataset.initialOpenApplied === "true") {
    return;
  }

  node.open = true;
  node.dataset.initialOpenApplied = "true";
}

function renderFaqAnswer(answer, linkedTowns) {
  return answer.split(LINKED_TOWNS_PATTERN).map((part, index) => {
    const href = FAQ_TOWN_LINKS[part];
    if (!href || linkedTowns.has(part)) {
      return part;
    }

    linkedTowns.add(part);
    return (
      <a href={href} key={`${part}-${index}`}>
        {part}
      </a>
    );
  });
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updatePreference);
    } else {
      mediaQuery.addListener?.(updatePreference);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updatePreference);
      } else {
        mediaQuery.removeListener?.(updatePreference);
      }
    };
  }, []);

  return prefersReducedMotion;
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionHeader({ eyebrow, title, lead, dark = false, compact = false, children }) {
  return (
    <div className={`buyers-section-header${compact ? " compact" : ""}`}>
      <p className={`buyers-eyebrow${dark ? " buyers-eyebrow-dark" : ""}`}>{eyebrow}</p>
      <h2>{title}</h2>
      {lead && <p className={`buyers-lead${dark ? " buyers-lead-dark" : ""}`}>{lead}</p>}
      {children}
    </div>
  );
}

function BuyersFaqSection() {
  const linkedTowns = new Set();

  return (
    <section className="buyers-section tinted-section buyers-faq-section">
      <div className="buyers-container">
        <SectionHeader
          eyebrow="07 / Buyer FAQ"
          title="Buyer Questions We Hear Most Often"
          lead="Buying north of Toronto is not just about finding a house. It is about choosing the right town, commute, lifestyle, and long-term fit before you make a move."
        />
        <div className="buyers-faq-list">
          {BUYER_FAQS.map(({ question, answer }, index) => (
            <details
              className="buyers-faq-item"
              key={question}
              ref={(node) => applyInitialFaqOpen(node, index)}
            >
              <summary>{question}</summary>
              <p>{renderFaqAnswer(answer, linkedTowns)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TownMatchQuiz({ variant = "buyers", onComplete } = {}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const selected = answers[step] || "";
  const progress = `${((step + 1) / QUESTIONS.length) * 100}%`;

  function chooseAnswer(value) {
    setAnswers((current) => {
      const next = [...current];
      next[step] = value;
      return next;
    });
  }

  function calculateResult(finalAnswers) {
    const scores = COMMUNITIES.reduce((acc, town) => ({ ...acc, [town]: 0 }), {});
    finalAnswers.forEach((answer) => {
      Object.entries(SCORE_MATRIX[answer] || {}).forEach(([town, points]) => {
        scores[town] += points;
      });
    });
    const ranked = COMMUNITIES
      .map((town, index) => ({ town, score: scores[town], index }))
      .sort((a, b) => b.score - a.score || a.index - b.index);
    const resultTowns = ranked.slice(0, 3).map((item) => item.town);
    setResult(resultTowns);
    onComplete?.(resultTowns);
  }

  function nextStep() {
    if (!selected) return;
    if (step === QUESTIONS.length - 1) {
      calculateResult(answers);
      return;
    }
    setStep((current) => current + 1);
  }

  function retakeQuiz() {
    setStep(0);
    setAnswers([]);
    setResult(null);
  }

  if (result) {
    const [primary, ...secondary] = result;
    const primaryData = TOWN_DATA[primary];
    return (
      <div className="quiz-card result-card">
        <div className="result-primary">
          <h3>{primary}</h3>
          <p>{variant === "modal" ? `Looks like ${primary} could be a great fit.` : `Based on your answers, ${primary} is your strongest fit.`}</p>
          <ul>
            {primaryData.reasons.map((reason) => (
              <li key={reason}><span>✓</span>{reason}</li>
            ))}
          </ul>
          {variant !== "modal" && (
            <div className="result-conversion">
              <strong>Want us to pressure-test this against your budget, commute, and timing?</strong>
              <p>Send us your basics and we’ll build a practical NorthSide GTA shortlist around your actual move.</p>
              <button type="button" onClick={() => scrollToSection("cta-section")}>Send me my town shortlist</button>
            </div>
          )}
          <div className="result-actions secondary-actions">
            <a href={`/communities/${primaryData.slug}`}>Explore {primary} →</a>
            {variant === "modal" && <a href="/contact">Talk to Matt &amp; Landon →</a>}
          </div>
        </div>
        <div className="also-like">
          <p className="buyers-eyebrow">You might also like</p>
          <div className="also-grid">
            {secondary.map((town) => (
              <article key={town} className="also-card">
                <h4>{town}</h4>
                <p>{TOWN_DATA[town].reasons[0]}</p>
                <a href={`/communities/${TOWN_DATA[town].slug}`}>Secondary town guide →</a>
              </article>
            ))}
          </div>
        </div>
        <button className="retake-button" type="button" onClick={retakeQuiz}>← Retake the quiz</button>
      </div>
    );
  }

  const question = QUESTIONS[step];
  return (
    <div className="quiz-card">
      <div className="quiz-progress" aria-hidden="true"><span style={{ width: progress }} /></div>
      <p className="quiz-step">Question {step + 1} of 3</p>
      <h3>{question.question}</h3>
      <div className="quiz-options" role="radiogroup" aria-label={question.question}>
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={selected === option.value ? "selected" : ""}
            onClick={() => chooseAnswer(option.value)}
            role="radio"
            aria-checked={selected === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
      <button className="quiz-next" type="button" disabled={!selected} onClick={nextStep}>
        {step === QUESTIONS.length - 1 ? "See my match →" : "Next"}
      </button>
    </div>
  );
}

function HeroRotator() {
  const [active, setActive] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) return undefined;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % HERO_ROTATION.length),
      5200
    );
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  return (
    <div className="hero-rotator">
      {HERO_ROTATION.map(({ src, caption, sub, alt }, index) => (
        <figure key={src} className={`hero-slide${index === active ? " active" : ""}`} aria-hidden={index !== active}>
          <img
            src={src}
            alt={index === active ? alt : ""}
            loading={index === 0 ? "eager" : "lazy"}
            fetchpriority={index === 0 ? "high" : "auto"}
          />
          <figcaption>
            <strong>{caption}</strong>
            <span>{sub}</span>
          </figcaption>
        </figure>
      ))}
      <div className="hero-dots" role="group" aria-label="Choose hero image">
        {HERO_ROTATION.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={index === active ? "on" : ""}
            onClick={() => setActive(index)}
            aria-label={`Show ${slide.caption}`}
            aria-pressed={index === active}
          />
        ))}
      </div>
      <div className="hero-chip hero-chip-rating"><span className="hero-chip-stars">★★★★★</span> 5.0 on Google</div>
    </div>
  );
}

function VisibilityVideo({ src, poster, alt }) {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldPlay = isVisible && !prefersReducedMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (!shouldPlay) {
      video.pause();
      return undefined;
    }

    video.load();
    const playPromise = video.play();
    playPromise?.catch(() => {
      // Muted autoplay can still be blocked by browser or device policy.
    });

    return () => video.pause();
  }, [shouldPlay, src]);

  return (
    <video ref={videoRef} loop muted playsInline preload="none" poster={poster} aria-label={alt}>
      {shouldPlay && <source src={src} type="video/mp4" />}
    </video>
  );
}

function ConsultationForm() {
  const [expanded, setExpanded] = useState(false);
  const [selectedTowns, setSelectedTowns] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const formEndpoint = useMemo(() => getFormEndpoint(), []);

  function toggleTown(town) {
    setSelectedTowns((current) =>
      current.includes(town) ? current.filter((item) => item !== town) : [...current, town]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setStatus("sending");
    setError("");

    const data = Object.fromEntries(new FormData(form).entries());
    data.towns = selectedTowns.join(", ");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Sorry, something went wrong. Please try again.");
      }

      setStatus("success");
      form.reset();
      setSelectedTowns([]);
    } catch (submissionError) {
      setStatus("idle");
      setError(submissionError.message || "Sorry, something went wrong. Please try again.");
    }
  }

  return (
    <div className="consultation-wrap">
      <div className="team-photo-block">
        <img src="/assets/homepage/matthew-landon-northside-gta.jpg" alt="Matthew and Landon Mulhall" />
        <p>Matthew & Landon Mulhall · Finally Home Agents · HomeLife Optimum Realty, Brokerage</p>
      </div>
      <div className="consultation-card">
        {status === "success" ? (
          <p className="form-thanks">Thanks — we'll be in touch shortly. Matt & Landon</p>
        ) : (
          <form action={formEndpoint} method="POST" onSubmit={handleSubmit}>
            <input type="hidden" name="_subject" value="New buyer inquiry — NorthSide GTA" />
            <input type="hidden" name="_next" value="" />
            <input type="hidden" name="towns" value={selectedTowns.join(", ")} />

            <div className="form-two-col">
              <label>
                <span>First name</span>
                <input name="first_name" placeholder="Your first name" required />
              </label>
              <label>
                <span>Phone or email</span>
                <input name="contact" placeholder="Phone or email" required />
              </label>
            </div>

            <label>
              <span>Where are you moving from?</span>
              <select name="moving_from" required defaultValue="">
                <option value="" disabled>Select one</option>
                <option>Toronto — downtown / midtown</option>
                <option>Toronto — east end</option>
                <option>Toronto — west end</option>
                <option>North York / Scarborough</option>
                <option>Elsewhere in GTA</option>
                <option>Outside the GTA</option>
              </select>
            </label>

            <button
              className={`expand-toggle${expanded ? " open" : ""}`}
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
            >
              <span>▸</span>
              Add more detail — budget, timeline, towns you're thinking about
            </button>

            {expanded && (
              <div className="expanded-fields">
                <label>
                  <span>Budget range</span>
                  <select name="budget" defaultValue="">
                    <option value="">Select a budget</option>
                    <option>Under $800K</option>
                    <option>$800K – $1M</option>
                    <option>$1M – $1.3M</option>
                    <option>$1.3M+</option>
                  </select>
                </label>

                <label>
                  <span>Timeline</span>
                  <select name="timeline" defaultValue="">
                    <option value="">Select a timeline</option>
                    <option>Just exploring</option>
                    <option>3–6 months</option>
                    <option>6–12 months</option>
                    <option>Ready now</option>
                  </select>
                </label>

                <fieldset>
                  <legend>Towns curious about</legend>
                  <div className="town-chip-grid">
                    {COMMUNITIES.map((town) => (
                      <button
                        key={town}
                        type="button"
                        className={selectedTowns.includes(town) ? "selected" : ""}
                        onClick={() => toggleTown(town)}
                        aria-pressed={selectedTowns.includes(town)}
                      >
                        {town}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="submit-button" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Book a Strategy Call →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function BuyersPage() {
  const [stickyTarget, setStickyTarget] = useState("town-match");

  useEffect(() => {
    const quizSection = document.getElementById("town-match");
    if (!quizSection || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setStickyTarget(entry.boundingClientRect.top < 0 && !entry.isIntersecting ? "cta-section" : "town-match"),
      { threshold: 0, rootMargin: "-90px 0px 0px 0px" }
    );

    observer.observe(quizSection);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="buyers-page">
      <Helmet>
        <title>{BUYERS_SEO.title}</title>
        <meta name="description" content={BUYERS_SEO.description} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Finally Home Agents" />
        <meta name="publisher" content="Finally Home Agents" />
        <link rel="canonical" href={BUYERS_SEO.url} />
        <link rel="preload" as="image" href="/uploads/sold-home-newmarket-finally-home-agents.webp" />
        <meta property="og:title" content={BUYERS_SEO.title} />
        <meta property="og:description" content={BUYERS_SEO.description} />
        <meta property="og:url" content={BUYERS_SEO.url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={BUYERS_SEO.image} />
        <meta property="og:image:alt" content={BUYERS_SEO.imageAlt} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_CA" />
        <meta property="og:site_name" content="NorthSide GTA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={BUYERS_SEO.title} />
        <meta name="twitter:description" content={BUYERS_SEO.description} />
        <meta name="twitter:image" content={BUYERS_SEO.image} />
        <meta name="twitter:image:alt" content={BUYERS_SEO.imageAlt} />
        <meta name="twitter:site" content="@northsidegta" />
        <script type="application/ld+json">{JSON.stringify(BUYERS_SCHEMA)}</script>
      </Helmet>

      <style>{BUYERS_STYLES}</style>

      <section className="buyers-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="buyers-container hero-grid">
          <div className="hero-copy">
            <p className="buyers-eyebrow buyers-eyebrow-dark hero-fade">Buying North of Toronto</p>
            <h1 className="hero-fade hero-delay-1">You don't have to leave the city. <em>You get to.</em></h1>
            <p className="hero-subhead hero-fade hero-delay-2">A guided buyer path for Toronto families moving north: match the right town, understand the market, then pressure-test the shortlist with Matt & Landon.</p>
            <div className="hero-actions hero-fade hero-delay-3">
              <button type="button" className="hero-primary" onClick={() => scrollToSection("town-match")}>Find My Town <span aria-hidden="true">→</span></button>
              <button type="button" className="hero-ghost" onClick={() => scrollToSection("cta-section")}>Book a Strategy Call</button>
            </div>
            <div className="trust-strip hero-fade hero-delay-4">
              {[ ["5.0 ★", "Google Rating"], ["7", "Communities Served"], ["RECO", "Registered · Ontario"], ["HomeLife", "Optimum Realty"] ].map(([stat, label]) => (
                <div key={stat}><strong>{stat}</strong><span>{label}</span></div>
              ))}
            </div>
          </div>
          <HeroRotator />
        </div>
      </section>

      <section className="community-strip" aria-label="Communities served">
        <div className="buyers-container community-strip-inner">
          <span className="serving-label">Serving:</span>
          <span className="serving-dot" />
          <div className="community-tags">
            {COMMUNITIES.map((town) => <span key={town}>{town}</span>)}
          </div>
          <p>Guidance also available in King, Bradford, Vaughan, Richmond Hill, Markham, Pickering, Ajax, Whitby, and Oshawa</p>
        </div>
      </section>

      <section className="moving-guides-strip" aria-labelledby="moving-guides-heading">
        <div className="buyers-container moving-guides-strip__inner">
          <div>
            <p className="buyers-eyebrow">Moving from Toronto?</p>
            <h2 id="moving-guides-heading">Start with an honest town guide.</h2>
            <p>
              Compare all seven NorthSide GTA towns with real prices, commute trade-offs,
              neighbourhood guidance, and the details Toronto movers need before choosing.
            </p>
          </div>
          <ul>
            {MOVING_FROM_TORONTO_GUIDES.map(({ town, href }) => (
              <li key={town}>
                {href ? (
                  <a href={href}>Moving to {town} from Toronto →</a>
                ) : (
                  <span>Moving to {town} from Toronto <em>Coming soon</em></span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="buyers-section white-section" id="town-match">
        <div className="buyers-container split-section">
          <SectionHeader
            eyebrow="01 / Town Match"
            title="Where do you actually belong?"
            lead="Start here. Answer 3 quick questions and we’ll point you toward the NorthSide GTA towns that best fit your lifestyle, commute, and pace."
          />
          <TownMatchQuiz />
        </div>
      </section>

      <section className="buyers-section tinted-section">
        <div className="buyers-container">
          <SectionHeader
            eyebrow="02 / Real Results"
            title="From local outreach to SOLD"
            lead="No stock photos here. This is how we build awareness on the ground, bring an actual Newmarket listing to market, and carry it through to SOLD."
          />
          <div className="photo-grid">
            {PROOF_CARDS.map(({ image, position, label, sublabel, alt }) => (
              <figure className="photo-card" key={label}>
                <img src={image} alt={alt} loading="lazy" style={{ objectPosition: position }} />
                <figcaption><strong>{label}</strong><span>{sublabel}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="buyers-section white-section">
        <div className="buyers-container">
          <SectionHeader
            eyebrow="03 / Market Context"
            title="A quick read on where budgets are landing"
            lead={`${MARKET_DATA.period} · ${MARKET_DATA.homeType}. Use this as context, then let us apply it to your budget and timing.`}
          />
          <div className="market-grid">
            {MARKET_SNAPSHOT.map(({ town, price, sales, avgLdom }) => (
              <article className="market-card" key={town}>
                <h3>{town}</h3>
                <strong>{price}</strong>
                <span>{sales}</span>
                <em className="market-change">{avgLdom}</em>
              </article>
            ))}
          </div>
          <div className="market-followup">
            <p className="attribution">Source: {MARKET_DATA.source}. Exact municipal all-home-types figures; not a guarantee of value.</p>
            <a href="/what-my-home-buys">See what your home buys up north</a>
            <button type="button" onClick={() => scrollToSection("cta-section")}>Book a Strategy Call</button>
          </div>
        </div>
      </section>

      <section className="buyers-section tinted-section">
        <div className="buyers-container">
          <SectionHeader
            eyebrow="04 / How We Work"
            title="A calm system for buying north"
            lead="A focused buyer process that keeps your shortlist tight, your showings useful, and your offer strategy grounded in local context."
          />
          <div className="process-grid">
            {PROCESS_STEPS.map(([step, title, body]) => (
              <article className="process-card" key={step}>
                <span>{step}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="buyers-section white-section">
        <div className="buyers-container">
          <SectionHeader
            eyebrow="05 / Community"
            title="We don't just sell here. We live here."
            lead="The Finally Home Cup at Mill Run Golf Club in Uxbridge, league nights, and the people we get to call neighbours. When we say local, this is what we mean."
          />
          <div className="community-grid">
            {COMMUNITY_MEDIA.map(({ type, src, poster, position, label, alt, span }) => (
              <figure className={`community-card${span === "wide" ? " community-card-wide" : ""}${span === "tall" ? " community-card-tall" : ""}`} key={src}>
                {type === "video" ? (
                  <VisibilityVideo src={src} poster={poster} alt={alt} />
                ) : (
                  <img src={src} alt={alt} loading="lazy" style={{ objectPosition: position }} />
                )}
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="buyers-section tinted-section">
        <div className="buyers-container">
          <SectionHeader eyebrow="06 / Client Proof" title="Real moves. Real families." compact>
            <p className="buyers-lead">All reviews from Google. <a href="https://share.google/GJz2QTQ8GqZIifaNH" target="_blank" rel="noreferrer">See all Google reviews →</a></p>
          </SectionHeader>
          <div className="reviews-grid">
            {REVIEWS.map(([name, context, quote]) => (
              <article className="review-card" key={name}>
                <div className="stars" aria-label="5 stars">★★★★★</div>
                <blockquote>“{quote}”</blockquote>
                <h3>{name}</h3>
                <p>{context}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BuyersFaqSection />

      <section className="buyers-section dark-section" id="cta-section">
        <div className="buyers-container cta-grid">
          <SectionHeader
            eyebrow="08 / Start the Conversation"
            title="Want a town shortlist built around your actual move?"
            lead="Tell us where you’re coming from, what matters most, and when you’re thinking of moving. We’ll help you narrow the right NorthSide GTA towns before you waste time on the wrong homes."
            dark
          />
          <ConsultationForm />
        </div>
      </section>

      <div className="mobile-cta-bar">
        <div><strong>{stickyTarget === "town-match" ? "Ready to find your town?" : "Have your shortlist?"}</strong><span>Matt & Landon · Finally Home Agents</span></div>
        <button type="button" onClick={() => scrollToSection(stickyTarget)}>{stickyTarget === "town-match" ? "Find My Town" : "Book a Strategy Call"}</button>
      </div>

      <Footer />
    </main>
  );
}

const BUYERS_STYLES = `
  .buyers-page {
    --primary: #23470a;
    --accent: #5a8a2a;
    --soft: #a8c97a;
    --tinted: #f9f8f5;
    --text: #1a1a1a;
    --muted: #5a6474;
    --border: #e2ddd5;
    --trust: #f5f3ee;
    color: var(--text);
    background: #fff;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    scroll-behavior: smooth;
  }

  .buyers-container { max-width: 1120px; margin: 0 auto; }
  .buyers-eyebrow { margin: 0 0 12px; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--accent); font-weight: 500; }
  .buyers-eyebrow-dark { color: var(--soft); }
  .buyers-section { padding: 42px 32px; scroll-margin-top: 120px; }
  .white-section { background: #fff; }
  .tinted-section { background: var(--tinted); }
  .dark-section { background: var(--primary); padding-top: 44px; padding-bottom: 44px; }
  .buyers-section-header { max-width: 620px; margin-bottom: 24px; }
  .buyers-section-header.compact { margin-bottom: 18px; }
  .buyers-section-header h2 { margin: 0; color: var(--text); font-family: "Playfair Display", Georgia, serif; font-size: 32px; line-height: 1.08; font-weight: 600; letter-spacing: -0.02em; }
  .dark-section .buyers-section-header h2 { color: #fff; }
  .buyers-lead { margin: 12px 0 0; color: var(--muted); font-size: 14px; line-height: 1.75; }
  .buyers-lead a { color: var(--primary); font-weight: 600; text-decoration: none; }
  .buyers-lead-dark { color: rgba(255,255,255,0.65); }

  .buyers-hero { position: relative; overflow: hidden; padding: 56px 32px 48px; background:
    radial-gradient(1000px 560px at 88% 8%, rgba(105,160,50,0.42), transparent 62%),
    radial-gradient(720px 460px at 4% 100%, rgba(168,201,122,0.20), transparent 60%),
    linear-gradient(128deg, #16300a 0%, #23470a 46%, #2e5c11 100%); }
  .buyers-hero::before { content: ""; position: absolute; inset: 0; opacity: 0.5; background-image: radial-gradient(rgba(255,255,255,0.085) 1px, transparent 1.4px); background-size: 26px 26px; }
  .hero-glow { position: absolute; top: -140px; right: -80px; width: 560px; height: 560px; border-radius: 50%; background: radial-gradient(circle, rgba(168,201,122,0.28), transparent 65%); filter: blur(10px); animation: hero-glow-drift 9s ease-in-out infinite alternate; }
  @keyframes hero-glow-drift { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(-50px,36px,0) scale(1.12); } }
  .hero-grid { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(340px, 420px); gap: 48px; align-items: center; }
  .buyers-hero h1 { margin: 0; max-width: 540px; color: #fff; font-family: "Playfair Display", Georgia, serif; font-size: 42px; line-height: 1.1; font-weight: 600; letter-spacing: -0.02em; }
  .buyers-hero h1 em { display: inline-block; font-style: italic; color: #d3ecab; background-image: linear-gradient(transparent 72%, rgba(168,201,122,0.32) 72%); }
  .hero-subhead { max-width: 560px; margin: 16px 0 0; color: rgba(255,255,255,0.78); font-size: 14.5px; line-height: 1.75; }
  .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
  .hero-primary span { display: inline-block; margin-left: 6px; transition: transform 180ms ease; }
  .hero-primary:hover span { transform: translateX(4px); }

  .hero-fade { opacity: 0; transform: translateY(14px); animation: hero-fade-up 640ms cubic-bezier(0.22, 0.85, 0.35, 1) forwards; }
  .hero-delay-1 { animation-delay: 90ms; }
  .hero-delay-2 { animation-delay: 180ms; }
  .hero-delay-3 { animation-delay: 270ms; }
  .hero-delay-4 { animation-delay: 380ms; }
  @keyframes hero-fade-up { to { opacity: 1; transform: translateY(0); } }

  .hero-rotator { position: relative; aspect-ratio: 3 / 4; max-height: 560px; width: 100%; border-radius: 14px; overflow: visible; opacity: 0; animation: hero-visual-in 800ms cubic-bezier(0.22, 0.85, 0.35, 1) 240ms forwards; }
  @keyframes hero-visual-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .hero-slide { position: absolute; inset: 0; margin: 0; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.24); box-shadow: 0 34px 80px rgba(8,20,2,0.5); opacity: 0; transition: opacity 1100ms ease; }
  .hero-slide.active { opacity: 1; }
  .hero-slide img { width: 100%; height: 100%; object-fit: cover; transform: scale(1); }
  .hero-slide.active img { animation: hero-slide-drift 5600ms ease-out forwards; }
  @keyframes hero-slide-drift { from { transform: scale(1.06); } to { transform: scale(1); } }
  .hero-slide::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, rgba(10,24,2,0.72)); }
  .hero-slide figcaption { position: absolute; z-index: 1; left: 18px; right: 18px; bottom: 16px; color: #fff; }
  .hero-slide figcaption strong { display: block; font-size: 14.5px; font-weight: 700; text-shadow: 0 1px 8px rgba(0,0,0,0.5); }
  .hero-slide figcaption span { display: block; margin-top: 3px; color: rgba(255,255,255,0.82); font-size: 12px; }
  .hero-dots { position: absolute; z-index: 2; right: 8px; bottom: 8px; display: flex; }
  .hero-dots button { position: relative; width: 28px; height: 28px; padding: 0; border: 0; background: transparent; cursor: pointer; }
  .hero-dots button::after { content: ""; position: absolute; inset: 10px; border-radius: 50%; background: rgba(255,255,255,0.38); transition: background 200ms ease, transform 200ms ease; }
  .hero-dots button.on::after { background: #fff; transform: scale(1.25); }
  .hero-dots button:focus-visible { outline: 2px solid #fff; outline-offset: -2px; border-radius: 50%; }
  .hero-chip { position: absolute; z-index: 3; display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700; box-shadow: 0 14px 34px rgba(8,20,2,0.4); }
  .hero-chip-rating { top: -14px; left: -20px; background: #fff; color: var(--primary); animation: hero-chip-float 7s ease-in-out infinite alternate; }
  .hero-chip-stars { color: #e0a51e; letter-spacing: 1px; font-size: 11px; }
  @keyframes hero-chip-float { from { translate: 0 0; } to { translate: 0 -8px; } }

  @media (prefers-reduced-motion: reduce) {
    .hero-fade, .hero-rotator { opacity: 1; transform: none; animation: none; }
    .hero-slide, .hero-slide.active img, .hero-chip, .hero-glow { animation: none; transition: none; }
  }
  .hero-actions button, .result-actions button, .result-actions a, .quiz-next, .submit-button, .mobile-cta-bar button { border-radius: 3px; border: 0; font-weight: 600; cursor: pointer; transition: transform 160ms ease, opacity 160ms ease; }
  .hero-actions button:hover, .result-actions button:hover, .result-actions a:hover, .quiz-next:hover, .submit-button:hover, .mobile-cta-bar button:hover { transform: translateY(-1px); }
  .hero-primary { background: #fff; color: var(--primary); padding: 12px 20px; }
  .hero-ghost { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.72) !important; padding: 11px 20px; }
  .trust-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; max-width: 620px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 18px; margin-top: 24px; }
  .trust-strip strong { display: block; color: #fff; font-size: 15px; font-weight: 600; }
  .trust-strip span { display: block; margin-top: 3px; color: rgba(255,255,255,0.6); font-size: 11.5px; }

  .community-strip { background: var(--trust); border-bottom: 1px solid #e8e4db; padding: 9px 32px; }
  .community-strip-inner { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }
  .serving-label { color: var(--muted); font-size: 11.5px; }
  .serving-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--primary); }
  .community-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .community-tags span { border: 1px solid #e2ddd5; border-radius: 999px; background: #fff; padding: 4px 9px; color: var(--primary); font-size: 11.5px; font-weight: 600; }
  .community-strip p { flex-basis: 100%; margin: 2px 0 0; color: var(--muted); font-size: 11.5px; }
  .moving-guides-strip { border-bottom: 1px solid #e8e4db; background: #eef3e6; padding: 30px 32px; }
  .moving-guides-strip__inner { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(420px, 1.2fr); gap: 34px; align-items: center; }
  .moving-guides-strip h2 { margin: 0; color: var(--primary); font-family: "Playfair Display", Georgia, serif; font-size: 27px; line-height: 1.14; }
  .moving-guides-strip p:not(.buyers-eyebrow) { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.65; }
  .moving-guides-strip ul { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 0; padding: 0; list-style: none; }
  .moving-guides-strip li a, .moving-guides-strip li span { display: flex; min-height: 43px; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid #d8dfcf; border-radius: 4px; background: #fff; padding: 9px 12px; color: var(--primary); font-size: 12px; font-weight: 650; text-decoration: none; }
  .moving-guides-strip li span { color: var(--muted); font-weight: 500; }
  .moving-guides-strip li em { flex: 0 0 auto; color: #8a7450; font-size: 9px; font-style: normal; letter-spacing: 0.08em; text-transform: uppercase; }

  .split-section { display: grid; grid-template-columns: minmax(0, 0.82fr) minmax(340px, 600px); gap: 34px; align-items: start; }
  .quiz-card { width: 100%; max-width: 600px; background: #fff; border: 1px solid var(--border); border-radius: 6px; padding: 26px; box-shadow: 0 22px 70px rgba(26,26,26,0.07); }
  .quiz-progress { height: 2px; background: #e8e4db; margin-bottom: 16px; }
  .quiz-progress span { display: block; height: 100%; background: var(--primary); transition: width 180ms ease; }
  .quiz-step { margin: 0 0 10px; color: var(--muted); font-size: 11px; }
  .quiz-card h3 { margin: 0 0 18px; color: var(--text); font-family: "Playfair Display", Georgia, serif; font-size: 24px; line-height: 1.2; }
  .quiz-options { display: flex; flex-wrap: wrap; gap: 9px; margin-bottom: 22px; }
  .quiz-options button { background: var(--tinted); border: 1px solid #ddd6c8; border-radius: 20px; padding: 8px 16px; color: var(--text); font-size: 12.5px; cursor: pointer; }
  .quiz-options button.selected { background: var(--primary); color: #fff; border-color: var(--primary); }
  .quiz-next { background: var(--primary); color: #fff; padding: 11px 22px; }
  .quiz-next:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .result-primary h3 { margin-bottom: 8px; color: var(--primary); font-size: 26px; }
  .result-primary p { margin: 0 0 16px; color: var(--muted); font-size: 13px; }
  .result-primary ul { display: grid; gap: 9px; margin: 0; padding: 0; list-style: none; }
  .result-primary li { display: flex; gap: 9px; color: var(--text); font-size: 13px; line-height: 1.55; }
  .result-primary li span { color: var(--accent); font-weight: 700; }
  .result-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
  .result-conversion { margin-top: 20px; border: 1px solid #dfe8d5; border-radius: 5px; background: #f7fbf1; padding: 16px; }
  .result-conversion strong { display: block; color: var(--primary); font-size: 14px; line-height: 1.35; }
  .result-conversion p { margin: 6px 0 12px; color: var(--muted); font-size: 12.5px; line-height: 1.55; }
  .result-conversion button { border: 0; border-radius: 3px; background: var(--primary); color: #fff; padding: 11px 16px; font-weight: 700; cursor: pointer; }
  .secondary-actions { margin-top: 10px; }
  .result-actions button { background: var(--primary); color: #fff; padding: 11px 18px; }
  .result-actions a { display: inline-flex; align-items: center; background: var(--tinted); border: 1px solid var(--border); color: var(--primary); padding: 10px 18px; text-decoration: none; }
  .also-like { border-top: 1px solid #e8e4db; margin-top: 24px; padding-top: 18px; }
  .also-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .also-card { border: 1px solid var(--border); border-radius: 5px; padding: 14px 16px; }
  .also-card h4 { margin: 0 0 6px; color: var(--primary); font-size: 13px; font-weight: 600; }
  .also-card p { margin: 0 0 10px; color: var(--muted); font-size: 12px; line-height: 1.5; }
  .also-card a { color: var(--primary); font-size: 12px; font-weight: 600; text-decoration: none; }
  .retake-button { margin-top: 18px; padding: 0; border: 0; background: transparent; color: var(--muted); font-size: 12px; cursor: pointer; }

  .photo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; counter-reset: proof; }
  .photo-card { position: relative; overflow: hidden; margin: 0; aspect-ratio: 4 / 5; border-radius: 8px; background-color: #1a3a0a; border: 1px solid var(--border); box-shadow: 0 18px 45px rgba(26,26,26,0.09); }
  .photo-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 400ms ease; }
  .photo-card:hover img { transform: scale(1.03); }
  .photo-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 52%, rgba(10,24,2,0.78)); pointer-events: none; }
  .photo-card figcaption { position: absolute; z-index: 1; left: 16px; right: 16px; bottom: 14px; color: #fff; }
  .photo-card strong { display: block; font-size: 14px; font-weight: 700; text-shadow: 0 1px 6px rgba(0,0,0,0.45); }
  .photo-card span { display: block; margin-top: 4px; color: rgba(255,255,255,0.8); font-size: 12px; line-height: 1.45; }

  .community-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: 200px; gap: 12px; }
  .community-card { position: relative; overflow: hidden; margin: 0; border-radius: 8px; background: #1a3a0a; border: 1px solid var(--border); }
  .community-card-wide { grid-column: span 2; }
  .community-card-tall { grid-row: span 2; }
  .community-card img, .community-card video { width: 100%; height: 100%; object-fit: cover; }
  .community-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 58%, rgba(10,24,2,0.72)); pointer-events: none; }
  .community-card figcaption { position: absolute; z-index: 1; left: 14px; right: 14px; bottom: 11px; color: #fff; font-size: 12.5px; font-weight: 600; text-shadow: 0 1px 6px rgba(0,0,0,0.45); }

  .market-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .market-card, .process-card, .review-card { border: 1px solid var(--border); border-radius: 5px; background: #fff; }
  .market-card { padding: 13px 15px; }
  .market-card h3 { margin: 0 0 10px; color: var(--primary); font-size: 13px; font-weight: 700; }
  .market-card strong { display: block; font-size: 18px; color: var(--text); }
  .market-card span, .market-card em { display: block; margin-top: 5px; color: var(--muted); font-size: 12px; font-style: normal; }
  .market-card em { font-weight: 700; }
  .market-card em.market-change--down { color: #f43f5e; }
  .market-card em.market-change--up { color: #22c55e; }
  .market-card em.market-change--neutral { color: var(--muted); }
  .attribution { margin: 0; color: var(--muted); font-size: 10.5px; }
  .market-followup { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 14px; }
  .market-followup button, .market-followup a { flex-shrink: 0; border: 1px solid var(--border); border-radius: 3px; background: #fff; color: var(--primary); padding: 9px 14px; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: none; }

  .process-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .process-card { padding: 18px 16px; }
  .process-card span { display: block; margin-bottom: 10px; color: var(--accent); font-size: 10px; font-weight: 700; letter-spacing: 1.5px; }
  .process-card h3 { margin: 0 0 9px; color: var(--primary); font-family: "Playfair Display", Georgia, serif; font-size: 20px; line-height: 1.15; }
  .process-card p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.65; }

  .reviews-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .review-card { padding: 17px; }
  .stars { color: var(--primary); font-size: 12px; letter-spacing: 1px; }
  .review-card blockquote { margin: 10px 0 14px; color: var(--text); font-size: 13px; line-height: 1.62; }
  .review-card h3 { margin: 0; color: var(--primary); font-size: 13px; font-weight: 700; }
  .review-card p { margin: 4px 0 0; color: var(--muted); font-size: 12px; }

  .buyers-faq-section { border-top: 1px solid var(--border); }
  .buyers-faq-list { display: grid; gap: 10px; max-width: 920px; }
  .buyers-faq-item { border: 1px solid var(--border); border-radius: 6px; background: #fff; box-shadow: 0 16px 45px rgba(26,26,26,0.045); overflow: hidden; }
  .buyers-faq-item summary { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; color: var(--primary); font-family: "Playfair Display", Georgia, serif; font-size: 19px; line-height: 1.22; font-weight: 600; cursor: pointer; list-style: none; }
  .buyers-faq-item summary::-webkit-details-marker { display: none; }
  .buyers-faq-item summary::after { content: "+"; flex: 0 0 auto; width: 28px; height: 28px; border: 1px solid #d8d2c6; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--accent); font-family: Inter, system-ui, sans-serif; font-size: 18px; line-height: 1; transition: transform 160ms ease, background 160ms ease, color 160ms ease; }
  .buyers-faq-item[open] summary { border-bottom: 1px solid #eee8df; }
  .buyers-faq-item[open] summary::after { content: "−"; background: var(--primary); border-color: var(--primary); color: #fff; }
  .buyers-faq-item p { margin: 0; padding: 16px 20px 20px; color: var(--muted); font-size: 14px; line-height: 1.78; }
  .buyers-faq-item a { color: var(--primary); font-weight: 700; text-decoration: none; border-bottom: 1px solid rgba(35,71,10,0.25); }
  .buyers-faq-item a:hover { border-bottom-color: var(--primary); }

  .cta-grid { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(340px, 540px); gap: 36px; align-items: start; }
  .consultation-wrap { max-width: 540px; }
  .team-photo-block { margin-bottom: 16px; }
  .team-photo-block img { width: 100%; max-width: 540px; height: 176px; border-radius: 5px; object-fit: cover; object-position: center 32%; display: block; }
  .team-photo-block p { margin: 8px 0 0; color: rgba(255,255,255,0.45); font-size: 11px; }
  .consultation-card { max-width: 540px; border: 1px solid rgba(255,255,255,0.14); border-radius: 6px; background: rgba(255,255,255,0.07); padding: 24px; box-shadow: 0 24px 70px rgba(0,0,0,0.14); }
  .consultation-card form { display: grid; gap: 12px; }
  .form-two-col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .consultation-card label, .consultation-card fieldset { display: grid; gap: 6px; margin: 0; border: 0; padding: 0; }
  .consultation-card label span, .consultation-card legend { color: rgba(255,255,255,0.72); font-size: 11px; }
  .consultation-card input, .consultation-card select { width: 100%; border: 1px solid rgba(255,255,255,0.18); border-radius: 3px; background: rgba(255,255,255,0.08); padding: 10px 12px; color: #fff; font-size: 13px; }
  .consultation-card input::placeholder { color: rgba(255,255,255,0.35); }
  .consultation-card option { color: #1a1a1a; }
  .expand-toggle { display: flex; align-items: center; gap: 8px; border: 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); background: transparent; padding: 10px 0; color: rgba(255,255,255,0.78); font-size: 12px; text-align: left; cursor: pointer; }
  .expand-toggle span { display: inline-block; transition: transform 160ms ease; }
  .expand-toggle.open span { transform: rotate(90deg); }
  .expanded-fields { display: grid; gap: 14px; }
  .town-chip-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .town-chip-grid button { border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.6); padding: 8px 12px; font-size: 12px; cursor: pointer; }
  .town-chip-grid button.selected { background: #3a7a1a; border-color: #3a7a1a; color: #fff; }
  .submit-button { width: 100%; background: #fff; color: var(--primary); padding: 12px 13px; font-weight: 700; scroll-margin-bottom: 110px; }
  .submit-button:disabled { opacity: 0.65; cursor: wait; transform: none; }
  .form-error { margin: 0; color: #ffd4c9; font-size: 12px; }
  .form-thanks { margin: 18px 0; color: #fff; text-align: center; font-family: "Playfair Display", Georgia, serif; font-size: 26px; line-height: 1.25; }

  .mobile-cta-bar { display: none; }

  @media (max-width: 1020px) {
    .hero-grid { grid-template-columns: 1fr; gap: 36px; }
    .hero-rotator { max-width: 420px; margin: 0 auto; }
    .hero-chip-rating { left: -8px; }
    .community-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 190px; }
  }

  @media (max-width: 900px) {
    .split-section, .cta-grid, .moving-guides-strip__inner { grid-template-columns: 1fr; }
    .market-grid, .process-grid, .reviews-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 768px) {
    .buyers-page { padding-bottom: 82px; }
    .mobile-cta-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; gap: 10px; background: var(--primary); border-top: 2px solid var(--accent); padding: 11px 96px calc(11px + env(safe-area-inset-bottom)) 18px; box-shadow: 0 -12px 30px rgba(0,0,0,0.18); }
    .mobile-cta-bar strong { display: block; color: #fff; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .mobile-cta-bar span { display: none; }
    .mobile-cta-bar button { flex-shrink: 0; background: #fff; color: var(--primary); padding: 9px 12px; font-size: 11.5px; }
  }

  @media (max-width: 640px) {
    .buyers-hero, .buyers-section, .community-strip, .moving-guides-strip { padding-left: 20px; padding-right: 20px; }
    .buyers-section { padding-top: 34px; padding-bottom: 34px; }
    .dark-section { padding-bottom: 104px; }
    .buyers-hero { padding-top: 46px; }
    .buyers-hero h1 { font-size: 33px; }
    .buyers-section-header h2 { font-size: 29px; }
    .hero-rotator { max-width: 340px; }
    .trust-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .community-grid { grid-template-columns: 1fr; grid-auto-rows: auto; }
    .community-card { height: 230px; min-height: 0; }
    .community-card-wide { grid-column: auto; }
    .community-card-tall { grid-row: auto; height: 380px; min-height: 0; }
    .photo-grid, .market-grid, .process-grid, .reviews-grid, .also-grid, .form-two-col { grid-template-columns: 1fr; }
    .moving-guides-strip ul { grid-template-columns: 1fr; }
    .quiz-card, .consultation-card { padding: 22px; }
    .buyers-faq-item summary { align-items: flex-start; padding: 16px; font-size: 17px; }
    .buyers-faq-item p { padding: 14px 16px 17px; font-size: 13.5px; }
    .photo-card { min-height: 154px; }
    .market-followup { align-items: flex-start; flex-direction: column; }
    .team-photo-block img { height: 150px; object-position: center 30%; }
  }
`;
