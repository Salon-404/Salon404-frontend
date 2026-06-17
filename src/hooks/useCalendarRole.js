import { ROLES } from '../constants/auth'

/**
 * Determina el rol y la vista del calendario a partir del usuario actual.
 * @param {Object} user - Usuario autenticado
 * @returns {{ isAdmin: boolean, vista: 'admin' | 'public' }}
 */
export function useCalendarRole(user) {
  const isAdmin = user?.rol === ROLES.ADMIN
  return { isAdmin, vista: isAdmin ? 'admin' : 'public' }
}
