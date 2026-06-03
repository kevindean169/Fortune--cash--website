import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
  // Mock authentication check - replace with real auth logic later
  // For demonstration, we'll assume the user is always logged in. 
  // Change to false to test redirect to login.
  const isAuthenticated = true 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
