import { useState, useEffect } from 'react'
import { getDisponibilidad } from '../services/disponibilidadService'

/**
 * Hook para obtener la disponibilidad de un día específico
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Object} { reservas, loading, error, refetch }
 */
export function useDisponibilidad(fecha) {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDisponibilidad = async () => {
    if (!fecha) {
      setReservas([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getDisponibilidad(fecha)
      setReservas(data.reservas || [])
    } catch (err) {
      setError(err.message || 'Error al obtener disponibilidad')
      setReservas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDisponibilidad()
  }, [fecha])

  return {
    reservas,
    loading,
    error,
    refetch: fetchDisponibilidad,
  }
}
