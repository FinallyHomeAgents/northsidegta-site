// src/BuyersPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "./Footer";
import { getFormEndpoint } from "./components/contact/contactConfig";
import { BUYER_FAQS, BUYERS_SCHEMA } from "./components/seo/buyersSchema.mjs";

const COMMUNITIES = [
  "Aurora",
  "Newmarket",
  "Stouffville",
  "Uxbridge",
  "Georgina",
  "East Gwillimbury",
  "Scugog",
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

const PHOTO_GRID = [
  {
    image: "/Images/newmarket-banner.jpg",
    position: "center 52%",
    label: "Main Street, Newmarket",
    sublabel: "Historic · Walkable · GO Train",
  },
  {
    image: "/Images/aurora-banner.jpg",
    position: "center 45%",
    label: "Aurora community trails",
    sublabel: "Parks · Schools · Neighbourhoods",
  },
  {
    image: "/Images/stouffville-banner.jpg",
    position: "center 48%",
    label: "Stouffville heritage district",
    sublabel: "Village feel · GO Train · Trails",
  },
  {
    image: "/Images/uxbridge-banner.jpg",
    position: "center 46%",
    label: "Uxbridge trail system",
    sublabel: "Trail Capital of Canada",
  },
  {
    image: "/Images/georgina-banner.jpg",
    position: "center 44%",
    label: "Lake Simcoe waterfront",
    sublabel: "Georgina · Keswick · Sutton",
  },
  {
    image: "/Images/eastgwillimbury-banner.jpg",
    position: "center 50%",
    label: "East Gwillimbury new builds",
    sublabel: "404 Corridor · Growing fast",
  },
];

const MARKET_SNAPSHOT = [
  ["Aurora", "$1,153,153", "26 days avg", "↓ 12.3%"],
  ["Newmarket", "$998,202", "24 days avg", "↓ 9.2%"],
  ["Stouffville", "$1,186,821", "27 days avg", "↓ 10.2%"],
  ["Uxbridge", "$1,023,606", "37 days avg", "↓ 7.3%"],
  ["Georgina", "$767,732", "24 days avg", "↓ 7.8%"],
  ["East Gwillimbury", "$1,038,275", "31 days avg", "↓ 4.4%"],
  ["Scugog", "$865,895", "37 days avg", "↓ 6.4%"],
];

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
          eyebrow="06 / Buyer FAQ"
          title="Buyer Questions We Hear Most Often"
          lead="Buying north of Toronto is not just about finding a house. It is about choosing the right town, commute, lifestyle, and long-term fit before you make a move."
        />
        <div className="buyers-faq-list">
          {BUYER_FAQS.map(({ question, answer }, index) => (
            <details
              className="buyers-faq-item"
              key={question}
              defaultOpen={index === 0}
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
        <title>Buying a Home North of Toronto | Buyers Guide | Finally Home Agents | NorthSide GTA</title>
        <meta
          name="description"
          content="Buying a home north of Toronto? Finally Home Agents guides buyers across Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog. Local expertise, town-by-town guidance, and a free strategy call."
        />
        <meta name="author" content="Finally Home Agents" />
        <meta name="publisher" content="Finally Home Agents" />
        <link rel="canonical" href="https://northsidegta.ca/buyers" />
        <meta property="og:title" content="Buying a Home North of Toronto | Finally Home Agents | NorthSide GTA" />
        <meta property="og:description" content="Find the right community north of Toronto. Town-by-town buyer guidance from Finally Home Agents across the NorthSide GTA." />
        <meta property="og:url" content="https://northsidegta.ca/buyers" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://northsidegta.ca/uploads/buyers-page-seo.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_CA" />
        <meta property="og:site_name" content="NorthSide GTA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Buying a Home North of Toronto | Finally Home Agents | NorthSide GTA" />
        <meta name="twitter:description" content="Find the right community north of Toronto. Town-by-town buyer guidance from Finally Home Agents across the NorthSide GTA." />
        <meta name="twitter:image" content="https://northsidegta.ca/uploads/buyers-page-seo.jpg" />
        <meta name="twitter:site" content="@northsidegta" />
        <script type="application/ld+json">{JSON.stringify(BUYERS_SCHEMA)}</script>
      </Helmet>

      <style>{BUYERS_STYLES}</style>

      <section className="buyers-hero">
        <img className="buyers-hero-bg" src="/uploads/northside-gta-finally-home-agents-hero.jpg" alt="" aria-hidden="true" />
        <div className="buyers-container hero-inner">
          <p className="buyers-eyebrow buyers-eyebrow-dark">Buying North of Toronto</p>
          <h1>You don't have to leave the city. You get to.</h1>
          <p className="hero-subhead">A guided buyer path for Toronto families moving north: match the right town, understand the market, then pressure-test the shortlist with Matt & Landon.</p>
          <div className="hero-actions">
            <button type="button" className="hero-primary" onClick={() => scrollToSection("town-match")}>Find My Town →</button>
            <button type="button" className="hero-ghost" onClick={() => scrollToSection("cta-section")}>Book a Strategy Call</button>
          </div>
          <div className="trust-strip">
            {[ ["5.0 ★", "Google Rating"], ["7", "Communities Served"], ["RECO", "Registered · Ontario"], ["HomeLife", "Optimum Realty"] ].map(([stat, label]) => (
              <div key={stat}><strong>{stat}</strong><span>{label}</span></div>
            ))}
          </div>
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
            eyebrow="02 / Life Up Here"
            title="This is what you're actually moving to"
            lead="Not just a bigger house — a different kind of morning. School drop-off without gridlock. A backyard that gets used. Communities built around real life."
          />
          <div className="photo-grid">
            {PHOTO_GRID.map(({ image, position, label, sublabel }) => (
              <figure
                className="photo-card"
                key={label}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.72)), url(${image})`, backgroundPosition: position }}
              >
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
            lead="April 2026 · TRREB Market Watch. Use this as context, then let us apply it to your budget and timing."
          />
          <div className="market-grid">
            {MARKET_SNAPSHOT.map(([town, price, days, yoy]) => (
              <article className="market-card" key={town}>
                <h3>{town}</h3>
                <strong>{price}</strong>
                <span>{days}</span>
                <em>{yoy}</em>
              </article>
            ))}
          </div>
          <div className="market-followup">
            <p className="attribution">Source: TRREB Market Watch · April 2026. Figures rounded; not a guarantee of value.</p>
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
          <SectionHeader eyebrow="05 / Client Proof" title="Real moves. Real families." compact>
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
            eyebrow="07 / Start the Conversation"
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

  .buyers-hero { position: relative; overflow: hidden; background: var(--primary); padding: 72px 32px 44px; }
  .buyers-hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.25; }
  .buyers-hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(35,71,10,0.95), rgba(35,71,10,0.74), rgba(35,71,10,0.45)); }
  .hero-inner { position: relative; z-index: 1; max-width: 760px; margin-left: max(calc((100vw - 1120px) / 2), 0px); }
  .buyers-hero h1 { margin: 0; max-width: 640px; color: #fff; font-family: "Playfair Display", Georgia, serif; font-size: 38px; line-height: 1.08; font-weight: 600; letter-spacing: -0.02em; }
  .hero-subhead { max-width: 610px; margin: 16px 0 0; color: rgba(255,255,255,0.76); font-size: 14px; line-height: 1.75; }
  .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
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

  .photo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .photo-card { position: relative; overflow: hidden; min-height: 142px; margin: 0; border-radius: 5px; background-color: #1a3a0a; background-size: cover; background-repeat: no-repeat; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); }
  .photo-card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(26,58,10,0.3), rgba(26,58,10,0)); }
  .photo-card figcaption { position: absolute; z-index: 1; left: 14px; right: 14px; bottom: 12px; color: #fff; }
  .photo-card strong { display: block; font-size: 13px; font-weight: 600; }
  .photo-card span { display: block; margin-top: 3px; color: rgba(255,255,255,0.72); font-size: 11.5px; }

  .market-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .market-card, .process-card, .review-card { border: 1px solid var(--border); border-radius: 5px; background: #fff; }
  .market-card { padding: 13px 15px; }
  .market-card h3 { margin: 0 0 10px; color: var(--primary); font-size: 13px; font-weight: 700; }
  .market-card strong { display: block; font-size: 18px; color: var(--text); }
  .market-card span, .market-card em { display: block; margin-top: 5px; color: var(--muted); font-size: 12px; font-style: normal; }
  .market-card em { color: var(--accent); font-weight: 700; }
  .attribution { margin: 0; color: var(--muted); font-size: 10.5px; }
  .market-followup { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 14px; }
  .market-followup button { flex-shrink: 0; border: 1px solid var(--border); border-radius: 3px; background: #fff; color: var(--primary); padding: 9px 14px; font-size: 12px; font-weight: 700; cursor: pointer; }

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

  @media (max-width: 900px) {
    .split-section, .cta-grid { grid-template-columns: 1fr; }
    .market-grid, .process-grid, .reviews-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 768px) {
    .buyers-page { padding-bottom: 82px; }
    .mobile-cta-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; gap: 14px; background: var(--primary); border-top: 2px solid var(--accent); padding: 11px 18px calc(11px + env(safe-area-inset-bottom)); box-shadow: 0 -12px 30px rgba(0,0,0,0.18); }
    .mobile-cta-bar strong { display: block; color: #fff; font-size: 13px; font-weight: 600; }
    .mobile-cta-bar span { display: block; color: rgba(255,255,255,0.65); font-size: 12px; }
    .mobile-cta-bar button { flex-shrink: 0; background: #fff; color: var(--primary); padding: 9px 18px; font-size: 12px; }
  }

  @media (max-width: 640px) {
    .buyers-hero, .buyers-section, .community-strip { padding-left: 20px; padding-right: 20px; }
    .buyers-section { padding-top: 34px; padding-bottom: 34px; }
    .dark-section { padding-bottom: 104px; }
    .buyers-hero { padding-top: 58px; }
    .buyers-hero h1 { font-size: 32px; }
    .buyers-section-header h2 { font-size: 29px; }
    .trust-strip, .photo-grid, .market-grid, .process-grid, .reviews-grid, .also-grid, .form-two-col { grid-template-columns: 1fr; }
    .quiz-card, .consultation-card { padding: 22px; }
    .buyers-faq-item summary { align-items: flex-start; padding: 16px; font-size: 17px; }
    .buyers-faq-item p { padding: 14px 16px 17px; font-size: 13.5px; }
    .photo-card { min-height: 154px; }
    .market-followup { align-items: flex-start; flex-direction: column; }
    .team-photo-block img { height: 150px; object-position: center 30%; }
  }
`;
