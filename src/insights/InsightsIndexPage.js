import React from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "../Navigation";
import Footer from "../Footer";

export default function InsightsIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Helmet>
        <title>NorthSide GTA Insights</title>
        <meta
          name="description"
          content="Browse expert guidance from Finally Home Agents across the NorthSide GTA."
        />
        <link rel="canonical" href="https://northsidegta.ca/insights" />
      </Helmet>
      <Navigation />
      <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.38em] text-emerald-700">
          NorthSide GTA Insights
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Insight library coming soon
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          We’re assembling stories, market intel, and concierge-level guidance for every move north of Toronto.
          Check back shortly for the first batch of articles.
        </p>
      </main>
      <Footer />
    </div>
  );
}
