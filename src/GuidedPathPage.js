import React from "react";
import { Link, useParams } from "react-router-dom";
import GuidedNarrowForm from "./components/GuidedNarrowForm";
import { guidedPaths } from "./data/guidedPaths";

const fallbackGuidance = {
  title: "Choose a lifestyle path",
  valueLine: "Select a starting point so we can tailor a shortlist for you.",
};

export default function GuidedPathPage() {
  const { path } = useParams();
  const guidedPath = guidedPaths.find((entry) => entry.slug === path);

  if (!guidedPath) {
    return (
      <section className="min-h-screen bg-[#f6f8f5] py-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="rounded-[32px] border border-emerald-200/80 bg-white/95 p-8 shadow-[0_24px_60px_rgba(12,35,18,0.1)]">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
              Full-Service Guidance
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-emerald-950">
              {fallbackGuidance.title}
            </h1>
            <p className="mt-2 text-sm text-emerald-900/70">{fallbackGuidance.valueLine}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {guidedPaths.map((entry) => (
                <Link
                  key={entry.slug}
                  to={`/guided/${entry.slug}`}
                  className="inline-flex items-center rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {entry.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f6f8f5] py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="rounded-[36px] border border-emerald-200/70 bg-white/95 p-8 shadow-[0_30px_80px_rgba(12,35,18,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
            Full-Service Guidance
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-emerald-950">
            You chose: {guidedPath.title}
          </h1>
          <p className="mt-2 text-sm text-emerald-900/70">{guidedPath.valueLine}</p>
        </div>

        <div className="mt-8">
          <GuidedNarrowForm guidedPath={guidedPath} />
        </div>
      </div>
    </section>
  );
}
