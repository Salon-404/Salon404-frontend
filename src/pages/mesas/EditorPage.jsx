import { useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMesas } from '../../hooks/useMesas'
import { useFloorEditor } from '../../hooks/useFloorEditor'
import MesaShape from '../../components/mesas/MesaShape'
import MesaConfigPanel from '../../components/mesas/MesaConfigPanel'
import { FORMAS } from '../../constants/mesas'
import UserMenu from '../../components/auth/UserMenu'

// Editor visual del plano del salón (solo admin).
// El admin puede agregar, mover, redimensionar y rotar mesas sobre un canvas libre.
// Los cambios se guardan explícitamente con el botón "Guardar".
export default function EditorPage() {
  const { layout, loading, error } = useMesas()

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen mensaje={error} />

  return <EditorCanvas layoutInicial={layout} />
}

function EditorCanvas({ layoutInicial }) {
  const canvasRef = useRef(null)

  const {
    mesas,
    mesaSeleccionada,
    canvasAncho,
    canvasAlto,
    isDirty,
    isSaving,
    errorGuardar,
    isEliminating,
    errorEliminar,
    limpiarErrorEliminar,
    handleMouseDown,
    handleResizeStart,
    handleRotateStart,
    handleMouseMove,
    handleMouseUp,
    agregarMesa,
    actualizarMesa,
    eliminarMesa,
    seleccionarMesa,
    guardarLayout,
  } = useFloorEditor(layoutInicial)

  // Listeners globales: drag/resize/rotate siguen funcionando si el mouse sale del canvas
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup',   handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup',   handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Avisa al usuario si intenta cerrar la pestaña con cambios sin guardar
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Inyecta el rect del canvas al handleRotateStart para calcular el centro en coordenadas de pantalla
  const onRotateStart = useCallback((e, mesaId) => {
    if (!canvasRef.current) return
    handleRotateStart(e, mesaId, canvasRef.current.getBoundingClientRect())
  }, [handleRotateStart])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra superior */}
      <header className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-4">
          <Link to="/mesas" className="text-slate-300 hover:text-white text-sm">
            ← Ver plano
          </Link>
          <span className="text-slate-500">|</span>
          <h1 className="font-semibold text-base">Editor de mesas</h1>
        </div>
        <div className="flex items-center gap-3">
          {errorGuardar && (
            <span className="text-red-300 text-xs">{errorGuardar}</span>
          )}
          {isDirty && !isSaving && (
            <span className="text-yellow-300 text-xs">Cambios sin guardar</span>
          )}
          <button
            onClick={guardarLayout}
            disabled={!isDirty || isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            {isSaving ? 'Guardando…' : 'Guardar layout'}
          </button>
          <UserMenu />
        </div>
      </header>

      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Panel lateral */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col gap-4 p-4 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Agregar mesa
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => agregarMesa(FORMAS.REDONDA)}
                className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-lg leading-none">○</span>
                Mesa redonda
              </button>
              <button
                onClick={() => agregarMesa(FORMAS.RECTANGULAR)}
                className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-lg leading-none">□</span>
                Mesa rectangular
              </button>
            </div>
          </div>

          {mesaSeleccionada && (
            <MesaConfigPanel
              mesa={mesaSeleccionada}
              onChange={(campos) => actualizarMesa(mesaSeleccionada.id, campos)}
              onEliminar={eliminarMesa}
              onCerrar={() => seleccionarMesa(null)}
              isEliminating={isEliminating}
              errorEliminar={errorEliminar}
              onLimpiarError={limpiarErrorEliminar}
            />
          )}

          {!mesaSeleccionada && mesas.length > 0 && (
            <p className="text-xs text-slate-400 text-center mt-4">
              Hacé click en una mesa para configurarla
            </p>
          )}
        </aside>

        {/* Canvas del plano */}
        <main className="flex-1 overflow-auto p-6 flex items-start justify-center">
          <div>
            <div
              ref={canvasRef}
              className="relative bg-white border-2 border-dashed border-slate-300 rounded-xl shadow-inner"
              style={{ width: canvasAncho, height: canvasAlto }}
            >
              {mesas.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                  <span className="text-5xl mb-3">○ □</span>
                  <p className="text-sm font-medium">Empezá agregando las primeras mesas</p>
                  <p className="text-xs mt-1">Usá el panel de la izquierda</p>
                </div>
              )}

              {mesas.map(mesa => (
                <MesaShape
                  key={mesa.id}
                  mesa={mesa}
                  seleccionada={mesaSeleccionada?.id === mesa.id}
                  onClick={(m) => seleccionarMesa(m.id)}
                  onMouseDown={handleMouseDown}
                  onResizeStart={handleResizeStart}
                  onRotateStart={onRotateStart}
                />
              ))}
            </div>

            <p className="text-xs text-slate-400 mt-2 text-center">
              {mesas.length} {mesas.length === 1 ? 'mesa' : 'mesas'}
              {' · '}
              Arrastrás para mover · Seleccioná para redimensionar y rotar
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Cargando editor…</p>
    </div>
  )
}

function ErrorScreen({ mensaje }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-red-600">{mensaje}</p>
    </div>
  )
}
