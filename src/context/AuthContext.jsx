import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as loginService, register as registerService } from '../services/authService'
import { TOKEN_KEY } from '../constants/auth'
import { decodeToken } from '../globals/decodeToken'

const AuthContext = createContext(null)

function normalizeUser(decoded) {
  if (!decoded) return null

  const role = decoded.role || decoded.rol
  return {
    id: decoded.id,
    name: decoded.name || decoded.nombre,
    nombre: decoded.nombre || decoded.name,
    email: decoded.email,
    role,
    rol: role,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      setLoading(false)
      return
    }

    const usuario = normalizeUser(decodeToken(token))

    if (!usuario) {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    } else {
      setUser(usuario)
    }

    setLoading(false)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const res = await loginService({ email, password })
    const token = res?.Token || res?.token

    if (!token) throw new Error('No se recibio el token del servidor')

    const usuario = normalizeUser(decodeToken(token))
    if (!usuario) throw new Error('No se pudo leer el token del servidor')

    localStorage.setItem(TOKEN_KEY, token)
    setUser(usuario)
    return usuario
  }, [])

  const register = useCallback(async ({ name, lastName, email, password, phone }) => {
    return registerService({ name, lastName, email, password, phone })
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
