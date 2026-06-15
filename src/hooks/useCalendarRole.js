<<<<<<< HEAD
import { ROLES } from '../constants/auth'

/**
 * Determina el rol y la vista del calendario a partir del usuario actual.
 * @param {Object} user - Usuario autenticado
 * @returns {{ isAdmin: boolean, vista: 'admin' | 'public' }}
 */
export function useCalendarRole(user) {
  const isAdmin = user?.rol === ROLES.ADMIN
  return { isAdmin, vista: isAdmin ? 'admin' : 'public' }
=======
import { useMemo } from 'react'
import { determinarVista } from '../utils/seguridad'

/**
 * Hook que determina la vista del calendario según el usuario autenticado.
 * @param {Object|null} user - Objeto de usuario del AuthContext
 * @returns {{ isAdmin: boolean, vista: 'admin'|'publica', puedeVerDetalle: boolean }}
 */
export function useCalendarRole(user) {
  return useMemo(() => determinarVista(user), [user])
>>>>>>> origin/develop
}
