// Thin wrapper around the Pendo agent's track API.
// The agent is loaded via the snippet in index.html; this guard keeps the app
// working if it is blocked or not yet available, and never lets tracking
// failures break the user flow.
export function trackEvent(name, properties = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.pendo?.track === 'function') {
      window.pendo.track(name, properties)
    }
  } catch (err) {
    console.warn('Pendo track failed', name, err)
  }
}

// Round currency values so float artifacts (e.g. 23.100000000000001) are not sent.
export const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100
