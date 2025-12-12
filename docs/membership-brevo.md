# Membership Brevo Setup

Configure the following environment variables (Preview + Production):

- `BREVO_API_KEY`
- `BREVO_LIST_ID`
- `BREVO_ENABLED` (optional, defaults to enabled when unset)

Create these Brevo contact attributes before enabling sync:

- `FULL_NAME` (text)
- `CARD_NUMBER` (text)
- `CARD_LABEL` (text)
- `PRIMARY_TOWN` (text)
- `MEMBER_TYPE` (text)
- `INTEREST_EVENTS` (boolean)
- `INTEREST_TASTE_HUB` (boolean)
- `INTEREST_MARKET_INSIGHTS` (boolean)
- `COMPLIANCE_CONFIRMED` (boolean)
