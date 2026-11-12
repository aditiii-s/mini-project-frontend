import { useCallback, useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock,
  FilePlus2,
  Inbox,
  Loader2,
  Megaphone,
  PackagePlus,
  Search,
  Timer,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ComplaintTable from '../components/ComplaintTable.jsx'
import Skeleton, { StatCardSkeleton } from '../components/Skeleton.jsx'
import { formatDateTime } from '../services/format.js'
import { CATEGORY_ICONS } from '../components/CategoryIcon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import {
  announcementsApi,
  complaintsApi,
  dashboardApi,
  errorMessage,
} from '../services/api.js'

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Printer', 'Other']

const QUICK_ACTIONS = [
  { to: '/raise-complaint', label: 'Raise Complaint', Icon: FilePlus2 },
  { to: '/my-complaints', label: 'All Complaints', Icon: ClipboardList },
  { to: '/knowledge-base', label: 'Help Center', Icon: BookOpen },
  { to: '/service-requests', label: 'Service Requests', Icon: PackagePlus },
]

const ANNOUNCEMENT_TONE = {
  Maintenance: 'announcement--maintenance',
  Outage: 'announcement--outage',
  Update: 'announcement--update',
  Notice: 'announcement--notice',
}

function formatHours(hours) {
  if (hours === null || hours === undefined) return 'No data yet'
  if (hours < 24) return hours + ' h'
  return (hours / 24).toFixed(1) + ' days'
}

const STAT_CARDS = [
  { key: 'total', label: 'My complaints', hint: 'All time', Icon: Inbox, tone: 'blue' },
  { key: 'pending', label: 'Pending', hint: 'Awaiting IT Cell', Icon: Clock, tone: 'amber' },
  { key: 'in_progress', label: 'In progress', hint: 'Engineer assigned', Icon: CircleDashed, tone: 'sky' },
  { key: 'resolved', label: 'Resolved', hint: 'Closed tickets', Icon: CheckCircle2, tone: 'green' },
]

