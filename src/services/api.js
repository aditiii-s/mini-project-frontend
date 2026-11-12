import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export const TOKEN_KEY = 'bsphcl_token'

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('bsphcl_employee')
      if (window.location.pathname !== '/login') window.location.replace('/login')
    }
    return Promise.reject(error)
  },
)

/** Pull a readable message out of any axios/FastAPI error. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) return detail[0].msg || fallback
  if (error?.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the FastAPI backend running?'
  return error?.message || fallback
}

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (payload) => api.put('/auth/me', payload).then((r) => r.data),
  changePassword: (payload) => api.post('/auth/change-password', payload).then((r) => r.data),
}

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data),
  recentComplaints: (limit = 4) =>
    api.get('/dashboard/recent-complaints', { params: { limit } }).then((r) => r.data),
  activity: (limit = 6) => api.get('/dashboard/activity', { params: { limit } }).then((r) => r.data),
}

export const announcementsApi = {
  list: (limit = 5) => api.get('/announcements', { params: { limit } }).then((r) => r.data),
}

export const notificationsApi = {
  list: (limit = 20) => api.get('/notifications', { params: { limit } }).then((r) => r.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.put('/notifications/read-all').then((r) => r.data),
}

export const knowledgeBaseApi = {
  list: (params = {}) => api.get('/knowledge-base', { params }).then((r) => r.data),
}

export const serviceRequestsApi = {
  create: (payload) => api.post('/service-requests', payload).then((r) => r.data),
  list: (params = {}) => api.get('/service-requests', { params }).then((r) => r.data),
}

export const complaintsApi = {
  create: (payload) => api.post('/complaints', payload).then((r) => r.data),
  list: (params = {}) => api.get('/complaints', { params }).then((r) => r.data),
  details: (ticketId) => api.get(`/complaints/${ticketId}`).then((r) => r.data),
  track: (ticketId) => api.get(`/complaints/track/${ticketId}`).then((r) => r.data),
  comments: (ticketId) => api.get(`/complaints/${ticketId}/comments`).then((r) => r.data),
  addComment: (ticketId, message) =>
    api.post(`/complaints/${ticketId}/comments`, { message }).then((r) => r.data),
}

export default api
