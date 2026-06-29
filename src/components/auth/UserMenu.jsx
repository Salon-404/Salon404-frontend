import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function UserMenu({ className = '' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className={`text-slate-300 hover:text-white text-sm font-medium transition-colors ${className}`}
      >
        Ingresar
      </Link>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-xs text-slate-400 hidden sm:inline">
        {user.email}
      </span>
      <span className="text-xs text-slate-300 font-medium">
        {user.role}
      </span>
      <button
        onClick={handleLogout}
        className="text-xs text-slate-400 hover:text-white transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
