import { useState, useEffect, useCallback } from 'react'
import { getAsignaciones, createAsignacion, deleteAsignacion } from '../services/mesasService'
import { useMesas } from './useMesas'

// Administra la asignación de invitados a mesas para una reserva específica.
// Usa actualización optimista: el cambio se refleja en la UI antes de que responda el backend,
// y se hace rollback si hay un error (por ej. capacidad excedida).
export function useAsignaciones(reservaId) {
  const { layout, loading: loadingLayout } = useMesas()

  // mesasConInvitados: array de { ...mesa, invitados: [...] }
  const [mesasConInvitados, setMesasConInvitados] = useState([])
  const [sinAsignar,        setSinAsignar]        = useState([])
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState(null)
  const [errorCapacidad,    setErrorCapacidad]    = useState(null)

  // Carga las asignaciones desde el backend cuando el layout ya está disponible
  useEffect(() => {
    if (loadingLayout || !layout) return
    async function cargar() {
      setLoading(true)
      setError(null)
      try {
        const data = await getAsignaciones(reservaId)

        // Combina el layout (posiciones) con los invitados asignados de cada mesa
        const combinado = layout.mesas.map(mesa => {
          const mesaData = data.mesas.find(m => m.mesaId === mesa.id)
          const invitados = (mesaData?.invitados || []).map(inv => ({
            ...inv,
            // Guardamos el id de asignación en el invitado para poder desasignarlo luego
            _asignacionId: data.mesas
              .find(m => m.mesaId === mesa.id)?.invitados
              .find(i => i.id === inv.id)?._asignacionId ?? null,
          }))
          return { ...mesa, invitados }
        })

        setMesasConInvitados(combinado)
        setSinAsignar(data.sinAsignar)
      } catch {
        setError('No se pudieron cargar las asignaciones')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [reservaId, layout, loadingLayout])

  // Asigna un invitado a una mesa. Si el backend rechaza por capacidad, hace rollback.
  const asignarInvitado = useCallback(async (invitadoId, mesaId) => {
    // Optimistic update: mueve el invitado a la mesa antes de la respuesta del servidor
    const invitado = sinAsignar.find(i => i.id === invitadoId)
      || mesasConInvitados.flatMap(m => m.invitados).find(i => i.id === invitadoId)

    if (!invitado) return

    const snapMesas = mesasConInvitados.map(m => ({ ...m, invitados: [...m.invitados] }))
    const snapSin   = [...sinAsignar]

    // Remueve el invitado de donde estaba
    setSinAsignar(prev => prev.filter(i => i.id !== invitadoId))
    setMesasConInvitados(prev => prev.map(m => ({
      ...m,
      invitados: m.id === mesaId
        ? [...m.invitados.filter(i => i.id !== invitadoId), invitado]
        : m.invitados.filter(i => i.id !== invitadoId),
    })))

    try {
      const asignacion = await createAsignacion({ reservaId, mesaId, invitadoId })

      // Actualiza el _asignacionId del invitado en el estado para poder desasignarlo
      setMesasConInvitados(prev => prev.map(m => ({
        ...m,
        invitados: m.invitados.map(i =>
          i.id === invitadoId ? { ...i, _asignacionId: asignacion.id } : i
        ),
      })))
    } catch (err) {
      // Rollback al estado anterior
      setMesasConInvitados(snapMesas)
      setSinAsignar(snapSin)

      if (err.response?.data?.code === 'CAPACIDAD_EXCEDIDA') {
        const mesa = mesasConInvitados.find(m => m.id === mesaId)
        setErrorCapacidad({
          mesaNombre: mesa?.nombre ?? 'La mesa',
          capacidad:  err.response.data.capacidad,
          asignados:  err.response.data.asignados,
        })
      }
    }
  }, [reservaId, sinAsignar, mesasConInvitados])

  // Quita un invitado de su mesa y lo devuelve a la lista sin asignar
  const desasignarInvitado = useCallback(async (asignacionId) => {
    // Busca el invitado que tiene este asignacionId
    let invitadoLibre = null
    const snapMesas = mesasConInvitados.map(m => {
      const inv = m.invitados.find(i => i._asignacionId === asignacionId)
      if (inv) invitadoLibre = inv
      return { ...m, invitados: [...m.invitados] }
    })
    const snapSin = [...sinAsignar]

    if (!invitadoLibre) return

    // Optimistic update
    setMesasConInvitados(prev => prev.map(m => ({
      ...m,
      invitados: m.invitados.filter(i => i._asignacionId !== asignacionId),
    })))
    setSinAsignar(prev => [...prev, invitadoLibre])

    try {
      await deleteAsignacion(asignacionId)
    } catch {
      setMesasConInvitados(snapMesas)
      setSinAsignar(snapSin)
    }
  }, [mesasConInvitados, sinAsignar])

  return {
    mesasConInvitados,
    sinAsignar,
    layout,
    loading: loading || loadingLayout,
    error,
    errorCapacidad,
    limpiarErrorCapacidad: () => setErrorCapacidad(null),
    asignarInvitado,
    desasignarInvitado,
  }
}
