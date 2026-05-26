import axios from 'axios'
import { reservasMock, disponibilidadMock } from '../mocks/reservasMock'

const USE_MOCK = true

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
  const params = {}
  if (estado) params.estado = estado
  if (mes) params.mes = mes
  if (anio) params.año = anio
  const res = await api.get('/api/reservas', { params })
  return res.data
}

export async function getReserva(id) {
  if (USE_MOCK) {
    await simularDelay()
    const reserva = reservasMock.find((r) => r.id === Number(id))
    if (!reserva) throw { response: { status: 404 } }
    return reserva
  }
  const res = await api.get(`/api/reservas/${id}`)
  return res.data
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
  const res = await api.post('/api/reservas', data)
  return res.data
}

export async function updateReserva(id, data) {
  if (USE_MOCK) {
    await simularDelay()
    const idx = reservasMock.findIndex((r) => r.id === Number(id))
    if (idx === -1) throw { response: { status: 404 } }
    reservasMock[idx] = { ...reservasMock[idx], ...data }
    return reservasMock[idx]
  }
  const res = await api.put(`/api/reservas/${id}`, data)
  return res.data
}

export async function updateEstado(id, estado) {
  if (USE_MOCK) {
    await simularDelay()
    const idx = reservasMock.findIndex((r) => r.id === Number(id))
    if (idx === -1) throw { response: { status: 404 } }
    reservasMock[idx] = { ...reservasMock[idx], estado }
    return reservasMock[idx]
  }
  const res = await api.patch(`/api/reservas/${id}/estado`, { estado })
  return res.data
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
  const res = await api.get('/api/reservas/disponibilidad', { params: { year, month } })
  return res.data
}
