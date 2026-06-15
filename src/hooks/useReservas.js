import { useState, useEffect, useCallback } from 'react'
import { getReservas } from '../services/reservasService'
import { filtrarReservas } from '../utils/reservas'

export function useReservas() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    tipoEventoId: null,
    nombreCliente: '',
  })

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getReservas({ estado: filtros.estado })
      const filtradas = filtrarReservas(res.data, filtros)
      setReservas(filtradas)
    } catch (err) {
      setError(err.message || 'Error al cargar reservas')
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { reservas, loading, error, filtros, setFiltros, refetch: fetch }
}