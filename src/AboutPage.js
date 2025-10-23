// src/AboutPage.js
import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import { Award, Heart, Lightbulb, Mail, MapPin, ShieldCheck } from "lucide-react";

const metrics = [
  {
    title: "20 Years Combined",
    description: "Experience that delivers.",
  },
  {
    title: "Award Winners",
    description: "Multiple Top Agent Awards, HomeLife Optimum Realty.",
  },
  {
    title: "Communities Covered",
    description: "NorthSide GTA and beyond.",
  },
  {
    title: "Next-Gen Marketing",
    description: "Professional tools + AI innovation.",
  },
];

const differentiators = [
  {
    headline: "Athlete-Agent Mindset",
    copy:
      "We treat our clients like professional athletes — with loyalty, strategy, and trust.",
  },
  {
    headline: "Award-Winning Service",
    copy:
      "Multiple Top Agent Awards with HomeLife Optimum Realty prove our results.",
  },
  {
    headline: "Premium Marketing",
    copy:
      "From professional photography and video to cutting-edge AI tools, we create marketing that makes your property stand out.",
  },
  {
    headline: "Community Expertise",
    copy:
      "From golf leagues to local events, our roots run deep across the GTA.",
  },
  {
    headline: "Lifestyle Focused",
    copy:
      "It’s not just about the house — it’s about finding the right community to thrive.",
  },
];

const teamMembers = [
  {
    name: "Matthew Mulhall",
    title: "Sales Representative, Finally Home Agents",
    bio: "Matthew is a co-founder of Finally Home Agents and one of the driving forces behind NorthSide GTA. With nearly two decades of combined real estate experience alongside his brother Landon, Matthew has helped clients buy and sell homes across the GTA with professionalism and care. As a proud dad of twins, Steven and Elena, he understands the importance of finding not just a house, but a place where families can thrive. Matthew brings award-winning service, strong negotiation skills, and a unique client-agent philosophy inspired by professional athlete representation — treating every client with loyalty, strategy, and trust.",
    awards: "Multiple Top Agent Award Winner, HomeLife Optimum Realty.",
    image: "/Images/matthew.jpg",
    email: "mailto:contact@finallyhomeagents.com?subject=Hello%20Matthew",
  },
  {
    name: "Landon Mulhall",
    title: "Sales Representative, Finally Home Agents",
    bio: "Landon is a co-founder of Finally Home Agents and a key voice behind the NorthSide GTA brand. Growing up in the area and staying closely connected through sports, golf, and community events, Landon brings an authentic understanding of what makes local neighborhoods special. He pairs that insight with creative marketing strategies — including the use of AI — to help buyers relocating to the GTA find more space, more community, and less traffic. Known for his approachable style and innovative brand-building, Landon combines award-winning service with a personal touch that makes every client feel like part of the family.",
    awards: "Multiple Top Agent Award Winner, HomeLife Optimum Realty.",
    image: "/Images/landon.jpg",
    email: "mailto:contact@finallyhomeagents.com?subject=Hello%20Landon",
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description: "Clients come first, always.",
  },
  {
    icon: Lightbulb,
    title: "Expertise",
    description: "Nearly 20 years combined experience and proven results.",
  },
  {
    icon: Award,
    title: "Professionalism",
    description: "Award-winning service and marketing strategies tailored to each client.",
  },
  {
    icon: MapPin,
    title: "Community",
    description: "Deep roots in NorthSide GTA and beyond.",
  },
  {
    icon: Heart,
    title: "Lifestyle-Driven",
    description: "Helping families thrive with more space, more community, and less traffic.",
  },
];

