const test = require('node:test')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')

const handlerPath = require.resolve('../api/coffee-request.js')

async function loadValidator() {
  const moduleUrl = `${pathToFileURL(handlerPath).href}?t=${Date.now()}`
  const module = await import(moduleUrl)
  return module.validateRequestedDateTime
}

test('coffee datetime validation uses Toronto timezone across UTC rollover', async () => {
  const validateRequestedDateTime = await loadValidator()
  const { Settings } = await import('luxon')

  const originalNow = Settings.now
  Settings.now = () => Date.parse('2026-02-20T00:30:00.000Z')

  try {
    const sameDayEvening = validateRequestedDateTime('2026-02-19', '20:00')
    assert.equal(sameDayEvening.valid, true)

    const pastSameDayTime = validateRequestedDateTime('2026-02-19', '18:30')
    assert.equal(pastSameDayTime.valid, false)
    assert.equal(pastSameDayTime.reason, 'past')

    const tomorrowMorning = validateRequestedDateTime('2026-02-20', '09:00')
    assert.equal(tomorrowMorning.valid, true)
  } finally {
    Settings.now = originalNow
  }
})

test('coffee datetime validation enforces slot window and rejects invalid date/time values', async () => {
  const validateRequestedDateTime = await loadValidator()
  const { Settings } = await import('luxon')

  const originalNow = Settings.now
  Settings.now = () => Date.parse('2026-02-19T20:00:00.000Z')

  try {
    assert.equal(validateRequestedDateTime('2026-02-20', '08:30').valid, false)
    assert.equal(validateRequestedDateTime('2026-02-20', '21:30').valid, false)
    assert.equal(validateRequestedDateTime('2026-02-20', '09:10').valid, false)
    assert.equal(validateRequestedDateTime('not-a-date', '10:00').valid, false)
    assert.equal(validateRequestedDateTime('2026-02-20', 'invalid').valid, false)
  } finally {
    Settings.now = originalNow
  }
})
