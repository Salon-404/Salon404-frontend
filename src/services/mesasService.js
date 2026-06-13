import axios from 'axios'
import {
  layoutMock,
  invitadosMock,
  asignacionesMock,
  nextMesaMockId,
  nextAsignMockId,
} from '../mocks/mesasMock'

// Poner en false cuando el backend de David esté listo
const USE_MOCK = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_MESAS_URL,
})

// Copia local del layout para simular persistencia durante la sesión
let layoutState = JSON.parse(JSON.stringify(layoutMock))

// Copia local de asignaciones para simular persistencia durante la sesión
const asignacionesState = JSON.parse(JSON.stringify(asignacionesMock))

function delay(ms = 250) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Devuelve el layout global del salón con todas las mesas y sus posiciones
export async function getLayout() {
  if (USE_MOCK) {
    await delay()
    return JSON.parse(JSON.stringify(layoutState))
  }
  const { data } = await api.get('/api/mesas/layout')
  return data
}

// Guarda el layout completo del salón (reemplaza todo)
export async function putLayout(layout) {
  if (USE_MOCK) {
    await delay(300)
    layoutState = JSON.parse(JSON.stringify(layout))
    return JSON.parse(JSON.stringify(layoutState))
  }
  const { data } = await api.put('/api/mesas/layout', layout)
  return data
}

// Elimina una mesa del plano. Devuelve 409 si tiene invitados asignados en reservas activas.
export async function deleteMesa(mesaId) {
  if (USE_MOCK) {
    await delay()
    const tieneAsignaciones = Object.values(asignacionesState).some(asigs =>
      asigs.some(a => a.mesaId === mesaId)
    )
    if (tieneAsignaciones) {
      const error = new Error('La mesa tiene invitados asignados')
      error.response = { status: 409 }
      throw error
    }
    layoutState.mesas = layoutState.mesas.filter(m => m.id !== mesaId)
    return null
  }
  await api.delete(`/api/mesas/${mesaId}`)
}

// Devuelve el estado de asignaciones de invitados para una reserva específica
export async function getAsignaciones(reservaId) {
  if (USE_MOCK) {
    await delay()
    const asigs = asignacionesState[reservaId] || []
    const invitados = invitadosMock[reservaId] || []
    const asignadosIds = new Set(asigs.map(a => a.invitadoId))

    // Agrupa los invitados asignados por mesa
    const mesasConInvitados = layoutState.mesas.map(mesa => {
      const invitadosDeMesa = asigs
        .filter(a => a.mesaId === mesa.id)
        .map(a => {
          const inv = invitados.find(i => i.id === a.invitadoId)
          return inv ? { ...inv, _asignacionId: a.id } : null
        })
        .filter(Boolean)
      return { mesaId: mesa.id, invitados: invitadosDeMesa }
    })

    return {
      reservaId,
      mesas: mesasConInvitados,
      sinAsignar: invitados.filter(i => !asignadosIds.has(i.id)),
    }
  }
  const { data } = await api.get(`/api/mesas/asignaciones/${reservaId}`)
  return data
}

// Asigna un invitado a una mesa. Devuelve 409 con CAPACIDAD_EXCEDIDA si está llena.
export async function createAsignacion({ reservaId, mesaId, invitadoId }) {
  if (USE_MOCK) {
    await delay()
    const reservaAsigs = asignacionesState[reservaId] || []
    const mesa = layoutState.mesas.find(m => m.id === mesaId)
    const asignadasEnMesa = reservaAsigs.filter(a => a.mesaId === mesaId).length

    if (mesa && asignadasEnMesa >= mesa.capacidad) {
      const error = new Error('Capacidad excedida')
      error.response = {
        status: 409,
        data: { code: 'CAPACIDAD_EXCEDIDA', mesaId, capacidad: mesa.capacidad, asignados: asignadasEnMesa },
      }
      throw error
    }

    const nueva = { id: nextAsignMockId(), reservaId, mesaId, invitadoId }
    if (!asignacionesState[reservaId]) asignacionesState[reservaId] = []
    asignacionesState[reservaId].push(nueva)
    return nueva
  }
  const { data } = await api.post('/api/mesas/asignaciones', { reservaId, mesaId, invitadoId })
  return data
}

// Quita la asignación de un invitado a una mesa
export async function deleteAsignacion(asignacionId) {
  if (USE_MOCK) {
    await delay()
    for (const reservaId of Object.keys(asignacionesState)) {
      asignacionesState[reservaId] = asignacionesState[reservaId].filter(a => a.id !== asignacionId)
    }
    return null
  }
  await api.delete(`/api/mesas/asignaciones/${asignacionId}`)
}

// Devuelve el layout con la ocupación por mesa para la vista de solo lectura del cliente
export async function getPlano(reservaId) {
  if (USE_MOCK) {
    await delay()
    const asigs = asignacionesState[reservaId] || []
    const invitados = invitadosMock[reservaId] || []

    const ocupacion = layoutState.mesas.map(mesa => {
      const asignadosEnMesa = asigs
        .filter(a => a.mesaId === mesa.id)
        .map(a => invitados.find(i => i.id === a.invitadoId))
        .filter(Boolean)
      return {
        mesaId:    mesa.id,
        asignados: asignadosEnMesa.length,
        capacidad: mesa.capacidad,
        invitados: asignadosEnMesa,
      }
    })

    return {
      layout:          JSON.parse(JSON.stringify(layoutState)),
      ocupacion,
      totalInvitados:  invitados.length,
    }
  }
  const { data } = await api.get(`/api/mesas/plano/${reservaId}`)
  return data
}
