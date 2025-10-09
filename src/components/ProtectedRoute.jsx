import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Check if route requires admin access
  if (adminOnly && user?.email !== 'sarmanpreets.it.22@nitj.ac.in') {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
