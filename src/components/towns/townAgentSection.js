import { getFormEndpoint } from '../contact/contactConfig';
import { trackEvent } from '../../utils/analytics';

const localFocus = {
  aurora: 'Compare established neighbourhoods, GO access, and the tradeoffs between older homes and newer builds.',
  newmarket: 'Compare established streets, newer neighbourhoods, and the everyday access that matters to your family.',
  georgina: 'Explore Keswick, Sutton, and Pefferlaw with your budget, commute, and proximity to the lake in mind.',
  'east-gwillimbury': 'Compare Holland Landing, Sharon, and Queensville, including established homes and newer communities.',
  stouffville: 'Weigh Main Street convenience, GO access, newer subdivisions, and rural properties.',
  uxbridge: 'Compare in-town living and country properties, with space, upkeep, and commuting in mind.',
  scugog: 'Explore Port Perry and surrounding communities, including the practical considerations of rural and waterfront homes.',
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function townAgentHtml(slug, town) {
  const name = escape(town);
  return `<section class="town-agent" id="contact" aria-labelledby="town-agent-heading">
    <div class="town-agent-brand"><img src="/brand/finally-home-agents-card-logo.png" width="64" height="64" alt="Finally Home Agents"><div><strong>Finally Home Agents Team</strong><span>HomeLife Optimum Realty, Brokerage</span></div></div>
    <div class="town-agent-intro">
      <p class="town-agent-eyebrow">Your ${name} real estate team</p>
      <h2 id="town-agent-heading">Moving north of Toronto?<br>We’re your guys.</h2>
      <p>We’re Matthew Mulhall and Landon Mulhall—the brothers behind Finally Home Agents Team and NorthSide GTA. Buying or selling in ${name}? We’ll help you figure out where you fit, what makes sense, and what comes next.</p>
      <div class="town-agent-people">
        <a href="/agents/matthew-mulhall"><img src="/Images/matthew.jpg" width="52" height="52" alt="Matthew Mulhall" loading="lazy"><span>Matthew Mulhall<small>Sales Representative</small></span></a>
        <a href="/agents/landon-mulhall"><img src="/Images/landon.jpg" width="52" height="52" alt="Landon Mulhall" loading="lazy"><span>Landon Mulhall<small>Sales Representative</small></span></a>
      </div>
      <div class="town-agent-recognition"><span aria-hidden="true">★</span><p><strong>Matthew Mulhall · Award recognition</strong><small>HomeLife Optimum Realty · 2023, 2024 &amp; 2025</small></p></div>
    </div>
    <div class="town-agent-offer">
      <div class="town-agent-switch" role="group" aria-label="What are you planning?">
        <button type="button" data-intent="buy" aria-pressed="true">I’m buying</button>
        <button type="button" data-intent="sell" aria-pressed="false">I’m selling</button>
      </div>
      <div data-offer="buy"><h3>Find the right neighbourhood in ${name}.</h3><p>${escape(localFocus[slug])}</p><ul><li>Neighbourhood suggestions based on your priorities</li><li>A realistic conversation about your price range</li><li>Clear next steps—even if you’re just researching</li></ul></div>
      <div data-offer="sell" hidden><h3>Know where to start with your ${name} home.</h3><p>Get a personal starting point for pricing and preparing your home, based on your property and plans.</p><ul><li>Relevant recent sales to discuss</li><li>Preparation priorities before you spend on updates</li><li>A selling timeline that fits your next move</li></ul><p class="town-agent-note">An initial discussion, not an instant valuation or appraisal.</p></div>
      <button type="button" class="town-agent-primary" data-open-form aria-expanded="false" aria-controls="town-agent-form">Request my neighbourhood shortlist →</button>
      <p class="town-agent-note">A personal email from Matthew or Landon. No obligation to book a call.</p>
    </div>
    <form id="town-agent-form" class="town-agent-form" hidden>
      <div class="town-agent-form-heading"><h3>Tell us a little about your move.</h3><p>We’ll review your note and email you personally. If we need more detail to make useful suggestions, we’ll ask.</p></div>
      <div class="town-agent-fields"><label>Your name<input name="name" autocomplete="name" maxlength="120" required></label><label>Email for your reply<input name="email" type="email" autocomplete="email" maxlength="200" required></label></div>
      <label><span data-message-label>What matters in your next home? <small>(optional)</small></span><textarea name="message" rows="2" maxlength="2000" placeholder="Budget, preferred area, timing, or a question you’d like help with"></textarea></label>
      <div class="town-agent-honeypot" aria-hidden="true"><label>Leave this empty<input name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
      <p class="town-agent-note">By sending this request, you’re asking Matthew or Landon to contact you by email about your move. This form does not subscribe you to listing alerts.</p>
      <button class="town-agent-primary" type="submit">Send my request</button>
      <p class="town-agent-status" role="status" aria-live="polite"></p>
      <p class="town-agent-note">Prefer to contact us directly? <a href="mailto:contact@finallyhomeagents.com">contact@finallyhomeagents.com</a></p>
    </form>
  </section>`;
}

export function initTownAgent(container, slug, town) {
  const section = container?.querySelector('.town-agent');
  if (!section) return undefined;
  const form = section.querySelector('form');
  const open = section.querySelector('[data-open-form]');
  const status = section.querySelector('.town-agent-status');
  const submit = form.querySelector('[type="submit"]');
  const controller = new AbortController();
  let intent = 'buy';
  let pending = false;
  let complete = false;
  const onClick = event => {
    const choice = event.target.closest('[data-intent]');
    if (choice && !pending && !complete) {
      intent = choice.dataset.intent;
      section.querySelectorAll('[data-intent]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.intent === intent)));
      section.querySelectorAll('[data-offer]').forEach(p => { p.hidden = p.dataset.offer !== intent; });
      open.textContent = intent === 'buy' ? 'Request my neighbourhood shortlist →' : 'Request my pricing & prep plan →';
      section.querySelector('[data-message-label]').textContent = intent === 'buy' ? 'What matters in your next home? (optional)' : 'Tell us about your property and plans (optional)';
      form.elements.message.placeholder = intent === 'buy' ? 'Budget, preferred area, timing, or a question you’d like help with' : 'Neighbourhood or address, home type, timing, and any questions';
      trackEvent('town_agent_intent', { town: slug, intent });
    }
    if (event.target.closest('[data-open-form]')) {
      form.hidden = false;
      open.setAttribute('aria-expanded', 'true');
      form.elements.name.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
      trackEvent('town_agent_form_open', { town: slug, intent });
    }
  };
  const onSubmit = async event => {
    event.preventDefault();
    if (pending || complete || form.elements._gotcha.value || !form.reportValidity()) return;
    if (!form.elements.name.value.trim()) { status.textContent = 'Please enter your name.'; form.elements.name.focus(); return; }
    pending = true;
    submit.disabled = true;
    section.querySelectorAll('[data-intent]').forEach(b => { b.disabled = true; });
    submit.textContent = 'Sending…';
    status.textContent = '';
    const payload = new FormData(form);
    payload.set('name', form.elements.name.value.trim());
    payload.set('email', form.elements.email.value.trim());
    payload.set('intent', intent);
    payload.set('town', town);
    payload.set('requested_help', `${intent === 'buy' ? 'Buyer neighbourhood shortlist' : 'Seller pricing and preparation plan'} in ${town}`);
    payload.set('source_page', `${town} town page — agent introduction`);
    payload.set('source_route', `/communities/${slug}`);
    payload.set('contact_permission', 'Email reply about this request; no listing-alert subscription requested.');
    try {
      const response = await fetch(getFormEndpoint(), { method: 'POST', body: payload, headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Delivery failed');
      complete = true;
      status.textContent = 'Thank you—your request has been received. Matthew or Landon will follow up by email about your move.';
      submit.textContent = 'Request received';
      trackEvent('town_agent_request_success', { town: slug, intent });
    } catch (error) {
      if (error.name === 'AbortError') return;
      status.textContent = 'Your request could not be sent. Please try again, or email contact@finallyhomeagents.com.';
      submit.textContent = 'Try again';
      trackEvent('town_agent_request_error', { town: slug, intent });
    } finally {
      pending = false;
      submit.disabled = complete;
      section.querySelectorAll('[data-intent]').forEach(b => { b.disabled = complete; });
    }
  };
  section.addEventListener('click', onClick);
  form.addEventListener('submit', onSubmit);
  return () => { controller.abort(); section.removeEventListener('click', onClick); form.removeEventListener('submit', onSubmit); };
}
