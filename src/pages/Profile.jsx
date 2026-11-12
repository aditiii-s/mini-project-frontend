import { useCallback, useEffect, useState } from 'react'
import {
  Briefcase,
  Building2,
  CalendarDays,
  IdCard,
  Mail,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { dashboardApi, errorMessage } from '../services/api.js'
import { formatDate, initials } from '../services/format.js'
import Skeleton from '../components/Skeleton.jsx'

const SUMMARY = [
  { key: 'total', label: 'Complaints raised' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'resolved', label: 'Resolved' },
]

export default function Profile() {
  const { employee } = useAuth()
  const { notify } = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setStats(await dashboardApi.stats())
    } catch (err) {
      notify(errorMessage(err, 'Could not load your complaint summary.'), 'error')
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    load()
  }, [load])

  if (!employee) return null

  const isAdmin = employee.role === 'admin'

  const DETAILS = [
    { label: 'Employee ID', value: employee.employee_id, Icon: IdCard },
    { label: 'Designation', value: employee.designation, Icon: Briefcase },
    { label: 'Department', value: employee.department, Icon: Building2 },
    { label: 'Office', value: employee.office_location, Icon: MapPin },
    { label: 'Email', value: employee.email, Icon: Mail },
    { label: 'Member since', value: formatDate(employee.created_at), Icon: CalendarDays },
  ]

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>My profile</h1>
          <p className="muted">Your account details as recorded by the IT Cell.</p>
        </div>
      </div>

      <section className="card profile-header">
        <span className="avatar avatar--lg">{initials(employee.full_name)}</span>
        <div className="profile-header__text">
          <h2>{employee.full_name}</h2>
          <p className="muted">
            {employee.designation} &middot; {employee.department}
          </p>
          <span className={`badge ${isAdmin ? 'badge--assigned' : 'badge--progress'}`}>
            {isAdmin ? <ShieldCheck size={13} /> : <User size={13} />}
            {isAdmin ? 'IT Cell administrator' : 'Employee'}
          </span>
        </div>
      </section>

      <div className="profile-grid">
        <section className="card">
          <h2 className="card__step">Account details</h2>
          <ul className="profile-list">
            {DETAILS.map(({ label, value, Icon }) => (
              <li key={label}>
                <span className="profile-list__icon">
                  <Icon size={16} />
                </span>
                <span className="profile-list__text">
                  <small>{label}</small>
                  <strong>{value || '-'}</strong>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="card__step">Complaint summary</h2>
          <ul className="profile-summary">
            {SUMMARY.map(({ key, label }) => (
              <li key={key}>
                <span>{label}</span>
                {loading || !stats ? (
                  <Skeleton width={28} height={20} radius={6} />
                ) : (
                  <strong>{stats[key]}</strong>
                )}
              </li>
            ))}
          </ul>
          <p className="hint profile-note">
            To correct any of these details, contact the IT Cell. Profile information is
            maintained centrally and cannot be edited from the portal.
          </p>
        </section>
      </div>
    </div>
  )
}
