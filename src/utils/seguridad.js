import { ROLES } from '../constants/auth'
import { decodeToken } from '../globals/decodeToken'

/**
 * Verifica si un usuario tiene rol de admin.
 * @param {Object|null} user - Objeto de usuario con propiedad role
 * @returns {boolean} True si es admin, false en cualquier otro caso
 */
export function esAdmin(user) {
  if (!user || !user.role) return false
  return user.role === ROLES.ADMIN
}

/**
 * Decodifica un token JWT de forma segura.
 * Wrapper de decodeToken que maneja errores gracefully.
 * @param {string|null} token - Token JWT
 * @returns {Object|null} Datos decodificados o null si es inválido
 */
export function decodificarToken(token) {
  if (!token || typeof token !== 'string') return null
  return decodeToken(token)
}

/**
 * Verifica si un token es válido (existe, se puede decodificar y no está expirado).
 * @param {string|null} token - Token JWT
 * @returns {boolean} True si el token es válido
 */
export function esTokenValido(token) {
  if (!token || typeof token !== 'string') return false

  try {
    const decoded = decodificarToken(token)
    if (!decoded) return false

    const ahora = Math.floor(Date.now() / 1000)
    const exp = decoded.exp

    if (!exp || exp < ahora) return false

    return true
  } catch {
    return false
  }
}

/**
 * Determina el tipo de vista según el usuario autenticado.
 * @param {Object|null} user - Objeto de usuario
 * @returns {{ isAdmin: boolean, vista: 'admin'|'publica', puedeVerDetalle: boolean }}
 */
export function determinarVista(user) {
  const isAdmin = esAdmin(user)
  return {
    isAdmin,
    vista: isAdmin ? 'admin' : 'publica',
    puedeVerDetalle: isAdmin,
  }
}
