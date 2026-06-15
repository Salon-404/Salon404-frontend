import { useMemo } from 'react'
import { determinarVista } from '../utils/seguridad'

/**
 * Hook que determina la vista del calendario según el usuario autenticado.
 * @param {Object|null} user - Objeto de usuario del AuthContext
 * @returns {{ isAdmin: boolean, vista: 'admin'|'publica', puedeVerDetalle: boolean }}
 */
export function useCalendarRole(user) {
  return useMemo(() => determinarVista(user), [user])
}
