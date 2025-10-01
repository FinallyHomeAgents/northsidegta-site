import React from 'react'
import classNames from 'classnames'
import { Helmet } from 'react-helmet-async'
import { DateTime } from 'luxon'
import { upload } from '@vercel/blob/client'

import CaptchaWidget from '../components/CaptchaWidget'

const TORONTO_ZONE = 'America/Toronto'
const MAX_EVENT_DURATION_DAYS = 14
const MAX_AUDIENCE_TAGS = 3
const MAX_CATEGORY_TAGS = 4
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024
const ALLOWED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const EVENT_TYPES = [
  'Community',
  'Sports',
  'Family',
  'Arts & Culture',
  'Education',
  'Business/Networking',
  'Charity',
  'Other',
]

const CITY_OPTIONS = [
  'Georgina',
  'East Gwillimbury',
  'Aurora',
  'Stouffville',
  'Uxbridge',
  'Scugog',
  'Newmarket',
  'Nearby/Other (North of Toronto)',
]

const AUDIENCE_OPTIONS = ['All ages', 'Kids', 'Teens', 'Adults', 'Seniors', 'Families']

const CATEGORY_TAGS = [
  'Community',
  'Sports',
  'Family',
  'Arts & Culture',
  'Education',
  'Business/Networking',
  'Charity',
  'Other',
  'Fall',
  'Winter',
  'Spring',
  'Summer',
  'Holiday',
]

const turnstileKey = (process.env.REACT_APP_TURNSTILE_SITE_KEY || '').trim()
const hcaptchaKey = (process.env.REACT_APP_HCAPTCHA_SITE_KEY || '').trim()
const CAPTCHA_PROVIDER = turnstileKey ? 'turnstile' : hcaptchaKey ? 'hcaptcha' : null
const CAPTCHA_SITE_KEY = turnstileKey || hcaptchaKey || ''

function initialFormState() {
  const defaultStart = DateTime.now().setZone(TORONTO_ZONE).plus({ hours: 24 })
  const defaultEnd = defaultStart.plus({ hours: 2 })
  return {
    title: '',
    organizerName: '',
    organizerEmail: '',
    eventType: '',
    shortDescription: '',
    fullDescription: '',
    startDate: defaultStart.toFormat("yyyy-LL-dd'T'HH:mm"),
    endDate: defaultEnd.toFormat("yyyy-LL-dd'T'HH:mm"),
    venueName: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    costType: 'Free',
    priceFrom: '',
    ticketsUrl: '',
    registrationUrl: '',
    imageUrl: '',
    uploadedImageUrl: '',
    audienceTags: [],
    categoryTags: [],
    contactConsent: false,
    honeypot: '',
    captchaToken: '',
  }
}

function stripHtml(value) {
  if (!value) return ''
  return String(value).replace(/<[^>]*>/g, '')
}

function hasEmoji(value) {
  if (!value) return false
  return /\p{Extended_Pictographic}/u.test(value)
}

function isHttpsUrl(value) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch (error) {
    return false
  }
}

function validatePostalCode(value) {
  if (!value) return false
  return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value.trim())
}

function formatTorontoRange(startIso, endIso) {
  const start = startIso ? DateTime.fromISO(startIso, { zone: TORONTO_ZONE }) : null
  const end = endIso ? DateTime.fromISO(endIso, { zone: TORONTO_ZONE }) : null
  if (!start?.isValid) return ''
  if (end?.isValid) {
    if (start.hasSame(end, 'day')) {
      return `${start.toFormat('ccc, MMM d • h:mm a')} – ${end.toFormat('h:mm a')}`
    }
    return `${start.toFormat('ccc, MMM d h:mm a')} → ${end.toFormat('ccc, MMM d h:mm a')}`
  }
  return `${start.toFormat('ccc, MMM d • h:mm a')}`
}

function ensureMax(list, max) {
  if (!Array.isArray(list)) return []
  if (list.length <= max) return list
  return list.slice(0, max)
}

