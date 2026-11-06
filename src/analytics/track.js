// Thin wrapper around the Pendo agent's track API (loaded via the snippet in index.html).
// Safe to call when the agent is missing or blocked: tracking must never break the app.
export function trackEvent(name, properties = {}) {
  try {
    if (typeof window !== 'undefined' && window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties)
    }
  } catch (err) {
    console.warn(`Pendo track failed for "${name}"`, err)
  }
}
