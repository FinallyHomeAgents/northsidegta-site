const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// Share one loader across route mounts; never remove another form's script.
let loading = null;
export function loadTurnstile(win = window, doc = document) {
  if (win.turnstile?.render) return Promise.resolve(win.turnstile);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    let script = doc.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    const owned = !script;
    if (!script) {
      script = doc.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
    }
    let interval;
    let timeout;
    const finish = (error) => {
      win.clearInterval(interval);
      win.clearTimeout(timeout);
      script.removeEventListener('error', onError);
      if (error) {
        if (owned) script.remove();
        reject(error);
      } else resolve(win.turnstile);
    };
    const onError = () => finish(new Error('Verification could not load.'));
    script.addEventListener('error', onError, { once: true });
    interval = win.setInterval(() => { if (win.turnstile?.render) finish(); }, 100);
    timeout = win.setTimeout(onError, 15000);
    if (owned) doc.head.appendChild(script);
  }).catch((error) => { loading = null; throw error; });
  return loading;
}

export function mountHomepageBotCheck({ form, submitButton, siteKey, win = window, doc = document, load = loadTurnstile }) {
  let token = '';
  let widgetId;
  let api;
  let disposed = false;
  let busy = false;
  let starting = false;
  const wrapper = doc.createElement('div');
  const mount = doc.createElement('div');
  const message = doc.createElement('p');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.style.fontSize = '0.875rem';
  const retry = doc.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Retry verification';
  retry.hidden = true;
  const fallback = doc.createElement('p');
  fallback.style.fontSize = '0.875rem';
  fallback.appendChild(doc.createTextNode('Having trouble? '));
  const email = doc.createElement('a');
  email.href = 'mailto:contact@finallyhomeagents.com';
  email.textContent = 'Email us directly';
  fallback.appendChild(email);
  wrapper.append(mount, message, retry, fallback);
  form.insertBefore(wrapper, submitButton);
  const syncButton = () => { if (!disposed && submitButton) submitButton.disabled = busy || !token; };
  const show = (text, canRetry = false) => {
    if (disposed) return;
    token = '';
    message.textContent = text;
    retry.hidden = !canRetry;
    syncButton();
  };
  async function start() {
    if (disposed || starting || busy) return;
    if (!siteKey) {
      show('This form’s verification is unavailable. Please email us directly.');
      return;
    }
    starting = true;
    show('Checking your browser…');
    try {
      api = await load(win, doc);
      if (disposed) return;
      if (widgetId !== undefined) api.remove(widgetId);
      widgetId = api.render(mount, {
        sitekey: siteKey,
        action: 'homepage_lead',
        size: 'flexible',
        'response-field': false,
        callback: (value) => {
          if (disposed) return;
          token = value;
          message.textContent = '';
          retry.hidden = true;
          syncButton();
        },
        'expired-callback': () => show('Verification expired. Please verify again.', true),
        'timeout-callback': () => show('Verification timed out. Please try again.', true),
        'error-callback': () => { show('Verification could not finish. Retry or email us directly.', true); return true; },
      });
    } catch {
      show('Verification could not load. Retry or email us directly.', true);
    } finally { starting = false; }
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
      show('Please verify again before retrying.', true);
      if (api && widgetId !== undefined) {
        try { api.reset(widgetId); } catch { /* Retry will recreate the widget. */ }
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      token = '';
      retry.removeEventListener('click', start);
      if (api && widgetId !== undefined) {
        try { api.remove(widgetId); } catch { /* The route may already be gone. */ }
      }
      wrapper.remove();
    },
  };
}
