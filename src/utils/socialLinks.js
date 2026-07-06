const SOCIAL_ENTRIES = [
  {
    key: "instagram",
    label: "Instagram",
    envKey: "PUBLIC_INSTAGRAM_URL",
    fallback: "https://instagram.com/FinallyHomeAgents",
  },
  {
    key: "facebook",
    label: "Facebook",
    envKey: "PUBLIC_FACEBOOK_URL",
    fallback: "https://facebook.com/finallyhomeagents",
  },
  {
    key: "youtube",
    label: "YouTube",
    envKey: "PUBLIC_YOUTUBE_URL",
    fallback: "https://www.youtube.com/@FinallyHomeAgents",
  },
  {
    key: "tiktok",
    label: "TikTok",
    envKey: "PUBLIC_TIKTOK_URL",
    fallback: "https://www.tiktok.com/@finallyhomeagents",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    envKey: "PUBLIC_LINKEDIN_URL",
    fallback: "https://www.linkedin.com/company/finally-home-agents",
  },
];

function envValue(key) {
  if (!key) return "";
  return (
    (process.env[`REACT_APP_${key}`] || process.env[key] || "")
      .toString()
      .trim()
  );
}

export function getSocialLinks() {
  return SOCIAL_ENTRIES.map((entry) => {
    const href = envValue(entry.envKey) || entry.fallback;
    if (!href) return null;
    return {
      key: entry.key,
      label: entry.label,
      href,
    };
  }).filter(Boolean);
}

export function getSocialLinkMap() {
  return getSocialLinks().reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {});
}
