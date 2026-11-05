// Thin wrapper around the Pendo agent's Track Events API.
// Event names are registered in Pendo as-is, so pass them verbatim.
// Tracking must never break the storefront, so this no-ops when the
// agent is not loaded and swallows any error thrown by the agent.
export function trackEvent(name, properties = {}) {
  try {
    const pendo = typeof window !== 'undefined' ? window.pendo : undefined
    if (!pendo || typeof pendo.track !== 'function') return
    pendo.track(name, properties)
  } catch (err) {
    console.warn(`[analytics] Failed to send Pendo track event "${name}"`, err)
  }
}
