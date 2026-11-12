import { useCallback, useEffect, useState } from 'react'
import { KeyRound, Laptop, Loader2, Mail, Plus, Send, Wifi, X } from 'lucide-react'
import Skeleton from '../components/Skeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { errorMessage, serviceRequestsApi } from '../services/api.js'
import { formatDate } from '../services/format.js'

const TYPES = [
  { name: 'New Hardware', hint: 'Desktop, monitor, UPS, keyboard', Icon: Laptop },
  { name: 'Software Installation', hint: 'Applications and licences', Icon: Plus },
  { name: 'Network Access', hint: 'LAN port, Wi-Fi, VPN access', Icon: Wifi },
  { name: 'Email / Account Access', hint: 'Email ID, shared folders, roles', Icon: Mail },
]

const STATUS_CLASS = {
  Submitted: 'badge badge--pending',
  'Under Review': 'badge badge--progress',
  Approved: 'badge badge--assigned',
  Fulfilled: 'badge badge--resolved',
  Rejected: 'badge badge--priority-critical',
}

const TYPE_ICON = {
  'New Hardware': Laptop,
  'Software Installation': Plus,
  'Network Access': Wifi,
  'Email / Account Access': Mail,
}

const EMPTY = { request_type: 'New Hardware', item: '', justification: '', office_location: '' }

export default function ServiceRequests() {
  const { employee } = useAuth()
  const { notify } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRequests(await serviceRequestsApi.list())
    } catch (err) {
      notify(errorMessage(err, 'Could not load your service requests.'), 'error')
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    load()
  }, [load])

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const next = {}
    if (form.item.trim().length < 3) next.item = 'Say what you need, in at least 3 characters.'
    if (form.justification.trim().length < 10)
      next.justification = 'Explain why it is needed, in at least 10 characters.'
    setErrors(next)
    if (Object.keys(next).length) {
      notify('Please correct the highlighted fields.', 'error')
      return
    }

    setSubmitting(true)
    try {
      const created = await serviceRequestsApi.create({
        request_type: form.request_type,
        item: form.item.trim(),
        justification: form.justification.trim(),
        office_location: form.office_location.trim() || null,
      })
      notify(`Request registered as ${created.request_id}.`)
      setForm(EMPTY)
      setShowForm(false)
      load()
    } catch (err) {
      notify(errorMessage(err, 'Could not submit your request.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>IT service requests</h1>
          <p className="muted">
            Ask for new hardware, software, network or account access. For something that is
            broken, raise a complaint instead.
          </p>
        </div>
        <button
          type="button"
          className={showForm ? 'btn btn--ghost' : 'btn btn--primary'}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? 'Cancel' : 'New request'}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <h2 className="card__step">New service request</h2>

          <div className="category-grid">
            {TYPES.map(({ name, hint, Icon }) => (
              <button
                type="button"
                key={name}
                className={
                  'category-tile' + (form.request_type === name ? ' category-tile--active' : '')
                }
                onClick={() => setField('request_type', name)}
              >
                <Icon size={18} />
                <strong>{name}</strong>
                <small>{hint}</small>
              </button>
            ))}
          </div>

          <div className="field-row request-fields">
            <label className="field">
              <span>What do you need?</span>
              <input
                type="text"
                value={form.item}
                maxLength={200}
                placeholder="e.g. Replacement keyboard for counter 3"
                onChange={(e) => setField('item', e.target.value)}
              />
              {errors.item && <p className="form-error">{errors.item}</p>}
            </label>
            <label className="field">
              <span>Office location (optional)</span>
              <input
                type="text"
                value={form.office_location}
                maxLength={120}
                placeholder={employee?.office_location || 'Head Office, Patna'}
                onChange={(e) => setField('office_location', e.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span>Justification</span>
            <textarea
              rows={4}
              value={form.justification}
              maxLength={1000}
              placeholder="Why is this needed, and what is affected without it?"
              onChange={(e) => setField('justification', e.target.value)}
            />
            {errors.justification && <p className="form-error">{errors.justification}</p>}
          </label>

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? <Loader2 size={17} className="spin" /> : <Send size={17} />}
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
        </form>
      )}

      <section className="card">
        <h2 className="card__step">My requests</h2>

        {loading ? (
          <div className="request-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="request-row" key={i} aria-busy="true">
                <Skeleton width={34} height={34} radius={9} />
                <div className="request-row__text">
                  <Skeleton width="48%" height={14} />
                  <Skeleton width="30%" height={12} className="skeleton--gap-sm" />
                </div>
                <Skeleton width={84} height={22} radius={999} />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            You have not raised any service request yet.
          </div>
        ) : (
          <div className="request-list">
            {requests.map((request) => {
              const Icon = TYPE_ICON[request.request_type] || KeyRound
              return (
                <div className="request-row" key={request.request_id}>
                  <span className="request-row__icon">
                    <Icon size={17} />
                  </span>
                  <div className="request-row__text">
                    <strong>{request.item}</strong>
                    <small>
                      {request.request_id} &middot; {request.request_type} &middot;{' '}
                      {formatDate(request.created_at)}
                    </small>
                    {request.remarks && <p className="request-row__remarks">{request.remarks}</p>}
                  </div>
                  <span className={STATUS_CLASS[request.status] || 'badge badge--pending'}>
                    {request.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
