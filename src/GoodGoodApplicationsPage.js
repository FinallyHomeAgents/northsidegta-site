import React, { useEffect, useState } from "react";
import "./GoodGoodApplicationsPage.css";

const reviewStatuses = ["New", "Reviewing", "Conversation", "Shortlisted", "Declined"];
const hiddenAnswers = new Set(["id", "status", "notes", "ipHash", "createdAt", "updatedAt", "updatedBy", "agree", "offer"]);
const endpoint = "/api/good-good-applications";

function offerLabel(application) {
  if (application.offerPending) return "Email pending";
  if (application.status === "Accepted") return "Offer pending";
  if (application.status === "Confirmed") return "Filled";
  return application.status;
}

function createDraft(application) {
  const seat = application.category === "Other" ? "" : application.category;
  return {
    seat,
    subject: "Your invitation to GOOD GOOD Business Network",
    note: ""
  };
}

function acceptanceMessage(application, seat) {
  const firstName = application.name.trim().split(/\s+/)[0];
  return [
    "Hi " + firstName + ",",
    "We’d like to offer you the " + (seat.trim() || "[business category]") + " seat in GOOD GOOD Business Network at Mill Run Golf Club.",
    "Please reply to confirm you’d like to join. We’re looking forward to having you in the group.",
    "Matthew & Landon\nGOOD GOOD Business Network"
  ].filter(Boolean).join("\n\n");
}

