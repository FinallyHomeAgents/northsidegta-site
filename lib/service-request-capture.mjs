// src/campaign-tracking.mjs
function campaignTracking(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const { campaignId, source, medium } = value;
  if (typeof campaignId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(campaignId) || !["instagram", "facebook"].includes(source) || medium !== "organic_social") return null;
  return { campaignId: campaignId.toLowerCase(), source, medium, evidence: "browser_reported" };
}
function campaignTrackingFromUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || !["northsidegta.ca", "www.northsidegta.ca"].includes(u.hostname) || u.port || u.username || u.password) return null;
    for (const key of ["utm_campaign", "utm_source", "utm_medium"]) if (u.searchParams.getAll(key).length !== 1) return null;
    return campaignTracking({ campaignId: u.searchParams.get("utm_campaign"), source: u.searchParams.get("utm_source"), medium: u.searchParams.get("utm_medium") });
  } catch {
    return null;
  }
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

// integrations/website/service-request-capture.mjs
var text = (v, max, required = false) => {
  if (v === void 0 && !required) return "";
  if (typeof v !== "string" || v.length > max || /[\u0000-\u001f]/.test(v) || required && !v.trim()) throw Error("Invalid service request");
  return v.trim();
};
function projectServiceRequest(kind, record) {
  if (!record || !/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(record.id || "")) throw Error("Stable request identity required");
  const tracking = kind === "coffee" ? campaignTrackingFromUrl(record.sourceUrl) : null;
  const common = { ...tracking ? { tracking } : {}, version: 1, externalId: record.id.toLowerCase(), receivedAt: text(record.receivedAt, 40, true), name: text(record.name, 200, true), email: text(record.email, 320, true), phone: text(record.phone, 100) };
  if (kind === "listing-email") {
    if (record.casl !== true || record.notRepresented !== true) throw Error("Explicit source checkboxes required");
    return validateLead({ ...common, source: "listing-request", pageUrl: "https://northsidegta.ca/", message: `Requested listing email: ${text(record.title, 200, true)}. Listing reference: ${text(record.slug, 120)}. Email delivery is separate from headquarters capture.`, consent: { purpose: "requested-response", status: "recorded", marketing: false, evidence: "Requested listing email only. Source casl and notRepresented checkboxes were true; exact form wording and representation remain owner-review matters. No broad marketing permission inferred." } });
  }
  if (kind === "coffee") {
    const date = text(record.requestedDate, 10, true), time = text(record.requestedTime, 5, true);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):(00|30)$/.test(time)) throw Error("Invalid requested meeting time");
    return validateLead({ ...common, source: "coffee", pageUrl: "https://northsidegta.ca/coffee", message: `Coffee meeting requested for ${date} ${time} America/Toronto. Pending owner confirmation; not a booked appointment. Address and notes remain in the original request.`, consent: { purpose: "requested-response", status: "unknown", marketing: false, evidence: "Submitted coffee meeting request. No separate consent checkbox was observed; owner must review requested-contact scope. Meeting is not confirmed." } });
  }
  throw Error("Unsupported service request");
}
async function persistServiceRequest(kind, record, { redis, now = Date.now } = {}) {
  const lead = projectServiceRequest(kind, record), item = prepareInquiryOutboxItem(lead);
  const original = JSON.stringify(record), score = Date.parse(record.receivedAt), queuedAt = now();
  if (Buffer.byteLength(original) > 64e3 || !Number.isSafeInteger(queuedAt) || queuedAt < 0) throw Error("Invalid source record");
  if (!redis || typeof redis.eval !== "function") throw Error("Durable storage required");
  const prefix2 = `northside:service-request:${kind}:`;
  const result = await redis.eval(saveRequestScript, [prefix2 + lead.externalId, prefix2 + "index", item.payloadKey, item.dueKey, item.fingerprintKey], [original, score, lead.externalId, item.raw, queuedAt, item.id, item.fingerprint]);
  if (result !== 1 && result !== 2) throw Error("Service request save not confirmed");
  return { reference: lead.externalId, deliveryId: item.id, replayed: result === 2 };
}
async function recordServiceNotification(kind, reference, status, { redis } = {}) {
  if (!["coffee", "listing-email"].includes(kind) || !/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(reference) || !["accepted", "failed", "unknown"].includes(status)) throw Error("Invalid notification outcome");
  await redis.set(`northside:service-request:${kind}:notification:${reference}`, { status, checkedAt: (/* @__PURE__ */ new Date()).toISOString() });
}
export {
  persistServiceRequest,
  projectServiceRequest,
  recordServiceNotification
};
