// src/SignWithUsPage.js
import React from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import Button     from "./components/ui/Button";
import Card       from "./components/ui/Card";

/* optional page background – delete if you already added this in index.css */
const PageBackground = () => (
  <style>{`
    body {
      background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px);
      background-size: 12px 12px;
    }
  `}</style>
);

export default function SignWithUsPage() {
  return (
    <>
      <PageBackground />
      <HeaderShell />

      <Helmet>
        <title>Work With Finally Home Agents | NorthSide GTA</title>
        <meta
          name="description"
          content="Share your buying or selling goals with Finally Home Agents for NorthSide GTA real estate guidance."
        />
        <meta name="robots" content="noindex, follow" />
        <meta name="author" content="Finally Home Agents" />
        <meta name="publisher" content="Finally Home Agents" />
        <link rel="canonical" href="https://northsidegta.ca/sign" />
        <meta property="og:title" content="Work With Finally Home Agents | NorthSide GTA" />
        <meta property="og:description" content="Share your buying or selling goals with Finally Home Agents." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://northsidegta.ca/sign" />
        <meta property="og:image" content="https://northsidegta.ca/uploads/sellers-page-seo.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://northsidegta.ca/uploads/sellers-page-seo.jpg" />
      </Helmet>

      <div className="px-4 md:px-20 py-16 space-y-12">

        {/* HERO */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Work With Finally&nbsp;Home&nbsp;Agents
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you’re buying, selling, or simply planning ahead, let’s craft a winning
            strategy that gets you home—with clarity and confidence.
          </p>
        </section>

        {/* FORM CARD */}
        <section className="max-w-2xl mx-auto">
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-center">
              Tell&nbsp;Us&nbsp;About&nbsp;Your&nbsp;Goals
            </h2>

            <form
              name="sign-with-us"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"   /* spam filter */
              className="space-y-4"
            >
              {/* Netlify required hidden inputs */}
              <input type="hidden" name="form-name" value="sign-with-us" />
              <p className="hidden">
                <label>
                  Don’t fill this out: <input name="bot-field" />
                </label>
              </p>

              <input
                name="name"
                placeholder="Full Name"
                className="w-full border rounded-md px-4 py-3"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full border rounded-md px-4 py-3"
                required
              />
              <input
                name="phone"
                placeholder="Phone (optional)"
                className="w-full border rounded-md px-4 py-3"
              />

              <textarea
                name="message"
                rows="5"
                className="w-full border rounded-md px-4 py-3"
                defaultValue={
`Hi Finally Home Agents,

I’m interested in working with your team on my next real-estate move
(buying, selling, or both). Let me know the best way to get started!

Thanks and talk soon,`
                }
              />

              <Button size="lg" type="submit" className="w-full sm:w-auto">
                Send&nbsp;My&nbsp;Info
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </>
  );
}
