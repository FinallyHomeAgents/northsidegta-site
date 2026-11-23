import { submitWebsiteInquiry } from './submitWebsiteInquiry';
import { getFormEndpoint } from '../components/contact/contactConfig';

// Bound to this mounted guide, not an inline/global click handler.
export function initGuideInquiry(root, submit = submitWebsiteInquiry, endpoint = getFormEndpoint()) {
  const button = root?.querySelector('#leadSubmitBtn');
  if (!button) return () => {};
  const status = root.querySelector('#guideInquiryStatus');
  const value = id => root.querySelector(`#${id}`)?.value.trim() || '';
  let busy = false, complete = false, disposed = false;
  const send = async () => {
    if (busy || complete) return;
    const fields = {
      name: [value('f_fn'), value('f_ln')].filter(Boolean).join(' '),
      email: value('f_em'), phone: value('f_ph'),
      timeline: value('f_tl'), budget: value('f_bg'),
      communities: [...root.querySelectorAll('.pchk:checked')].map(el => el.value).join(', '),
      message: value('f_nt'), source_route: '/neighbourhood-guide',
      contact_permission: 'Requested local guidance reply only; no marketing subscription.',
      _subject: 'NorthSide GTA neighbourhood guidance request',
    };
    if (!fields.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      status.textContent = 'Please enter your name and a valid email.';
      return;
    }
    busy = true; button.disabled = true; button.textContent = 'Sending…'; status.textContent = '';
    try {
      const response = await submit(endpoint, {method: 'POST', body: JSON.stringify(fields)});
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Your request could not be confirmed. Please contact our team.');
      complete = true;
      if (!disposed) {
        root.querySelector('#leadFormBody').hidden = true;
        root.querySelector('#formSuccess').style.display = 'block';
        status.textContent = 'Your request has been received.';
      }
    } catch (error) {
      if (!disposed) status.textContent = error.message || 'Please contact our team before retrying.';
    } finally {
      busy = false;
      if (!disposed && !complete) { button.disabled = false; button.textContent = 'Help me compare towns'; }
    }
  };
  button.addEventListener('click', send);
  return () => { disposed = true; button.removeEventListener('click', send); };
}
