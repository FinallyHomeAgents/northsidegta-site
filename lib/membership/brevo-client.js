// Brevo setup note:
// Create the following contact attributes in Brevo before syncing memberships:
// - FULL_NAME (text)
// - CARD_NUMBER (text)
// - CARD_LABEL (text)
// - PRIMARY_TOWN (text)
// - MEMBER_TYPE (text)
// - INTEREST_EVENTS (boolean)
// - INTEREST_TASTE_HUB (boolean)
// - INTEREST_MARKET_INSIGHTS (boolean)
// - COMPLIANCE_CONFIRMED (boolean)
// - NSGTA_PASS_ID (text)
// - NSGTA_PASS_CARD_URL (text)
// - NSGTA_SOURCE (text)

export async function upsertBrevoContact({
  email,
  fullName,
  cardNumber,
  cardLabel,
  primaryTown,
  memberType,
  interests = {},
  complianceConfirmed = true,
  cardUrl,
  source,
  passId,
}) {
  const apiKey = process.env.BREVO_API_KEY
  const listId = Number(process.env.BREVO_LIST_ID)
  const normalizedEmail = (email || '').trim().toLowerCase()

  if (!apiKey) {
    throw new Error('Brevo API key is not configured')
  }

  if (!Number.isFinite(listId)) {
    throw new Error('Brevo list id is missing or invalid')
  }

  const body = {
    email: normalizedEmail,
    updateEnabled: true,
    listIds: [listId],
    attributes: {
      FULL_NAME: fullName,
      CARD_NUMBER: cardNumber,
      CARD_LABEL: cardLabel,
      PRIMARY_TOWN: primaryTown,
      MEMBER_TYPE: memberType,
      INTEREST_EVENTS: !!interests.events,
      INTEREST_TASTE_HUB: !!interests.tasteHub,
      INTEREST_MARKET_INSIGHTS: !!interests.marketInsights,
      COMPLIANCE_CONFIRMED: !!complianceConfirmed,
      NSGTA_PASS_ID: passId || cardNumber,
      NSGTA_PASS_CARD_URL: cardUrl,
      NSGTA_SOURCE: source,
    },
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = new Error(`Brevo contact upsert failed with status ${response.status}`)
    error.responseStatus = response.status
    try {
      const bodyText = await response.text()
      error.responseBody = bodyText ? bodyText.slice(0, 500) : undefined
    } catch (bodyError) {
      error.responseBody = undefined
    }
    throw error
  }

  try {
    return await response.json()
  } catch (parseError) {
    return null
  }
}
