import { useCallback, useEffect, useState } from 'react'
import {
  Bell,
  BookOpen,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  PanelLeft,
  PanelLeftClose,
  ShieldCheck,
  UserRound,
  Zap,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { initials } from '../services/format.js'

const NAV_GROUPS = [
  {
    title: 'Employee Services',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { to: '/raise-complaint', label: 'Raise Complaint', Icon: FilePlus2 },
      { to: '/my-complaints', label: 'My Complaints', Icon: ClipboardList },
      { to: '/service-requests', label: 'IT Service Requests', Icon: PackagePlus },
      { to: '/knowledge-base', label: 'Knowledge Base', Icon: BookOpen },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/notifications', label: 'Notifications', Icon: Bell, badge: 'unread' },
      { to: '/profile', label: 'My Profile', Icon: UserRound },
    ],
  },
]

const COLLAPSE_KEY = 'bsphcl_sidebar_collapsed'
const MOBILE_BREAKPOINT = 860

export default function AppLayout() {
  const { employee, logout } = useAuth()
  const { unread } = useNotifications()
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
          {NAV_GROUPS.map((group) => (
            <div className="sidebar__group" key={group.title}>
              <p className="sidebar__section">{group.title}</p>
              {group.items.map(({ to, label, Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-item__icon">
                    <Icon size={18} />
                    {badge === 'unread' && unread > 0 && <span className="nav-dot" />}
                  </span>
                  <span className="nav-item__label">{label}</span>
                  {badge === 'unread' && unread > 0 && (
                    <span className="nav-count">{unread > 9 ? '9+' : unread}</span>
                  )}
                </NavLink>
              ))}
            </div>
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
            <button
              type="button"
              className="icon-button bell"
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
              title="Notifications"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={19} />
              {unread > 0 && <span className="bell__badge">{unread > 9 ? '9+' : unread}</span>}
            </button>
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
