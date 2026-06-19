import { Link, Navigate } from 'react-router-dom'
import { RUTA_LOGIN } from '../../constants/auth'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, rolRequerido }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Validando sesión...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={RUTA_LOGIN} replace />
  }

  const userRole = user.role || user.rol

  if (rolRequerido && userRole !== rolRequerido) {
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
