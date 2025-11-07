import React, { useEffect, useMemo, useRef, useState } from "react";
import Navigation from "./Navigation";
import ContactHero from "./components/contact/ContactHero";
import ContactChannelBar from "./components/contact/ContactChannelBar";
import SmartContactForm from "./components/contact/SmartContactForm";
import TrustPanel from "./components/contact/TrustPanel";
import ReviewsCarousel from "./components/contact/ReviewsCarousel";
import BookCallCard from "./components/contact/BookCallCard";
import ContactFooterBand from "./components/contact/ContactFooterBand";
// ⬇️ remove the Legacy import and the feature flag
// import LegacyContactPage from "./components/contact/LegacyContactPage";
import {
  useContactConfig,
  useContactChannels,
  // getContactFeatureEnabled, // remove this
  getJsonLd,
} from "./components/contact/contactConfig";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";

export default function ContactPage() {
  // Always render the new version
  return <ContactPageV2 />;
}

function ContactPageV2() {
  const config = useContactConfig();
  const channels = useContactChannels(config);
  const formRef = useRef(null);
  const formSectionRef = useRef(null);
  const [reviewsReady, setReviewsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const id = window.requestAnimationFrame(() => setReviewsReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const whatsappChannel = useMemo(
    () => channels.find((item) => item.key === "whatsapp"),
    [channels]
  );

  const jsonLd = useMemo(() => getJsonLd(config), [config]);

  const scrollToForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <DynamicMetaTags
        route="/contact"
        documentTitle={config.seoTitle}
        title={config.seoTitle}
        description={config.seoDescription}
        canonicalUrl="https://northsidegta.ca/contact"
        ogType="website"
        ogImage={config.seoImage || undefined}
        twitterCard="summary_large_image"
        twitterImage={config.seoImage || undefined}
      >
        <script type="application/ld+json">{jsonLd}</script>
      </DynamicMetaTags>
      <Navigation />
      <main className="bg-slate-50 pb-20">
        <ContactHero
          config={config}
          onPrimaryClick={scrollToForm}
          whatsappHref={whatsappChannel?.href}
        />
        <ContactChannelBar channels={channels} microcopy={config.contactMicrocopy} />
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <section ref={formSectionRef} id="contact-form" className="mx-auto max-w-6xl pt-12">
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
              <div className="space-y-6">
                <div className="rounded-3xl bg-white p-6 shadow-lg shadow-emerald-50 ring-1 ring-slate-100">
                  <SmartContactForm
                    config={config}
                    formRef={formRef}
                    whatsappChannel={whatsappChannel}
                  />
                </div>
              </div>
              <div className="space-y-6">
                <TrustPanel config={config} />
                <BookCallCard config={config} />
              </div>
            </div>
          </section>

          {reviewsReady && config.reviews.length > 0 && (
            <section className="mx-auto mt-14 max-w-4xl">
              <ReviewsCarousel
                reviews={config.reviews}
                disclaimer={config.reviewsDisclaimer}
              />
            </section>
          )}
        </div>
        <ContactFooterBand config={config} channels={channels} />
      </main>
    </>
  );
}
