// src/campaign-tracking.mjs
function campaignTracking(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const { campaignId, source, medium } = value;
  if (typeof campaignId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(campaignId) || !["instagram", "facebook"].includes(source) || medium !== "organic_social") return null;
  return { campaignId: campaignId.toLowerCase(), source, medium, evidence: "browser_reported" };
}

// src/core.mjs
import { DatabaseSync } from "node:sqlite";
var Fault = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
};

// src/lead-intake.mjs
var leadSources = ["homepage", "contact", "quick-contact", "listing-request", "play-your-budget", "buying-power", "coffee", "good-good", "membership", "newsletter", "contest", "tastehub", "community-event"];
var purposes = ["requested-response", "comparison-email-only", "newsletter", "membership", "contest", "business-request", "event-submission", "unknown"];
function field(value, max, required = false) {
  if (typeof value !== "string" || value.length > max || required && !value.trim()) throw new Fault(400, "Invalid inquiry field.");
  return value;
}
function validateLead(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) || input.version !== 1 || !leadSources.includes(input.source)) throw new Fault(400, "Invalid inquiry source.");
  const allowed = ["version", "source", "externalId", "receivedAt", "name", "email", "phone", "message", "pageUrl", "consent", "tracking"];
  if (Object.keys(input).some((k) => !allowed.includes(k))) throw new Fault(400, "Unexpected inquiry field.");
  const externalId = field(input.externalId, 200, true);
  if (!/^[a-zA-Z0-9:_-]+$/.test(externalId)) throw new Fault(400, "Invalid inquiry reference.");
  const receivedAt = field(input.receivedAt, 40, true);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(receivedAt) || !Number.isFinite(Date.parse(receivedAt))) throw new Fault(400, "Invalid inquiry date.");
  const consent = input.consent;
  if (!consent || !purposes.includes(consent.purpose) || !["unknown", "recorded", "withdrawn"].includes(consent.status) || typeof consent.marketing !== "boolean" || Object.keys(consent).some((k) => !["purpose", "status", "marketing", "evidence"].includes(k))) throw new Fault(400, "Invalid contact permission.");
  const evidence = field(consent.evidence, 2e3);
  if (consent.status === "recorded" && !evidence.trim()) throw new Fault(400, "Permission evidence required.");
  const pageUrl = field(input.pageUrl, 500);
  if (pageUrl) {
    let u;
    try {
      u = new URL(pageUrl);
    } catch {
      throw new Fault(400, "Invalid source page.");
    }
    if (u.protocol !== "https:" || !["northsidegta.ca", "www.northsidegta.ca"].includes(u.hostname) || u.username || u.password || u.port || u.search || u.hash) throw new Fault(400, "Use a website page URL without query parameters.");
  }
  const tracking = campaignTracking(input.tracking);
  return { ...tracking ? { tracking } : {}, version: 1, source: input.source, externalId, receivedAt: new Date(receivedAt).toISOString(), name: field(input.name, 200), email: field(input.email, 320), phone: field(input.phone, 100), message: field(input.message, 5e3), pageUrl, consent: { purpose: consent.purpose, status: consent.status, marketing: consent.marketing, evidence } };
}

// integrations/website/saved-request-projection.mjs
var communities = /* @__PURE__ */ new Set(["Georgina", "East Gwillimbury", "Newmarket", "Aurora", "Stouffville", "Uxbridge", "Scugog", "King", "Bradford", "georgina", "east-gwillimbury", "newmarket", "aurora", "stouffville", "uxbridge", "scugog"]);
function text(value, max, required = false) {
  if (value === void 0 && !required) return "";
  if (typeof value !== "string" || value.length > max || /[\u0000-\u001f]/.test(value) || required && !value.trim()) throw Error("Invalid saved request field");
  return value.trim();
}
function base(record, source, date, page) {
  if (!record || typeof record !== "object" || Array.isArray(record) || !/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(record.id || "")) throw Error("Persisted request identity required");
  return { version: 1, source, externalId: record.id.toLowerCase(), receivedAt: text(record[date], 40, true), name: text(record.name, 200), email: text(record.email, 320, true), phone: text(record.phone, 100), pageUrl: page };
}
function towns(values) {
  if (values === void 0) return [];
  if (!Array.isArray(values) || values.length > 9 || values.some((x) => !communities.has(x))) throw Error("Invalid saved communities");
  return [...new Set(values)];
}
function projectBuyingPowerRequest(record) {
  const lead = base(record, "buying-power", "submittedAt", "https://northsidegta.ca/what-my-home-buys");
  if (!["comparison", "valuation"].includes(record.leadType)) throw Error("Unknown saved request purpose");
  const comparison = record.leadType === "comparison";
  if (comparison ? record.contactConsent !== "Requested comparison email only" : record.contactConsent !== true) throw Error("Saved requested-contact evidence required");
  if (record.marketingConsent !== void 0 && typeof record.marketingConsent !== "boolean") throw Error("Marketing permission must be an explicit boolean");
  const preference = text(record.contactPreference, 20, true);
  if (!["email", "phone", "text"].includes(preference)) throw Error("Unknown response preference");
  const selected = towns(record.communities), version = text(record.consentVersion, 120);
  const tracking = campaignTracking({ campaignId: record.attribution?.utm_campaign, source: record.attribution?.utm_source, medium: record.attribution?.utm_medium });
  return validateLead({ ...lead, ...tracking ? { tracking } : {}, message: [comparison ? "Requested a home-buying comparison email." : "Requested a home-value conversation.", comparison ? `Requested delivery: email only. Recorded preference: ${preference}; this does not expand the requested-email permission.` : `Preferred response: ${preference}.`, selected.length ? `Selected communities: ${selected.join(", ")}.` : "", "Original request details remain in the website record."].filter(Boolean).join(" "), consent: { purpose: comparison ? "comparison-email-only" : "requested-response", status: "recorded", marketing: record.marketingConsent === true, evidence: `Saved website request ${lead.externalId}; ${comparison ? "comparison email only" : "requested valuation response"}; permission version: ${version || "not recorded"}; marketing checkbox: ${record.marketingConsent === true ? "true" : "false"}. Owner must review the original permission scope before outreach.` } });
}
function projectPlayYourBudgetRequest(record) {
  const lead = base(record, "play-your-budget", "createdAt", "https://northsidegta.ca/play-your-budget");
  if (record.contactConsent !== true) throw Error("Saved requested-contact evidence required");
  if (!["homes", "match"].includes(record.requestType)) throw Error("Unknown saved request purpose");
  const selected = towns(record.selectedCommunities);
  const tracking = campaignTracking(record.tracking);
  return validateLead({ ...lead, ...tracking ? { tracking } : {}, message: [record.requestType === "homes" ? "Requested homes matching selected communities." : "Requested a community match.", selected.length ? `Selected communities: ${selected.join(", ")}.` : "", "Budget and detailed preferences remain in the original website record."].filter(Boolean).join(" "), consent: { purpose: "requested-response", status: "recorded", marketing: false, evidence: `Saved Play Your Budget request ${lead.externalId}; contactConsent was true for this requested response. No separate marketing permission is inferred.` } });
}

