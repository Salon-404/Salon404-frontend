import { useState, useRef, useCallback } from 'react'
import {
  FORMAS,
  GRUPOS,
  CANVAS_ANCHO_DEFAULT,
  CANVAS_ALTO_DEFAULT,
  MESA_REDONDA_DIAMETRO_DEFAULT,
  MESA_RECTANGULAR_ANCHO_DEFAULT,
  MESA_RECTANGULAR_ALTO_DEFAULT,
  CAPACIDAD_DEFAULT,
} from '../constants/mesas'
import { putLayout, deleteMesa as deleteMesaService } from '../services/mesasService'
import { nextMesaMockId } from '../mocks/mesasMock'

// Administra el estado interactivo del editor del plano.
// Usa mouse events nativos del DOM para el drag, sin librerías externas,
// porque las mesas se posicionan con CSS absoluto y no necesitan DnD accesible.
export function useFloorEditor(layoutInicial) {
  const [mesas,             setMesas]             = useState(() =>
    layoutInicial?.mesas ? JSON.parse(JSON.stringify(layoutInicial.mesas)) : []
  )
  const [mesaSeleccionadaId, setMesaSeleccionadaId] = useState(null)
  const [isSaving,          setIsSaving]           = useState(false)
  const [errorGuardar,      setErrorGuardar]       = useState(null)
  const [isEliminating,     setIsEliminating]      = useState(false)
  const [errorEliminar,     setErrorEliminar]      = useState(null)

  const canvasAncho = layoutInicial?.canvasAncho ?? CANVAS_ANCHO_DEFAULT
  const canvasAlto  = layoutInicial?.canvasAlto  ?? CANVAS_ALTO_DEFAULT

  // Ref para rastrear qué mesa se está arrastrando sin provocar re-renders en cada píxel
  const arrastrandoRef = useRef(null) // { mesaId, offsetX, offsetY }

  // Calcula si el estado actual difiere del layout original para habilitar el botón Guardar
  const isDirty = JSON.stringify(mesas) !== JSON.stringify(layoutInicial?.mesas ?? [])

  // Devuelve las dimensiones de una mesa (necesario para el clamping)
  function dimensionMesa(mesa) {
    if (mesa.forma === FORMAS.REDONDA) {
      const d = mesa.diametro ?? MESA_REDONDA_DIAMETRO_DEFAULT
      return { ancho: d, alto: d }
    }
    return {
      ancho: mesa.ancho ?? MESA_RECTANGULAR_ANCHO_DEFAULT,
      alto:  mesa.alto  ?? MESA_RECTANGULAR_ALTO_DEFAULT,
    }
  }

  // Inicia el arrastre al hacer mousedown sobre una mesa
  const handleMouseDown = useCallback((e, mesaId) => {
    const mesa = mesas.find(m => m.id === mesaId)
    if (!mesa) return
    arrastrandoRef.current = {
      mesaId,
      offsetX: e.clientX - mesa.x,
      offsetY: e.clientY - mesa.y,
    }
  }, [mesas])

  // Mueve la mesa activa mientras se arrastra, con clamping dentro del canvas
  const handleMouseMove = useCallback((e, canvasRef) => {
    if (!arrastrandoRef.current) return
    const { mesaId, offsetX, offsetY } = arrastrandoRef.current

    setMesas(prev => prev.map(mesa => {
      if (mesa.id !== mesaId) return mesa
      const { ancho, alto } = dimensionMesa(mesa)
      return {
        ...mesa,
        x: Math.max(0, Math.min(e.clientX - offsetX, canvasAncho - ancho)),
        y: Math.max(0, Math.min(e.clientY - offsetY, canvasAlto  - alto)),
      }
    }))
  }, [canvasAncho, canvasAlto])

  // Finaliza el arrastre al soltar el mouse
  const handleMouseUp = useCallback(() => {
    arrastrandoRef.current = null
  }, [])

  // Agrega una mesa nueva en una posición escalonada para que no queden superpuestas
  const agregarMesa = useCallback((forma) => {
    const offset    = mesas.length * 20
    const esRedonda = forma === FORMAS.REDONDA
    const nueva = {
      id:       nextMesaMockId(),
      nombre:   `Mesa ${mesas.length + 1}`,
      forma,
      capacidad: CAPACIDAD_DEFAULT,
      grupo:     GRUPOS.SIN_GRUPO,
      x: Math.min(50 + offset, canvasAncho - 150),
      y: Math.min(50 + offset, canvasAlto  - 120),
      ...(esRedonda
        ? { diametro: MESA_REDONDA_DIAMETRO_DEFAULT }
        : { ancho: MESA_RECTANGULAR_ANCHO_DEFAULT, alto: MESA_RECTANGULAR_ALTO_DEFAULT }
      ),
    }
    setMesas(prev => [...prev, nueva])
    setMesaSeleccionadaId(nueva.id)
  }, [mesas.length, canvasAncho, canvasAlto])

  // Actualiza campos parciales de una mesa específica (desde el panel de configuración)
  const actualizarMesa = useCallback((id, campos) => {
    setMesas(prev => prev.map(m => m.id === id ? { ...m, ...campos } : m))
  }, [])

  // Elimina una mesa. Si el backend devuelve 409, la mesa no se elimina (tiene invitados).
  const eliminarMesa = useCallback(async (id) => {
    setIsEliminating(true)
    setErrorEliminar(null)
    try {
      await deleteMesaService(id)
      setMesas(prev => prev.filter(m => m.id !== id))
      setMesaSeleccionadaId(null)
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorEliminar('Esta mesa tiene invitados asignados en reservas activas. Primero desasignalos desde la vista de asignación.')
      } else {
        setErrorEliminar('Ocurrió un error al eliminar la mesa')
      }
    } finally {
      setIsEliminating(false)
    }
  }, [])

  // Guarda el layout completo en el backend
  const guardarLayout = useCallback(async () => {
    setIsSaving(true)
    setErrorGuardar(null)
    try {
      await putLayout({ mesas, canvasAncho, canvasAlto })
    } catch {
      setErrorGuardar('No se pudo guardar el plano. Intentá de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }, [mesas, canvasAncho, canvasAlto])

  const mesaSeleccionada = mesas.find(m => m.id === mesaSeleccionadaId) ?? null

  return {
    mesas,
    mesaSeleccionada,
    canvasAncho,
    canvasAlto,
    isDirty,
    isSaving,
    errorGuardar,
    isEliminating,
    errorEliminar,
    limpiarErrorEliminar: () => setErrorEliminar(null),
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    agregarMesa,
    actualizarMesa,
    eliminarMesa,
    seleccionarMesa: setMesaSeleccionadaId,
    guardarLayout,
  }
}
