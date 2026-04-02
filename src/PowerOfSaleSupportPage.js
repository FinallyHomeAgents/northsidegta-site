import React from "react";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import "./styles/power-of-sale-support.css";

const trustSignals = [
  "Local market knowledge across the NorthSide GTA",
  "Professional listing preparation and presentation",
  "Clear communication and consistent updates",
  "Strategic pricing and market positioning",
  "Coordinated execution with all stakeholders",
];

const reasons = [
  {
    title: "Structured approach to lender-directed listings",
    body:
      "Our process is designed to support properties that require clear timelines, coordinated access, and professional execution.",
  },
  {
    title: "Strong local market knowledge",
    body:
      "We operate across the NorthSide GTA and understand pricing, buyer demand, and micro-market differences that impact positioning.",
  },
  {
    title: "Professional presentation standards",
    body:
      "Even in challenging situations, we focus on presenting the property clearly and effectively to the market.",
  },
  {
    title: "Clear communication and reporting",
    body:
      "We provide consistent updates on activity, feedback, and next steps so all parties stay aligned.",
  },
  {
    title: "Ability to navigate complex situations",
    body:
      "We are prepared to work through access limitations, tenant situations, property condition issues, and coordination with multiple stakeholders.",
  },
  {
    title: "Balanced execution",
    body:
      "We focus on both timely action and thoughtful positioning to support a clean and efficient process.",
  },
];

const processSteps = [
  {
    title: "Initial file review",
    body: "We review the property, current status, access, condition, and any known limitations.",
  },
  {
    title: "Market analysis and strategy",
    body:
      "We assess current market conditions, comparable properties, and outline a pricing and positioning approach.",
  },
  {
    title: "Listing preparation",
    body:
      "We coordinate the appropriate level of preparation, including photography, access planning, and listing setup.",
  },
  {
    title: "Market launch and buyer management",
    body:
      "We manage inquiries, showings, and buyer communication while monitoring activity and feedback.",
  },
  {
    title: "Reporting and coordination",
    body:
      "We provide updates on activity, feedback, and offers, and work alongside all parties involved through to closing.",
  },
];

const faqItems = [
  {
    question: "Do you currently work with lenders on power of sale files?",
    answer:
      "We are actively building relationships with lenders and mortgage professionals and are structured to support power of sale and lender-directed listings across the NorthSide GTA.",
  },
  {
    question: "Do you handle occupied properties?",
    answer:
      "Yes. Our process is designed to support properties where access and communication require additional structure and coordination.",
  },
  {
    question: "Can you assist with as-is properties?",
    answer:
      "Yes. We assess how to position each property based on condition, timing, and current market conditions.",
  },
  {
    question: "Do you provide reporting and updates?",
    answer:
      "Yes. We provide clear updates on activity, feedback, and next steps throughout the listing process.",
  },
  {
    question: "Do you coordinate with lawyers and other professionals?",
    answer:
      "Yes. We work alongside all relevant parties to support a smooth and organized process.",
  },
];