// integrations/website/inquiry-outbox.mjs
import { createHash } from "node:crypto";
var prefix = "northside:hq-outbox:v1:";
var due = prefix + "due";
var quarantine = prefix + "review";
function prepareInquiryOutboxItem(lead) {
  if (!lead || typeof lead.source !== "string" || typeof lead.externalId !== "string" || !lead.externalId) throw Error("Stable source reference required.");
  const raw = JSON.stringify(lead);
  if (Buffer.byteLength(raw) > 16e3) throw Error("Inquiry exceeds size limit.");
  const id = createHash("sha256").update(lead.source + "\0" + lead.externalId).digest("hex");
  const fingerprint = createHash("sha256").update(JSON.stringify({ ...lead, receivedAt: "" })).digest("hex");
  return { raw, id, fingerprint, payloadKey: prefix + id, dueKey: due, fingerprintKey: prefix + id + ":fingerprint" };
}

// integrations/website/saved-request-store.mjs
var saveRequestScript = `
local expected={'string','zset','string','zset','string'}
for i=1,5 do
 local t=redis.call('TYPE',KEYS[i]).ok
 if t~='none' and t~=expected[i] then return -1 end
end
local fingerprint=redis.call('GET',KEYS[5])
local original=redis.call('GET',KEYS[1])
if fingerprint then
 if fingerprint~=ARGV[7] then return -2 end
 if not original then return -3 end
 return 2
end
if original or redis.call('EXISTS',KEYS[3])==1 then return -3 end
redis.call('MSET',KEYS[1],ARGV[1],KEYS[3],ARGV[4],KEYS[5],ARGV[7])
redis.call('ZADD',KEYS[2],ARGV[2],ARGV[3])
redis.call('ZADD',KEYS[4],ARGV[5],ARGV[6])
return 1`;
async function persistSavedWebsiteRequest(kind, record, { redis, now = Date.now } = {}) {
  if (!redis || typeof redis.eval !== "function") throw Error("Website Redis client required.");
  const definitions = {
    "buying-power": { project: projectBuyingPowerRequest, prefix: "buying-power:lead:", index: "buying-power:leads", date: "submittedAt" },
    "play-your-budget": { project: projectPlayYourBudgetRequest, prefix: "play-your-budget:v1:lead:", index: "play-your-budget:v1:index", date: "createdAt" }
  };
  const definition = definitions[kind];
  if (!definition) throw Error("Unsupported saved request source.");
  const lead = definition.project(record), item = prepareInquiryOutboxItem(lead), original = JSON.stringify(record);
  if (Buffer.byteLength(original) > 64e3) throw Error("Saved request exceeds size limit.");
  const score = Date.parse(record[definition.date]), queuedAt = now();
  if (!Number.isSafeInteger(score) || score < 0 || !Number.isSafeInteger(queuedAt) || queuedAt < 0) throw Error("Valid saved request time required.");
  const result = await redis.eval(saveRequestScript, [definition.prefix + lead.externalId, definition.index, item.payloadKey, item.dueKey, item.fingerprintKey], [original, score, lead.externalId, item.raw, queuedAt, item.id, item.fingerprint]);
  if (result !== 1 && result !== 2) throw Error("Request and headquarters copy were not confirmed saved.");
  return { saved: true, deliveryRecorded: true, newlyQueued: result === 1, replayed: result === 2, id: lead.externalId, deliveryId: item.id };
}
export {
  persistSavedWebsiteRequest,
  saveRequestScript
};
