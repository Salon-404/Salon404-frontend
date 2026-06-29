import axios from 'axios'
import { services } from './endpointsUrl'
import { getTipos } from './tiposEventoService'

const API_URL = import.meta.env.VITE_API_EVENTOS_ROOT_URL || services.eventos.replace(/\/api\/v1\/Events\/?$/i, '')

/**
 * Obtiene la configuracion del salon (horarios de apertura, tiempo de limpieza)
 * @returns {Promise<Object>} Configuracion del salon
 */
export async function getConfigSalon() {
  const response = await axios.get(`${API_URL}/api/salon/config`)
  return response.data
}

/**
 * Obtiene los tipos de evento con sus duraciones
 * @returns {Promise<Array>} Lista de tipos de evento
 */
export async function getTiposEvento() {
  return getTipos()
}
