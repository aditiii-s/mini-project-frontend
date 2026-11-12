import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { notificationsApi } from '../services/api.js'

const NotificationContext = createContext(null)

/** Shared so the bell badge and the notifications page stay in step. */
export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const data = await notificationsApi.list()
      setItems(data.items)
      setUnread(data.unread)
    } catch {
      /* the bell is not worth a toast - the page shows its own errors */
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([])
      setUnread(0)
      return
    }
    refresh()
  }, [isAuthenticated, refresh])

  const markRead = useCallback(async (id) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, is_read: true } : i)))
    setUnread((n) => Math.max(0, n - 1))
    try {
      await notificationsApi.markRead(id)
    } catch {
      /* ignore - the next refresh corrects the state */
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setItems((list) => list.map((i) => ({ ...i, is_read: true })))
    setUnread(0)
    try {
      await notificationsApi.markAllRead()
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ items, unread, loading, refresh, markRead, markAllRead }),
    [items, unread, loading, refresh, markRead, markAllRead],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}
