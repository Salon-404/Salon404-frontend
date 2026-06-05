import { Navigate } from 'react-router-dom'
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
      <div className="p-10 text-center">
        No tenés permisos para entrar acá
      </div>
    )
  }

  return children
}