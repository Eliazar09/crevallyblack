import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'

export function RequireAuth() {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="min-h-[100dvh] bg-ink-900 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-coffee-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace />

  return <Outlet />
}
