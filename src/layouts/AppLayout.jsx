import { useCallback, useEffect, useState } from 'react'
import {
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { initials } from '../services/format.js'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/raise-complaint', label: 'Raise Complaint', Icon: FilePlus2 },
  { to: '/my-complaints', label: 'My Complaints', Icon: ClipboardList },
]

const COLLAPSE_KEY = 'bsphcl_sidebar_collapsed'
const MOBILE_BREAKPOINT = 860

export default function AppLayout() {
  const { employee, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Drawer on phones, narrow icon rail on desktop.
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, String(collapsed))
    } catch {
      /* private browsing - the preference just will not persist */
    }
  }, [collapsed])

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      setSidebarOpen((open) => !open)
    } else {
      setCollapsed((value) => !value)
    }
  }, [])

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const shellClass = [
    'app-shell',
    sidebarOpen ? 'app-shell--open' : '',
    collapsed ? 'app-shell--collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass}>
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="brand-mark">
            <Zap size={20} />
          </span>
          <span className="sidebar__brand-text">
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
              title={collapsed ? label : undefined}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span className="nav-item__label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__user">
          <NavLink
            to="/profile"
            className={({ isActive }) => `user-row ${isActive ? 'user-row--active' : ''}`}
            title={collapsed ? `${employee?.full_name} - view profile` : 'View profile'}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="avatar">{initials(employee?.full_name)}</span>
            <span className="user-meta">
              <strong>{employee?.full_name}</strong>
              <small>
                {employee?.employee_id} &middot; {employee?.designation}
              </small>
            </span>
          </NavLink>
          <button
            type="button"
            className="sign-out"
            onClick={handleSignOut}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={17} />
            <span className="nav-item__label">Sign out</span>
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
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleSidebar}
          >
            {collapsed ? <PanelLeft size={19} /> : <PanelLeftClose size={19} />}
          </button>
          <div className="topbar__title">
            <ShieldCheck size={18} />
            <span>Bihar State Power (Holding) Company Ltd. &mdash; IT Cell</span>
          </div>
          <div className="topbar__actions">
            <span className="chip">Employee Portal</span>
            {location.pathname !== '/raise-complaint' && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate('/raise-complaint')}
              >
                <FilePlus2 size={17} />
                New complaint
              </button>
            )}
          </div>
        </header>

        <main className="page">
          <Outlet />
        </main>

        <footer className="footer">
          &copy; {new Date().getFullYear()} Bihar State Power (Holding) Company Ltd. &mdash; IT
          Cell. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
