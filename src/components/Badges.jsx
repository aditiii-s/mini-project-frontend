import { CheckCircle2, CircleDashed, Clock, UserCheck } from 'lucide-react'

const STATUS_META = {
  Pending: { className: 'badge badge--pending', Icon: Clock },
  Assigned: { className: 'badge badge--assigned', Icon: UserCheck },
  'In Progress': { className: 'badge badge--progress', Icon: CircleDashed },
  Resolved: { className: 'badge badge--resolved', Icon: CheckCircle2 },
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Pending
  const { Icon } = meta
  return (
    <span className={meta.className}>
      <Icon size={13} />
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge--priority-${priority.toLowerCase()}`}>{priority}</span>
}