export default function PowerOfSaleSupportPage() {
  return (
    <>
      <DynamicMetaTags
        route="/power-of-sale-support"
        documentTitle="Power of Sale Listing Support | NorthSide GTA"
        title="Power of Sale Listing Support | NorthSide GTA"
        description="Structured real estate support for power of sale and lender-directed listings across the NorthSide GTA."
        canonicalUrl="https://northsidegta.ca/power-of-sale-support"
        ogType="website"
        ogImage="/uploads/northside-gta-finally-home-agents-hero.jpg"
        twitterCard="summary_large_image"
        twitterImage="/uploads/northside-gta-finally-home-agents-hero.jpg"
        additionalMeta={[{ name: "robots", content: "noindex,nofollow" }]}
      />

      <main className="power-sale-page bg-[#f6f7f5] text-slate-900">
        <section className="power-sale-hero">
          <img
            src="/uploads/northside-gta-finally-home-agents-hero.jpg"
            alt="Aerial view of the NorthSide GTA area at sunset"
            className="power-sale-hero-image"
            loading="eager"
          />
          <div className="power-sale-hero-overlay" aria-hidden="true" />
          <div className="power-sale-wrap relative py-20 md:py-28 lg:py-32">
            <p className="power-sale-kicker">Professional Partner Page</p>
            <p className="power-sale-eyebrow">NorthSide GTA | Professional Listing Support</p>
            <h1 className="power-sale-title">
              Power of Sale Listing Support
              <br />
              For Banks, Lenders, and Mortgage Professionals
            </h1>
            <p className="power-sale-lead">
              We provide structured real estate support for power of sale and lender-directed listings across the NorthSide GTA, combining clear communication, local market insight, and disciplined execution from launch through closing.
            </p>
            <p className="power-sale-lead power-sale-lead-secondary">
              We are actively building relationships with lenders and mortgage professionals seeking a reliable, locally focused team.
            </p>
            <div className="power-sale-actions">
              <a href="mailto:contact@finallyhomeagents.com?subject=Confidential%20Conversation%20Request" className="power-sale-btn power-sale-btn-primary">
                Request a Confidential Conversation
              </a>
              <a href="mailto:contact@finallyhomeagents.com?subject=Power%20of%20Sale%20File%20Submission" className="power-sale-btn power-sale-btn-secondary">
                Submit a File
              </a>
            </div>
            <p className="power-sale-note">Serving the NorthSide GTA and surrounding communities.</p>
            <p className="power-sale-brokerage">
              Finally Home Agents | Matthew Mulhall &amp; Landon Mulhall, Sales Representatives, HomeLife Optimum Realty, Brokerage.
            </p>
          </div>
        </section>

        <section className="power-sale-trust-strip" aria-label="Trust signals">
          <div className="power-sale-wrap power-sale-trust-grid">
            {trustSignals.map((signal) => (
              <p key={signal} className="power-sale-trust-item">{signal}</p>
            ))}
          </div>
        </section>

        <section className="power-sale-wrap power-sale-section">
          <h2 className="power-sale-heading">Why lenders and mortgage professionals should consider working with us</h2>
          <div className="power-sale-reason-grid">
            {reasons.map((item) => (
              <article key={item.title} className="power-sale-reason-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="power-sale-wrap power-sale-image-break">
          <img
            src="/uploads/image-of-a-pool-in-a-backyard-of-a-nice-residential-home-in-ontario-canada..jpg"
            alt="Bright, professionally presented residential property in the NorthSide GTA"
            loading="lazy"
            className="power-sale-supporting-image"
          />
        </section>

        <section className="power-sale-wrap power-sale-section">
          <h2 className="power-sale-heading">What we handle</h2>
          <div className="power-sale-handle-grid">
            <div>
              <ul>
                <li>Power of sale listings</li>
                <li>Lender-directed sales</li>
                <li>Private lender disposition support</li>
                <li>As-is property sales</li>
                <li>Occupied and vacant properties</li>
                <li>Properties requiring cleanup or preparation coordination</li>
                <li>Pricing strategy and market positioning</li>
                <li>Offer management and communication</li>
                <li>Coordination with lawyers and relevant professionals</li>
              </ul>
            </div>
            <div>
              <p className="power-sale-subhead">Property types include</p>
              <ul>
                <li>Detached homes</li>
                <li>Condos</li>
                <li>Townhomes</li>
                <li>Rural and semi-rural properties</li>
                <li>Investment properties</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="power-sale-wrap power-sale-section">
          <h2 className="power-sale-heading">Our Process</h2>
          <ol className="power-sale-process-list">
            {processSteps.map((step, index) => (
              <li key={step.title} className="power-sale-process-item">
                <span className="power-sale-step-num">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="power-sale-wrap power-sale-section power-sale-collab">
          <div>
            <h2 className="power-sale-heading">Built for professional collaboration</h2>
            <p>
              While our primary work is with buyers and sellers across the NorthSide GTA, our systems, communication standards, and listing process are designed to integrate smoothly with professional partners, including lenders, mortgage brokers, and legal teams.
            </p>
          </div>
          <img
            src="/Images/hero-about.jpg"
            alt="Matthew and Landon of Finally Home Agents"
            loading="lazy"
          />
        </section>

        <section className="power-sale-wrap power-sale-section">
          <h2 className="power-sale-heading">NorthSide GTA Coverage</h2>
          <div className="power-sale-coverage-grid">
            <ul>
              <li>Newmarket</li>
              <li>Aurora</li>
              <li>East Gwillimbury</li>
              <li>Stouffville</li>
              <li>Uxbridge</li>
              <li>Georgina</li>
              <li>Scugog</li>
            </ul>
            <img src="/Images/northside-map.svg" alt="Map of NorthSide GTA coverage areas" loading="lazy" />
          </div>
          <p className="power-sale-note">Serving the NorthSide GTA and surrounding communities.</p>
        </section>

        <section className="power-sale-wrap power-sale-section">
          <h2 className="power-sale-heading">Frequently Asked Questions</h2>
          <div className="power-sale-faq-list">
            {faqItems.map((item) => (
              <details className="power-sale-faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="power-sale-wrap power-sale-final-cta">
          <h2>Need support on a power of sale file in the NorthSide GTA?</h2>
          <p>
            We are available to connect, review the situation, and outline a clear approach based on the property, timeline, and requirements.
          </p>
          <div className="power-sale-actions">
            <a href="mailto:contact@finallyhomeagents.com?subject=Power%20of%20Sale%20File%20Submission" className="power-sale-btn power-sale-btn-primary">
              Submit a File
            </a>
            <a href="mailto:contact@finallyhomeagents.com?subject=Confidential%20Conversation%20Request" className="power-sale-btn power-sale-btn-secondary">
              Request a Confidential Conversation
            </a>
          </div>
          <p className="power-sale-contact-row">
            <a href="mailto:contact@finallyhomeagents.com">contact@finallyhomeagents.com</a>
            <span aria-hidden="true">•</span>
            <a href="tel:+16476684646">647-668-4646</a>
          </p>
        </section>

        <section className="power-sale-wrap pb-16 md:pb-20">
          <p className="power-sale-compliance-line">
            We are a real estate team serving the NorthSide GTA, working in collaboration with lenders, mortgage professionals, and legal representatives where applicable.
          </p>
          <p className="power-sale-brokerage-bottom">
            Brokerage: HomeLife Optimum Realty, Brokerage.
          </p>
        </section>
      </main>
    </>
  );
}
