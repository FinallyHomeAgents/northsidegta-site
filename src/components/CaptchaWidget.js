import React from 'react'
import classNames from 'classnames'

const PROVIDER_SCRIPTS = {
  turnstile: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
  hcaptcha: 'https://js.hcaptcha.com/1/api.js?render=explicit',
}

const PROVIDER_GLOBALS = {
  turnstile: 'turnstile',
  hcaptcha: 'hcaptcha',
}

const TURNSTILE_RENDER_OPTIONS = {
  theme: 'light',
  size: 'normal',
}

const scriptCache = new Map()

function isProviderReady(provider) {
  if (typeof window === 'undefined') return false
  const globalName = PROVIDER_GLOBALS[provider]
  if (!globalName) return false
  const globalObj = window[globalName]
  return Boolean(globalObj && typeof globalObj.render === 'function')
}

function waitForProvider(provider, attempt = 0) {
  if (isProviderReady(provider)) {
    return Promise.resolve()
  }

  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Captcha provider not available'))
  }

  if (attempt > 50) {
    return Promise.reject(new Error('Captcha provider did not initialize'))
  }

  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      waitForProvider(provider, attempt + 1).then(resolve).catch(reject)
    }, 100)
  })
}

function loadScript(provider) {
  const src = PROVIDER_SCRIPTS[provider]
  if (!src) {
    return Promise.reject(new Error('Unsupported captcha provider'))
  }
  if (scriptCache.has(provider)) {
    return scriptCache.get(provider)
  }

  const promise = new Promise((resolve, reject) => {
    const handleReady = () => {
      waitForProvider(provider).then(resolve).catch(reject)
    }

    if (isProviderReady(provider)) {
      resolve()
      return
    }

    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', handleReady, { once: true })
      existing.addEventListener('error', reject, { once: true })
      if (existing.getAttribute('data-loaded') === 'true' || existing.readyState === 'loaded' || existing.readyState === 'complete') {
        handleReady()
      }
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => {
      script.setAttribute('data-loaded', 'true')
      handleReady()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })

  scriptCache.set(provider, promise)
  return promise
}

export default function CaptchaWidget({ provider, siteKey, onTokenChange, className }) {
  const containerRef = React.useRef(null)
  const widgetIdRef = React.useRef(null)
  const [ready, setReady] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    onTokenChange('')
    setError('')
    if (!provider || !siteKey) {
      return undefined
    }

    let cancelled = false

    loadScript(provider)
      .then(() => {
        if (cancelled) return
        setReady(true)
        renderWidget()
      })
      .catch(() => {
        if (!cancelled) {
          setError('Captcha could not load. Please refresh and try again.')
        }
      })

    return () => {
      cancelled = true
      resetWidget()
    }
  }, [provider, siteKey, renderWidget, resetWidget, onTokenChange])

  const resetWidget = React.useCallback(() => {
    if (provider === 'turnstile' && typeof window !== 'undefined' && window.turnstile && widgetIdRef.current != null) {
      try {
        window.turnstile.reset(widgetIdRef.current)
      } catch (err) {
        console.warn('turnstile reset failed', err)
      }
    }
    if (provider === 'hcaptcha' && typeof window !== 'undefined' && window.hcaptcha && widgetIdRef.current != null) {
      try {
        window.hcaptcha.reset(widgetIdRef.current)
      } catch (err) {
        console.warn('hcaptcha reset failed', err)
      }
    }
    widgetIdRef.current = null
  }, [provider])

  const renderWidget = React.useCallback(() => {
    if (!containerRef.current || !provider || !siteKey) return

    if (provider === 'turnstile') {
      if (typeof window === 'undefined' || !window.turnstile || typeof window.turnstile.render !== 'function') {
        setError('Captcha is still loading…')
        return
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => {
          onTokenChange(token || '')
          setError('')
        },
        'error-callback': () => {
          onTokenChange('')
          setError('Captcha validation failed. Please try again.')
        },
        'expired-callback': () => {
          onTokenChange('')
        },
        ...TURNSTILE_RENDER_OPTIONS,
      })
      return
    }

    if (provider === 'hcaptcha') {
      if (typeof window === 'undefined' || !window.hcaptcha || typeof window.hcaptcha.render !== 'function') {
        setError('Captcha is still loading…')
        return
      }
      widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => {
          onTokenChange(token || '')
          setError('')
        },
        'error-callback': () => {
          onTokenChange('')
          setError('Captcha validation failed. Please try again.')
        },
        'expired-callback': () => {
          onTokenChange('')
        },
        theme: 'light',
      })
    }
  }, [provider, siteKey, onTokenChange])

  React.useEffect(() => {
    if (ready) {
      renderWidget()
    }
  }, [ready, renderWidget])

  return (
    <div className={classNames('space-y-2', className)}>
      <div ref={containerRef} className="min-h-[78px]" aria-live="polite" />
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
    </div>
  )
}
