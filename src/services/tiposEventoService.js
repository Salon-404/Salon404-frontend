import axios from 'axios'
import { tiposEventoMock } from '../mocks/tiposEventoMock'

// Poner en false cuando el backend de David esté listo
const USE_MOCK = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_EVENTOS_URL,
})

// Copia local para simular persistencia durante la sesión
let tiposState = JSON.parse(JSON.stringify(tiposEventoMock))

let _nextId = Math.max(...tiposEventoMock.map((t) => t.id)) + 1
function nextId() { return _nextId++ }

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Devuelve todos los tipos de evento activos
export async function getTipos() {
  if (USE_MOCK) {
    await delay()
    return JSON.parse(JSON.stringify(tiposState))
  }
  const { data } = await api.get('/api/v1/eventtypes')
  return data
}

// Devuelve un tipo de evento por id
export async function getTipoById(id) {
  if (USE_MOCK) {
    await delay()
    const tipo = tiposState.find((t) => t.id === Number(id))
    if (!tipo) {
      const error = new Error('Tipo de evento no encontrado')
      error.response = { status: 404 }
      throw error
    }
    return JSON.parse(JSON.stringify(tipo))
  }
  const { data } = await api.get(`/api/v1/eventtypes/${id}`)
  return data
}

// Crea un nuevo tipo de evento
export async function crearTipo(data) {
  if (USE_MOCK) {
    await delay(300)
    const nuevo = { ...data, id: nextId(), activo: true }
    tiposState.push(nuevo)
    return JSON.parse(JSON.stringify(nuevo))
  }
  const { data: created } = await api.post('/api/v1/eventtypes', data)
  return created
}

// Actualiza un tipo de evento existente
export async function actualizarTipo(id, data) {
  if (USE_MOCK) {
    await delay(300)
    const idx = tiposState.findIndex((t) => t.id === Number(id))
    if (idx === -1) {
      const error = new Error('Tipo de evento no encontrado')
      error.response = { status: 404 }
      throw error
    }
    tiposState[idx] = { ...tiposState[idx], ...data }
    return JSON.parse(JSON.stringify(tiposState[idx]))
  }
  const { data: updated } = await api.put(`/api/v1/eventtypes/${id}`, data)
  return updated
}

// Elimina un tipo de evento
export async function eliminarTipo(id) {
  if (USE_MOCK) {
    await delay()
    const idx = tiposState.findIndex((t) => t.id === Number(id))
    if (idx === -1) {
      const error = new Error('Tipo de evento no encontrado')
      error.response = { status: 404 }
      throw error
    }
    tiposState.splice(idx, 1)
    return null
  }
  await api.delete(`/api/v1/eventtypes/${id}`)
}
