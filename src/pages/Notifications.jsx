import { useCallback, useEffect, useState } from 'react'
import { BellOff, CheckCheck, CheckCircle2, CircleDashed, Megaphone, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Skeleton from '../components/Skeleton.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { formatDateTime } from '../services/format.js'

const KIND_ICON = {
  Assignment: UserCheck,
  Status: CircleDashed,
  Resolution: CheckCircle2,
  Announcement: Megaphone,
}

export default function Notifications() {
  const { items, unread, loading, refresh, markRead, markAllRead } = useNotifications()
  const [working, setWorking] = useState(false)

  const load = useCallback(() => refresh(), [refresh])

  useEffect(() => {
    load()
  }, [load])

  const handleMarkAll = async () => {
    setWorking(true)
    await markAllRead()
    setWorking(false)
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <p className="muted">
            Updates on your complaints and service requests from the IT Cell.
          </p>
        </div>
        {unread > 0 && (
          <button type="button" className="btn btn--ghost" onClick={handleMarkAll} disabled={working}>
            <CheckCheck size={17} />
            Mark all as read
          </button>
        )}
      </div>

      <section className="card">
        {loading ? (
          <div className="notification-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="notification-row" key={i} aria-busy="true">
                <Skeleton width={34} height={34} radius={9} />
                <div className="notification-row__text">
                  <Skeleton width="52%" height={14} />
                  <Skeleton width="78%" height={12} className="skeleton--gap-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <BellOff size={20} />
            <p>Nothing to show yet. Updates on your tickets will appear here.</p>
          </div>
        ) : (
          <div className="notification-list">
            {items.map((item) => {
              const Icon = KIND_ICON[item.kind] || CircleDashed
              return (
                <div
                  className={`notification-row ${item.is_read ? '' : 'notification-row--unread'}`}
                  key={item.id}
                >
                  <span className="notification-row__icon">
                    <Icon size={17} />
                  </span>
                  <div className="notification-row__text">
                    <strong>{item.title}</strong>
                    {item.body && <p>{item.body}</p>}
                    <small>{formatDateTime(item.created_at)}</small>
                  </div>
                  <div className="notification-row__actions">
                    {item.ticket_id && (
                      <Link className="link" to={`/complaints/${item.ticket_id}`}>
                        View ticket
                      </Link>
                    )}
                    {!item.is_read && (
                      <button type="button" className="link-button" onClick={() => markRead(item.id)}>
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
