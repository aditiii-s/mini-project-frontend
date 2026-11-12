import { useCallback, useEffect, useState } from 'react'
import {
  Briefcase,
  Building2,
  CalendarDays,
  IdCard,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { authApi, dashboardApi, errorMessage } from '../services/api.js'
import { formatDate, initials } from '../services/format.js'
import Skeleton from '../components/Skeleton.jsx'

const SUMMARY = [
  { key: 'total', label: 'Complaints raised' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'resolved', label: 'Resolved' },
]

export default function Profile() {
  const { employee, refreshEmployee } = useAuth()
  const { notify } = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [contact, setContact] = useState({ email: '', phone: '', office_location: '' })
  const [savingContact, setSavingContact] = useState(false)

  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm: '' })
  const [savingPassword, setSavingPassword] = useState(false)

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

  useEffect(() => {
    if (employee) {
      setContact({
        email: employee.email || '',
        phone: employee.phone || '',
        office_location: employee.office_location || '',
      })
    }
  }, [employee])

  const saveContact = async (event) => {
    event.preventDefault()
    setSavingContact(true)
    try {
      await authApi.updateProfile({
        email: contact.email.trim(),
        phone: contact.phone.trim() || null,
        office_location: contact.office_location.trim() || null,
      })
      await refreshEmployee()
      setEditing(false)
      notify('Contact details updated.')
    } catch (err) {
      notify(errorMessage(err, 'Could not update your contact details.'), 'error')
    } finally {
      setSavingContact(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    if (passwords.new_password.length < 6) {
      notify('The new password must be at least 6 characters.', 'error')
      return
    }
    if (passwords.new_password !== passwords.confirm) {
      notify('The two new passwords do not match.', 'error')
      return
    }
    setSavingPassword(true)
    try {
      await authApi.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      })
      setPasswords({ current_password: '', new_password: '', confirm: '' })
      notify('Password changed. Use it the next time you sign in.')
    } catch (err) {
      notify(errorMessage(err, 'Could not change your password.'), 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  if (!employee) return null

  const isAdmin = employee.role === 'admin'

  const DETAILS = [
    { label: 'Employee ID', value: employee.employee_id, Icon: IdCard },
    { label: 'Designation', value: employee.designation, Icon: Briefcase },
    { label: 'Department', value: employee.department, Icon: Building2 },
    { label: 'Office', value: employee.office_location, Icon: MapPin },
    { label: 'Email', value: employee.email, Icon: Mail },
    { label: 'Phone', value: employee.phone, Icon: Phone },
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
          <div className="card__header">
            <h2 className="card__step">Account details</h2>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? <X size={15} /> : <Pencil size={15} />}
              {editing ? 'Cancel' : 'Edit contact'}
            </button>
          </div>

          {editing && (
            <form className="contact-form" onSubmit={saveContact}>
              <div className="field-row">
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={contact.email}
                    required
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Phone</span>
                  <input
                    type="text"
                    value={contact.phone}
                    maxLength={30}
                    placeholder="e.g. +91 98350 11223"
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                  />
                </label>
              </div>
              <label className="field">
                <span>Office location</span>
                <input
                  type="text"
                  value={contact.office_location}
                  maxLength={120}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, office_location: e.target.value }))
                  }
                />
              </label>
              <button type="submit" className="btn btn--primary" disabled={savingContact}>
                {savingContact ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                {savingContact ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          )}
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
            Your name, Employee ID, designation and department are maintained centrally by the
            IT Cell and cannot be changed here.
          </p>
        </section>

        <section className="card profile-password">
          <h2 className="card__step">
            <KeyRound size={16} /> Change password
          </h2>
          <form onSubmit={savePassword}>
            <label className="field">
              <span>Current password</span>
              <input
                type="password"
                value={passwords.current_password}
                autoComplete="current-password"
                required
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, current_password: e.target.value }))
                }
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>New password</span>
                <input
                  type="password"
                  value={passwords.new_password}
                  autoComplete="new-password"
                  required
                  onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={passwords.confirm}
                  autoComplete="new-password"
                  required
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                />
              </label>
            </div>
            <button type="submit" className="btn btn--primary" disabled={savingPassword}>
              {savingPassword ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />}
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
