// TODO: conectar con API real (salon404-eventos, módulo cronograma)
import { v4 as uuidv4 } from 'uuid';

const MOCK_DELAY = 600;
const ERROR_RATE = 0.1;

// Base de datos local mock de cronogramas por eventoId
let cronogramasMock = {
  // Ej: '1': [{ id, horaInicio, duracionEstimada, actividad, responsable }]
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const maybeThrow = () => {
  if (Math.random() < ERROR_RATE) {
    throw new Error('Error de conexión con el servidor (Cronograma).');
  }
};

export const getCronograma = async (eventoId) => {
  await wait(MOCK_DELAY);
  maybeThrow();
  if (!cronogramasMock[eventoId]) {
    // Inicializar mock vacío para el evento si no existe
    cronogramasMock[eventoId] = [];
  }
  // Ordenar por horaInicio
  return [...cronogramasMock[eventoId]].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
};

export const createCronogramaItem = async (eventoId, data) => {
  await wait(MOCK_DELAY);
  maybeThrow();
  if (!cronogramasMock[eventoId]) {
    cronogramasMock[eventoId] = [];
  }
  const nuevo = {
    ...data,
    id: uuidv4(),
  };
  cronogramasMock[eventoId].push(nuevo);
  return nuevo;
};

export const updateCronogramaItem = async (eventoId, itemId, data) => {
  await wait(MOCK_DELAY);
  maybeThrow();
  if (!cronogramasMock[eventoId]) throw new Error('Evento no encontrado');

  const index = cronogramasMock[eventoId].findIndex(i => i.id === itemId);
  if (index === -1) throw new Error('Ítem no encontrado');

  cronogramasMock[eventoId][index] = {
    ...cronogramasMock[eventoId][index],
    ...data,
  };
  return cronogramasMock[eventoId][index];
};

export const deleteCronogramaItem = async (eventoId, itemId) => {
  await wait(MOCK_DELAY);
  maybeThrow();
  if (!cronogramasMock[eventoId]) return false;
  cronogramasMock[eventoId] = cronogramasMock[eventoId].filter(i => i.id !== itemId);
  return true;
};
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
