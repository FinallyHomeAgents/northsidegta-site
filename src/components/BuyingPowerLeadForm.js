import React, { useRef, useState } from 'react';
import { trackBuyingPower } from '../lib/buyingPowerTracking';

const inputClass = 'min-h-[48px] w-full rounded border border-gray-300 bg-white px-3 py-3 text-base';
export default function BuyingPowerLeadForm({ type, value, address = '', onAddressChange, towns }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [preference, setPreference] = useState('email');
  const lock = useRef(false);
  const valuation = type === 'valuation';
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const form = new FormData(event.currentTarget);
    if (form.get('nickname')) return;
    lock.current = true;
    setBusy(true); setError('');
    const attribution = {};
    const params = new URLSearchParams(window.location.search);
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) attribution[key] = params.get(key) || '';
    try {
      const response = await fetch('/api/buying-power-lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ leadType: type, estimatedValue: value,
          email: form.get('email'), name: form.get('name') || '', phone: form.get('phone') || '',
          address: valuation ? address : '', contactPreference: preference,
          contactConsent: form.get('contactConsent') === 'on',
          notUnderContract: form.get('notUnderContract') === 'on',
          marketingConsent: false, communities: form.getAll('communities'), attribution }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || 'We could not send your request. Please try again.');
      setResult(data);
      trackBuyingPower('generate_lead', { lead_type: type });
    } catch (err) { setError(err.message || 'Please try again or contact us directly.'); }
    finally { lock.current = false; setBusy(false); }
  }
  if (result) return <div role="status" className="rounded bg-emerald-50 p-4 text-brand-green">
    <p className="m-0 font-bold">{valuation ? 'Your request is saved.' : 'Your comparison is saved.'}</p>
    <p className="mb-0 mt-2 text-sm">{result.emailSent ? 'Your comparison is on its way by email. Check your spam folder if it does not arrive.' : 'Your request reached us, but the automatic email is delayed. We’ll email you within 24 hours.'} {valuation && 'Matthew or Landon will respond within 24 hours.'}</p>
  </div>;
  return <form onSubmit={submit} className="flex flex-col gap-3" aria-label={valuation ? 'Request a home-value review' : 'Email my comparison'}>
    {valuation && <label className="text-sm font-semibold">Your name<input className={inputClass} name="name" autoComplete="name" maxLength={100} required /></label>}
    <label className="text-sm font-semibold">Email<input className={inputClass} name="email" type="email" autoComplete="email" maxLength={180} required /></label>
    {valuation && <>
      <label className="text-sm font-semibold">Your home address<input className={inputClass} name="address" autoComplete="street-address" value={address} onChange={e => onAddressChange(e.target.value)} maxLength={250} required /></label>
      <label className="text-sm font-semibold">How should we reply?<select className={inputClass} name="contactPreference" value={preference} onChange={e => setPreference(e.target.value)}><option value="email">Email</option><option value="phone">Phone call</option><option value="text">Text message about this request</option></select></label>
      <label className="text-sm font-semibold">Phone {preference === 'email' ? '(optional)' : '(required)'}<input className={inputClass} name="phone" type="tel" autoComplete="tel" maxLength={40} required={preference !== 'email'} /></label>
      <label className="flex gap-2 text-sm"><input type="checkbox" name="notUnderContract" className="h-5 w-5 flex-none" /><span>I’m not currently under a representation agreement with another brokerage.</span></label>
      <label className="flex gap-2 text-sm"><input type="checkbox" name="contactConsent" required className="h-5 w-5 flex-none" /><span>I agree to be contacted by Finally Home Agents about this home-value request using my selected contact method.</span></label>
    </>}
    <fieldset className="m-0 border-0 p-0"><legend className="mb-2 text-sm font-semibold">Towns you’re considering (optional)</legend><div className="grid grid-cols-2 gap-2">{towns.map(town => <label key={town.slug} className="flex items-start gap-2 text-sm"><input type="checkbox" name="communities" value={town.slug} className="h-5 w-5 flex-none" /><span>{town.name}</span></label>)}</div></fieldset>
    <input name="nickname" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    {error && <p role="alert" className="m-0 text-sm text-red-700">{error} <a className="underline" href="mailto:contact@finallyhomeagents.com">Email us directly</a>.</p>}
    <button type="submit" disabled={busy} className="min-h-[52px] rounded bg-brand-green px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Sending…' : valuation ? 'Request my home-value review' : 'Email me my comparison'}</button>
    <p className="m-0 text-xs leading-relaxed text-gray-600">{valuation ? 'Personal reply within 24 hours.' : 'All seven towns, with your comparison amount and the market-data date. No phone number needed.'} This request does not sign you up for marketing. Your details are used to deliver this request and arrange any follow-up you ask for.</p>
  </form>;
}
