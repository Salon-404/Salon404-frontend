import { useState, useEffect } from 'react'
import { getDisponibilidad } from '../services/eventosService'

/**
 * Hook para obtener la disponibilidad de un día específico
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Object} { eventos, loading, error, refetch }
 */
export function useDisponibilidad(fecha) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDisponibilidad = async () => {
    if (!fecha) {
      setEventos([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getDisponibilidad(fecha)
      setEventos(data.eventos || [])
    } catch (err) {
      setError(err.message || 'Error al obtener disponibilidad')
      setEventos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDisponibilidad()
  }, [fecha])

  return {
    eventos,
    loading,
    error,
    refetch: fetchDisponibilidad,
  }
}
