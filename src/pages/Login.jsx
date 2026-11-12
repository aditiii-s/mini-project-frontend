import { useEffect, useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2, Lock, LogIn, ShieldCheck, User, Zap } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { errorMessage } from '../services/api.js'

const DEMO_ACCOUNTS = [
  { role: 'Employee', id: 'EMP1024', password: 'demo123', Icon: User },
  { role: 'IT Admin', id: 'ITADMIN', password: 'admin123', Icon: ShieldCheck },
]

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
  }, [isAuthenticated, navigate, redirectTo])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!employeeId.trim() || !password) {
      setError('Enter both your Employee ID and password.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const user = await login(employeeId.trim().toUpperCase(), password)
      notify(`Welcome back, ${user.full_name.split(' ')[0]}.`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Sign in failed.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login">
      <section className="login__hero">
        <div className="login__brand">
          <span className="brand-mark brand-mark--lg">
            <Zap size={24} />
          </span>
          <span>
            <strong>BSPHCL</strong>
            <small>Bihar State Power (Holding) Company Ltd.</small>
          </span>
        </div>

        <div className="login__pitch">
          <span className="rule" />
          <h1>IT Helpdesk Management System</h1>
          <p>
            One place for every office to report hardware, software, network and printer issues
            &mdash; and for the IT Cell to resolve them on time.
          </p>
          <div className="login__stats">
            <div>
              <strong>5</strong>
              <small>Support categories</small>
            </div>
            <div>
              <strong>24&times;7</strong>
              <small>Ticket tracking</small>
            </div>
            <div>
              <strong>&lt; 48h</strong>
              <small>Target resolution</small>
            </div>
          </div>
        </div>

        <p className="login__note">Authorised personnel only &middot; Demo environment with fictional data</p>
      </section>

      <section className="login__panel">
        <form className="login__form" onSubmit={handleSubmit}>
          <p className="login__eyebrow">
            <Lock size={13} /> SECURE SIGN-IN
          </p>
          <h2>Welcome back</h2>
          <p className="muted">Sign in with your Employee ID to continue.</p>

          <label className="field">
            <span>Employee ID</span>
            <span className="field__control">
              <User size={16} />
              <input
                type="text"
                value={employeeId}
                placeholder="e.g. EMP1024"
                autoComplete="username"
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </span>
          </label>

          <label className="field">
            <span>Password</span>
            <span className="field__control">
              <KeyRound size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder="Enter password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="field__toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? <Loader2 size={17} className="spin" /> : <LogIn size={17} />}
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="demo-box">
            <p>DEMO ACCOUNTS</p>
            <div className="demo-box__grid">
              {DEMO_ACCOUNTS.map(({ role, id, password: pwd, Icon }) => (
                <button
                  type="button"
                  key={id}
                  className="demo-card"
                  onClick={() => {
                    setEmployeeId(id)
                    setPassword(pwd)
                    setError('')
                  }}
                >
                  <span>
                    <Icon size={15} /> {role}
                  </span>
                  <code>
                    {id} / {pwd}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </form>

        <p className="login__footer">
          &copy; 2026 IT Cell &middot; Sample portal &mdash; not connected to any real BSPHCL system
        </p>
      </section>
    </div>
  )
}
