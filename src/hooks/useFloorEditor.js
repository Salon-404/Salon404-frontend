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
  ROTACION_DEFAULT,
  MESA_ANCHO_MIN,
  MESA_ALTO_MIN,
  MESA_DIAMETRO_MIN,
} from '../constants/mesas'
import { putLayout, deleteMesa as deleteMesaService } from '../services/mesasService'
import { nextMesaMockId } from '../mocks/mesasMock'

// Administra el estado interactivo del editor del plano.
// Usa mouse events nativos del DOM para drag/resize/rotate sin librerías externas.
// arrastrandoRef.current.modo distingue entre 'mover', 'redimensionar' y 'rotar'.
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

  const arrastrandoRef = useRef(null)

  const isDirty = JSON.stringify(mesas) !== JSON.stringify(layoutInicial?.mesas ?? [])

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

  // Drag: guarda posición inicial del cursor y de la mesa para calcular deltas
  const handleMouseDown = useCallback((e, mesaId) => {
    const mesa = mesas.find(m => m.id === mesaId)
    if (!mesa) return
    arrastrandoRef.current = {
      modo:         'mover',
      mesaId,
      cursorStartX: e.clientX,
      cursorStartY: e.clientY,
      mesaStartX:   mesa.x,
      mesaStartY:   mesa.y,
    }
  }, [mesas])

  // Resize: guarda el valor inicial de la dimensión a cambiar
  const handleResizeStart = useCallback((e, mesaId, campo, signo) => {
    const mesa = mesas.find(m => m.id === mesaId)
    if (!mesa) return
    const valorInicial = mesa[campo] ?? (
      campo === 'diametro' ? MESA_REDONDA_DIAMETRO_DEFAULT :
      campo === 'ancho'    ? MESA_RECTANGULAR_ANCHO_DEFAULT :
                             MESA_RECTANGULAR_ALTO_DEFAULT
    )
    arrastrandoRef.current = {
      modo:         'redimensionar',
      mesaId,
      campo,
      signo,
      valorInicial,
      cursorStartX: e.clientX,
      cursorStartY: e.clientY,
    }
  }, [mesas])

  // Rotate: calcula el centro de la mesa en coordenadas de pantalla usando el rect del canvas
  const handleRotateStart = useCallback((e, mesaId, canvasRect) => {
    const mesa = mesas.find(m => m.id === mesaId)
    if (!mesa) return
    const { ancho, alto } = dimensionMesa(mesa)
    arrastrandoRef.current = {
      modo:    'rotar',
      mesaId,
      centerX: canvasRect.left + mesa.x + ancho / 2,
      centerY: canvasRect.top  + mesa.y + alto  / 2,
    }
  }, [mesas])

  // Mouse move unificado: delega según modo activo
  // Usa delta en lugar de offset para ser agnóstico al sistema de coordenadas
  const handleMouseMove = useCallback((e) => {
    if (!arrastrandoRef.current) return
    const { modo } = arrastrandoRef.current

    if (modo === 'mover') {
      const { mesaId, cursorStartX, cursorStartY, mesaStartX, mesaStartY } = arrastrandoRef.current
      const deltaX = e.clientX - cursorStartX
      const deltaY = e.clientY - cursorStartY
      setMesas(prev => prev.map(mesa => {
        if (mesa.id !== mesaId) return mesa
        const { ancho, alto } = dimensionMesa(mesa)
        return {
          ...mesa,
          x: Math.max(0, Math.min(mesaStartX + deltaX, canvasAncho - ancho)),
          y: Math.max(0, Math.min(mesaStartY + deltaY, canvasAlto  - alto)),
        }
      }))

    } else if (modo === 'redimensionar') {
      const { mesaId, cursorStartX, cursorStartY, valorInicial, campo, signo } = arrastrandoRef.current
      const delta = (campo === 'ancho' || campo === 'diametro')
        ? e.clientX - cursorStartX
        : e.clientY - cursorStartY
      const minValor = campo === 'diametro' ? MESA_DIAMETRO_MIN
                     : campo === 'ancho'    ? MESA_ANCHO_MIN
                                            : MESA_ALTO_MIN
      const nuevoValor = Math.max(minValor, Math.round(valorInicial + delta * signo))
      setMesas(prev => prev.map(m => m.id === mesaId ? { ...m, [campo]: nuevoValor } : m))

    } else if (modo === 'rotar') {
      const { mesaId, centerX, centerY } = arrastrandoRef.current
      // +90° para que apuntar hacia arriba sea 0°
      const grados = Math.round(Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI + 90)
      setMesas(prev => prev.map(m => m.id === mesaId ? { ...m, rotacion: grados } : m))
    }
  }, [canvasAncho, canvasAlto])

  const handleMouseUp = useCallback(() => {
    arrastrandoRef.current = null
  }, [])

  const agregarMesa = useCallback((forma) => {
    const offset    = mesas.length * 20
    const esRedonda = forma === FORMAS.REDONDA
    const nueva = {
      id:       nextMesaMockId(),
      nombre:   `Mesa ${mesas.length + 1}`,
      forma,
      capacidad: CAPACIDAD_DEFAULT,
      grupo:     GRUPOS.SIN_GRUPO,
      rotacion:  ROTACION_DEFAULT,
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

  const actualizarMesa = useCallback((id, campos) => {
    setMesas(prev => prev.map(m => m.id === id ? { ...m, ...campos } : m))
  }, [])

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
    handleResizeStart,
    handleRotateStart,
    handleMouseMove,
    handleMouseUp,
    agregarMesa,
    actualizarMesa,
    eliminarMesa,
    seleccionarMesa: setMesaSeleccionadaId,
    guardarLayout,
  }
}