const testimonials = [
  {
    quote:
      "“Finally Home Agents exceeded our expectations when selling our home in Holland Landing. Their professionalism and personal attention set them apart.”",
    name: "Susan B.",
  },
  {
    quote:
      "“As a first-time buyer I had plenty of questions. Landon was patient and made my experience fantastic.”",
    name: "Logan A.",
  },
  {
    quote:
      "“Matthew found me my dream home during a crazy market. Wouldn’t have got it without him.”",
    name: "Olivia O.",
  },
  {
    quote:
      "“Landon took all the stress out of renting in a brand-new city — I am forever thankful!”",
    name: "Tessa C.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <Helmet>
        <title>About Finally Home Agents | Local NorthSide GTA Realtors®</title>
        <meta
          name="description"
          content="We’re a local, relationship-first real estate team serving the NorthSide GTA—Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge & Scugog."
        />
        <meta
          name="keywords"
          content="about Finally Home Agents, NorthSide GTA realtors, local real estate team, Newmarket, Aurora, Uxbridge"
        />
        <link rel="canonical" href="https://www.northsidegta.ca/about" />

        <meta
          property="og:title"
          content="About Finally Home Agents | NorthSide GTA"
        />
        <meta
          property="og:description"
          content="Local team. Personal guidance. NorthSide GTA focus."
        />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="https://www.northsidegta.ca/about" />
        <meta property="og:image" content="/Images/northsidegta-map-bg.jpg" />
      </Helmet>

      <main className="pb-16">
        {/* ───────── Hero Banner ───────── */}
        <section className="relative overflow-hidden bg-[#04110c] pb-20 pt-12 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_65%)]" aria-hidden />
          <div className="pointer-events-none absolute -top-24 left-[-10%] h-[22rem] w-[22rem] rounded-full bg-emerald-400/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-35%] right-[-15%] h-[28rem] w-[28rem] rounded-full bg-emerald-300/25 blur-3xl" />

          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 lg:flex-row lg:items-center lg:px-6">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
                NorthSide GTA • Finally Home Agents
              </span>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
                Meet the NorthSide Experts
              </h1>
              <p className="text-base text-emerald-100/90 sm:text-lg">
                Knowledge • Passion • Community
              </p>
            </div>
            <div className="flex flex-1 justify-center">
              <div className="relative w-full max-w-xl rounded-[40px] bg-gradient-to-tr from-emerald-300 via-emerald-400 to-emerald-500 p-[1.5px] shadow-[0_55px_110px_rgba(2,26,20,0.55)]">
                <div className="rounded-[36px] border border-white/15 bg-black/50 p-4 backdrop-blur">
                  <div className="overflow-hidden rounded-[28px] border border-white/10">
                    <img
                      src="/Images/hero-about.jpg"
                      alt="NorthSide GTA scenic"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Metrics Strip ───────── */}
        <section className="relative -mt-12 px-4">
          <div className="mx-auto w-full max-w-6xl rounded-[36px] border border-emerald-100 bg-white/90 p-8 shadow-2xl shadow-emerald-100/70 backdrop-blur">
            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 lg:text-left">
              {metrics.map((metric) => (
                <div key={metric.title} className="flex flex-col gap-2">
                  <span className="text-lg font-semibold text-emerald-900 sm:text-xl md:text-2xl">
                    {metric.title}
                  </span>
                  <p className="text-sm text-slate-600 md:text-base">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Why We're Different ───────── */}
        <section className="relative mt-24 overflow-hidden py-24">
          <div className="absolute inset-0 bg-[#06110d]" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700" aria-hidden />
          <div className="pointer-events-none absolute left-[-18%] top-[-18%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/25 blur-3xl" />
          <div className="pointer-events-none absolute right-[-12%] bottom-[-24%] h-[30rem] w-[30rem] rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15),_transparent_70%)]" aria-hidden />

          <div className="relative z-10 mx-auto max-w-6xl space-y-10 px-4 text-center text-white md:text-left">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Why We’re Different
            </h2>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {differentiators.map((item) => (
                <div key={item.headline} className="rounded-3xl border border-white/10 bg-white/10 p-6 text-left shadow-[0_25px_60px_rgba(4,47,35,0.45)] backdrop-blur">
                  <h3 className="text-xl font-semibold text-white">{item.headline}</h3>
                  <p className="mt-3 text-sm text-emerald-100/85 md:text-base">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Team Bios ───────── */}
        <section className="px-4 py-24">
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

        {/* ───────── Core Values ───────── */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-[#06110d]" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700" aria-hidden />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.2),_transparent_70%)]" aria-hidden />

          <div className="relative z-10 mx-auto max-w-6xl px-4 text-center text-white lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Core Values
            </h2>
            <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
              {values.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-[0_25px_60px_rgba(4,47,35,0.45)] backdrop-blur lg:items-start lg:text-left">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="text-sm text-emerald-100/85">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Testimonials ───────── */}
        <section className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
              Trusted by Families Across the GTA
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="flex h-full flex-col justify-between rounded-3xl border border-emerald-100 bg-white/90 p-8 text-left shadow-2xl shadow-emerald-100/60"
                >
                  <div className="flex items-center gap-3 text-sm font-semibold text-[#FBBC04]">
                    {"★★★★★"}
                    <img
                      src="/Images/google-logo.png"
                      alt="Google reviews"
                      className="h-4 w-auto"
                    />
                  </div>
                  <p className="mt-6 text-sm text-slate-700">{testimonial.quote}</p>
                  <p className="mt-6 text-sm font-semibold text-emerald-900">
                    — {testimonial.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── CTA Footer ───────── */}
        <section className="relative overflow-hidden rounded-[36px] px-4">
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
