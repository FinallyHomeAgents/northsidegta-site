// src/AboutPage.js
import React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import { Award, Heart, Lightbulb, Mail, ShieldCheck } from "lucide-react";
import teamMembers from "./data/teamMembers";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";

const trophyHighlights = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description: "Built on genuine relationships and proven results.",
  },
  {
    icon: Lightbulb,
    title: "Strategy",
    description:
      "We treat our clients like professional athletes — with loyalty, strategy, and trust.",
  },
  {
    icon: Heart,
    title: "Community",
    description: "Helping families thrive with more space, more community, and less traffic.",
  },
  {
    icon: Award,
    title: "Results",
    description:
      "Multiple Top Agent Awards with HomeLife Optimum Realty prove our results.",
  },
];

const ABOUT_ROUTE_META = getStaticRouteMeta("/about") || {};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <DynamicMetaTags {...ABOUT_ROUTE_META} />

      <main className="pb-16 pt-8 sm:pt-12">
        {/* ───────── Intro & Hero ───────── */}
        <section className="px-4">
          <div className="mx-auto w-full max-w-6xl space-y-10">
            <div className="space-y-6 text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700">
                NorthSide GTA • Finally Home Agents
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-emerald-900 sm:text-4xl md:text-[2.75rem]">
                About Finally Home Agents
              </h1>
              <div className="space-y-4 text-base text-slate-600 sm:text-lg">
                <p className="text-slate-700">
                  Led by brothers Matthew and Landon Mulhall, Finally Home Agents pairs award-winning service with deep NorthSide GTA roots to guide families home.
                </p>
                <p>
                  We treat our clients like professional athletes — with loyalty, strategy, and trust. Helping families thrive with more space, more community, and less traffic.
                </p>
              </div>
            </div>
            <figure className="mx-auto w-full overflow-hidden rounded-[32px] border border-emerald-100 bg-white/90 shadow-2xl shadow-emerald-100/60">
              <img
                src="/uploads/about-hero-finally-home-agents.jpg"
                alt="Matthew and Landon Mulhall of Finally Home Agents standing on a stylized landscape background at sunset, representing their NorthSide GTA real estate approach."
                className="h-auto w-full object-cover"
                loading="lazy"
              />
              <figcaption className="px-6 py-4 text-sm font-medium text-emerald-900/80 sm:px-8 sm:py-5 sm:text-base">
                Built on trust, strategy, and community — the Finally Home Agents story.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ───────── Trophy Case ───────── */}
        <section className="px-4 pt-12">
          <div className="mx-auto w-full max-w-6xl rounded-[32px] border border-emerald-100 bg-white/90 px-6 py-12 shadow-2xl shadow-emerald-100/60 backdrop-blur-sm">
            <div className="space-y-10">
              <div className="space-y-3 text-center md:text-left">
                <h2 className="text-3xl font-semibold tracking-tight text-emerald-900 sm:text-4xl">
                  Our Trophy Case
                </h2>
                <p className="text-base text-slate-600 sm:text-lg">
                  The highlights that set Finally Home Agents apart for NorthSide GTA families.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {trophyHighlights.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex h-full flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-xl shadow-emerald-100/50 sm:text-left"
                  >
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 sm:mx-0">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-semibold text-emerald-900">{title}</h3>
                    <p className="text-sm text-slate-600 sm:text-base">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* ───────── Team Bios ───────── */}
        <section className="px-4 pb-20 pt-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-20">
            {teamMembers.map((member, idx) => (
              <article
                key={member.name}
                className={`grid grid-cols-1 items-center gap-12 rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-100/60 backdrop-blur-sm lg:grid-cols-2 ${
                  idx % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="flex justify-center">
                  <div className="relative w-full max-w-xs rounded-[30px] bg-gradient-to-tr from-emerald-300 via-emerald-400 to-emerald-500 p-[1.5px] shadow-lg shadow-emerald-200/60">
                    <div className="rounded-[24px] border border-emerald-100 bg-white p-3">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-auto w-full rounded-[20px] object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-semibold tracking-tight text-emerald-900">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                      {member.title}
                    </p>
                  </div>
                  <p className="leading-relaxed text-slate-700">
                    {member.bio}
                  </p>
                  <p className="text-sm font-medium text-emerald-900">
                    {member.awards}
                  </p>
                  <div>
                    <a
                      href={member.email}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900"
                    >
                      <Mail className="h-4 w-4" /> Email {member.name.split(" ")[0]}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ───────── CTA Footer ───────── */}
        <section className="relative mt-16 overflow-hidden rounded-[36px] px-4">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 rounded-[32px] border border-emerald-200 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 px-6 py-16 text-center text-white shadow-[0_35px_90px_rgba(16,185,129,0.45)]">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Ready to make your move?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/90">
              Let’s talk about your goals and create your NorthSide GTA success story.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3 text-base font-semibold text-emerald-700 shadow-xl shadow-emerald-900/30 transition hover:bg-emerald-50"
            >
              Contact Matthew & Landon
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
