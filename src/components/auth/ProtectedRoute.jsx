import { Link, Navigate } from 'react-router-dom'
import { decodeToken } from '../../globals/decodeToken'
import { TOKEN_KEY, RUTA_LOGIN } from '../../constants/auth'

export default function ProtectedRoute({ children, rolRequerido }) {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token) {
    return <Navigate to={RUTA_LOGIN} replace />
  }

  let user = null

  try {
    user = decodeToken(token)
  } catch {
    return <Navigate to={RUTA_LOGIN} replace />
  }

  if (rolRequerido && user.role !== rolRequerido) {
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