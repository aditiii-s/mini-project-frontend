import { useState } from 'react'
import { CheckCircle2, Loader2, Paperclip, Send, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CATEGORY_ICONS } from '../components/CategoryIcon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { complaintsApi, errorMessage } from '../services/api.js'

const CATEGORIES = [
  { name: 'Hardware', hint: 'PC, monitor, UPS, keyboard' },
  { name: 'Software', hint: 'Applications, licences, OS' },
  { name: 'Network', hint: 'LAN, Wi-Fi, VPN, internet' },
  { name: 'Printer', hint: 'Printers, scanners, toner' },
  { name: 'Other', hint: 'Email ID, access, others' },
]
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const SUBCATEGORIES = {
  Hardware: ['Desktop / PC', 'Monitor', 'UPS / Power', 'Keyboard / Mouse', 'Other hardware'],
  Software: [
    'Billing application',
    'Operating system',
    'Licence / activation',
    'MS Office',
    'Other software',
  ],
  Network: ['LAN / cable', 'Wi-Fi', 'VPN', 'Internet speed', 'Other network'],
  Printer: ['Paper jam', 'Toner / cartridge', 'Scanner', 'Print quality', 'Other printer'],
  Other: ['Email ID', 'Access / permission', 'New request', 'Other'],
}

const EMPTY_FORM = {
  subject: '',
  description: '',
  category: 'Hardware',
  subcategory: '',
  priority: 'Medium',
  office_location: '',
  asset_tag: '',
  contact_extension: '',
}

export default function RaiseComplaint() {
  const { employee } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    category: location.state?.category || 'Hardware',
  })
  const [attachment, setAttachment] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(null)

  const setField = (key, value) => {
    setForm((prev) =>
      key === 'category'
        ? { ...prev, category: value, subcategory: '' }
        : { ...prev, [key]: value },
    )
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    const subject = form.subject.trim()
    if (subject.length < 5) next.subject = 'Give a subject of at least 5 characters.'
    if (form.description.trim().length < 10)
      next.description = 'Describe the problem in at least 10 characters.'
    if (!form.category) next.category = 'Select a category.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) {
      notify('Please correct the highlighted fields.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category,
        subcategory: form.subcategory || null,
        priority: form.priority,
        office_location: form.office_location.trim() || null,
        asset_tag: form.asset_tag.trim() || null,
        contact_extension: form.contact_extension.trim() || null,
        attachment_name: attachment?.name || null,
      }
      const complaint = await complaintsApi.create(payload)
      setCreated(complaint)
      notify('Complaint registered as ' + complaint.ticket_id + '.')
    } catch (err) {
      notify(errorMessage(err, 'Could not submit your complaint.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    return (
      <div className="stack">
        <section className="card success-card">
          <span className="success-card__icon">
            <CheckCircle2 size={30} />
          </span>
          <h1>Complaint submitted</h1>
          <p className="muted">
            Your complaint has reached the IT Cell. Please keep this ticket ID for tracking.
          </p>
          <div className="ticket-box">
            <small>TICKET ID</small>
            <strong>{created.ticket_id}</strong>
          </div>
          <dl className="summary-list">
            <div>
              <dt>Subject</dt>
              <dd>{created.subject}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>
                {created.category}
                {created.subcategory ? ` / ${created.subcategory}` : ''}
              </dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>{created.priority}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{created.status}</dd>
            </div>
          </dl>
          <div className="button-row">
            <Link className="btn btn--primary" to={'/complaints/' + created.ticket_id}>
              View complaint
            </Link>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setCreated(null)
                setForm({ ...EMPTY_FORM })
                setAttachment(null)
              }}
            >
              Raise another
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="page-head">
        <div>
          <h1>Raise a complaint</h1>
          <p className="muted">
            Tell the IT Cell what is wrong. You will get a ticket ID right away.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <div className="stack">
          <section className="card">
            <h2 className="card__step">1. Category</h2>
            <div className="category-grid">
              {CATEGORIES.map(({ name, hint }) => {
                const Icon = CATEGORY_ICONS[name]
                return (
                  <button
                    type="button"
                    key={name}
                    className={
                      'category-tile' + (form.category === name ? ' category-tile--active' : '')
                    }
                    onClick={() => setField('category', name)}
                  >
                    <Icon size={18} />
                    <strong>{name}</strong>
                    <small>{hint}</small>
                  </button>
                )
              })}
            </div>
            {errors.category && <p className="form-error">{errors.category}</p>}

            <label className="field field--subcategory">
              <span>Subcategory (optional)</span>
              <select
                value={form.subcategory}
                onChange={(e) => setField('subcategory', e.target.value)}
              >
                <option value="">Select a more specific issue</option>
                {(SUBCATEGORIES[form.category] || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="card">
            <h2 className="card__step">2. Problem details</h2>

            <label className="field">
              <span>Subject</span>
              <input
                type="text"
                value={form.subject}
                maxLength={200}
                placeholder="e.g. Printer in Billing section not printing"
                onChange={(e) => setField('subject', e.target.value)}
              />
              {errors.subject && <p className="form-error">{errors.subject}</p>}
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                rows={7}
                value={form.description}
                maxLength={1500}
                placeholder="What happened, since when, and any error message you see."
                onChange={(e) => setField('description', e.target.value)}
              />
              <small className="counter">{form.description.length}/1500</small>
              {errors.description && <p className="form-error">{errors.description}</p>}
            </label>

            <label className="field">
              <span>Office location</span>
              <input
                type="text"
                value={form.office_location}
                maxLength={120}
                placeholder={employee?.office_location || 'Head Office, Patna'}
                onChange={(e) => setField('office_location', e.target.value)}
              />
              <small className="hint">Leave blank to use your registered office.</small>
            </label>

            <div className="field-row">
              <label className="field">
                <span>Asset tag (optional)</span>
                <input
                  type="text"
                  value={form.asset_tag}
                  maxLength={60}
                  placeholder="e.g. UPS-RB-214"
                  onChange={(e) => setField('asset_tag', e.target.value)}
                />
              </label>
              <label className="field">
                <span>Contact extension (optional)</span>
                <input
                  type="text"
                  value={form.contact_extension}
                  maxLength={30}
                  placeholder="e.g. 1147"
                  onChange={(e) => setField('contact_extension', e.target.value)}
                />
              </label>
            </div>

            <div className="field">
              <span>Attachment (optional)</span>
              {attachment ? (
                <div className="attachment">
                  <Paperclip size={15} />
                  <span>{attachment.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    aria-label="Remove attachment"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <label className="file-drop">
                  <Paperclip size={16} />
                  <span>Attach a screenshot or document</span>
                  <input
                    type="file"
                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                    hidden
                  />
                </label>
              )}
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="card">
            <h2 className="card__step">3. Priority</h2>
            <div className="priority-grid">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={
                    'priority-tile priority-tile--' +
                    p.toLowerCase() +
                    (form.priority === p ? ' priority-tile--active' : '')
                  }
                  onClick={() => setField('priority', p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="hint">
              Use Critical only when work at your office has completely stopped.
            </p>
          </section>

          <section className="card">
            <h2 className="card__step">Raised by</h2>
            <p className="raised-by">
              <strong>{employee?.full_name}</strong>
              <span>
                {employee?.employee_id} &middot; {employee?.designation}
              </span>
              <span>{employee?.department}</span>
              <span>{employee?.office_location}</span>
            </p>
          </section>

          <div className="button-row button-row--stack">
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? <Loader2 size={17} className="spin" /> : <Send size={17} />}
              {submitting ? 'Submitting...' : 'Submit complaint'}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => navigate('/dashboard')}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
