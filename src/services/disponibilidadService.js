import axios from 'axios'
import { configSalonMock } from '../mocks/disponibilidadMock'
import { tiposEventoMock } from '../mocks/tiposEventoMock'

const USE_MOCK = true
const API_URL = import.meta.env.VITE_API_EVENTOS_URL || 'http://localhost:5000'

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