export default function Dashboard() {
  const { employee } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [activity, setActivity] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsError, setStatsError] = useState(false)
  const [trackId, setTrackId] = useState('')
  const [tracking, setTracking] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setStatsError(false)

    // allSettled, not all: a failing widget must not blank the whole dashboard.
    const [statsRes, recentRes, activityRes, announcementRes] = await Promise.allSettled([
      dashboardApi.stats(),
      dashboardApi.recentComplaints(4),
      dashboardApi.activity(5),
      announcementsApi.list(3),
    ])

    if (statsRes.status === 'fulfilled') setStats(statsRes.value)
    else setStatsError(true)
    if (recentRes.status === 'fulfilled') setRecent(recentRes.value)
    if (activityRes.status === 'fulfilled') setActivity(activityRes.value)
    if (announcementRes.status === 'fulfilled') setAnnouncements(announcementRes.value)

    const failed = [statsRes, recentRes, activityRes, announcementRes].filter(
      (r) => r.status === 'rejected',
    )
    if (failed.length) {
      notify(errorMessage(failed[0].reason, 'Some dashboard data could not be loaded.'), 'error')
    }

    setLoading(false)
  }, [notify])

  useEffect(() => {
    load()
  }, [load])

  const handleTrack = async (event) => {
    event.preventDefault()
    const ticket = trackId.trim().toUpperCase()
    if (!ticket) {
      notify('Enter a ticket ID first, for example IT-2026-0144.', 'error')
      return
    }
    setTracking(true)
    try {
      const data = await complaintsApi.track(ticket)
      notify(`${data.ticket_id} is ${data.status}.`)
      navigate(`/complaints/${data.ticket_id}`)
    } catch (err) {
      notify(errorMessage(err, 'Ticket not found.'), 'error')
    } finally {
      setTracking(false)
    }
  }

  const firstName = employee?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Namaste, {firstName}</h1>
          <p className="muted">
            {employee?.designation} &middot; {employee?.department} &middot; {employee?.office_location}
          </p>
        </div>
      </div>

      {statsError && !loading && (
        <div className="reload-banner">
          <span>Your complaint figures could not be loaded.</span>
          <button type="button" className="btn btn--ghost btn--small" onClick={load}>
            Try again
          </button>
        </div>
      )}

      <div className="quick-actions">
        {QUICK_ACTIONS.map(({ to, label, Icon }) => (
          <Link className="quick-action" to={to} key={to}>
            <span className="quick-action__icon">
              <Icon size={17} />
            </span>
            {label}
          </Link>
        ))}
      </div>

      <div className="stat-grid">
        {loading
          ? STAT_CARDS.map(({ key }) => <StatCardSkeleton key={key} />)
          : STAT_CARDS.map(({ key, label, hint, Icon, tone }) => (
              <article className="card stat-card" key={key}>
                <header>
                  <span>{label}</span>
                  <span className={`stat-icon stat-icon--${tone}`}>
                    <Icon size={18} />
                  </span>
                </header>
                <strong>{stats ? stats[key] : '-'}</strong>
                <small>{hint}</small>
              </article>
            ))}
      </div>

      <section className="card resolution-card">
        <span className="resolution-card__icon">
          <Timer size={19} />
        </span>
        <div className="resolution-card__value">
          <small>Average resolution time</small>
          {loading ? (
            <Skeleton width={90} height={22} radius={6} />
          ) : (
            <strong>{stats ? formatHours(stats.avg_resolution_hours) : '-'}</strong>
          )}
        </div>
        <p className="muted">
          Measured across your resolved complaints, from the time you filed them.
        </p>
      </section>

      <div className="dashboard-grid">
        <section className="card card--navy track-card">
          <h2>Track a complaint</h2>
          <p>Enter the ticket ID you received when you filed it.</p>
          <form onSubmit={handleTrack}>
            <span className="track-input">
              <Search size={16} />
              <input
                type="text"
                value={trackId}
                placeholder="IT-2026-0144"
                onChange={(e) => setTrackId(e.target.value)}
              />
            </span>
            <button type="submit" className="btn btn--accent btn--block" disabled={tracking}>
              {tracking ? <Loader2 size={17} className="spin" /> : null}
              {tracking ? 'Checking...' : 'Track status'}
              {!tracking && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="track-card__divider" />
          <p className="track-card__label">REPORT AN ISSUE IN</p>
          <div className="quick-categories">
            {CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category]
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => navigate('/raise-complaint', { state: { category } })}
                >
                  <Icon size={15} />
                  {category}
                </button>
              )
            })}
          </div>
        </section>

        <section className="card recent-card">
          <header className="card__header">
            <h2>Recent complaints</h2>
            <Link className="link" to="/my-complaints">
              View all <ArrowRight size={15} />
            </Link>
          </header>
          <ComplaintTable
            complaints={recent}
            loading={loading}
            emptyText="You have not raised any complaint yet."
          />
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid--lower">
        <section className="card">
          <header className="card__header">
            <h2>
              <Megaphone size={17} /> IT announcements
            </h2>
          </header>
          {loading ? (
            <div className="announcement-list">
              {Array.from({ length: 2 }).map((_, i) => (
                <div className="announcement" key={i} aria-busy="true">
                  <Skeleton width="54%" height={14} />
                  <Skeleton width="92%" height={12} className="skeleton--gap-sm" />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="empty-state">No announcements at the moment.</div>
          ) : (
            <div className="announcement-list">
              {announcements.map((item) => (
                <article
                  className={'announcement ' + (ANNOUNCEMENT_TONE[item.kind] || '')}
                  key={item.id}
                >
                  <div className="announcement__head">
                    <strong>{item.title}</strong>
                    <span className="announcement__kind">{item.kind}</span>
                  </div>
                  <p>{item.body}</p>
                  <small>{formatDateTime(item.created_at)}</small>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <header className="card__header">
            <h2>Recent activity</h2>
          </header>
          {loading ? (
            <div className="activity-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="activity-row" key={i} aria-busy="true">
                  <Skeleton width={10} height={10} radius={999} />
                  <div className="activity-row__text">
                    <Skeleton width="60%" height={13} />
                    <Skeleton width="36%" height={11} className="skeleton--gap-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="empty-state">Nothing has happened on your tickets yet.</div>
          ) : (
            <div className="activity-list">
              {activity.map((item, index) => (
                <div className="activity-row" key={item.ticket_id + '-' + index}>
                  <span className="activity-row__dot" />
                  <div className="activity-row__text">
                    <strong>
                      <Link className="ticket-link" to={'/complaints/' + item.ticket_id}>
                        {item.ticket_id}
                      </Link>{' '}
                      {item.previous_status ? 'moved to ' + item.new_status : 'was submitted'}
                    </strong>
                    <small>
                      {item.updated_by} &middot; {formatDateTime(item.created_at)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
