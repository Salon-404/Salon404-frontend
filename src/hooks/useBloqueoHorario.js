import { useState, useEffect, useRef, useCallback } from 'react'
import { bloquearHorario, liberarHorario } from '../services/disponibilidadService'

const DURACION_BLOQUEO_SEGUNDOS = 600
const TICK_INTERVAL_MS = 1000

/**
 * Hook para gestionar el bloqueo temporal de un horario (como asiento de cine)
 * @returns {Object} { reservaTemporal, segundosRestantes, bloqueando, error, bloquear, liberar }
 */
export function useBloqueoHorario() {
  const [reservaTemporal, setReservaTemporal] = useState(null)
  const [segundosRestantes, setSegundosRestantes] = useState(0)
  const [bloqueando, setBloqueando] = useState(false)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const onExpireRef = useRef(null)

  const limpiarIntervalo = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const iniciarCountdown = useCallback((expirationAt) => {
    limpiarIntervalo()

    const expiracion = new Date(expirationAt).getTime()

    const calcularRestantes = () => {
      const ahora = Date.now()
      const restantes = Math.max(0, Math.ceil((expiracion - ahora) / 1000))
      return restantes
    }

    setSegundosRestantes(calcularRestantes())

    intervalRef.current = setInterval(() => {
      const restantes = calcularRestantes()
      setSegundosRestantes(restantes)

      if (restantes <= 0) {
        limpiarIntervalo()
        const reservaActual = reservaTemporalRef.current
        if (reservaActual) {
          liberarHorario(reservaActual.id).catch(() => {})
        }
        setReservaTemporal(null)
        setSegundosRestantes(0)
        if (onExpireRef.current) {
          onExpireRef.current()
        }
      }
    }, TICK_INTERVAL_MS)
  }, [limpiarIntervalo])

  const reservaTemporalRef = useRef(null)

  useEffect(() => {
    reservaTemporalRef.current = reservaTemporal
  }, [reservaTemporal])

  useEffect(() => {
    return () => limpiarIntervalo()
  }, [limpiarIntervalo])

  /**
   * Bloquea un horario temporalmente
   * @param {Object} datos - { fecha, horaInicio, horaFin, tipoEventoId }
   * @param {Function} [onExpire] - Callback cuando expira el bloqueo
   * @returns {Promise<Object|null>} Reserva temporal o null si falla
   */
  const bloquear = async (datos, onExpire) => {
    if (bloqueando || reservaTemporal) return null

    onExpireRef.current = onExpire || null
    setBloqueando(true)
    setError(null)

    try {
      const resultado = await bloquearHorario(datos)
      setReservaTemporal(resultado)
      iniciarCountdown(resultado.expirationAt)
      return resultado
    } catch (err) {
      setError(err.message || 'Error al bloquear horario')
      return null
    } finally {
      setBloqueando(false)
    }
  }

  /**
   * Libera el horario bloqueado manualmente
   */
  const liberar = async () => {
    if (!reservaTemporal) return

    limpiarIntervalo()

    try {
      await liberarHorario(reservaTemporal.id)
    } catch {
      // silently ignore
    }

    setReservaTemporal(null)
    setSegundosRestantes(0)
  }

  return {
    reservaTemporal,
    segundosRestantes,
    bloqueando,
    error,
    bloquear,
    liberar,
  }
}
