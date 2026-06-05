import axios from 'axios'
import { reservasMock, disponibilidadMock } from '../mocks/reservasMock'

const USE_MOCK = false

const api = axios.create({
  baseURL: import.meta.env.VITE_API_RESERVAS_URL,
})

function simularDelay() {
  return new Promise((resolve) => setTimeout(resolve, 300))
}

export async function getReservas({ estado = '', mes = '', anio = '' } = {}) {
  if (USE_MOCK) {
    await simularDelay()
    let data = [...reservasMock]
    if (estado) data = data.filter((r) => r.estado === estado)
    if (mes && anio) data = data.filter((r) => {
      const fecha = new Date(r.fecha)
      return fecha.getMonth() + 1 === Number(mes) && fecha.getFullYear() === Number(anio)
    })
    return { data, total: data.length, page: 1 }
  }
  const res = await api.get('/api/v1/Reservations')
  const mapped = (res.data || []).map(r => ({
    id: r.id,
    fecha: r.dateReserved,
    horario: 'tarde',
    tipoEvento: 'cumpleanos',
    nombreCliente: 'Usuario Registrado',
    email: 'usuario@example.com',
    telefono: 'N/A',
    cantidadInvitados: 50,
    notas: 'Reserva importada de base de datos',
    estado: r.statusName === "Pending" ? "pendiente" : 
            r.statusName === "Confirmed" ? "confirmada" : 
            r.statusName === "Cancelled" ? "cancelada" : "pendiente"
  }))
  let filtered = [...mapped]
  if (estado) filtered = filtered.filter((r) => r.estado === estado)
  if (mes && anio) filtered = filtered.filter((r) => {
    const parts = r.fecha.split('-').map(Number)
    return parts[1] === Number(mes) && parts[0] === Number(anio)
  })
  return { data: filtered, total: filtered.length, page: 1 }
}

export async function getReserva(id) {
  if (USE_MOCK) {
    await simularDelay()
    const reserva = reservasMock.find((r) => r.id === Number(id))
    if (!reserva) throw { response: { status: 404 } }
    return reserva
  }
  const res = await api.get('/api/v1/Reservations', { params: { reservationId: id } })
  const r = res.data?.[0]
  if (!r) throw { response: { status: 404 } }
  return {
    id: r.id,
    fecha: r.dateReserved,
    horario: 'tarde',
    tipoEvento: 'cumpleanos',
    nombreCliente: 'Usuario Registrado',
    email: 'usuario@example.com',
    telefono: 'N/A',
    cantidadInvitados: 50,
    notas: 'Reserva importada de base de datos',
    estado: r.statusName === "Pending" ? "pendiente" : 
            r.statusName === "Confirmed" ? "confirmada" : 
            r.statusName === "Cancelled" ? "cancelada" : "pendiente"
  }
}

export async function createReserva(data) {
  if (USE_MOCK) {
    await simularDelay()
    const ocupada = reservasMock.some((r) => r.fecha === data.fecha && r.estado !== 'cancelada')
    if (ocupada) {
      const error = new Error('Fecha ya ocupada')
      error.response = { status: 409 }
      throw error
    }
    const nueva = { ...data, id: Date.now(), estado: 'pendiente', creadoEn: new Date().toISOString() }
    reservasMock.push(nueva)
    return nueva
  }
  const payload = {
    userId: data.userId || "00000000-0000-0000-0000-000000000000",
    eventId: "11111111-1111-1111-1111-111111111111",
    totalAmount: 100.00,
    dateReserved: data.fecha
  }
  const res = await api.post('/api/v1/Reservations', payload)
  const r = res.data
  return {
    ...data,
    id: r.id,
    estado: r.statusName === "Pending" ? "pendiente" : 
            r.statusName === "Confirmed" ? "confirmada" : 
            r.statusName === "Cancelled" ? "cancelada" : "pendiente"
  }
}

export async function updateReserva(id, data) {
  if (USE_MOCK) {
    await simularDelay()
    const idx = reservasMock.findIndex((r) => r.id === Number(id))
    if (idx === -1) throw { response: { status: 404 } }
    reservasMock[idx] = { ...reservasMock[idx], ...data }
    return reservasMock[idx]
  }
  return { id, ...data }
}

export async function updateEstado(id, estado) {
  if (USE_MOCK) {
    await simularDelay()
    const idx = reservasMock.findIndex((r) => r.id === Number(id))
    if (idx === -1) throw { response: { status: 404 } }
    reservasMock[idx] = { ...reservasMock[idx], estado }
    return reservasMock[idx]
  }
  const statusId = estado === "pendiente" ? 1 : 
                   estado === "confirmada" ? 2 : 
                   estado === "cancelada" ? 4 : 3;
  const res = await api.patch('/api/v1/Reservations', {
    reservationId: id,
    reservationStatusId: statusId
  })
  const r = res.data
  return {
    id: r.id,
    fecha: r.dateReserved,
    horario: 'tarde',
    tipoEvento: 'cumpleanos',
    nombreCliente: 'Usuario Registrado',
    email: 'usuario@example.com',
    telefono: 'N/A',
    cantidadInvitados: 50,
    notas: 'Reserva importada de base de datos',
    estado: r.statusName === "Pending" ? "pendiente" : 
            r.statusName === "Confirmed" ? "confirmada" : 
            r.statusName === "Cancelled" ? "cancelada" : "pendiente"
  }
}

export async function getDisponibilidad(year, month) {
  if (USE_MOCK) {
    await simularDelay()
    const pad = (n) => String(n).padStart(2, '0')
    const prefix = `${year}-${pad(month)}`
    const fechasOcupadas = disponibilidadMock.fechasOcupadas.filter((f) => f.startsWith(prefix))
    const fechasPendientes = disponibilidadMock.fechasPendientes.filter((f) => f.startsWith(prefix))
    return { fechasOcupadas, fechasPendientes }
  }
  const res = await api.get('/api/v1/Reservations')
  const reservations = res.data || []
  const fechasOcupadas = []
  const fechasPendientes = []
  reservations.forEach(r => {
    if (r.statusId === 2) {
      fechasOcupadas.push(r.dateReserved)
    } else if (r.statusId === 1) {
      fechasPendientes.push(r.dateReserved)
    }
  })
  return { fechasOcupadas, fechasPendientes }
}
