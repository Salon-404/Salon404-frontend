import { useState, useEffect, useMemo } from 'react'
import { getConfigSalon, getTiposEvento } from '../services/disponibilidadService'
import { useDisponibilidad } from './useDisponibilidad'
import { calcularHorariosDisponibles } from '../utils/disponibilidad'

/**
 * Hook para calcular horarios disponibles para una fecha y tipo de evento
 * @param {string|null} fecha - Fecha en formato YYYY-MM-DD
 * @param {number|null} tipoEventoId - ID del tipo de evento
 * @returns {Object} { horarios, loading, error, configSalon, tiposEvento, refetch }
 */
export function useHorariosDisponibles(fecha, tipoEventoId) {
  const [configSalon, setConfigSalon] = useState(null)
  const [tiposEvento, setTiposEvento] = useState([])
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [error, setError] = useState(null)

  const { reservas, loading: loadingReservas } = useDisponibilidad(fecha)

  const loading = loadingConfig || loadingReservas

  const fetchConfig = async () => {
    setLoadingConfig(true)
    setError(null)

    try {
      const [config, tipos] = await Promise.all([
        getConfigSalon(),
        getTiposEvento(),
      ])
      setConfigSalon(config)
      setTiposEvento(tipos)
    } catch (err) {
      setError(err.message || 'Error al obtener configuración')
    } finally {
      setLoadingConfig(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const horarios = useMemo(() => {
    if (!fecha || !tipoEventoId || !configSalon) return []

    const tipoEvento = tiposEvento.find(t => t.id === tipoEventoId)
    if (!tipoEvento) return []

    return calcularHorariosDisponibles(fecha, tipoEvento, reservas, configSalon)
  }, [fecha, tipoEventoId, configSalon, tiposEvento, reservas])

  return {
    horarios,
    loading,
    error,
    configSalon,
    tiposEvento,
    refetch: fetchConfig,
  }
}
