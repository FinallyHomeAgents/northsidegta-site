function normalizeMedia(items) {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .filter(item => {
      if (!item || item.published === false || typeof item.url !== "string") return false;
      const url = item.url.trim();
      if (!/^https:\/\/(www\.)?instagram\.com\/(reel|p|tv)\/[\w-]+\/?(?:\?.*)?$/.test(url) || seen.has(url.split("?")[0].replace(/\/$/, ""))) return false;
      seen.add(url.split("?")[0].replace(/\/$/, ""));
      return true;
    })
    .sort((a, b) => Number(Boolean(b.pin)) - Number(Boolean(a.pin)) || (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

module.exports = { normalizeMedia };
