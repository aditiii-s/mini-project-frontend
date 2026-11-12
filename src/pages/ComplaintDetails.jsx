import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, MessageSquare, Paperclip, Send, UserCog } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PriorityBadge, StatusBadge } from '../components/Badges.jsx'
import CategoryIcon from '../components/CategoryIcon.jsx'
import { DetailsSkeleton } from '../components/Skeleton.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { complaintsApi, errorMessage } from '../services/api.js'
import { formatDateTime } from '../services/format.js'

const TIMELINE_STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved']
const STATUS_TO_STEP = {
  Pending: 'Submitted',
  Assigned: 'Assigned',
  'In Progress': 'In Progress',
  Resolved: 'Resolved',
}

/** Match each timeline step to the history row that produced it, if any. */
function buildTimeline(complaint) {
  const history = complaint.history || []
  const reached = {}
  history.forEach((entry) => {
    const step = entry.previous_status === null ? 'Submitted' : STATUS_TO_STEP[entry.new_status]
    if (step && !reached[step]) reached[step] = entry
  })
  const currentIndex = TIMELINE_STEPS.indexOf(STATUS_TO_STEP[complaint.status] || 'Submitted')
  return TIMELINE_STEPS.map((step, index) => ({
    step,
    entry: reached[step],
    done: Boolean(reached[step]) || index < currentIndex,
    current: index === currentIndex,
  }))
}

export default function ComplaintDetails() {
  const { ticketId } = useParams()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setComplaint(await complaintsApi.details(ticketId))
    } catch (err) {
      notify(errorMessage(err, 'Complaint not found.'), 'error')
      navigate('/my-complaints', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [ticketId, notify, navigate])

  useEffect(() => {
    load()
  }, [load])

  const sendComment = async (event) => {
    event.preventDefault()
    const text = message.trim()
    if (text.length < 2) {
      notify('Write a short message before sending.', 'error')
      return
    }
    setSending(true)
    try {
      const comment = await complaintsApi.addComment(ticketId, text)
      setComplaint((prev) => ({ ...prev, comments: [...(prev.comments || []), comment] }))
      setMessage('')
      notify('Message sent to the IT Cell.')
    } catch (err) {
      notify(errorMessage(err, 'Could not send your message.'), 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <DetailsSkeleton />
  if (!complaint) return null

  const timeline = buildTimeline(complaint)

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <Link className="link link--back" to="/my-complaints">
            <ArrowLeft size={15} /> Back to my complaints
          </Link>
          <h1>{complaint.ticket_id}</h1>
          <p className="muted">{complaint.subject}</p>
        </div>
        <div className="badge-row">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="details-grid">
        <div className="stack">
          <section className="card">
            <h2 className="card__step">Complaint description</h2>
            <p className="description">{complaint.description}</p>
            {complaint.attachment_name && (
              <p className="attachment attachment--static">
                <Paperclip size={15} />
                {complaint.attachment_name}
              </p>
            )}
          </section>

          <section className="card">
            <h2 className="card__step">Progress</h2>
            <ol className="timeline">
              {timeline.map(({ step, entry, done, current }) => (
                <li
                  key={step}
                  className={
                    'timeline__item' +
                    (done ? ' timeline__item--done' : '') +
                    (current ? ' timeline__item--current' : '')
                  }
                >
                  <span className="timeline__dot" />
                  <div>
                    <strong>{step}</strong>
                    <small>{entry ? formatDateTime(entry.created_at) : 'Pending'}</small>
                    {entry?.remarks && <p>{entry.remarks}</p>}
                    {entry?.updated_by && <span className="timeline__by">by {entry.updated_by}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="card">
            <h2 className="card__step">
              <MessageSquare size={16} /> Communication
            </h2>

            {complaint.comments?.length ? (
              <ul className="comment-list">
                {complaint.comments.map((comment) => (
                  <li
                    key={comment.id}
                    className={
                      'comment' + (comment.author_role === 'admin' ? ' comment--admin' : '')
                    }
                  >
                    <div className="comment__head">
                      <strong>{comment.author_name}</strong>
                      <span className="comment__role">
                        {comment.author_role === 'admin' ? 'IT Cell' : 'Employee'}
                      </span>
                      <small>{formatDateTime(comment.created_at)}</small>
                    </div>
                    <p>{comment.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted comment-empty">
                No messages yet. Add a note below if you have more information for the IT Cell.
              </p>
            )}

            <form className="comment-form" onSubmit={sendComment}>
              <textarea
                rows={3}
                value={message}
                maxLength={1000}
                placeholder="Add an update or ask the IT Cell a question..."
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" className="btn btn--primary" disabled={sending}>
                {sending ? <Loader2 size={17} className="spin" /> : <Send size={17} />}
                {sending ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </section>

          {complaint.status === 'Resolved' && complaint.resolution_remarks && (
            <section className="card card--resolved">
              <h2 className="card__step">
                <CheckCircle2 size={16} /> Resolution remarks
              </h2>
              <p className="description">{complaint.resolution_remarks}</p>
              <small className="muted">Resolved on {formatDateTime(complaint.resolved_at)}</small>
            </section>
          )}
        </div>

        <div className="stack">
          <section className="card">
            <h2 className="card__step">Ticket information</h2>
            <dl className="summary-list">
              <div>
                <dt>Ticket ID</dt>
                <dd>{complaint.ticket_id}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd className="cell-category">
                  <CategoryIcon category={complaint.category} />
                  {complaint.category}
                </dd>
              </div>
              {complaint.subcategory && (
                <div>
                  <dt>Subcategory</dt>
                  <dd>{complaint.subcategory}</dd>
                </div>
              )}
              <div>
                <dt>Priority</dt>
                <dd>{complaint.priority}</dd>
              </div>
              {complaint.office_location && (
                <div>
                  <dt>Office</dt>
                  <dd>{complaint.office_location}</dd>
                </div>
              )}
              <div>
                <dt>Status</dt>
                <dd>{complaint.status}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>{formatDateTime(complaint.created_at)}</dd>
              </div>
              <div>
                <dt>Last update</dt>
                <dd>{formatDateTime(complaint.updated_at)}</dd>
              </div>
              {complaint.asset_tag && (
                <div>
                  <dt>Asset tag</dt>
                  <dd>{complaint.asset_tag}</dd>
                </div>
              )}
              {complaint.contact_extension && (
                <div>
                  <dt>Extension</dt>
                  <dd>{complaint.contact_extension}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="card">
            <h2 className="card__step">
              <UserCog size={16} /> Assigned engineer
            </h2>
            <p className="assigned">
              {complaint.assigned_engineer || 'Not assigned yet. The IT Cell will allocate an engineer.'}
            </p>
          </section>

          <section className="card">
            <h2 className="card__step">Raised by</h2>
            <p className="raised-by">
              <strong>{complaint.raised_by}</strong>
              <span>{complaint.raised_by_employee_id}</span>
              <span>{complaint.department}</span>
              <span>{complaint.office_location}</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
