import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import ComplaintDetails from './pages/ComplaintDetails.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import MyComplaints from './pages/MyComplaints.jsx'
import Profile from './pages/Profile.jsx'
import RaiseComplaint from './pages/RaiseComplaint.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/raise-complaint" element={<RaiseComplaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/complaints/:ticketId" element={<ComplaintDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
