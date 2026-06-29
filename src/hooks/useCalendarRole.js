import { isSuperAdmin } from '../utils/roles'

/**
 * Determina el rol y la vista del calendario a partir del usuario actual.
 * @param {Object} user - Usuario autenticado
 * @returns {{ isAdmin: boolean, vista: 'admin' | 'public' }}
 */
export function useCalendarRole(user) {
  const isAdmin = isSuperAdmin(user)
  return { isAdmin, vista: isAdmin ? 'admin' : 'public' }
}
