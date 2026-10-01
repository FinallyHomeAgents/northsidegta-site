(() => {
  const $ = id => document.getElementById(id);
  let records = [], nextOffset = null, busy = false;
  const message = text => { $('message').textContent = text || ''; };
  async function request(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { const error = new Error(data.error || 'Unable to complete this request. Please try again.'); error.status = response.status; throw error; }
    return data;
  }
  const post = (url, body) => request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  function render() {
    const query = $('search').value.trim().toLowerCase(), stage = $('stage').value, status = $('status').value;
    const filtered = records.filter(r => (!stage || r.requestType === stage) && (!status || r.status === status) && (!query || [r.name, r.email, r.phone, r.recommendedCommunity, ...(r.selectedCommunities || [])].join(' ').toLowerCase().includes(query)));
    $('count').textContent = `${filtered.length} ${filtered.length === 1 ? 'submission' : 'submissions'}${nextOffset !== null ? ' in loaded results' : ''} · Each match reveal and homes request is recorded separately.`;
    $('leads').replaceChildren();
    if (!filtered.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = records.length ? 'No leads match these filters.' : 'New buyer enquiries will appear here.'; $('leads').append(empty); }
    for (const record of filtered) {
      const card = $('lead-template').content.firstElementChild.cloneNode(true);
      const text = (selector, value) => { card.querySelector(selector).textContent = value || '—'; };
      text('.stage', record.stage); card.querySelector('.stage').classList.toggle('homes', record.requestType === 'homes');
      text('.name', record.name); text('.budget', record.budgetLabel);
      text('.time', new Date(record.createdAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }));
      text('.email', record.email); card.querySelector('.email').href = `mailto:${encodeURIComponent(record.email)}`;
      if (record.phone) { text('.phone', record.phone); card.querySelector('.phone').href = `tel:${record.phone.replace(/[^+\d]/g, '')}`; } else card.querySelector('.phone').remove();
      text('.match', record.recommendedCommunity); text('.towns', (record.selectedCommunities || []).join(', ') || 'No homes requested yet');
      text('.priorities', (record.priorities || []).join(' · ')); text('.property-fit', (record.propertyTypes || []).map(v => `${v.label}: ${v.status}`).join(' · '));
      text('.notification', record.notificationStatus === 'sent' ? 'Sent' : record.notificationStatus === 'failed' ? 'Failed — lead saved; follow up directly' : 'Pending — lead saved');
      card.querySelector('.notification').classList.toggle('failed', record.notificationStatus === 'failed');
      const form = card.querySelector('.follow-up'); form.elements.status.value = record.status; form.elements.notes.value = record.notes || '';
      form.addEventListener('submit', async event => {
        event.preventDefault(); const button = form.querySelector('button'), result = form.querySelector('.save-status'); button.disabled = true; result.textContent = '';
        try { const data = await post('/api/play-your-budget-lead?action=update', { id: record.id, status: form.elements.status.value, notes: form.elements.notes.value }); Object.assign(record, data.lead); result.textContent = 'Saved'; }
        catch (error) { result.textContent = error.message; }
        finally { button.disabled = false; }
      });
      $('leads').append(card);
    }
    $('more').hidden = nextOffset === null;
  }
  async function load(append = false) {
    if (busy) return; busy = true; $('refresh').disabled = true; $('more').disabled = true; message('');
    try {
      const data = await request(`/api/play-your-budget-lead?action=list&offset=${append ? nextOffset : 0}`);
      records = append ? [...records, ...data.leads] : data.leads; nextOffset = data.nextOffset;
      $('login').hidden = true; $('dashboard').hidden = false; $('logout').hidden = false; render();
    } catch (error) {
      if (error.status === 401) { records = []; $('leads').replaceChildren(); $('login').hidden = false; $('dashboard').hidden = true; $('logout').hidden = true; }
      else message(error.message);
    } finally { busy = false; $('refresh').disabled = false; $('more').disabled = false; }
  }
  $('login').addEventListener('submit', async event => {
    event.preventDefault(); const button = $('login').querySelector('button'); button.disabled = true; message('');
    try { await post('/api/cms-login', { username: $('login').elements.username.value.trim(), password: $('login').elements.password.value }); $('login').elements.password.value = ''; await load(); }
    catch (error) { message(error.message); }
    finally { button.disabled = false; }
  });
  $('logout').addEventListener('click', async () => { try { await post('/api/play-your-budget-lead?action=logout', {}); for (const key of ['decap-cms-user','netlify-cms-user']) localStorage.removeItem(key); location.assign('/cms/'); } catch (error) { message(error.message); } });
  $('refresh').addEventListener('click', () => load()); $('more').addEventListener('click', () => load(true));
  for (const id of ['search', 'stage', 'status']) $(id).addEventListener(id === 'search' ? 'input' : 'change', render);
  load();
})();
