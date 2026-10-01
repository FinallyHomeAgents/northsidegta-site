import React from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Compass, HeartHandshake, MapPin, Phone } from "lucide-react";
import HeaderShell from "./components/HeaderShell";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import { CANONICAL_TESTIMONIALS } from "./data/testimonials";
import "./AboutPage.css";

const ABOUT_ROUTE_META = getStaticRouteMeta("/about") || {};
const clientStory = CANONICAL_TESTIMONIALS.find(({ id }) => id === "glenn-t");
const communities = [
  ["Georgina", "georgina"],
  ["East Gwillimbury", "east-gwillimbury"],
  ["Newmarket", "newmarket"],
  ["Aurora", "aurora"],
  ["Whitchurch-Stouffville", "stouffville"],
  ["Uxbridge", "uxbridge"],
  ["Scugog", "scugog"],
];
const approach = [
  {
    icon: HeartHandshake,
    title: "An athlete-agent mindset.",
    text: "We approach representation the way an agent supports a professional athlete: with loyalty, strategy, and your long-term interests at heart. Matthew and Landon stay directly involved from the first conversation to closing.",
  },
  {
    icon: Compass,
    title: "A plan built around your life.",
    text: "Your budget, commute, family, and timing shape the search or sale. We help you understand the trade-offs before you make a decision.",
  },
  {
    icon: MapPin,
    title: "Local knowledge you can use.",
    text: "From neighbourhood feel to pricing and presentation, we turn our experience across these communities into practical guidance for your next move.",
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <HeaderShell />
      <DynamicMetaTags {...ABOUT_ROUTE_META} />
      <main>
        <section className="about-wrap about-hero" aria-labelledby="about-heading">
          <div className="about-hero-copy">
            <h1 id="about-heading"><span className="about-eyebrow">About Finally Home Agents</span>Brothers. Neighbours.<br /><span>Your real estate team.</span></h1>
            <p className="about-intro">We’re Matthew and Landon Mulhall. We help people find their place in the communities we call home.</p>
            <p className="about-body">Buying, selling, or figuring out what comes next? We bring local perspective, a clear strategy, and personal support to your move across the NorthSide GTA.</p>
            <div className="about-actions">
              <Link className="about-button" to="/contact">Let’s talk about your move <ArrowRight size={18} aria-hidden="true" /></Link>
              <a className="about-text-link" href="#meet-the-team">Meet Matthew & Landon <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            <p className="about-brokerage">Finally Home Agents · HomeLife Optimum Realty, Brokerage</p>
          </div>
          <figure className="about-hero-photo">
            <img src="/assets/homepage/matthew-landon-northside-gta.jpg" alt="Landon and Matthew Mulhall, the brothers behind Finally Home Agents" width="2100" height="1500" loading="eager" />
            <figcaption><span>Landon & Matthew Mulhall</span><span>Finally Home Agents</span></figcaption>
          </figure>
        </section>

        <section className="about-roots" aria-labelledby="about-roots-heading">
          <div className="about-wrap about-roots-grid">
            <div><p className="about-eyebrow">The story behind NorthSide GTA</p><h2 id="about-roots-heading">We live here.<br />We work here.</h2></div>
            <div className="about-body">
              <p>NorthSide GTA is personal. It’s where we live, raise our families, play golf, and spend time in our communities. That connection is why we built a place to explore life north of Toronto.</p>
              <p>Through Finally Home Agents, we help you take the next step: compare neighbourhoods, understand the market, and make a move that fits your life. The homes matter. So does everything around them.</p>
            </div>
          </div>
        </section>

        <section className="about-wrap about-section" id="meet-the-team" aria-labelledby="about-team-heading">
          <div className="about-section-heading"><div><p className="about-eyebrow">Two brothers. One team.</p><h2 id="about-team-heading">Get to know your agents.</h2></div><p>You’ll work with us directly.<br />Start by getting to know us.</p></div>
          <div className="about-team-grid">
            <article className="about-profile">
              <img src="/assets/agents/matthew-mulhall-solo-portrait.jpg" alt="Matthew Mulhall" loading="lazy" width="800" height="1000" />
              <div className="about-profile-copy">
                <p className="about-eyebrow">Co-founder · Finally Home Agents</p>
                <h3>Matthew Mulhall</h3>
                <p className="about-role">Sales Representative</p>
                <p className="about-award"><strong>HomeLife Optimum Realty’s #1 Individual Agent</strong><span>2023 · 2024 · 2025</span></p>
                <p className="about-body">A real estate agent since 2009 and a dad of twins living in Keswick, Matthew brings experienced negotiation, thoughtful strategy, and a family perspective to every move.</p>
                <Link className="about-text-link" to="/agents/matthew-mulhall">More about Matthew <ArrowRight size={17} aria-hidden="true" /></Link>
                <a className="about-phone" href="tel:+16476684646"><Phone size={15} aria-hidden="true" />647-668-4646<span className="sr-only"> — call Matthew</span></a>
                <a className="about-text-link" href="mailto:contact@finallyhomeagents.com?subject=Hello%20Matthew">Email Matthew</a>
              </div>
            </article>
            <article className="about-profile">
              <img src="/assets/agents/landon-mulhall-solo-portrait.jpg" alt="Landon Mulhall" loading="lazy" width="800" height="1000" />
              <div className="about-profile-copy">
                <p className="about-eyebrow">Co-founder · Finally Home Agents</p>
                <h3>Landon Mulhall</h3>
                <p className="about-role">Sales Representative</p>
                <p className="about-body">Raised in Uxbridge and now living in East Gwillimbury, Landon combines first-hand community knowledge, creative marketing, and an approachable style to help you find the right fit.</p>
                <Link className="about-text-link" to="/agents/landon-mulhall">More about Landon <ArrowRight size={17} aria-hidden="true" /></Link>
                <a className="about-phone" href="tel:+14164554594"><Phone size={15} aria-hidden="true" />416-455-4594<span className="sr-only"> — call Landon</span></a>
                <a className="about-text-link" href="mailto:LandoTheRealtor@gmail.com?subject=Hello%20Landon">Email Landon</a>
              </div>
            </article>
          </div>
        </section>

        <section className="about-approach" aria-labelledby="about-approach-heading">
          <div className="about-wrap about-section">
            <p className="about-eyebrow">What working with us feels like</p>
            <h2 id="about-approach-heading">Good advice. A clear next step.</h2>
            <div className="about-approach-grid">{approach.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={27} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div>
          </div>
        </section>

        {clientStory && <section className="about-wrap about-quote" aria-label="A client’s experience">
          <p className="about-eyebrow">In our clients’ words</p>
          <blockquote><p>“{clientStory.quote}”</p><footer>{clientStory.name}<span>Finally Home Agents client</span></footer></blockquote>
          <a className="about-text-link" href="https://share.google/GJz2QTQ8GqZIifaNH" target="_blank" rel="noreferrer">Read our Google reviews <ArrowRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        </section>}

        <section className="about-wrap about-communities" aria-labelledby="about-communities-heading">
          <p className="about-eyebrow">Seven communities. Plenty of possibilities.</p>
          <h2 id="about-communities-heading">Find your NorthSide.</h2>
          <p className="about-body">Different towns, different ways to feel at home. Get to know the communities we serve.</p>
          <nav aria-label="Explore our communities">{communities.map(([name, slug]) => <Link key={slug} to={`/communities/${slug}`}>{name}<ArrowRight size={16} aria-hidden="true" /></Link>)}</nav>
        </section>

        <section className="about-wrap about-cta" aria-labelledby="about-cta-heading">
          <div><p className="about-eyebrow">Your next chapter starts with a conversation</p><h2 id="about-cta-heading">Tell us what home looks like to you.</h2><p>Ready to move or just exploring? Let’s talk through your options.</p></div>
          <Link className="about-button" to="/contact">Talk with Matthew & Landon <ArrowRight size={18} aria-hidden="true" /></Link>
        </section>
      </main>
      <footer className="about-wrap about-footer"><p><strong>Finally Home Agents</strong><br />HomeLife Optimum Realty, Brokerage</p><div><p>Not intended to solicit clients already under contract with a brokerage.</p><p>© {new Date().getFullYear()} NorthSide GTA <span aria-hidden="true">·</span> <Link to="/privacy">Privacy policy</Link></p></div></footer>
    </div>
  );
}