function validateField(name, form) {
  const value = form[name]
  switch (name) {
    case 'title': {
      const trimmed = (value || '').trim()
      if (!trimmed) return 'Enter the event title.'
      if (trimmed.length < 3 || trimmed.length > 80) {
        return 'Use 3 to 80 characters for the title.'
      }
      const letters = trimmed.replace(/[^A-Za-z]/g, '')
      if (letters && letters === letters.toUpperCase()) {
        return 'Use sentence case instead of all caps.'
      }
      return ''
    }
    case 'organizerName': {
      const trimmed = (value || '').trim()
      if (!trimmed) return 'Tell us who is organizing the event.'
      if (trimmed.length < 2 || trimmed.length > 80) {
        return 'Organizer name must be between 2 and 80 characters.'
      }
      return ''
    }
    case 'organizerEmail': {
      const trimmed = (value || '').trim()
      if (!trimmed) return 'Provide a contact email (not shown publicly).'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return 'Enter a valid email address.'
      }
      return ''
    }
    case 'eventType': {
      if (!value || !EVENT_TYPES.includes(value)) {
        return 'Pick the event type that fits best.'
      }
      return ''
    }
    case 'shortDescription': {
      const trimmed = stripHtml(value || '').trim()
      if (trimmed.length < 10 || trimmed.length > 200) {
        return 'Short description must be 10–200 characters.'
      }
      if (hasEmoji(trimmed)) {
        return 'Please remove emojis from the short description.'
      }
      return ''
    }
    case 'fullDescription': {
      const trimmed = stripHtml(value || '').trim()
      if (trimmed && trimmed.length > 4000) {
        return 'Full description can be up to 4,000 characters.'
      }
      return ''
    }
    case 'startDate': {
      const dt = DateTime.fromISO(value || '', { zone: TORONTO_ZONE })
      if (!dt.isValid) {
        return 'Pick a valid start date and time.'
      }
      const now = DateTime.now().setZone(TORONTO_ZONE).minus({ minutes: 10 })
      if (dt < now) {
        return 'Start time must be in the future.'
      }
      return ''
    }
    case 'endDate': {
      const start = DateTime.fromISO(form.startDate || '', { zone: TORONTO_ZONE })
      const end = DateTime.fromISO(value || '', { zone: TORONTO_ZONE })
      if (!end.isValid) {
        return 'Pick a valid end date and time.'
      }
      if (!start.isValid) {
        return 'Set the start date before the end date.'
      }
      if (end <= start) {
        return 'End time must be after the start time.'
      }
      if (end.diff(start, 'days').days > MAX_EVENT_DURATION_DAYS) {
        return 'Events can span up to 14 days.'
      }
      return ''
    }
    case 'venueName': {
      const trimmed = (value || '').trim()
      if (!trimmed) return 'Enter the venue name.'
      if (trimmed.length < 2 || trimmed.length > 80) {
        return 'Venue name must be 2–80 characters.'
      }
      return ''
    }
    case 'streetAddress': {
      const trimmed = (value || '').trim()
      if (!trimmed) return 'Provide the street address.'
      return ''
    }
    case 'city': {
      if (!value || !CITY_OPTIONS.includes(value)) {
        return 'Select the closest city or town.'
      }
      return ''
    }
    case 'postalCode': {
      const trimmed = (value || '').trim()
      if (!trimmed) return 'Enter the postal code.'
      if (!validatePostalCode(trimmed)) {
        return 'Use the Canadian format A1A 1A1.'
      }
      return ''
    }
    case 'costType': {
      if (!['Free', 'Paid'].includes(value)) {
        return 'Choose Free or Paid.'
      }
      return ''
    }
    case 'priceFrom': {
      if (form.costType === 'Paid') {
        const trimmed = (value || '').trim()
        if (!trimmed) {
          return 'Enter the lowest ticket price.'
        }
        if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
          return 'Use a number with up to two decimals (e.g., 15 or 12.50).'
        }
      }
      return ''
    }
    case 'ticketsUrl': {
      if (form.costType === 'Paid') {
        const trimmed = (value || '').trim()
        if (!trimmed) {
          return 'Add a ticket purchase link.'
        }
        if (!isHttpsUrl(trimmed)) {
          return 'Tickets link must start with https://'
        }
      }
      return ''
    }
    case 'registrationUrl': {
      const trimmed = (value || '').trim()
      if (trimmed && !isHttpsUrl(trimmed)) {
        return 'Registration link must start with https://'
      }
      return ''
    }
    case 'audienceTags': {
      const list = Array.isArray(value) ? value : []
      if (list.length > MAX_AUDIENCE_TAGS) {
        return 'Choose up to three audience tags.'
      }
      return ''
    }
    case 'categoryTags': {
      const list = Array.isArray(value) ? value : []
      if (list.length > MAX_CATEGORY_TAGS) {
        return 'Pick up to four category tags.'
      }
      return ''
    }
    case 'imageUrl': {
      const trimmed = (value || '').trim()
      if (trimmed && !isHttpsUrl(trimmed)) {
        return 'Event image link must start with https://'
      }
      return ''
    }
    case 'contactConsent': {
      if (!form.contactConsent) {
        return 'Consent is required before submitting.'
      }
      return ''
    }
    case 'captchaToken': {
      if (CAPTCHA_PROVIDER && !value) {
        return 'Complete the captcha challenge.'
      }
      return ''
    }
    default:
      return ''
  }
}

