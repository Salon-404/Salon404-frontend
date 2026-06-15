import axios from 'axios'
import { configSalonMock, tiposEventoMock } from '../mocks/disponibilidadMock'

const USE_MOCK = true
const API_URL = import.meta.env.VITE_API_EVENTOS_URL || 'http://localhost:5000'

function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Obtiene la configuración del salón (horarios de apertura, tiempo de limpieza)
 * @returns {Promise<Object>} Configuración del salón
 */
export async function getConfigSalon() {
  if (USE_MOCK) {
    await delay()
    return configSalonMock
  }
  
  const response = await axios.get(`${API_URL}/api/salon/config`)
  return response.data
}

/**
 * Obtiene los tipos de evento con sus duraciones
 * @returns {Promise<Array>} Lista de tipos de evento
 */
export async function getTiposEvento() {
  if (USE_MOCK) {
    await delay()
    return tiposEventoMock
  }
  
  const response = await axios.get(`${API_URL}/api/event-types`)
  return response.data
}

/**
 * Obtiene la disponibilidad de un día específico
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Object>} Disponibilidad del día
 */
export async function getDisponibilidad(fecha) {
  if (USE_MOCK) {
    await delay()
    // Por ahora devolvemos todas las reservas del mock
    // En producción, el backend filtraría por fecha
    const { reservasMock } = await import('../mocks/reservasMock')
    const reservasDelDia = reservasMock.filter(r => r.fecha === fecha)
    return {
      fecha,
      reservas: reservasDelDia,
    }
  }
  
  const response = await axios.get(`${API_URL}/api/availability?fecha=${fecha}`)
  return response.data
}

/**
 * Bloquea un horario temporalmente (como asiento de cine)
 * @param {Object} datos - { fecha, horaInicio, horaFin, tipoEventoId }
 * @returns {Promise<Object>} Reserva temporal con ExpirationAt
 */
export async function bloquearHorario(datos) {
  if (USE_MOCK) {
    await delay(500)
    const ahora = new Date()
    const expiracion = new Date(ahora.getTime() + 10 * 60 * 1000) // +10 minutos
    
    return {
      id: `reserva-temp-${Date.now()}`,
      ...datos,
      estado: 'pendiente',
      expirationAt: expiracion.toISOString(),
    }
  }
  
  const response = await axios.post(`${API_URL}/api/reservations/lock`, datos)
  return response.data
}

/**
 * Libera un horario bloqueado (si expiró o el usuario canceló)
 * @param {string} reservaId - ID de la reserva temporal
 * @returns {Promise<void>}
 */
export async function liberarHorario(reservaId) {
  if (USE_MOCK) {
    await delay(200)
    return { success: true }
  }
  
  const response = await axios.delete(`${API_URL}/api/reservations/${reservaId}/lock`)
  return response.data
}
