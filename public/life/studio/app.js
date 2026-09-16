import { compressPhoto, renderPhoto, photoBlob } from './photo.js'
const $ = (s) => document.querySelector(s),
  esc = (s = '') =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c]
    )
const towns = [
  'East Gwillimbury',
  'Newmarket',
  'Aurora',
  'Georgina',
  'Whitchurch-Stouffville',
  'Uxbridge',
  'Scugog',
]
const icons = {
  create: '<path d="M12 5v14M5 12h14"/>',
  library:
    '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="16" cy="8" r="1"/>',
  settings:
    '<path d="m9 3-1 3-3 1-1 4 2 2-1 3 3 3 3-1 3 2 4-2 1-3 2-2-2-4-3-1-2-3z"/><circle cx="12" cy="12" r="3"/>',
  photo:
    '<rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="12" r="4"/><path d="m8 5 1-2h6l1 2"/>',
  spark:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
}
const icon = (n) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n] || icons.create}</svg>`
const brand = '<span class="brand">NORTHSIDE GTA<span>Life</span></span>'
const blank = () => ({
  photo: '',
  place: '',
  community: 'East Gwillimbury',
  locationConfirmed: false,
  notes: '',
  title: '',
  instagram: '',
  facebook: '',
  website: '',
  alt: '',
  layout: 'editorial',
  results: {},
})
let session = {},
  view = 'create',
  step = 1,
  draft = blank(),
  drafts = [],
  tab = 'instagram',
  dirty = false,
  selected = new Set(),
  busy = false,
  previewVersion = 0
async function api(action, body, query = '') {
  const response = await fetch(`/api/life?action=${action}${query}`, {
    credentials: 'same-origin',
    method: body ? 'POST' : 'GET',
    headers: body
      ? { 'Content-Type': 'application/json', 'X-Life-Request': '1' }
      : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json()
  if (!response.ok) {
    if (response.status === 401 && action !== 'login') {
      session.user = null
      render()
    }
    throw new Error(data.error || 'Request failed. Please try again.')
  }
  return data
}
function toast(message) {
  $('#toast').textContent = message
  $('#toast').classList.add('show')
  setTimeout(() => $('#toast').classList.remove('show'), 4500)
}
async function task(label, fn) {
  if (busy) return
  busy = true
  const overlay = document.createElement('div')
  overlay.className = 'busy-screen'
  overlay.setAttribute('role', 'status')
  overlay.innerHTML = `<div class="spinner"></div><h2>${esc(label)}</h2><p>Please keep this screen open.</p>`
  document.body.append(overlay)
  try {
    await fn()
  } catch (e) {
    toast(e.message)
  } finally {
    busy = false
    overlay.remove()
  }
}
const locked = () => Object.keys(draft.results || {}).length > 0
function nav() {
  return ['create', 'library', 'settings']
    .map(
      (v) =>
        `<button class="nav-item ${view === v ? 'active' : ''}" data-view="${v}" ${view === v ? 'aria-current="page"' : ''}>${icon(v)}${v === 'create' ? 'Create' : v === 'library' ? 'Library' : 'Settings'}</button>`
    )
    .join('')
}
function render() {
  if (!session.user) {
    renderLogin()
    return
  }
  const title =
    view === 'create'
      ? 'Content studio'
      : view === 'library'
        ? 'Your library'
        : 'Studio settings'
  $('#app').innerHTML =
    `<div class="shell"><aside class="sidebar">${brand}<nav aria-label="Main navigation">${nav()}</nav><div class="sidebar-footer"><strong>Matthew & Landon</strong><br>Finally Home Agents<br><br>Discover what makes it home.</div></aside><main class="workspace"><header class="topbar"><span class="crumb">NorthSide GTA Life &nbsp; / &nbsp; ${title}</span><div class="mobile-brand">${brand}</div><div class="account"><span>${esc(session.user)}</span><span class="avatar">${session.user === 'Matthew' ? 'MM' : 'LM'}</span></div></header><div id="content"></div></main><nav class="mobile-nav" aria-label="Mobile navigation">${nav()}</nav></div>`
  document
    .querySelectorAll('[data-view]')
    .forEach((b) => (b.onclick = () => navigate(b.dataset.view)))
  if (view === 'create') renderCreate()
  else if (view === 'library') renderLibrary()
  else renderSettings()
}
async function navigate(next) {
  if (dirty) {
    if (!confirm('Leave without saving your latest changes?')) return
    if (draft.id) {
      try {
        draft = (await api('draft', null, `&id=${draft.id}`)).draft
      } catch (e) {
        toast(e.message)
        return
      }
    } else {
      draft = blank()
      step = 1
    }
  }
  dirty = false
  view = next
  if (next === 'library')
    await task('Opening your library', async () => {
      drafts = (await api('drafts')).drafts
    })
  render()
  window.scrollTo(0, 0)
}
function renderLogin() {
  $('#app').innerHTML =
    `<div class="login-wrap"><section class="login-art">${brand}<div><p class="eyebrow">YOUR LOCAL CONTENT STUDIO</p><h1>A little moment.<br>A local story.</h1><p>Turn the places you discover into something worth sharing.</p></div><small>Matthew & Landon · Finally Home Agents</small></section><main class="login-form-wrap"><form class="login-form" id="login"><p class="eyebrow">MATTHEW & LANDON’S STUDIO</p><h2>Welcome home.</h2><p>Sign in to create your next local discovery.</p>${session.local ? '<div class="notice">Local development preview. Changes stay on this computer; social accounts are not connected.</div>' : ''}${!session.storage || !session.signInConfigured ? '<div class="notice">The studio is built. Private sign-in and shared storage need connecting before you can use it here.</div>' : ''}<label class="field"><span>Who’s creating today?</span><select name="person"><option>Matthew</option><option>Landon</option></select></label>${!session.local ? '<label class="field"><span>Website CMS username</span><input name="username" autocomplete="username" required></label><label class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>' : ''}<button class="primary full" ${!session.storage || !session.signInConfigured ? 'disabled' : ''}>${session.local ? 'Open local preview' : 'Sign in'} →</button><p class="small-note">Private access for Matthew and Landon.${session.local ? '' : ' Use your existing website CMS sign-in, or your configured personal password.'}</p></form></main></div>`
  $('#login').onsubmit = (e) => {
    e.preventDefault()
    task('Opening your studio', async () => {
      await api('login', Object.fromEntries(new FormData(e.target)))
      session = await api('session')
      render()
    })
  }
}
function heading(title, sub, number) {
  return `<div class="page-heading"><div><p class="eyebrow">${number === 1 ? 'CAPTURE SOMETHING LOCAL' : number === 2 ? 'MAKE IT YOURS' : 'ONE LAST LOOK'}</p><h1>${title}</h1><p>${sub}</p></div>${number ? `<span class="step-label">0${number} / 03</span>` : ''}</div>`
}
function renderCreate() {
  if (step === 1) renderUpload()
  else if (step === 2) renderReview()
  else renderPublish()
}
function renderUpload() {
  $('#content').innerHTML =
    heading(
      'What did you discover?',
      'A photo, a place, and a little local perspective.',
      1
    ) +
    `<div class="editor-grid"><section><div class="card"><div class="section-label"><h2>Your photo</h2><span class="pill">PHOTO POST</span></div><label class="upload ${draft.photo ? 'has-photo' : ''}">${draft.photo ? `<img src="${draft.photo}" alt="Your uploaded photo"><span class="replace-label">Change photo</span>` : `<span class="upload-icon">${icon('photo')}</span><strong>Add a local moment</strong><small>Tap to choose a photo from your library</small>`}<input id="photo" type="file" accept="image/*,.heic,.heif" aria-label="Upload a photo"></label><p class="photo-tip">Parks, coffee stops, favourite streets. Start with one photo—we’ll turn it into a ready-to-review post.</p></div><div class="studio-note">${icon('spark')}<div><strong>Your photo. Your perspective.</strong>We add a branded layout and draft the words. You have the final say before anything is shared.</div></div></section><section class="card"><div class="section-label"><h2>The local details</h2><span class="pill">JUST THE ESSENTIALS</span></div><label class="field"><span>Where was this?</span><input id="place" maxlength="100" placeholder="e.g. a park, café or trail" value="${esc(draft.place)}"></label><label class="field"><span>Community</span><select id="community">${towns.map((t) => `<option ${draft.community === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label><label class="check"><input id="confirmed" type="checkbox" ${draft.locationConfirmed ? 'checked' : ''}><span>I’ve checked that this is the right location.</span></label><label class="field"><span>Your observation <span style="display:inline;font-weight:400;color:var(--muted)">· optional</span></span><textarea id="notes" maxlength="1500" placeholder="What caught your eye? One sentence is plenty. You can use your iPhone keyboard’s microphone.">${esc(draft.notes)}</textarea></label><button id="generate" class="primary full">${session.ai ? 'Create my content' : 'Create starter content'} ${icon('spark')}</button><p class="small-note">${session.ai ? 'AI uses your photo and notes. Check the facts and wording before approving.' : 'AI isn’t connected yet. You can create and edit a starter caption and design now.'}</p></section></div>`
  $('#photo').onchange = (e) =>
    task('Preparing your photo', async () => {
      if (!e.target.files[0]) return
      draft.photo = await compressPhoto(e.target.files[0])
      draft.title = ''
      draft.id = undefined
      draft.results = {}
      dirty = true
      renderUpload()
    })
  $('#place').oninput = (e) => {
    draft.place = e.target.value
    draft.locationConfirmed = false
    $('#confirmed').checked = false
    dirty = true
  }
  $('#community').onchange = (e) => {
    draft.community = e.target.value
    draft.locationConfirmed = false
    $('#confirmed').checked = false
    dirty = true
  }
  $('#confirmed').onchange = (e) => {
    draft.locationConfirmed = e.target.checked
    dirty = true
  }
  $('#notes').oninput = (e) => {
    draft.notes = e.target.value
    dirty = true
  }
  $('#generate').onclick = () =>
    task('Creating your local story', async () => {
      if (!draft.photo) throw new Error('Choose a photo first.')
      if (!draft.place.trim()) throw new Error('Add the name of the place.')
      if (!draft.locationConfirmed)
        throw new Error('Confirm the location first.')
      const { content } = await api('generate', draft)
      Object.assign(draft, content)
      await save()
      step = 2
      render()
      window.scrollTo(0, 0)
    })
}
async function draw() {
  const canvas = $('#preview')
  if (!canvas || !draft.photo) return
  const ticket = ++previewVersion
  const buffer = document.createElement('canvas')
  await renderPhoto(buffer, draft)
  if (ticket === previewVersion && canvas.isConnected) {
    canvas.width = buffer.width
    canvas.height = buffer.height
    canvas.getContext('2d').drawImage(buffer, 0, 0)
  }
}
function renderReview() {
  $('#content').innerHTML =
    heading(
      'A story worth sharing.',
      'Your photo, with the NorthSide touch. Make it yours.',
      2
    ) +
    `<div class="editor-grid"><section><div class="preview-panel"><canvas id="preview" aria-label="Designed social post preview"></canvas><p class="preview-note">1080 × 1350 · READY FOR INSTAGRAM & FACEBOOK</p></div><div class="layout-row">${['editorial', 'minimal', 'postcard'].map((l) => `<button data-layout="${l}" class="${draft.layout === l ? 'active' : ''}" ${locked() ? 'disabled' : ''}>${l[0].toUpperCase() + l.slice(1)}</button>`).join('')}</div></section><section class="card"><div class="section-label"><h2>The finishing touches</h2><span class="pill">${draft.generationMode === 'ai' ? 'AI DRAFT' : 'STARTER DRAFT'}</span></div>${locked() ? '<div class="notice">This post has been approved. Its content is locked to keep published versions consistent.</div>' : ''}<label class="field"><span>Headline on your photo</span><input id="headline" maxlength="90" value="${esc(draft.title)}" ${locked() ? 'disabled' : ''}></label><div class="segmented">${['instagram', 'facebook', 'website'].map((t) => `<button data-tab="${t}" class="${tab === t ? 'active' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div><label class="field"><span>${tab === 'website' ? 'Website entry' : 'Suggested caption'}</span><textarea id="caption" rows="8" maxlength="${tab === 'instagram' ? 2200 : tab === 'facebook' ? 5000 : 6000}" ${locked() ? 'disabled' : ''}>${esc(draft[tab])}</textarea></label><label class="field"><span>Image description · accessibility</span><textarea id="alt" rows="2" maxlength="500" ${locked() ? 'disabled' : ''}>${esc(draft.alt)}</textarea></label><p class="small-note">${esc(draft.place)} · ${esc(draft.community)}${!locked() ? ' · <button class="text-button" id="details">Edit details</button>' : ''}</p><div class="action-row"><button class="secondary" id="save" ${locked() ? 'disabled' : ''}>Save draft</button><button class="primary" id="next">Choose destinations →</button></div><div class="action-row"><button class="text-button" id="download">Download image</button><button class="text-button" id="copy">Copy text</button></div></section></div>`
  draw().catch((e) => toast(e.message))
  $('#headline').oninput = (e) => {
    draft.title = e.target.value
    dirty = true
    draw().catch((e) => toast(e.message))
  }
  $('#caption').oninput = (e) => {
    draft[tab] = e.target.value
    dirty = true
  }
  $('#alt').oninput = (e) => {
    draft.alt = e.target.value
    dirty = true
  }
  document.querySelectorAll('[data-layout]').forEach(
    (b) =>
      (b.onclick = () => {
        draft.layout = b.dataset.layout
        dirty = true
        renderReview()
      })
  )
  document.querySelectorAll('[data-tab]').forEach(
    (b) =>
      (b.onclick = () => {
        tab = b.dataset.tab
        renderReview()
      })
  )
  $('#details')?.addEventListener('click', () => {
    step = 1
    render()
    window.scrollTo(0, 0)
  })
  $('#save').onclick = () =>
    task('Saving your draft', async () => {
      await save()
      toast('Draft saved for Matthew and Landon.')
    })
  $('#next').onclick = () =>
    task('Preparing destinations', async () => {
      if (!locked()) await save()
      step = 3
      selected = new Set(
        session.destinations
          .filter(
            (d) =>
              d.ready &&
              !draft.results[d.id] &&
              ['website', 'instagram_northside', 'facebook_northside'].includes(
                d.id
              )
          )
          .map((d) => d.id)
      )
      render()
      window.scrollTo(0, 0)
    })
  $('#download').onclick = () => task('Preparing your image', download)
  $('#copy').onclick = () => copy(draft[tab])
}
async function save() {
  const result = await api('save', draft)
  draft = result.draft
  dirty = false
  return draft
}
async function exportCanvas() {
  const canvas = document.createElement('canvas')
  await renderPhoto(canvas, draft)
  return canvas
}
async function download() {
  const canvas = await exportCanvas(),
    blob = await photoBlob(canvas),
    url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `northside-life-${draft.place.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
  toast('Image ready to save.')
}
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    toast('Copied to clipboard.')
  } catch {
    toast('Clipboard access is unavailable. Select and copy the caption above.')
  }
}
function renderPublish() {
  $('#content').innerHTML =
    heading(
      'Ready when you are.',
      'Choose where this local moment should live.',
      3
    ) +
    `<div class="editor-grid"><section class="card"><div class="mini-preview"><canvas id="preview" aria-label="Post thumbnail"></canvas><div><h3>${esc(draft.title)}</h3><p>${esc(draft.place)} · ${esc(draft.community)}</p></div></div>${session.destinations
      .map((d) => {
        const result = draft.results[d.id]
        return `<label class="destination"><input type="checkbox" data-destination="${d.id}" ${selected.has(d.id) ? 'checked' : ''} ${!d.ready || result ? 'disabled' : ''}><span class="dest-icon">${d.kind === 'Instagram' ? '◎' : d.kind === 'Website' ? '↗' : 'f'}</span><span class="dest-name"><strong>${esc(d.label)}</strong><small>${d.kind}</small></span><span class="dest-status">${result ? (result.status === 'published' ? 'Published ✓' : 'Check account') : d.ready ? 'Ready' : 'Not connected'}</span></label>`
      })
      .join(
        ''
      )}<div id="publish-errors"></div><div class="action-row"><button class="secondary" id="back">← Review</button><button class="primary" id="publish" ${!selected.size ? 'disabled' : ''}>Approve & Publish</button></div><p class="small-note">Only selected destinations are published. Each destination gets its own caption. The photo design is shared.</p>${Object.values(draft.results).some((r) => r.status === 'needs_review') ? '<div class="notice">A platform has not confirmed publication. Check that account manually. We won’t retry automatically and risk a duplicate.</div>' : ''}</section><section><div class="card"><p class="eyebrow">YOUR COMMUNITY CONVERSATION</p><h2>NorthSide GTA Life<br>Facebook Group</h2><p class="muted" style="font-size:13px">Your group post is ready to take with you. Facebook requires the final group-posting step in its own app.</p><button class="secondary full" id="share">Share photo…</button><div class="action-row"><button class="text-button" id="copy-group">Copy group caption</button><button class="text-button" id="download-group">Save image</button></div><p class="small-note">Copy the caption, then share the photo and choose Facebook if available. Paste the caption in your group.</p></div><div class="studio-note">${icon('spark')}<div><strong>You’re always in control.</strong>No post is sent when you upload. Your approval is the publishing step.</div></div></section></div>`
  draw().catch((e) => toast(e.message))
  document.querySelectorAll('[data-destination]').forEach(
    (c) =>
      (c.onchange = () => {
        c.checked
          ? selected.add(c.dataset.destination)
          : selected.delete(c.dataset.destination)
        $('#publish').disabled = !selected.size
      })
  )
  $('#back').onclick = () => {
    step = 2
    render()
  }
  $('#copy-group').onclick = () => copy(draft.facebook)
  $('#download-group').onclick = () => task('Preparing your image', download)
  $('#share').onclick = async () => {
    try {
      const canvas = await exportCanvas(),
        file = new File([await photoBlob(canvas)], 'northside-gta-life.jpg', {
          type: 'image/jpeg',
        })
      if (navigator.canShare?.({ files: [file] }))
        await navigator.share({ files: [file] })
      else await download()
    } catch (e) {
      if (e.name !== 'AbortError') toast(e.message)
    }
  }
  $('#publish').onclick = () =>
    task('Publishing your local moment', async () => {
      const image = (await exportCanvas()).toDataURL('image/jpeg', 0.88)
      const errors = []
      for (const destination of [...selected]) {
        try {
          const result = await api('publish', {
            id: draft.id,
            version: draft.version,
            approved: true,
            destination,
            image,
          })
          draft = result.draft
          selected.delete(destination)
        } catch (e) {
          errors.push(
            `${session.destinations.find((d) => d.id === destination)?.label}: ${e.message}`
          )
        }
      }
      renderPublish()
      if (errors.length) {
        $('#publish-errors').innerHTML =
          `<div class="notice error">${errors.map(esc).join('<br>')}</div>`
      } else toast('Publishing status updated.')
    })
}
function renderLibrary() {
  $('#content').innerHTML =
    heading(
      'Your local stories.',
      'Drafts and approved posts, shared by Matthew and Landon.'
    ) +
    `<div class="action-row" style="max-width:200px;margin:0 0 25px"><button class="primary" id="new">+ New discovery</button></div><div class="library-grid">${drafts.length ? drafts.map((d) => `<button class="draft-card" data-draft="${d.id}"><div class="draft-cover">${d.imageUrl ? `<img src="${esc(d.imageUrl)}" alt="">` : 'Local life.'}</div><p class="eyebrow" style="margin-top:15px">${esc(d.community)}</p><h3>${esc(d.title || d.place)}</h3><p>${esc(d.author)} · ${new Date(d.updatedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</p><span class="pill" style="display:inline-block;margin-top:12px">${Object.values(d.results || {}).some((r) => r.status === 'needs_review') ? 'Needs attention' : Object.keys(d.results || {}).length ? 'Approved' : 'Draft'}</span></button>`).join('') : '<div class="empty-state"><h2>Your first local story starts here.</h2><p>Find something worth sharing. We’ll help with the rest.</p></div>'}</div>`
  $('#new').onclick = () => {
    draft = blank()
    step = 1
    view = 'create'
    dirty = false
    render()
  }
  document.querySelectorAll('[data-draft]').forEach(
    (b) =>
      (b.onclick = () =>
        task('Opening your story', async () => {
          draft = (await api('draft', null, `&id=${b.dataset.draft}`)).draft
          view = 'create'
          step = 2
          dirty = false
          render()
        }))
  )
}
function renderSettings() {
  $('#content').innerHTML =
    heading(
      'A little housekeeping.',
      'Your accounts, your iPhone, your studio.'
    ) +
    `<div class="settings-grid"><section class="card"><h2>Connections</h2><div class="connection-line"><span>Shared draft library</span><span class="pill">${session.local ? 'Local preview' : session.storage ? 'Connected' : 'Not connected'}</span></div><div class="connection-line"><span>AI captions</span><span class="pill">${session.ai ? 'Configured' : 'Starter captions only'}</span></div>${session.destinations.map((d) => `<div class="connection-line"><span>${d.kind}<br><small>${esc(d.label)}</small></span><span class="pill">${d.ready ? 'Configured' : 'Not connected'}</span></div>`).join('')}<p class="small-note">Configured means credentials are present. The platform confirms a post only after publishing succeeds. Account setup happens securely on the server.</p></section><section><div class="card"><h2>Keep Life on your iPhone.</h2><p>Open this studio in Safari:</p><ol><li>Tap the Share button.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Tap Add. Look for NorthSide Life.</li></ol><p>An internet connection is needed to save drafts and publish.</p></div><div class="card" style="margin-top:20px"><h2>${esc(session.user)}’s studio</h2><p>Matthew & Landon Mulhall<br>Finally Home Agents<br>HomeLife Optimum Realty, Brokerage</p><a class="text-link" href="/life/" target="_blank" rel="noopener">Open the community page ↗</a><div class="action-row"><button class="secondary" id="signout">Sign out</button></div></div></section></div>`
  $('#signout').onclick = () =>
    task('Signing out', async () => {
      await api('logout', {})
      session = await api('session')
      draft = blank()
      dirty = false
      render()
    })
}
window.addEventListener('beforeunload', (e) => {
  if (dirty) {
    e.preventDefault()
    e.returnValue = ''
  }
})
window.addEventListener('offline', () =>
  toast('You’re offline. Keep this page open until you can save.')
)
try {
  session = await api('session')
  render()
} catch (e) {
  $('#app').innerHTML =
    `<div class="loading-screen">${brand}<p>Could not connect to the studio.</p><button class="primary" onclick="location.reload()">Try again</button></div>`
}
if ('serviceWorker' in navigator)
  navigator.serviceWorker
    .register('/life/studio/sw.js', { scope: '/life/studio/' })
    .catch(() => {})
