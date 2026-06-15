import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RUTA_LOGIN } from '../../constants/auth'

export default function ProtectedRoute({ children, rolRequerido }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={RUTA_LOGIN} state={{ from: location }} replace />
  }

  if (rolRequerido && user.rol !== rolRequerido) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-xl font-semibold text-slate-700">Acceso restringido</p>
        <p className="text-sm text-slate-500">No tenés permiso para ver esta página.</p>
        <Link to="/eventos" className="text-sm text-indigo-600 hover:underline">
          Ir a Eventos
        </Link>
      </div>
    )
  }

  return children
}
