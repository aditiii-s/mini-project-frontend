import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, TOKEN_KEY } from '../services/api.js'

const EMPLOYEE_KEY = 'bsphcl_employee'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(() => {
    const raw = localStorage.getItem(EMPLOYEE_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  // Revalidate the stored token against the backend on first load.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false)
      return
    }
    let active = true
    authApi
      .me()
      .then((data) => {
        if (!active) return
        setEmployee(data)
        localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(data))
      })
      .catch(() => {
        if (!active) return
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EMPLOYEE_KEY)
        setEmployee(null)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (employeeId, password) => {
    const data = await authApi.login({ employee_id: employeeId, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(data.employee))
    setEmployee(data.employee)
    return data.employee
  }, [])

  const refreshEmployee = useCallback(async () => {
    const data = await authApi.me()
    setEmployee(data)
    localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(data))
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMPLOYEE_KEY)
    setEmployee(null)
  }, [])

  const value = useMemo(
    () => ({
      employee,
      loading,
      login,
      logout,
      refreshEmployee,
      isAuthenticated: Boolean(employee),
    }),
    [employee, loading, login, logout, refreshEmployee],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
