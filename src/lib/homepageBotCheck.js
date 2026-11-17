// A first-party, short-lived form session is required by the server. This is
// one layer of abuse prevention, not proof that the visitor is human.
export function mountHomepageBotCheck({ form, submitButton, win = window, doc = document, fetchImpl = (...args) => fetch(...args) }) {
  let token = '';
  let disposed = false;
  let busy = false;
  let starting = false;
  let controller;
  let readyTimer;
  let expiryTimer;
  let timeoutTimer;
  let generation = 0;
  const wrapper = doc.createElement('div');
  const message = doc.createElement('p');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.style.fontSize = '0.875rem';
  const retry = doc.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Retry form';
  retry.hidden = true;
  const fallback = doc.createElement('p');
  fallback.style.fontSize = '0.875rem';
  fallback.appendChild(doc.createTextNode('Having trouble? '));
  const email = doc.createElement('a');
  email.href = 'mailto:contact@finallyhomeagents.com';
  email.textContent = 'Email us directly';
  fallback.appendChild(email);
  wrapper.append(message, retry, fallback);
  form.insertBefore(wrapper, submitButton);
  const syncButton = () => { if (!disposed && submitButton) submitButton.disabled = busy || !token; };
  const clearTimers = () => {
    win.clearTimeout(readyTimer);
    win.clearTimeout(expiryTimer);
    win.clearTimeout(timeoutTimer);
  };
  const show = (text, canRetry = false) => {
    if (disposed) return;
    token = '';
    message.textContent = text;
    retry.hidden = !canRetry;
    syncButton();
  };
  async function start() {
    if (disposed || starting || busy) return;
    const current = ++generation;
    starting = true;
    clearTimers();
    controller?.abort();
    controller = new AbortController();
    show('Preparing your form…');
    timeoutTimer = win.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetchImpl('/api/homepage-challenge', {
        method: 'GET', credentials: 'same-origin', cache: 'no-store',
        headers: { Accept: 'application/json' }, signal: controller.signal,
      });
      if (!response.ok) throw new Error('Form session unavailable');
      const result = await response.json();
      if (disposed || current !== generation) return;
      if (typeof result.token !== 'string' || !result.token || result.token.length > 4096 ||
          !Number.isFinite(result.readyAfterMs) || result.readyAfterMs < 0 || result.readyAfterMs > 60000) {
        throw new Error('Invalid form session');
      }
      win.clearTimeout(timeoutTimer);
      readyTimer = win.setTimeout(() => {
        if (disposed || current !== generation) return;
        token = result.token;
        message.textContent = '';
        retry.hidden = true;
        syncButton();
      }, result.readyAfterMs);
      // Refresh before the server's one-hour expiry, without interrupting typing.
      expiryTimer = win.setTimeout(() => {
        if (disposed || current !== generation) return;
        show('Preparing a fresh form session…');
        if (!busy) start();
      }, 55 * 60 * 1000);
    } catch {
      if (!disposed && current === generation) {
        show('The form could not get ready. Retry or email us directly.', true);
      }
    } finally {
      if (current === generation) {
        win.clearTimeout(timeoutTimer);
        starting = false;
      }
    }
  }
  retry.addEventListener('click', start);
  syncButton();
  start();
  return {
    getToken: () => token,
    setBusy(value) { busy = value; syncButton(); },
    reset() {
      if (disposed) return;
      busy = false;
      show('Preparing a fresh form session…');
      start();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      generation++;
      token = '';
      clearTimers();
      controller?.abort();
      retry.removeEventListener('click', start);
      wrapper.remove();
    },
  };
}
