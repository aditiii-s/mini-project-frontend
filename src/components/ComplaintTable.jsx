import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../services/format.js'
import { PriorityBadge, StatusBadge } from './Badges.jsx'
import CategoryIcon from './CategoryIcon.jsx'
import { TableSkeleton } from './Skeleton.jsx'

export default function ComplaintTable({
  complaints,
  showChevron = false,
  emptyText,
  loading = false,
  skeletonRows = 4,
}) {
  if (loading) {
    return <TableSkeleton rows={skeletonRows} showChevron={showChevron} />
  }

  if (!complaints.length) {
    return <div className="empty-state">{emptyText || 'No complaints to show yet.'}</div>
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Complaint</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Filed</th>
            {showChevron && <th aria-label="Open" />}
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.ticket_id}>
              <td>
                <Link className="ticket-link" to={`/complaints/${c.ticket_id}`}>
                  {c.ticket_id}
                </Link>
              </td>
              <td>
                <div className="cell-title">{c.subject}</div>
                <div className="cell-sub">{c.assigned_engineer || 'Awaiting assignment'}</div>
              </td>
              <td>
                <span className="cell-category">
                  <CategoryIcon category={c.category} />
                  {c.category}
                </span>
              </td>
              <td>
                <PriorityBadge priority={c.priority} />
              </td>
              <td>
                <StatusBadge status={c.status} />
              </td>
              <td className="cell-date">{formatDate(c.created_at)}</td>
              {showChevron && (
                <td className="cell-chevron">
                  <Link to={`/complaints/${c.ticket_id}`} aria-label={`Open ${c.ticket_id}`}>
                    <ChevronRight size={18} />
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
