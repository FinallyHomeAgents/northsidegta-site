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
    <div className="bg-white text-gray-900">
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

      {/* ───────── Hero Banner ───────── */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src="/Images/hero-about.jpg"
          alt="NorthSide GTA scenic"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Meet the NorthSide Experts
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-gray-200">
              Knowledge&nbsp;&bull;&nbsp;Passion&nbsp;&bull;&nbsp;Community
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Metrics Strip ───────── */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 border-y border-gray-200 py-10 text-center sm:grid-cols-2 lg:grid-cols-4 lg:text-left">
          {metrics.map((metric, index) => (
            <div
              key={metric.title}
              className={`flex flex-col gap-3 ${
                index !== 0 ? "lg:border-l lg:border-gray-200 lg:pl-10" : ""
              }`}
            >
              <span className="text-xl font-semibold md:text-2xl">
                {metric.title}
              </span>
              <p className="text-sm text-gray-600 md:text-base">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Why We're Different ───────── */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-5xl space-y-10 text-center md:text-left">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Why We’re Different
          </h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {differentiators.map((item) => (
              <div key={item.headline} className="space-y-3">
                <h3 className="text-xl font-semibold">{item.headline}</h3>
                <p className="text-gray-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Team Bios ───────── */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-20">
          {teamMembers.map((member, idx) => (
            <article
              key={member.name}
              className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 ${
                idx % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="flex justify-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-auto w-full max-w-sm rounded-3xl object-cover shadow-lg"
                />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-3xl font-semibold tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-sm uppercase tracking-[0.28em] text-gray-500">
                    {member.title}
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {member.bio}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {member.awards}
                </p>
                <div>
                  <a
                    href={member.email}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
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
      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-6xl text-center lg:text-left">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Core Values
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="h-6 w-6 text-green-700" />
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Testimonials ───────── */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-gray-500">
            Trusted by Families Across the GTA
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-gray-50 p-8 text-left shadow-sm"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-[#FBBC04]">
                  {"★★★★★"}
                  <img
                    src="/Images/google-logo.png"
                    alt="Google reviews"
                    className="h-4 w-auto"
                  />
                </div>
                <p className="mt-6 text-sm text-gray-700">{testimonial.quote}</p>
                <p className="mt-6 text-sm font-semibold text-gray-900">
                  — {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA Footer ───────── */}
      <section className="bg-green-700 px-4 py-16 text-center text-white">
        <h2 className="text-3xl font-semibold md:text-4xl">
          Ready to make your move?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          Let’s talk about your goals and create your NorthSide GTA success story.
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-green-700 shadow hover:bg-gray-100 transition"
        >
          Contact Matthew &amp; Landon
        </Link>
      </section>
    </div>
  );
}
