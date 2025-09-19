// src/ThankYouPage.js
import React from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function useTopic() {
  const location = useLocation();
  return React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    const value = params.get("topic") || "";
    try {
      return decodeURIComponent(value.replace(/\+/g, "%20"));
    } catch (err) {
      return value;
    }
  }, [location.search]);
}

function useCollection(topic) {
  const [state, setState] = React.useState({ page: null, loading: false });

  React.useEffect(() => {
    const slug = typeof topic === "string" ? topic.trim().toLowerCase() : "";
    if (!slug) {
      setState({ page: null, loading: false });
      return;
    }

    let ignore = false;
    setState((prev) => ({ ...prev, loading: true }));
    fetch(`/data/collections/${slug}.json`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Missing JSON");
        return res.json();
      })
      .then((data) => {
        if (!ignore) setState({ page: data, loading: false });
      })
      .catch(() => {
        if (!ignore) setState({ page: null, loading: false });
      });

    return () => {
      ignore = true;
    };
  }, [topic]);

  return state;
}

const DEFAULT_HEADLINE = "Thanks! Your listings are on the way.";

export default function ThankYouPage() {
  const topicParam = useTopic();
  const normalizedSlug = React.useMemo(() => {
    if (!topicParam) return "";
    return topicParam.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  }, [topicParam]);
  const { page } = useCollection(normalizedSlug);

  const topicLabel =
    (typeof page?.headline === "string" && page.headline.trim()) ||
    topicParam ||
    "this request";

  const whatsappUrl =
    typeof page?.whatsappUrl === "string" && page.whatsappUrl.trim().length > 0
      ? page.whatsappUrl.trim()
      : "";

  const guideUrl =
    typeof page?.thankYouGuideUrl === "string" && page.thankYouGuideUrl.trim().length > 0
      ? page.thankYouGuideUrl.trim()
      : "";
  const guideLabel =
    (typeof page?.thankYouGuideLabel === "string" && page.thankYouGuideLabel.trim()) ||
    "Download the NorthSide GTA Buyer’s Guide";

  return (
    <div style={styles.page}>
      <Helmet>
        <title>Thanks! Your listings are on the way. • NorthSide GTA</title>
        <meta
          name="description"
          content={`We’ve just emailed the full list for ${topicLabel}. Please check your inbox (and spam).`}
        />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.headline}>{DEFAULT_HEADLINE}</h1>
          <p style={styles.subheadline}>
            We’ve just emailed the full list for {topicLabel}. Please check your inbox (and spam).
          </p>
        </header>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.primaryButton}
          >
            Save Us on WhatsApp
          </a>
        )}

        {guideUrl && (
          <a href={guideUrl} style={styles.secondaryLink} target="_blank" rel="noopener noreferrer">
            {guideLabel}
          </a>
        )}

        <p style={styles.homeLinkWrap}>
          Or keep exploring at {" "}
          <a href="/" style={styles.homeLink}>
            northsidegta.ca
          </a>
        </p>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
  },
  main: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 24,
    padding: "48px 40px",
    boxShadow: "0 30px 80px rgba(15, 23, 42, 0.12)",
    border: "1px solid rgba(15, 23, 42, 0.06)",
    textAlign: "center",
  },
  header: { marginBottom: 28 },
  headline: {
    margin: 0,
    fontSize: "clamp(28px, 5vw, 40px)",
    color: "#0f172a",
    lineHeight: 1.1,
  },
  subheadline: {
    marginTop: 18,
    marginBottom: 0,
    fontSize: 16,
    lineHeight: 1.7,
    color: "#475569",
  },
  primaryButton: {
    display: "inline-block",
    marginTop: 12,
    padding: "14px 24px",
    borderRadius: 999,
    background: "#0ea5e9",
    color: "#fff",
    fontWeight: 600,
    textDecoration: "none",
    boxShadow: "0 12px 30px rgba(14, 165, 233, 0.25)",
  },
  secondaryLink: {
    display: "inline-block",
    marginTop: 20,
    fontSize: 15,
    color: "#0f172a",
    textDecoration: "none",
    borderBottom: "1px solid rgba(15, 23, 42, 0.12)",
    paddingBottom: 2,
  },
  homeLinkWrap: {
    marginTop: 28,
    fontSize: 14,
    color: "#64748b",
  },
  homeLink: {
    color: "#0f172a",
    fontWeight: 600,
    textDecoration: "none",
  },
};