async function request(action, { id, data } = {}) {
  const query = new URLSearchParams({ action });
  if (id) query.set("id", id);
  const response = await fetch(endpoint + "?" + query, data ? {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  } : undefined);
  if (response.status === 401) {
    window.location.assign("/life/studio/");
    throw new Error("Sign in to continue.");
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}

function ApplicationReview({ application, refresh, onClose }) {
  const [record, setRecord] = useState(application);
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.notes || "");
  const [draft, setDraft] = useState(null);
  const [deliveryChecked, setDeliveryChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const offer = record.offer;
  const retry = offer && !offer.sentAt && !offer.resolvedAt && !offer.closedAt;
  const offerAge = retry ? Date.now() - offer.timestamp : 0;
  const accepted = record.status === "Accepted" || record.status === "Confirmed";
  const message = draft && (draft.customBody ?? acceptanceMessage(record, draft.seat));
  const note = draft?.note.trim();
  const fullMessage = note ? message.trim() + "\n\nPersonal note from Matthew & Landon:\n" + note : message;

  function applyRecord(updated) {
    setRecord(updated);
    setStatus(updated.status);
  }

  async function saveReview(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const result = await request("update", { data: { id: record.id, status, notes } });
      applyRecord(result.application);
      setFeedback("Review saved.");
      await refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendOffer(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const result = await request("offer", { data: {
        id: record.id,
        seat: retry ? offer.seat : draft.seat,
        subject: retry ? offer.subject : draft.subject,
        body: retry ? offer.body : fullMessage
      } });
      applyRecord(result.application);
      setDraft(null);
      setFeedback("Acceptance sent. Awaiting reply.");
      await refresh();
    } catch (failure) {
      setError(failure.message);
      try {
        const result = await request("get", { id: record.id });
        applyRecord(result.application);
        if (result.application.offer?.sentAt) setDraft(null);
        await refresh();
      } catch {
        // Preserve the original send error and leave the draft available.
      }
    } finally {
      setBusy(false);
    }
  }

  async function resolveOffer(outcome) {
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const result = await request("resolve-offer", {
        data: { id: record.id, offerId: offer.id, outcome }
      });
      applyRecord(result.application);
      setDraft(null);
      setDeliveryChecked(false);
      setFeedback(outcome === "sent" ? "Email recorded. Awaiting reply." : "Seat released.");
      await refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function updateDraft(event) {
    const { name, value } = event.target;
    setDraft(current => ({ ...current, [name]: value }));
  }

  return (
    <div className="gga-modal" onClick={busy ? undefined : onClose}>
      <article role="dialog" aria-modal="true" aria-labelledby="gga-review-title" onClick={event => event.stopPropagation()}>
        <button className="close" aria-label="Close application" disabled={busy} onClick={onClose}>×</button>
        <p className="eyebrow">{offer?.seat || record.category}</p>
        <h2 id="gga-review-title">{record.name}</h2>
        <p>{record.company} · {record.role}</p>
        <div className="contact">
          <a href={"mailto:" + record.email}>{record.email}</a>
          <a href={"tel:" + record.phone}>{record.phone}</a>
          {record.linkedin && <a href={record.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
          {record.website && <a href={record.website} target="_blank" rel="noreferrer">Website ↗</a>}
        </div>
        {error && <p className="gga-review-error" role="alert">{error}</p>}
        {feedback && <p role="status">{feedback}</p>}
        <section className="gga-offer" aria-label="Membership offer">
          {offer?.sentAt && <p>Email sent {new Date(offer.sentAt).toLocaleString("en-CA", { timeZone: "America/Toronto" })}</p>}
          {accepted && !offer?.sentAt && offer?.resolvedAt && <p>Email verified manually.</p>}
          {accepted && <p><strong>{record.status === "Confirmed" ? "Seat filled" : "Offer pending · Awaiting reply"}</strong></p>}
          {retry && (
            <form onSubmit={sendOffer}>
              <h3>Acceptance email pending</h3>
              <p>{record.email} · {offer.seat}</p>
              <p><strong>{offer.subject}</strong></p>
              <p className="gga-offer-body">{offer.body}</p>
              {offerAge < 23 * 3600000 && <button className="save" disabled={busy}>Retry email</button>}
              {offerAge >= 23 * 3600000 && (
                <p>Check the email provider’s send record for this recipient and subject. You can record the outcome 24 hours after the first attempt.</p>
              )}
              {offerAge >= 24 * 3600000 && (
                <>
                  <label>
                    <span><input type="checkbox" checked={deliveryChecked} onChange={event => setDeliveryChecked(event.target.checked)} /> I verified the email outcome.</span>
                  </label>
                  <div className="gga-offer-actions">
                    <button type="button" disabled={busy || !deliveryChecked} onClick={() => resolveOffer("sent")}>Record as sent</button>
                    <button type="button" disabled={busy || !deliveryChecked} onClick={() => resolveOffer("unsent")}>Release unsent seat</button>
                  </div>
                </>
              )}
            </form>
          )}
          {!accepted && !retry && (draft ? (
            <form onSubmit={sendOffer}>
              <h3>Acceptance email</h3>
              <p>To <strong>{record.email}</strong></p>
              {record.category === "Other" && (
                <label>Business category seat<input name="seat" value={draft.seat} onChange={updateDraft} maxLength={100} required /></label>
              )}
              <label>Subject<input name="subject" value={draft.subject} onChange={updateDraft} maxLength={200} required /></label>
              <label>Personal note (optional)<textarea name="note" value={draft.note} onChange={updateDraft} maxLength={3500} /></label>
              <label>Message<textarea name="customBody" value={message} onChange={updateDraft} maxLength={6000} required /></label>
              <div className="gga-offer-actions">
                <button className="save" disabled={busy}>Send acceptance</button>
                <button type="button" disabled={busy} onClick={() => setDraft(null)}>Cancel</button>
              </div>
            </form>
          ) : <button className="save" onClick={() => setDraft(createDraft(record))}>Accept &amp; email</button>)}
        </section>
        <form onSubmit={saveReview}>
          <label>Status
            <select disabled={Boolean(retry) || busy} value={status} onChange={event => setStatus(event.target.value)}>
              {(accepted ? [record.status, ...(record.status === "Accepted" ? ["Confirmed"] : []), "Declined"] : reviewStatuses)
                .map(option => <option key={option}>{option}</option>)}
            </select>
          </label>
          <div className="answers">
            {Object.entries(record).filter(([key]) => !hiddenAnswers.has(key)).map(([key, value]) => (
              <section key={key}>
                <small>{key.replace(/([A-Z])/g, " $1")}</small>
                <p>{String(value || "—")}</p>
              </section>
            ))}
          </div>
          <label>Internal notes<textarea value={notes} onChange={event => setNotes(event.target.value)} /></label>
          <button className="save" disabled={busy}>Save review</button>
        </form>
      </article>
    </div>
  );
}

export default function GoodGoodApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const result = await request("list");
      setApplications(result.applications || []);
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function open(id) {
    try {
      const result = await request("get", { id });
      setSelected(result.application);
      setError("");
    } catch (failure) {
      setError(failure.message);
    }
  }

  const categories = ["All", ...new Set(applications.map(application => application.category))];
  const shown = filter === "All" ? applications : applications.filter(application => application.category === filter);
  return (
    <main className="gga">
      <header><div><b>GOOD GOOD</b><span>APPLICATIONS</span></div><a href="/good-good">View site ↗</a></header>
      <section className="gga-head">
        <p>PRIVATE CMS</p>
        <h1>Membership<br /><em>applications.</em></h1>
        <div className="gga-stats">
          <span><b>{applications.length}</b>Total</span>
          <span><b>{applications.filter(application => application.status === "New").length}</b>New</span>
          <span><b>{applications.filter(application => application.status === "Shortlisted").length}</b>Shortlisted</span>
        </div>
      </section>
      {error && <div className="gga-error" role="alert">{error}</div>}
      <nav className="gga-filters">
        {categories.map(category => (
          <button className={category === filter ? "active" : ""} onClick={() => setFilter(category)} key={category}>{category}</button>
        ))}
      </nav>
      <section className="gga-list">
        {loading ? <p>Loading applications…</p> : shown.length ? shown.map(application => (
          <button key={application.id} onClick={() => open(application.id)}>
            <span className="status">{offerLabel(application)}</span>
            <strong>{application.name}</strong>
            <span>{application.company}</span>
            <span>{application.seat || application.category}</span>
            <span>{application.millRun === "Yes" ? "Mill Run member" : "Non-member"}</span>
            <time>{new Date(application.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</time>
          </button>
        )) : <p>No applications in this view.</p>}
      </section>
      {selected && <ApplicationReview key={selected.id} application={selected} refresh={refresh} onClose={() => setSelected(null)} />}
    </main>
  );
}
