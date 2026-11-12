import { useState } from 'react'
import {
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { initials } from '../services/format.js'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/raise-complaint', label: 'Raise Complaint', Icon: FilePlus2 },
  { to: '/my-complaints', label: 'My Complaints', Icon: ClipboardList },
]

export default function AppLayout() {
  const { employee, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`app-shell ${sidebarOpen ? 'app-shell--open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="brand-mark">
            <Zap size={20} />
          </span>
          <span>
            <strong>BSPHCL</strong>
            <small>IT Helpdesk Management</small>
          </span>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__section">Employee Services</p>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__user">
          <div className="user-row">
            <span className="avatar">{initials(employee?.full_name)}</span>
            <span className="user-meta">
              <strong>{employee?.full_name}</strong>
              <small>
                {employee?.employee_id} &middot; {employee?.designation}
              </small>
            </span>
          </div>
          <button type="button" className="sign-out" onClick={handleSignOut}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
      />

      <div className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="icon-button"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <PanelLeft size={19} />
          </button>
          <div className="topbar__title">
            <ShieldCheck size={18} />
            <span>Bihar State Power (Holding) Company Ltd. &mdash; IT Cell</span>
          </div>
          <div className="topbar__actions">
            <span className="chip">Employee Portal</span>
            <button type="button" className="btn btn--primary" onClick={() => navigate('/raise-complaint')}>
              <FilePlus2 size={17} />
              New complaint
            </button>
          </div>
        </header>

        <main className="page">
          <Outlet />
        </main>

        <footer className="footer">
          Demo environment with fictional data &middot; For IT support call Ext. 1100 (sample)
        </footer>
      </div>
    </div>
  )
}
