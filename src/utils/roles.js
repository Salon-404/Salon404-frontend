import { ROLES } from '../constants/auth'

export function normalizeRole(role) {
  return String(role ?? '').trim()
}

export function isSuperAdmin(user) {
  return normalizeRole(user?.role) === ROLES.SUPER_ADMIN
}

export function isUser(user) {
  return normalizeRole(user?.role) === ROLES.USER
}

export function canViewAllEventos(user) {
  return isSuperAdmin(user)
}

/**
 * ¿Puede el usuario administrar la lista de invitados / hacer check-in de un evento?
 * Lo permiten un admin (o superadmin) o el responsable/propietario del evento.
 */
export function canManageEvent(user, evento) {
  if (!user) return false

  const role = normalizeRole(user.role ?? user.rol)
  if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) return true

  if (!evento) return false
  const ownerId = evento.eventOwner ?? evento.ownerId
  return ownerId != null && String(ownerId) === String(user.id)
}
