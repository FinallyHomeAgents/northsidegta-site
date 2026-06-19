const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

async function loadModule() {
  return import(pathToFileURL(path.resolve(__dirname, '../src/lib/sellersPlanning.js')).href)
}

const validForm = {
  community: 'Uxbridge',
  address: '123 Main St',
  timeline: 'Selling in 1–3 months',
  goals: ['Understanding current value'],
  property_type: 'Detached',
  bedrooms: '3',
  bathrooms: '2',
  upgrades: '',
  additional_notes: '',
  name: 'Jordan Seller',
  phone: '647-555-1212',
  email: '',
  preferred_contact: 'Text',
  best_time: 'Evenings',
  notUnderContract: true,
  contactConsent: true,
}

test('submission validation blocks when representation confirmation is unchecked', async () => {
  const { validateSellerPlanningForm } = await loadModule()
  const errors = validateSellerPlanningForm({ ...validForm, notUnderContract: false })
  assert.match(errors.notUnderContract, /not currently under contract/i)
})

test('submission validation blocks when contact consent is unchecked', async () => {
  const { validateSellerPlanningForm } = await loadModule()
  const errors = validateSellerPlanningForm({ ...validForm, contactConsent: false })
  assert.match(errors.contactConsent, /may contact/i)
})

test('successful payload includes both confirmation values', async () => {
  const { buildSellerPlanningPayload } = await loadModule()
  const payload = buildSellerPlanningPayload({ form: validForm, currentPageUrl: 'https://northsidegta.ca/sellers', timestamp: '2026-06-19T12:00:00.000Z' })
  assert.equal(payload.not_under_contract, 'Yes')
  assert.equal(payload.contact_consent, 'Yes')
})

test('successful payload includes UTM and attribution data when present', async () => {
  const { buildSellerPlanningPayload, getSellerAttribution } = await loadModule()
  const attribution = getSellerAttribution({
    search: '?utm_source=google&utm_medium=cpc&utm_campaign=seller&utm_term=uxbridge&utm_content=hero',
    referrer: 'https://example.com/ref',
    landingPage: 'https://northsidegta.ca/sellers?utm_source=google',
    currentPageUrl: 'https://northsidegta.ca/sellers?utm_source=google',
  })
  const payload = buildSellerPlanningPayload({ form: validForm, attribution, currentPageUrl: 'https://northsidegta.ca/sellers?step=5', timestamp: '2026-06-19T12:00:00.000Z' })
  assert.equal(payload._source, 'sellers-page')
  assert.equal(payload.utm_source, 'google')
  assert.equal(payload.utm_medium, 'cpc')
  assert.equal(payload.utm_campaign, 'seller')
  assert.equal(payload.utm_term, 'uxbridge')
  assert.equal(payload.utm_content, 'hero')
  assert.equal(payload.referrer, 'https://example.com/ref')
  assert.equal(payload.landing_page, 'https://northsidegta.ca/sellers?utm_source=google')
  assert.equal(payload.current_page_url, 'https://northsidegta.ca/sellers?step=5')
  assert.equal(payload.submission_timestamp, '2026-06-19T12:00:00.000Z')
})

test('conversion events fire once after a successful Formspree response', async () => {
  const { fireSellerConversionEvents } = await loadModule()
  const calls = []
  const fakeWindow = { dataLayer: [], fbq: (...args) => calls.push(args) }
  fireSellerConversionEvents(fakeWindow)
  assert.deepEqual(fakeWindow.dataLayer, [{ event: 'seller_submit' }])
  assert.deepEqual(calls, [['trackCustom', 'SellerSubmit']])
})

test('conversion events do not fire after a failed submission path', async () => {
  const { validateSellerPlanningForm } = await loadModule()
  const fakeWindow = { dataLayer: [], fbq: () => assert.fail('fbq should not be called') }
  const errors = validateSellerPlanningForm({ ...validForm, contactConsent: false })
  if (Object.keys(errors).length === 0) {
    const { fireSellerConversionEvents } = await loadModule()
    fireSellerConversionEvents(fakeWindow)
  }
  assert.deepEqual(fakeWindow.dataLayer, [])
})

test('form payload still works when no UTM parameters are present', async () => {
  const { buildSellerPlanningPayload, getSellerAttribution } = await loadModule()
  const attribution = getSellerAttribution({ search: '', referrer: '', landingPage: 'https://northsidegta.ca/sellers' })
  const payload = buildSellerPlanningPayload({ form: validForm, attribution, currentPageUrl: 'https://northsidegta.ca/sellers', timestamp: '2026-06-19T12:00:00.000Z' })
  assert.equal(payload.utm_source, '')
  assert.equal(payload.utm_medium, '')
  assert.equal(payload.utm_campaign, '')
  assert.equal(payload.utm_term, '')
  assert.equal(payload.utm_content, '')
  assert.equal(payload._source, 'sellers-page')
  assert.equal(payload.not_under_contract, 'Yes')
  assert.equal(payload.contact_consent, 'Yes')
})
