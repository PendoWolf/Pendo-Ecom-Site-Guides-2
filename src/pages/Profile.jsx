import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { trackEvent } from '../lib/analytics'

export default function Profile() {
  const { profile, updateProfile, hasShippingAddress } = useProfile()
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)

  const onChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setSaved(false)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    updateProfile(form)
    // Shipping address saved; send only non-personal properties
    trackEvent('shipping_address_saved', {
      isFirstAddress: !hasShippingAddress,
      state: (form.state || '').trim().slice(0, 32),
      hasPhone: Boolean(form.phone && form.phone.trim()),
      hasAddress2: Boolean(form.address2 && form.address2.trim()),
      hasDeliveryNotes: Boolean(form.deliveryNotes && form.deliveryNotes.trim()),
    })
    setSaved(true)
  }

  return (
    <div className="page profile">
      <header className="page-header">
        <h1>Your profile</h1>
        <p>Set the shipping address we use at checkout. Saved locally in this browser.</p>
      </header>

      <form className="panel profile__form" onSubmit={onSubmit}>
        <div className="field-row">
          <label className="field">
            <span>Full name</span>
            <input value={form.fullName} onChange={onChange('fullName')} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={onChange('email')}
              required
            />
          </label>
        </div>

        <label className="field">
          <span>Phone</span>
          <input type="tel" value={form.phone} onChange={onChange('phone')} />
        </label>

        <label className="field">
          <span>Address line 1</span>
          <input value={form.address1} onChange={onChange('address1')} required />
        </label>

        <label className="field">
          <span>Address line 2</span>
          <input value={form.address2} onChange={onChange('address2')} />
        </label>

        <div className="field-row field-row--3">
          <label className="field">
            <span>City</span>
            <input value={form.city} onChange={onChange('city')} required />
          </label>
          <label className="field">
            <span>State</span>
            <input value={form.state} onChange={onChange('state')} required />
          </label>
          <label className="field">
            <span>ZIP</span>
            <input value={form.zip} onChange={onChange('zip')} required />
          </label>
        </div>

        <label className="field">
          <span>Delivery notes</span>
          <textarea
            rows="3"
            value={form.deliveryNotes}
            onChange={onChange('deliveryNotes')}
            placeholder="Leave at door, ring twice, protect the lattice..."
          />
        </label>

        <div className="profile__actions">
          <button type="submit" className="btn btn--primary">
            Save shipping address
          </button>
          {hasShippingAddress && (
            <Link to="/checkout" className="btn btn--secondary">
              Go to checkout
            </Link>
          )}
        </div>

        {saved && (
          <p className="form-success" role="status">
            Shipping address saved.
          </p>
        )}
      </form>
    </div>
  )
}
