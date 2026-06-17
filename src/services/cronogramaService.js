import axios from 'axios'
import { services } from './endpointsUrl'

// URL base del microservicio de eventos (cronograma)
const urlBaseEventos = services.eventos

/**
 * Obtener el cronograma de un evento específico
 * @param {number|string} eventoId - ID del evento
 */
export const obtenerCronograma = (eventoId) =>
  axios.get(`${urlBaseEventos}/${eventoId}/cronograma`)

/**
 * Agregar una nueva actividad al cronograma
 * @param {number|string} eventoId - ID del evento
 * @param {object} datos - { hora, titulo, descripcion }
 */
export const agregarActividad = (eventoId, datos) =>
  axios.post(`${urlBaseEventos}/${eventoId}/cronograma`, datos)

/**
 * Actualizar una actividad del cronograma
 * @param {number|string} eventoId - ID del evento
 * @param {number|string} actividadId - ID de la actividad
 * @param {object} datos - Datos actualizados
 */
export const actualizarActividad = (eventoId, actividadId, datos) =>
  axios.put(`${urlBaseEventos}/${eventoId}/cronograma/${actividadId}`, datos)

/**
 * Eliminar una actividad del cronograma
 * @param {number|string} eventoId - ID del evento
 * @param {number|string} actividadId - ID de la actividad
 */
export const eliminarActividad = (eventoId, actividadId) =>
  axios.delete(`${urlBaseEventos}/${eventoId}/cronograma/${actividadId}`)
