import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { trackEvent } from '../analytics/track'
import { formatPrice } from '../data/pies'
import { useCart } from '../context/CartContext'
import { useProfile } from '../context/ProfileContext'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { profile, updateProfile, hasShippingAddress } = useProfile()
  const [payment, setPayment] = useState({
    cardName: profile.fullName || '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="page empty-state">
        <h1>Nothing to check out</h1>
        <p>Add a pie first, then come back for the checkout flourish.</p>
        <Link to="/shop" className="btn btn--primary">
          Shop pies
        </Link>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Checkout friction: the order was stopped by a validation error
    const trackBlocked = (failureReason) => {
      trackEvent('checkout_blocked', {
        failure_reason: failureReason,
        hasShippingAddress,
        total,
        line_count: items.length,
      })
    }

    if (!hasShippingAddress) {
      trackBlocked('missing_shipping_address')
      setError('Save a complete shipping address on your profile before placing an order.')
      return
    }

    if (
      !payment.cardName.trim() ||
      payment.cardNumber.replace(/\s/g, '').length < 12 ||
      !payment.expiry.trim() ||
      payment.cvc.trim().length < 3
    ) {
      trackBlocked('incomplete_payment')
      setError('Please fill in complete payment details (demo — no charge made).')
      return
    }

    setSubmitting(true)
    const orderId = `PR-${Date.now().toString().slice(-8)}`
    const order = {
      orderId,
      items,
      subtotal,
      shipping,
      total,
      shippingAddress: { ...profile },
      placedAt: new Date().toISOString(),
    }
    sessionStorage.setItem('pieriot-last-order', JSON.stringify(order))
    // Conversion: order placed with revenue and cart contents (no address PII)
    trackEvent('order_placed', {
      orderId,
      total,
      subtotal,
      shipping,
      free_shipping: shipping === 0,
      line_count: items.length,
      item_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      product_ids: [...new Set(items.map((item) => item.productId))].slice(0, 10),
      shipping_state: profile.state,
    })
    clearCart()
    navigate(`/success/${orderId}`)
  }

  return (
    <div className="page checkout">
      <header className="page-header">
        <h1>Checkout</h1>
        <p>Confirm shipping, enter payment, and let the pies start their journey.</p>
      </header>

      <form className="checkout__layout" onSubmit={handleSubmit}>
        <div className="checkout__forms">
          <section className="panel">
            <div className="panel__head">
              <h2>Shipping address</h2>
              <Link to="/profile" className="text-link">
                Edit profile
              </Link>
            </div>
            {hasShippingAddress ? (
              <address className="checkout__address">
                <strong>{profile.fullName}</strong>
                <br />
                {profile.address1}
                {profile.address2 ? `, ${profile.address2}` : ''}
                <br />
                {profile.city}, {profile.state} {profile.zip}
                <br />
                {profile.email}
                {profile.phone ? ` · ${profile.phone}` : ''}
                {profile.deliveryNotes && (
                  <>
                    <br />
                    <em>Note: {profile.deliveryNotes}</em>
                  </>
                )}
              </address>
            ) : (
              <div className="callout">
                <p>No shipping address on file yet.</p>
                <Link to="/profile" className="btn btn--secondary btn--sm">
                  Set shipping address
                </Link>
              </div>
            )}

            <label className="field">
              <span>Delivery notes (optional)</span>
              <textarea
                rows="2"
                value={profile.deliveryNotes}
                onChange={(e) => updateProfile({ deliveryNotes: e.target.value })}
                placeholder="Gate code, porch preference, pie urgency level..."
              />
            </label>
          </section>

          <section className="panel">
            <h2>Payment</h2>
            <p className="muted">Demo checkout only — nothing is charged.</p>
            <label className="field">
              <span>Name on card</span>
              <input
                value={payment.cardName}
                onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                autoComplete="cc-name"
              />
            </label>
            <label className="field">
              <span>Card number</span>
              <input
                value={payment.cardNumber}
                onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                placeholder="4242 4242 4242 4242"
                autoComplete="cc-number"
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Expiry</span>
                <input
                  value={payment.expiry}
                  onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                  placeholder="MM/YY"
                  autoComplete="cc-exp"
                />
              </label>
              <label className="field">
                <span>CVC</span>
                <input
                  value={payment.cvc}
                  onChange={(e) => setPayment({ ...payment, cvc: e.target.value })}
                  placeholder="123"
                  autoComplete="cc-csc"
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="cart__summary">
          <h2>Order summary</h2>
          <ul className="checkout__lines">
            {items.map((item) => (
              <li key={item.lineId}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="cart__row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="cart__row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          <div className="cart__row cart__row--total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Placing order…' : `Pay ${formatPrice(total)}`}
          </button>
        </aside>
      </form>
    </div>
  )
}
