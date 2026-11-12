import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Paperclip, UserCog } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PriorityBadge, StatusBadge } from '../components/Badges.jsx'
import CategoryIcon from '../components/CategoryIcon.jsx'
import Loader from '../components/Loader.jsx'
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

  if (loading) return <Loader label="Loading complaint..." />
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
              <div>
                <dt>Priority</dt>
                <dd>{complaint.priority}</dd>
              </div>
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
