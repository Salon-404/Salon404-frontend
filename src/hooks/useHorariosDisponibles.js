import { useState, useEffect, useCallback } from 'react'
import { getSalonAvailable } from '../services/eventosService'
export function useHorariosDisponibles(fecha, tipoEventoId, salonId) {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHorarios = useCallback(async () => {
    if (!fecha || !tipoEventoId || !salonId) {
      setHorarios([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getSalonAvailable(salonId, tipoEventoId, fecha)
      setHorarios(data)
      console.log('Horarios recibidos:', data) // ← log 3
    } catch (err) {
      console.error('Error en useHorariosDisponibles:', err)
      setError(err.message || 'Error al obtener horarios')
      setHorarios([])
    } finally {
      setLoading(false)
    }
  }, [fecha, tipoEventoId, salonId])

  useEffect(() => {
    fetchHorarios()
  }, [fetchHorarios])

  return { horarios, loading, error, refetch: fetchHorarios }
}