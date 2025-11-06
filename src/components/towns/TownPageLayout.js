import React, { useState } from "react";
import { Link } from "react-router-dom";

function ButtonLink({ href, label, variant = "primary" }) {
  if (!href || !label) return null;

  const baseClasses =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses =
    variant === "secondary"
      ? "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 focus:ring-emerald-300 focus:ring-offset-emerald-900"
      : "bg-emerald-600 text-white shadow hover:bg-emerald-500 focus:ring-emerald-200 focus:ring-offset-emerald-900";

  const className = `${baseClasses} ${variantClasses}`;

  const isInternal = href.startsWith("/");

  if (isInternal) {
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

function IconBubble({ icon: Icon, label }) {
  if (!Icon) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">
        {label ? label.charAt(0) : ""}
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
      <Icon className="h-6 w-6 text-emerald-700" aria-hidden />
    </div>
  );
}

function SnapshotRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-emerald-50 bg-white/80 p-4 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {label}
      </span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

function RatingRow({ item, scaleMax = 10 }) {
  if (!item) return null;
  const { icon, label, score = 0, description } = item;
  const normalized = scaleMax > 0 ? (score / scaleMax) * 10 : 0;
  const displayScore = Number.isFinite(normalized)
    ? normalized % 1 === 0
      ? `${normalized.toFixed(0)} / 10`
      : `${normalized.toFixed(1)} / 10`
    : "–";
  const barPercent = scaleMax > 0 ? Math.max(0, Math.min(100, (score / scaleMax) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-emerald-50 bg-white/75 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <IconBubble icon={icon} label={label} />
          <div>
            <p className="text-base font-semibold text-gray-900">{label}</p>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
        </div>
        <span className="text-sm font-semibold text-emerald-700">{displayScore}</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
          style={{ width: `${barPercent}%` }}
        />
      </div>
    </div>
  );
}

function LifestyleCard({ item }) {
  if (!item) return null;
  const { icon, title, description } = item;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-50 bg-white/80 p-6 shadow-sm">
      <IconBubble icon={icon} label={title} />
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-700">{description}</p>}
      </div>
    </div>
  );
}

function AudienceTile({ item }) {
  if (!item) return null;
  const { icon, title, description } = item;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-50 bg-white/80 p-5 shadow-sm">
      <IconBubble icon={icon} label={title} />
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
    </div>
  );
}

function NeighbourhoodCard({ item }) {
  if (!item) return null;
  const { name, description } = item;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-emerald-50 bg-white/85 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{name}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle, index }) {
  if (!item) return null;
  const { question, answer } = item;
  const regionId = `faq-panel-${index}`;
  return (
    <div className="rounded-2xl border border-emerald-50 bg-white/80 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
        aria-controls={regionId}
      >
        <span className="text-base font-semibold text-gray-900">{question}</span>
        <span className="text-emerald-600">{isOpen ? "−" : "+"}</span>
      </button>
      <div
        id={regionId}
        hidden={!isOpen}
        className="px-5 pb-4 text-sm text-gray-700"
      >
        {answer}
      </div>
    </div>
  );
}

export default function TownPageLayout({
  townName,
  hero,
  snapshot = {},
  ratings = [],
  ratingScaleMax = 10,
  lifestyleHighlights = [],
  audiences = [],
  neighbourhoods = [],
  faqs = [],
  cta,
  guide,
}) {
  const [openFaq, setOpenFaq] = useState(null);

  const snapshotFields = [
    { key: "population", label: "Population" },
    { key: "driveToToronto", label: "Drive to Toronto" },
    { key: "goTrainTime", label: "GO Train" },
    { key: "homePriceRange", label: "Typical Home Price" },
    { key: "highways", label: "Highways" },
    { key: "transitSummary", label: "Transit" },
  ];

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          {hero?.backgroundImage ? (
            <img
              src={hero.backgroundImage}
              alt={hero?.backgroundAlt || `${townName} skyline`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600" />
          )}
          <div className="absolute inset-0 bg-emerald-950/70" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 sm:py-24 lg:py-28">
          <div className="max-w-3xl text-white">
            {hero?.tagline && (
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100">
                {hero.tagline}
              </p>
            )}
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              {hero?.title || `Living in ${townName}`}
            </h1>
            {hero?.subtitle && (
              <p className="mt-4 text-base text-emerald-50 sm:text-lg">
                {hero.subtitle}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink
                href={hero?.primaryButton?.href || "#"}
                label={hero?.primaryButton?.label}
                variant="primary"
              />
              <ButtonLink
                href={hero?.secondaryButton?.href || "#"}
                label={hero?.secondaryButton?.label}
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Snapshot + Ratings */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-emerald-100 bg-white/90 p-6 shadow-lg backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900">Town Snapshot</h2>
              {guide?.href && guide?.label && (
                <a
                  href={guide.href}
                  target={guide.target || "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  {guide.label}
                  <span aria-hidden>→</span>
                </a>
              )}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {snapshotFields.map((field) => (
                <SnapshotRow key={field.key} label={field.label} value={snapshot?.[field.key]} />
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-100 bg-white/90 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">NorthSide Town Ratings</h2>
            </div>
            <div className="mt-6 space-y-4">
              {ratings.map((item, index) => (
                <RatingRow key={item?.label || index} item={item} scaleMax={ratingScaleMax} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle */}
      {lifestyleHighlights.length > 0 && (
        <section className="bg-emerald-950/02">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Lifestyle at a Glance</h2>
              <p className="mt-2 text-sm text-gray-600">
                What day-to-day life feels like in {townName}.
              </p>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {lifestyleHighlights.map((item, index) => (
                <LifestyleCard key={item?.title || index} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Audiences */}
      {audiences.length > 0 && (
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Who {townName} is Great For</h2>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {audiences.map((item, index) => (
                <AudienceTile key={item?.title || index} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Neighbourhoods */}
      {neighbourhoods.length > 0 && (
        <section className="bg-gradient-to-b from-emerald-50 to-white/60">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Neighbourhoods in {townName}</h2>
              <p className="mt-2 text-sm text-gray-600">
                A few of the areas home buyers ask us about.
              </p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {neighbourhoods.map((item, index) => (
                <NeighbourhoodCard key={item?.name || index} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section>
          <div className="mx-auto max-w-5xl px-4 py-16">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Key Questions About Living in {townName}</h2>
            </div>
            <div className="mt-8 space-y-4">
              {faqs.map((item, index) => (
                <FaqItem
                  key={item?.question || index}
                  item={item}
                  index={index}
                  isOpen={openFaq === index}
                  onToggle={() => setOpenFaq(openFaq === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {cta && (
        <section className="relative isolate overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600" />
          <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at top, rgba(255,255,255,0.2), transparent 55%)" }} />
          <div className="relative mx-auto max-w-4xl px-4 text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{cta.title}</h2>
            {cta.description && (
              <p className="mt-4 text-base text-emerald-50 sm:text-lg">{cta.description}</p>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink
                href={cta?.primaryButton?.href || "#"}
                label={cta?.primaryButton?.label}
                variant="primary"
              />
              <ButtonLink
                href={cta?.secondaryButton?.href || "#"}
                label={cta?.secondaryButton?.label}
                variant="secondary"
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
