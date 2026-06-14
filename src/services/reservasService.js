// Adapter temporal: expone la API vieja de reservas sobre el modelo unificado de eventos.
// Se mantiene solo para no romper los módulos que aún no migran (mesas y pages/reservas),
// que serán reemplazados/borrados en los Días 3-6 del spec de unificación.

import { eventosMock } from '../mocks/eventosMock'
import {
  getEvento as getEventoService,
  getEventos as getEventosService,
  createEvento as createEventoService,
  updateEvento as updateEventoService,
  updateEstadoReserva as updateEstadoReservaService,
} from './eventosService'

const USE_MOCK = true

function simularDelay() {
  return new Promise((resolve) => setTimeout(resolve, 300))
}

const TIPO_STRING_A_ID = {
  '15anos': 1,
  casamiento: 2,
  cumpleanos: 3,
  corporativo: 4,
  bautismo: 5,
  otro: 6,
}

const TIPO_ID_A_STRING = {
  1: '15anos',
  2: 'casamiento',
  3: 'cumpleanos',
  4: 'corporativo',
  5: 'bautismo',
  6: 'otro',
}

function mapEventoToReserva(evento) {
  return {
    id: evento.reserva?.id ?? evento.id,
    fecha: evento.fecha,
    horario: evento.franja,
    horaInicio: evento.horaInicio,
    horaFin: evento.horaFin,
    tipoEvento: TIPO_ID_A_STRING[evento.tipoEventoId] ?? 'otro',
    tipoEventoId: evento.tipoEventoId,
    nombreCliente: evento.cliente?.nombre ?? '',
    email: evento.cliente?.email ?? '',
    telefono: evento.cliente?.telefono ?? '',
    cantidadInvitados: evento.cantidadInvitados,
    notas: evento.descripcion ?? '',
    estado: evento.reserva?.estado ?? evento.estado,
    creadoEn: evento.reserva?.creadoEn ?? evento.creadoEn,
  }
}

function mapReservaToEventoPayload(data) {
  return {
    nombre: data.nombreCliente,
    descripcion: data.notas ?? '',
    tipoEventoId: data.tipoEventoId ?? TIPO_STRING_A_ID[data.tipoEvento] ?? 6,
    fecha: data.fecha,
    horaInicio: data.horaInicio,
    horaFin: data.horaFin,
    franja: data.horario,
    cantidadInvitados: data.cantidadInvitados,
    cliente: {
      nombre: data.nombreCliente,
      email: data.email,
      telefono: data.telefono,
    },
    reserva: {
      estado: data.estado ?? 'pendiente',
      montoTotal: 0,
      expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  }
}

export async function getReservas({ estado = '', mes = '', anio = '' } = {}) {
  if (USE_MOCK) {
    await simularDelay()
    const eventos = await getEventosService({ estado })
    let data = eventos.map(mapEventoToReserva)
    if (mes && anio) {
      data = data.filter((r) => {
        const fecha = new Date(r.fecha)
        return fecha.getMonth() + 1 === Number(mes) && fecha.getFullYear() === Number(anio)
      })
    }
    return { data, total: data.length, page: 1 }
  }
  throw new Error('API legacy no disponible sin mock')
}

export async function getReserva(id) {
  if (USE_MOCK) {
    await simularDelay()
    const evento = eventosMock.find((e) => e.reserva?.id === Number(id))
    if (!evento) throw { response: { status: 404 } }
    return mapEventoToReserva(evento)
  }
  const evento = await getEventoService(String(id))
  return mapEventoToReserva(evento)
}

export async function createReserva(data) {
  if (USE_MOCK) {
    await simularDelay()
    const payload = mapReservaToEventoPayload(data)
    const evento = await createEventoService(payload)
    return mapEventoToReserva(evento)
  }
  throw new Error('API legacy no disponible sin mock')
}

export async function updateReserva(id, data) {
  if (USE_MOCK) {
    await simularDelay()
    const evento = eventosMock.find((e) => e.reserva?.id === Number(id))
    if (!evento) throw { response: { status: 404 } }
    const payload = mapReservaToEventoPayload({ ...evento, ...data })
    delete payload.reserva.creadoEn
    const actualizado = await updateEventoService(evento.id, payload, evento.version)
    return mapEventoToReserva(actualizado)
  }
  throw new Error('API legacy no disponible sin mock')
}

export async function updateEstado(id, estado) {
  if (USE_MOCK) {
    await simularDelay()
    const evento = eventosMock.find((e) => e.reserva?.id === Number(id))
    if (!evento) throw { response: { status: 404 } }
    const actualizado = await updateEstadoReservaService(evento.id, estado, evento.version)
    return mapEventoToReserva(actualizado)
  }
  throw new Error('API legacy no disponible sin mock')
}

export async function getDisponibilidad(year, month) {
  if (USE_MOCK) {
    await simularDelay()
    const pad = (n) => String(n).padStart(2, '0')
    const prefix = `${year}-${pad(month)}`
    const ocupadas = ['2026-05-30', '2026-06-14', '2026-07-18', '2026-08-08']
    const pendientes = ['2026-06-20', '2026-06-25', '2026-07-25']
    return {
      fechasOcupadas: ocupadas.filter((f) => f.startsWith(prefix)),
      fechasPendientes: pendientes.filter((f) => f.startsWith(prefix)),
    }
  }
  throw new Error('API legacy no disponible sin mock')
}
