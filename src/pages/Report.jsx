import { useState } from 'react'
import { trackEvent } from '../lib/analytics'

const topics = [
  'Order issue',
  'Shipping delay',
  'Flavor feedback',
  'Website bug',
  'Compliment (welcome)',
  'Other',
]

export default function Report() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: topics[0],
    message: '',
  })
  const [sent, setSent] = useState(false)

  const onChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const reports = JSON.parse(localStorage.getItem('pieriot-reports') || '[]')
    reports.push({ ...form, at: new Date().toISOString() })
    localStorage.setItem('pieriot-reports', JSON.stringify(reports))
    // Report saved; send only non-personal fields (no name, email or message text)
    trackEvent('feedback_report_submitted', {
      topic: form.topic,
      messageLength: form.message.trim().length,
    })
    setSent(true)
  }

  if (sent) {
    return (
      <div className="page empty-state">
        <h1>Feedback received</h1>
        <p>
          Thanks, {form.name || 'friend'}. Our small bakery team reads every report — especially
          the spicy ones.
        </p>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            setForm({ name: '', email: '', topic: topics[0], message: '' })
            setSent(false)
          }}
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <div className="page report">
      <header className="page-header">
        <h1>Report feedback</h1>
        <p>Tell us what sang, what sank, or what the courier did with your lattice.</p>
      </header>

      <form className="panel report__form" onSubmit={onSubmit}>
        <div className="field-row">
          <label className="field">
            <span>Name</span>
            <input value={form.name} onChange={onChange('name')} required />
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
          <span>Topic</span>
          <select value={form.topic} onChange={onChange('topic')}>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Your message</span>
          <textarea
            rows="6"
            value={form.message}
            onChange={onChange('message')}
            required
            placeholder="Be specific. Include order ID if you have one."
          />
        </label>

        <button type="submit" className="btn btn--primary">
          Submit report
        </button>
      </form>
    </div>
  )
}
