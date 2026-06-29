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
