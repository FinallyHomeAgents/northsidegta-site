import { useEffect, useMemo, useState } from "react";

const CONTACT_JSON_PATH = "/data/contact-page.json";

const DEFAULT_CONFIG = {
  heroHeadline: "Glad you found us — let’s talk.",
  heroSubhead: "Buying or selling in the NorthSide GTA? We reply within 1 hour, 9am–9pm.",
  responsePledge: "We reply within 1 hour, 9am–9pm.",
  coverageLine: "Uxbridge • Georgina • Scugog • Stouffville • East Gwillimbury • Newmarket",
  heroPrimaryCtaLabel: "Send a Message",
  heroSecondaryCtaLabel: "Chat on WhatsApp",
  contactMicrocopy: "We usually reply in minutes.",
  trustBullets: [
    "Local experts: we don’t just work here — we live here.",
    "Concierge-level guidance from first chat to closing.",
    "Fast, human replies (9am–9pm).",
    "Neighborhood intel you won’t find on portals.",
  ],
  trustBadges: [],
  reviews: [],
  reviewsDisclaimer: "Real reviews from real clients.",
  showSchedulingCard: false,
  schedulingLabel: "Book a Call",
  schedulingSubcopy: "Pick a time that works for you and we’ll confirm within the hour.",
  schedulingUrl: "",
  footerBrokerageCopy:
    "Real Broker Ontario Ltd., Brokerage — Finally Home Agents, REALTORS®",
  footerAreas:
    "Serving Uxbridge, Georgina, Scugog, Stouffville, East Gwillimbury, Newmarket",
  footerSecondaryLinks: [
    { label: "Community Events", href: "/community" },
    { label: "Buyer’s Guide", href: "/buyers" },
  ],
  formThankYouMessage:
    "Thanks! We got your message and we’ll reply within the hour (9am–9pm).",
  seoTitle: "Contact Finally Home Agents | NorthSide GTA Real Estate Experts",
  seoDescription:
    "Talk to NorthSide GTA real estate experts for buying and selling guidance across Uxbridge, Georgina, Scugog, Stouffville, East Gwillimbury, and Newmarket.",
  seoImage: "/Images/northsidegta-map-bg.jpg",
  jsonLd: {
    sameAs: [],
    areaServed: [
      "Uxbridge",
      "Georgina",
      "Scugog",
      "Whitchurch-Stouffville",
      "East Gwillimbury",
      "Newmarket",
    ],
  },
};

function envValue(key) {
  return (
    (process.env[`REACT_APP_${key}`] || process.env[key] || "")
      .toString()
      .trim()
  );
}

function normalizeConfig(raw = {}) {
  const merged = {
    ...DEFAULT_CONFIG,
    ...raw,
  };

  merged.trustBullets = Array.isArray(raw.trustBullets)
    ? raw.trustBullets.filter(Boolean)
    : DEFAULT_CONFIG.trustBullets;

  merged.trustBadges = Array.isArray(raw.trustBadges)
    ? raw.trustBadges.filter((item) => item && (item.image || item.label))
    : DEFAULT_CONFIG.trustBadges;

  merged.reviews = Array.isArray(raw.reviews)
    ? raw.reviews.filter((item) => item && (item.quote || item.text))
    : DEFAULT_CONFIG.reviews;

  merged.footerSecondaryLinks = Array.isArray(raw.footerSecondaryLinks)
    ? raw.footerSecondaryLinks.filter((link) => link && link.href && link.label)
    : DEFAULT_CONFIG.footerSecondaryLinks;

  merged.jsonLd = {
    ...DEFAULT_CONFIG.jsonLd,
    ...(raw.jsonLd || {}),
  };

  if (!merged.heroPrimaryCtaLabel) {
    merged.heroPrimaryCtaLabel = DEFAULT_CONFIG.heroPrimaryCtaLabel;
  }
  if (!merged.heroSecondaryCtaLabel) {
    merged.heroSecondaryCtaLabel = DEFAULT_CONFIG.heroSecondaryCtaLabel;
  }
  if (!merged.reviewsDisclaimer) {
    merged.reviewsDisclaimer = DEFAULT_CONFIG.reviewsDisclaimer;
  }
  if (!merged.formThankYouMessage) {
    merged.formThankYouMessage = DEFAULT_CONFIG.formThankYouMessage;
  }

  return merged;
}

