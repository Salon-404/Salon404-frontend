import { ROLES } from '../constants/auth'

export function normalizeRole(role) {
  return String(role ?? '').trim()
}

export function isSuperAdmin(user) {
  return normalizeRole(user?.role ?? user?.rol) === ROLES.SUPER_ADMIN
}

export function isUser(user) {
  return normalizeRole(user?.role ?? user?.rol) === ROLES.USER
}

export function canViewAllEventos(user) {
  return isSuperAdmin(user)
}
