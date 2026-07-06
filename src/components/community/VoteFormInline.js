import React, { useMemo, useRef, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

import ConsentCopy from './ConsentCopy'

const TURNSTILE_SITE_KEY =
  process.env.REACT_APP_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY || ''

export default function VoteFormInline({ town, category, places = [], onVoted, onVoteFailed }) {
  const [selected, setSelected] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)
  const [emailStatus, setEmailStatus] = useState('idle')
  const [emailMessage, setEmailMessage] = useState('')

  const honeypotRef = useRef(null)
  const turnstileRef = useRef(null)

  const hasTurnstile = Boolean(TURNSTILE_SITE_KEY)
  const ballotPlaces = useMemo(() => {
    return Array.isArray(places) ? [...places] : []
  }, [places])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selected || isSubmitting) return
    if (hasTurnstile && !turnstileToken) return

    setIsSubmitting(true)
    setStatus('submitting')
    setMessage('')

    const payload = {
      town,
      category,
      choice: selected,
      turnstileToken: turnstileToken || undefined,
      honeypot: honeypotRef.current?.value || '',
    }

    try {
      const response = await fetch('/api/rankings/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.status === 429) {
        setStatus('duplicate')
        setMessage("It looks like you've already voted today — thanks for supporting local!")
        onVoteFailed?.('duplicate')
        return
      }

      if (!response.ok) {
        setStatus('error')
        setMessage('We could not record your vote. Please try again in a moment.')
        onVoteFailed?.('error')
        return
      }

      setStatus('success')
      setMessage('Thanks! Your vote was recorded.')
      onVoted?.()
    } catch (error) {
      console.error('[VoteFormInline] submit failed', error)
      setStatus('error')
      setMessage('We could not record your vote. Please try again in a moment.')
      onVoteFailed?.('error')
    } finally {
      setIsSubmitting(false)
      if (turnstileRef.current) {
        try {
          turnstileRef.current.reset()
        } catch (error) {
          // ignore reset issues
        }
      }
      setTurnstileToken('')
    }
  }

  async function handleEmailSubmit(event) {
    event.preventDefault()
    if (!email || !consentChecked) {
      setEmailStatus('error')
      setEmailMessage('Please provide your email and consent to subscribe.')
      return
    }

    setEmailStatus('submitting')
    setEmailMessage('')

    try {
      const response = await fetch('/api/marketing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          consent: true,
          source: `${town} ${category} Vote`,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('[VoteFormInline] subscribe failed', text)
        setEmailStatus('error')
        setEmailMessage('We could not add you to the list. Please try again later.')
        return
      }

      setEmailStatus('success')
      setEmailMessage('Check your email to confirm your subscription.')
      setEmail('')
      setConsentChecked(false)
    } catch (error) {
      console.error('[VoteFormInline] subscribe error', error)
      setEmailStatus('error')
      setEmailMessage('We could not add you to the list. Please try again later.')
    }
  }

  return (
    <div className="rounded-xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight text-emerald-900">
        Which {town} {category.toLowerCase()} spot gets your vote today?
      </h3>
      <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-3">
          {ballotPlaces.map((place) => (
            <label key={place.slug} className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="radio"
                name="place"
                value={place.slug}
                checked={selected === place.slug}
                onChange={() => setSelected(place.slug)}
                className="mt-1 h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-gray-900">{place.title}</span>
            </label>
          ))}
          {ballotPlaces.length === 0 && (
            <p className="text-sm text-gray-500">No spots available yet. Check back soon.</p>
          )}
        </div>

        <div className="hidden" aria-hidden="true">
          <label>
            Do not fill this field
            <input ref={honeypotRef} type="text" name="honeypot" tabIndex="-1" autoComplete="off" />
          </label>
        </div>

        {hasTurnstile && (
          <div className="flex justify-start">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token || '')}
              onExpire={() => setTurnstileToken('')}
              onError={() => setTurnstileToken('')}
              options={{ theme: 'light' }}
            />
          </div>
        )}

        {message && (
          <p
            className={`text-sm ${
              status === 'success' || status === 'duplicate' ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            !selected ||
            (hasTurnstile && !turnstileToken) ||
            ballotPlaces.length === 0
          }
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? 'Submitting…' : 'Submit vote'}
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-6 space-y-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-900">
          <p>You can vote once per day. Check back tomorrow to support your favourite spot again.</p>

          <div className="space-y-3">
            <h4 className="text-base font-semibold text-emerald-900">Stay in the loop</h4>
            <form className="space-y-3" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="vote-email" className="block text-sm font-medium text-emerald-900">
                  Email
                </label>
                <input
                  id="vote-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(event) => setConsentChecked(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <ConsentCopy />
                </div>
              </label>

              {emailMessage && (
                <p
                  className={`text-sm ${emailStatus === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}
                >
                  {emailMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={emailStatus === 'submitting'}
                className="inline-flex items-center justify-center rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
              >
                {emailStatus === 'submitting' ? 'Sending…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