export function useContactConfig() {
  const [config, setConfig] = useState(() => normalizeConfig(DEFAULT_CONFIG));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(CONTACT_JSON_PATH, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data) {
          setConfig(normalizeConfig(data));
        }
      } catch (err) {
        // ignore network errors and stick to defaults
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}

export function useContactChannels() {
  return useMemo(() => {
    const phone = envValue("PUBLIC_PHONE");
    const sms = envValue("PUBLIC_SMS") || phone;
    const whatsappNumber = envValue("PUBLIC_WHATSAPP_NUMBER");
    const instagramUrl = envValue("PUBLIC_INSTAGRAM_URL");
    const facebookUrl = envValue("PUBLIC_FACEBOOK_URL");

    const baseMessage =
      "Hi Finally Home Agents! I’d love concierge help with my move in the NorthSide GTA.";

    const items = [
      phone && {
        key: "call",
        label: "Call",
        href: `tel:${phone}`,
      },
      sms && {
        key: "text",
        label: "Text",
        href: `sms:${sms}`,
      },
      {
        key: "email",
        label: "Email",
        href: "mailto:contact@finallyhomeagents.com",
      },
      whatsappNumber && {
        key: "whatsapp",
        label: "WhatsApp",
        href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(baseMessage)}`,
      },
      instagramUrl && {
        key: "instagram",
        label: "Instagram",
        href: instagramUrl,
      },
      facebookUrl && {
        key: "facebook",
        label: "Facebook",
        href: facebookUrl,
      },
    ].filter(Boolean);

    return items;
  }, []);
}

export function getFormEndpoint() {
  const directUrl = envValue("FORMSPREE_CONTACT_URL");
  if (directUrl) return directUrl;
  const formId = envValue("FORMSPREE_CONTACT_ID");
  if (formId) return `https://formspree.io/f/${formId}`;
  return "https://formspree.io/f/mwpborow";
}

export function getContactFeatureEnabled() {
  const flagValue = envValue("CONTACT_V2").toLowerCase();
  const vercelEnv = envValue("VERCEL_ENV").toLowerCase() || envValue("NEXT_PUBLIC_VERCEL_ENV").toLowerCase();
  const reactAppVercel = envValue("REACT_APP_VERCEL_ENV").toLowerCase();
  const isPreview = [vercelEnv, reactAppVercel].some((v) => v === "preview");

  if (flagValue === "false" || flagValue === "0") return false;
  if (flagValue === "true" || flagValue === "1") return true;
  return isPreview;
}

export function getJsonLd(config) {
  const phone = envValue("PUBLIC_PHONE");
  const instagramUrl = envValue("PUBLIC_INSTAGRAM_URL");
  const facebookUrl = envValue("PUBLIC_FACEBOOK_URL");
  const whatsappNumber = envValue("PUBLIC_WHATSAPP_NUMBER");

  const sameAs = [instagramUrl, facebookUrl].filter(Boolean);

  const organization = {
    "@type": "Organization",
    name: "Finally Home Agents",
    url: "https://www.northsidegta.ca/contact",
    telephone: phone || undefined,
    sameAs: [...sameAs, ...(config.jsonLd?.sameAs || [])].filter(Boolean),
  };

  if (whatsappNumber) {
    organization.contactPoint = [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: `+${whatsappNumber}`,
        availableLanguage: ["English"],
      },
    ];
  }

  const doc = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: config.heroHeadline,
    description: config.heroSubhead,
    url: "https://www.northsidegta.ca/contact",
    mainEntity: organization,
    areaServed: config.jsonLd?.areaServed || DEFAULT_CONFIG.jsonLd.areaServed,
  };

  return JSON.stringify(doc);
}
