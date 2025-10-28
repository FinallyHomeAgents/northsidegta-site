import { getEnvValue } from "../utils/env";

const DEFAULT_SOCIALS = {
  instagram: "https://instagram.com/finallyhomeagents",
  facebook: "https://facebook.com/finallyhomeagents",
  youtube: "https://www.youtube.com/@finallyhomeagents",
  tiktok: "https://www.tiktok.com/@finallyhomeagents",
  linkedin: "https://www.linkedin.com/company/finally-home-agents",
};

export function getSocialLinks() {
  const links = [
    {
      key: "instagram",
      label: "Instagram",
      href: getEnvValue("PUBLIC_INSTAGRAM_URL") || DEFAULT_SOCIALS.instagram,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: getEnvValue("PUBLIC_FACEBOOK_URL") || DEFAULT_SOCIALS.facebook,
    },
    {
      key: "youtube",
      label: "YouTube",
      href: getEnvValue("PUBLIC_YOUTUBE_URL") || DEFAULT_SOCIALS.youtube,
    },
    {
      key: "tiktok",
      label: "TikTok",
      href: getEnvValue("PUBLIC_TIKTOK_URL") || DEFAULT_SOCIALS.tiktok,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: getEnvValue("PUBLIC_LINKEDIN_URL") || DEFAULT_SOCIALS.linkedin,
    },
  ];

  return links.filter((item) => typeof item.href === "string" && item.href.trim().length > 0);
}
