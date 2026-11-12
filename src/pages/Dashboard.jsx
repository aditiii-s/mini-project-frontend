import { useCallback, useEffect, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock,
  FilePlus2,
  Inbox,
  Loader2,
  Search,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ComplaintTable from '../components/ComplaintTable.jsx'
import Loader from '../components/Loader.jsx'
import { CATEGORY_ICONS } from '../components/CategoryIcon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { complaintsApi, dashboardApi, errorMessage } from '../services/api.js'

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Printer', 'Other']

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
  const [loading, setLoading] = useState(true)
  const [trackId, setTrackId] = useState('')
  const [tracking, setTracking] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsData, recentData] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.recentComplaints(4),
      ])
      setStats(statsData)
      setRecent(recentData)
    } catch (err) {
      notify(errorMessage(err, 'Could not load your dashboard.'), 'error')
    } finally {
      setLoading(false)
    }
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
        <Link className="btn btn--primary" to="/raise-complaint">
          <FilePlus2 size={17} />
          Raise a complaint
        </Link>
      </div>

      <div className="stat-grid">
        {STAT_CARDS.map(({ key, label, hint, Icon, tone }) => (
          <article className="card stat-card" key={key}>
            <header>
              <span>{label}</span>
              <span className={`stat-icon stat-icon--${tone}`}>
                <Icon size={18} />
              </span>
            </header>
            <strong>{loading || !stats ? '--' : stats[key]}</strong>
            <small>{hint}</small>
          </article>
        ))}
      </div>

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
          {loading ? (
            <Loader label="Loading complaints..." />
          ) : (
            <ComplaintTable
              complaints={recent}
              emptyText="You have not raised any complaint yet."
            />
          )}
        </section>
      </div>
    </div>
  )
}
