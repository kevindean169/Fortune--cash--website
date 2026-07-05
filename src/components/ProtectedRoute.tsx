import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute() {
  const { user, accessToken, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 rounded-full border-4 border-t-primary border-primary/20 animate-spin" />
      </div>
    )
  }

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