function FormError({ message }) {
  if (!message) return null
  return <p className="mt-2 text-sm font-medium text-rose-600">{message}</p>
}

function Hint({ children }) {
  return <p className="mt-1 text-xs text-slate-500">{children}</p>
}

export default function SubmitEventPage() {
  const [form, setForm] = React.useState(() => initialFormState())
  const [errors, setErrors] = React.useState({})
  const [touched, setTouched] = React.useState({})
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState('')
  const [submitResult, setSubmitResult] = React.useState(null)
  const [imageUploadProgress, setImageUploadProgress] = React.useState(0)
  const [imageError, setImageError] = React.useState('')
  const [uploadingImage, setUploadingImage] = React.useState(false)

  const finalImageUrl = form.uploadedImageUrl || form.imageUrl.trim()

  const setField = React.useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleBlur = React.useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }))
      const validation = validateField(name, form)
      setErrors((prev) => ({ ...prev, [name]: validation }))
    },
    [form]
  )

  const toggleAudience = (tag) => {
    setForm((prev) => {
      const existing = new Set(prev.audienceTags || [])
      if (existing.has(tag)) {
        existing.delete(tag)
      } else {
        if (existing.size >= MAX_AUDIENCE_TAGS) {
          return prev
        }
        existing.add(tag)
      }
      const next = Array.from(existing)
      setErrors((prevErrs) => ({ ...prevErrs, audienceTags: validateField('audienceTags', { ...prev, audienceTags: next }) }))
      return { ...prev, audienceTags: next }
    })
  }

  const toggleCategory = (tag) => {
    setForm((prev) => {
      const existing = new Set(prev.categoryTags || [])
      if (existing.has(tag)) {
        existing.delete(tag)
      } else {
        if (existing.size >= MAX_CATEGORY_TAGS) {
          return prev
        }
        existing.add(tag)
      }
      const next = Array.from(existing)
      setErrors((prevErrs) => ({ ...prevErrs, categoryTags: validateField('categoryTags', { ...prev, categoryTags: next }) }))
      return { ...prev, categoryTags: next }
    })
  }

  const handleImageUrlChange = (event) => {
    setImageError('')
    setField('imageUrl', event.target.value)
    setField('uploadedImageUrl', '')
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setImageError('')
    setImageUploadProgress(0)

    if (!file) return

    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      setImageError('Upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      setImageError('Uploads are limited to 5MB.')
      return
    }

    try {
      setUploadingImage(true)
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
      const path = `community-events/${Date.now()}-${safeName}`
      const result = await upload(path, file, {
        access: 'public',
        handleUploadUrl: '/api/community/event-image-upload',
        contentType: file.type,
        onUploadProgress: ({ percentage }) => {
          setImageUploadProgress(Math.round(percentage))
        },
      })
      setField('uploadedImageUrl', result.url || '')
      setField('imageUrl', '')
      setImageUploadProgress(100)
    } catch (error) {
      console.error('image upload failed', error)
      setImageError('Image upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCaptcha = React.useCallback(
    (token) => {
      setField('captchaToken', token)
      setErrors((prev) => ({
        ...prev,
        captchaToken: CAPTCHA_PROVIDER ? validateField('captchaToken', { ...form, captchaToken: token }) : '',
      }))
    },
    [form, setErrors, setField]
  )

  const resetForm = () => {
    setForm(initialFormState())
    setErrors({})
    setTouched({})
    setSubmitError('')
    setImageError('')
    setImageUploadProgress(0)
  }

  const validateAll = () => {
    const fieldNames = [
      'title',
      'organizerName',
      'organizerEmail',
      'eventType',
      'shortDescription',
      'fullDescription',
      'startDate',
      'endDate',
      'venueName',
      'streetAddress',
      'city',
      'postalCode',
      'costType',
      'priceFrom',
      'ticketsUrl',
      'registrationUrl',
      'audienceTags',
      'categoryTags',
      'imageUrl',
      'contactConsent',
      'captchaToken',
    ]
    const nextErrors = {}
    fieldNames.forEach((name) => {
      const err = validateField(name, form)
      if (err) {
        nextErrors[name] = err
      }
    })
    setErrors(nextErrors)
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const validation = validateAll()
    if (Object.values(validation).some(Boolean)) {
      setTouched((prev) => ({ ...prev, submitAttempted: true }))
      return
    }

    setSubmitting(true)

    const payload = {
      title: form.title,
      organizerName: form.organizerName,
      organizerEmail: form.organizerEmail,
      eventType: form.eventType,
      shortDescription: stripHtml(form.shortDescription).trim(),
      fullDescription: stripHtml(form.fullDescription).trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      venueName: form.venueName,
      streetAddress: form.streetAddress,
      city: form.city,
      postalCode: form.postalCode,
      costType: form.costType,
      priceFrom: form.priceFrom,
      ticketsUrl: form.ticketsUrl,
      registrationUrl: form.registrationUrl,
      imageUrl: finalImageUrl,
      audienceTags: ensureMax(form.audienceTags, MAX_AUDIENCE_TAGS),
      categoryTags: ensureMax(form.categoryTags, MAX_CATEGORY_TAGS),
      contactConsent: form.contactConsent,
      honeypot: form.honeypot,
      captchaToken: form.captchaToken,
      captchaProvider: CAPTCHA_PROVIDER,
    }

    try {
      const response = await fetch('/api/community/submit-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        if (body?.errors && typeof body.errors === 'object') {
          setErrors((prev) => ({ ...prev, ...body.errors }))
        }
        throw new Error(body?.error || 'Submission failed.')
      }

      const data = await response.json()
      setSubmitResult(data)
      resetForm()
    } catch (error) {
      console.error('submit-event failed', error)
      setSubmitError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitResult?.ok) {
    const summary = submitResult.event || {}
    return (
      <div className="min-h-screen bg-emerald-950/5 py-12">
        <Helmet>
          <title>Submit a Community Event | NorthSide GTA</title>
          <meta
            name="description"
            content="Share your NorthSide GTA community event with Finally Home Agents. Submit your listing for review."
          />
        </Helmet>
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl shadow-emerald-800/10">
            <h1 className="text-3xl font-semibold text-emerald-900">Thanks! Your event is pending review.</h1>
            <p className="mt-2 text-slate-700">
              Our team reviews community submissions quickly. If everything checks out, we’ll publish it to the NorthSide GTA
              community calendar.
            </p>
            {submitResult.message && <p className="mt-3 text-sm text-slate-600">{submitResult.message}</p>}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <h2 className="text-lg font-semibold text-slate-900">Submitted details</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Title</dt>
                  <dd className="font-medium text-slate-900">{summary.title}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Organizer</dt>
                  <dd className="font-medium text-slate-900">{summary.organizerName}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">When</dt>
                  <dd className="font-medium text-slate-900">{formatTorontoRange(summary.startDate, summary.endDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Where</dt>
                  <dd className="font-medium text-slate-900">
                    {summary.venueName}
                    {summary.city ? ` • ${summary.city}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Cost</dt>
                  <dd className="font-medium text-slate-900">
                    {summary.costType === 'Paid'
                      ? `Paid${summary.priceFrom ? ` — from $${summary.priceFrom}` : ''}`
                      : 'Free'}
                  </dd>
                </div>
                {summary.categoryTags?.length ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Categories</dt>
                    <dd className="font-medium text-slate-900">{summary.categoryTags.join(', ')}</dd>
                  </div>
                ) : null}
              </dl>
            {summary.image ? (
              <div className="mt-6">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Image</dt>
                  <dd className="mt-2">
                    <img
                      src={summary.image}
                      alt="Submitted event"
                      className="w-full rounded-2xl border border-slate-200 object-cover"
                    />
                  </dd>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmitResult(null)
                resetForm()
              }}
              className="mt-6 inline-flex items-center justify-center rounded-full border border-emerald-300 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:text-emerald-900"
            >
              Submit another event
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-emerald-950/5 py-12">
      <Helmet>
        <title>Submit a Community Event | NorthSide GTA</title>
        <meta
          name="description"
          content="Share upcoming events happening across Georgina, East Gwillimbury, Aurora, Stouffville, Uxbridge, Scugog, and nearby NorthSide GTA towns."
        />
      </Helmet>
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Community submission
          </span>
          <h1 className="mt-4 text-4xl font-semibold text-emerald-900">Submit a NorthSide GTA community event</h1>
          <p className="mt-3 text-base text-slate-600">
            Keep it detailed and accurate—titles, dates, and links are reviewed before publishing. We focus on family-friendly,
            local experiences north of Toronto.
          </p>
          <div className="mt-6 grid gap-4 rounded-3xl border border-emerald-200 bg-white/70 p-6 text-left shadow-sm md:grid-cols-3">
            {[1, 2, 3].map((step) => {
              const copy = [
                'Fill in every field carefully — formatting matters.',
                'Our team reviews new submissions quickly and may reach out if details are unclear.',
                'Approved events are published to our community calendar and newsletter.',
              ]
              return (
                <div key={step} className="space-y-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    {step}
                  </span>
                  <p className="text-sm text-slate-600">{copy[step - 1]}</p>
                </div>
              )
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-emerald-900/10"
        >
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-emerald-900">Event basics</h2>
              <div className="mt-4 space-y-5">
                <div>
                  <label htmlFor="event-title" className="block text-sm font-semibold text-slate-900">
                    Event Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    maxLength={80}
                    value={form.title}
                    onChange={(event) => setField('title', event.target.value)}
                    onBlur={() => handleBlur('title')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.title
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                    placeholder="Uxbridge Fall Market"
                  />
                  <Hint>Keep it short and clear (max 80). Example: “Uxbridge Fall Market”.</Hint>
                  <FormError message={errors.title && (touched.title || touched.submitAttempted) ? errors.title : ''} />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="organizer-name" className="block text-sm font-semibold text-slate-900">
                      Organizer Name
                    </label>
                    <input
                      id="organizer-name"
                      type="text"
                      value={form.organizerName}
                      onChange={(event) => setField('organizerName', event.target.value)}
                      onBlur={() => handleBlur('organizerName')}
                      className={classNames(
                        'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                        errors.organizerName
                          ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                      )}
                      placeholder="Finally Home Agents"
                    />
                    <Hint>Business, club, or person running the event.</Hint>
                    <FormError
                      message={errors.organizerName && (touched.organizerName || touched.submitAttempted) ? errors.organizerName : ''}
                    />
                  </div>
                  <div>
                    <label htmlFor="organizer-email" className="block text-sm font-semibold text-slate-900">
                      Organizer Email (not public)
                    </label>
                    <input
                      id="organizer-email"
                      type="email"
                      value={form.organizerEmail}
                      onChange={(event) => setField('organizerEmail', event.target.value)}
                      onBlur={() => handleBlur('organizerEmail')}
                      className={classNames(
                        'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                        errors.organizerEmail
                          ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                      )}
                      placeholder="you@example.com"
                    />
                    <Hint>We’ll contact you if we have questions. Not shown publicly.</Hint>
                    <FormError
                      message={
                        errors.organizerEmail && (touched.organizerEmail || touched.submitAttempted) ? errors.organizerEmail : ''
                      }
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="event-type" className="block text-sm font-semibold text-slate-900">
                    Event Type
                  </label>
                  <select
                    id="event-type"
                    value={form.eventType}
                    onChange={(event) => setField('eventType', event.target.value)}
                    onBlur={() => handleBlur('eventType')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.eventType
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                  >
                    <option value="">Select event type…</option>
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <FormError message={errors.eventType && (touched.eventType || touched.submitAttempted) ? errors.eventType : ''} />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-emerald-900">Descriptions</h2>
              <div className="mt-4 space-y-5">
                <div>
                  <label htmlFor="short-description" className="block text-sm font-semibold text-slate-900">
                    Short Description
                  </label>
                  <textarea
                    id="short-description"
                    rows={3}
                    value={form.shortDescription}
                    onChange={(event) => setField('shortDescription', event.target.value)}
                    onBlur={() => handleBlur('shortDescription')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.shortDescription
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                    placeholder="A neighbourhood market with live music, artisan vendors, and family activities."
                  />
                  <Hint>Short summary (10–200 characters). No emojis.</Hint>
                  <FormError
                    message={
                      errors.shortDescription && (touched.shortDescription || touched.submitAttempted)
                        ? errors.shortDescription
                        : ''
                    }
                  />
                </div>

                <div>
                  <label htmlFor="full-description" className="block text-sm font-semibold text-slate-900">
                    Full Description (recommended)
                  </label>
                  <textarea
                    id="full-description"
                    rows={6}
                    value={form.fullDescription}
                    onChange={(event) => setField('fullDescription', event.target.value)}
                    onBlur={() => handleBlur('fullDescription')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.fullDescription
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                    placeholder="Include key highlights, schedules, who should attend, and any registration details."
                  />
                  <Hint>Up to 4,000 characters. Plain text or simple sentences — we’ll format it for the listing.</Hint>
                  <FormError
                    message={
                      errors.fullDescription && (touched.fullDescription || touched.submitAttempted)
                        ? errors.fullDescription
                        : ''
                    }
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-emerald-900">Date & Time</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-semibold text-slate-900">
                    Start Date & Time
                  </label>
                  <input
                    id="start-date"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(event) => setField('startDate', event.target.value)}
                    onBlur={() => handleBlur('startDate')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.startDate
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                  />
                  <Hint>Use Toronto time (America/Toronto). Example: 2025-10-15 18:30.</Hint>
                  <FormError
                    message={errors.startDate && (touched.startDate || touched.submitAttempted) ? errors.startDate : ''}
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-semibold text-slate-900">
                    End Date & Time
                  </label>
                  <input
                    id="end-date"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(event) => setField('endDate', event.target.value)}
                    onBlur={() => handleBlur('endDate')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.endDate
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                  />
                  <Hint>End time must be after the start. Duration up to 14 days.</Hint>
                  <FormError message={errors.endDate && (touched.endDate || touched.submitAttempted) ? errors.endDate : ''} />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-emerald-900">Location</h2>
              <div className="mt-4 space-y-5">
                <div>
                  <label htmlFor="venue-name" className="block text-sm font-semibold text-slate-900">
                    Venue Name
                  </label>
                  <input
                    id="venue-name"
                    type="text"
                    value={form.venueName}
                    onChange={(event) => setField('venueName', event.target.value)}
                    onBlur={() => handleBlur('venueName')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.venueName
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                    placeholder="Georgina Ice Palace"
                  />
                  <FormError message={errors.venueName && (touched.venueName || touched.submitAttempted) ? errors.venueName : ''} />
                </div>

                <div>
                  <label htmlFor="street-address" className="block text-sm font-semibold text-slate-900">
                    Street Address
                  </label>
                  <input
                    id="street-address"
                    type="text"
                    value={form.streetAddress}
                    onChange={(event) => setField('streetAddress', event.target.value)}
                    onBlur={() => handleBlur('streetAddress')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.streetAddress
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                    placeholder="123 Main St"
                  />
                  <FormError
                    message={errors.streetAddress && (touched.streetAddress || touched.submitAttempted) ? errors.streetAddress : ''}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-slate-900">
                      City / Town
                    </label>
                    <select
                      id="city"
                      value={form.city}
                      onChange={(event) => setField('city', event.target.value)}
                      onBlur={() => handleBlur('city')}
                      className={classNames(
                        'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                        errors.city
                          ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                      )}
                    >
                      <option value="">Select a town…</option>
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <Hint>Pick the closest town in the NorthSide GTA.</Hint>
                    <FormError message={errors.city && (touched.city || touched.submitAttempted) ? errors.city : ''} />
                  </div>
                  <div>
                    <label htmlFor="postal-code" className="block text-sm font-semibold text-slate-900">
                      Postal Code
                    </label>
                    <input
                      id="postal-code"
                      type="text"
                      value={form.postalCode}
                      onChange={(event) => setField('postalCode', event.target.value)}
                      onBlur={() => handleBlur('postalCode')}
                      className={classNames(
                        'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                        errors.postalCode
                          ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                      )}
                      placeholder="L0E 1R0"
                    />
                    <Hint>Canadian format: A1A 1A1 (space optional).</Hint>
                    <FormError message={errors.postalCode && (touched.postalCode || touched.submitAttempted) ? errors.postalCode : ''} />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-emerald-900">Cost & Links</h2>
              <div className="mt-4 space-y-5">
                <div>
                  <span className="block text-sm font-semibold text-slate-900">Cost</span>
                  <Hint>Choose Free or Paid. If Paid, include your lowest ticket price and link.</Hint>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {['Free', 'Paid'].map((option) => (
                      <label
                        key={option}
                        className={classNames(
                          'flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition',
                          form.costType === option
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                        )}
                      >
                        <span>{option}</span>
                        <input
                          type="radio"
                          className="h-4 w-4"
                          checked={form.costType === option}
                          onChange={() => {
                            setField('costType', option)
                            setErrors((prev) => ({
                              ...prev,
                              priceFrom: option === 'Paid' ? validateField('priceFrom', { ...form, costType: option }) : '',
                              ticketsUrl: option === 'Paid' ? validateField('ticketsUrl', { ...form, costType: option }) : '',
                            }))
                          }}
                        />
                      </label>
                    ))}
                  </div>
                  <FormError message={errors.costType && (touched.costType || touched.submitAttempted) ? errors.costType : ''} />
                </div>

                {form.costType === 'Paid' && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="price-from" className="block text-sm font-semibold text-slate-900">
                        Price From
                      </label>
                      <input
                        id="price-from"
                        type="text"
                        value={form.priceFrom}
                        onChange={(event) => setField('priceFrom', event.target.value)}
                        onBlur={() => handleBlur('priceFrom')}
                        className={classNames(
                          'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                          errors.priceFrom
                            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                        )}
                        placeholder="20.00"
                      />
                      <FormError message={errors.priceFrom && (touched.priceFrom || touched.submitAttempted) ? errors.priceFrom : ''} />
                    </div>
                    <div>
                      <label htmlFor="tickets-url" className="block text-sm font-semibold text-slate-900">
                        Tickets URL
                      </label>
                      <input
                        id="tickets-url"
                        type="url"
                        value={form.ticketsUrl}
                        onChange={(event) => setField('ticketsUrl', event.target.value)}
                        onBlur={() => handleBlur('ticketsUrl')}
                        className={classNames(
                          'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                          errors.ticketsUrl
                            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                        )}
                        placeholder="https://"
                      />
                      <FormError
                        message={errors.ticketsUrl && (touched.ticketsUrl || touched.submitAttempted) ? errors.ticketsUrl : ''}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="registration-url" className="block text-sm font-semibold text-slate-900">
                    Registration / Info URL (optional)
                  </label>
                  <input
                    id="registration-url"
                    type="url"
                    value={form.registrationUrl}
                    onChange={(event) => setField('registrationUrl', event.target.value)}
                    onBlur={() => handleBlur('registrationUrl')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.registrationUrl
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                    placeholder="https://"
                  />
                  <FormError
                    message={
                      errors.registrationUrl && (touched.registrationUrl || touched.submitAttempted)
                        ? errors.registrationUrl
                        : ''
                    }
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-emerald-900">Images</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">Upload an image</p>
                  <Hint>Upload JPG/PNG/WebP up to 5MB (1200×630+), or paste a public https:// image URL.</Hint>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:text-emerald-900">
                      Upload image
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileUpload} />
                    </label>
                    {uploadingImage && (
                      <span className="text-xs font-medium text-emerald-700">Uploading… {imageUploadProgress}%</span>
                    )}
                    {form.uploadedImageUrl && !uploadingImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setField('uploadedImageUrl', '')
                          setImageUploadProgress(0)
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Remove uploaded image
                      </button>
                    )}
                  </div>
                  {form.uploadedImageUrl && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                      <img src={form.uploadedImageUrl} alt="Uploaded event" className="w-full object-cover" />
                    </div>
                  )}
                  {imageError && <p className="mt-2 text-sm font-medium text-rose-600">{imageError}</p>}
                </div>

                <div>
                  <label htmlFor="image-url" className="block text-sm font-semibold text-slate-900">
                    Image URL (optional)
                  </label>
                  <input
                    id="image-url"
                    type="url"
                    value={form.imageUrl}
                    onChange={handleImageUrlChange}
                    onBlur={() => handleBlur('imageUrl')}
                    className={classNames(
                      'mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2',
                      errors.imageUrl
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200'
                    )}
                    placeholder="https://"
                  />
                  <FormError message={errors.imageUrl && (touched.imageUrl || touched.submitAttempted) ? errors.imageUrl : ''} />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-emerald-900">Audience & Tags</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-sm font-semibold text-slate-900">Audience (choose up to 3)</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {AUDIENCE_OPTIONS.map((tag) => {
                      const active = form.audienceTags.includes(tag)
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleAudience(tag)}
                          className={classNames(
                            'rounded-full border px-4 py-2 text-xs font-semibold transition',
                            active
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-800'
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                  <FormError
                    message={errors.audienceTags && (touched.audienceTags || touched.submitAttempted) ? errors.audienceTags : ''}
                  />
                </div>

                <div>
                  <span className="text-sm font-semibold text-slate-900">Category tags (choose up to 4)</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CATEGORY_TAGS.map((tag) => {
                      const active = form.categoryTags.includes(tag)
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleCategory(tag)}
                          className={classNames(
                            'rounded-full border px-4 py-2 text-xs font-semibold transition',
                            active
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-800'
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                  <FormError
                    message={errors.categoryTags && (touched.categoryTags || touched.submitAttempted) ? errors.categoryTags : ''}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-emerald-900">Final steps</h2>
              <div className="mt-4 space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Disclaimer &amp; Terms</p>
                  <p className="mt-3 text-xs leading-5 text-slate-600">
                    By submitting this form, you represent that you have the right to share the information and materials provided
                    (including images and logos) and that your submission complies with all applicable laws. NorthSide GTA may
                    edit, decline, or remove any submitted event at its sole discretion. Listings are provided as community
                    information only; NorthSide GTA and Finally Home Agents do not endorse, verify, or guarantee the accuracy,
                    completeness, or availability of any event and are not responsible for any errors, omissions, changes,
                    cancellations, or losses arising from reliance on this information. You agree that NorthSide GTA and Finally
                    Home Agents shall have no liability for any claims related to your submission or any posted event. You grant
                    NorthSide GTA a non-exclusive, worldwide, royalty-free license to display, reproduce, and distribute your
                    submitted event details for the purpose of listing and promoting community events.
                  </p>
                  <label className="mt-4 flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.contactConsent}
                      onChange={(event) => {
                        setField('contactConsent', event.target.checked)
                        setErrors((prev) => ({
                          ...prev,
                          contactConsent: validateField('contactConsent', { ...form, contactConsent: event.target.checked }),
                        }))
                      }}
                      onBlur={() => handleBlur('contactConsent')}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span>I have read and agree to the Disclaimer &amp; Terms.</span>
                  </label>
                  <FormError
                    message={
                      errors.contactConsent && (touched.contactConsent || touched.submitAttempted)
                        ? errors.contactConsent
                        : ''
                    }
                  />
                </div>

                <div className="hidden">
                  <label htmlFor="website-field">Leave this field blank</label>
                  <input
                    id="website-field"
                    type="text"
                    name="website"
                    value={form.honeypot}
                    onChange={(event) => setField('honeypot', event.target.value)}
                    autoComplete="off"
                  />
                </div>

                {CAPTCHA_PROVIDER && (
                  <div>
                    <CaptchaWidget
                      provider={CAPTCHA_PROVIDER}
                      siteKey={CAPTCHA_SITE_KEY}
                      onTokenChange={handleCaptcha}
                    />
                    <FormError
                      message={errors.captchaToken && (touched.captchaToken || touched.submitAttempted) ? errors.captchaToken : ''}
                    />
                  </div>
                )}
              </div>
            </section>

            {submitError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {submitError}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Submissions are moderated. Approval emails are sent to contact@finallyhomeagents.com and Slack when configured.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className={classNames(
                  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition',
                  submitting
                    ? 'cursor-wait border border-emerald-200 bg-emerald-200 text-emerald-800'
                    : 'border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700'
                )}
              >
                {submitting ? 'Submitting…' : 'Submit for review'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
