import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useAsignaciones } from '../../hooks/useAsignaciones'
import InvitadoItem from '../../components/mesas/InvitadoItem'
import MesaDropZone from '../../components/mesas/MesaDropZone'
import CapacidadAlert from '../../components/mesas/CapacidadAlert'

// Vista de asignación de invitados a mesas (solo admin).
// Panel izquierdo: lista de invitados sin asignar.
// Panel derecho: tarjetas de mesas donde se sueltan los invitados.
export default function AsignarPage() {
  const { reservaId } = useParams()

  const {
    mesasConInvitados,
    sinAsignar,
    loading,
    error,
    errorCapacidad,
    limpiarErrorCapacidad,
    asignarInvitado,
    desasignarInvitado,
  } = useAsignaciones(Number(reservaId))

  const [busqueda,        setBusqueda]        = useState('')
  const [invitadoActivo,  setInvitadoActivo]  = useState(null) // para DragOverlay

  // PointerSensor con distancia mínima de activación para evitar clicks accidentales
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const invitadosFiltrados = busqueda.trim()
    ? sinAsignar.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : sinAsignar

  function handleDragStart({ active }) {
    const invitadoId = active.data.current?.invitadoId
    const todos      = [
      ...sinAsignar,
      ...mesasConInvitados.flatMap(m => m.invitados),
    ]
    setInvitadoActivo(todos.find(i => i.id === invitadoId) ?? null)
  }

  function handleDragEnd({ active, over }) {
    setInvitadoActivo(null)
    if (!over) return

    const { invitadoId, origen, asignacionId } = active.data.current

    // Determina el ID de la mesa de destino desde el ID del droppable
    if (!over.id.toString().startsWith('mesa-')) return
    const mesaDestinoId = Number(over.id.toString().replace('mesa-', ''))

    // Evita asignar a la misma mesa de origen sin ningún efecto
    if (origen?.mesaId === mesaDestinoId) return

    if (origen?.mesaId) {
      // El invitado viene de otra mesa: primero desasignar, luego reasignar
      desasignarInvitado(asignacionId).then(() => {
        asignarInvitado(invitadoId, mesaDestinoId)
      })
    } else {
      // El invitado viene de la lista sin asignar
      asignarInvitado(invitadoId, mesaDestinoId)
    }
  }

  const totalAsignados = mesasConInvitados.reduce((acc, m) => acc + m.invitados.length, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando asignaciones…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Barra superior */}
        <header className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between shadow">
          <div className="flex items-center gap-4">
            <Link
              to={`/reservas/${reservaId}`}
              className="text-slate-300 hover:text-white text-sm"
            >
              ← Volver a la reserva
            </Link>
            <span className="text-slate-500">|</span>
            <h1 className="font-semibold text-base">Asignar invitados a mesas</h1>
          </div>
          <span className="text-slate-300 text-sm">
            {totalAsignados} asignados · {sinAsignar.length} sin asignar
          </span>
        </header>

        {/* Alerta de capacidad excedida */}
        {errorCapacidad && (
          <div className="px-6 pt-4">
            <CapacidadAlert
              mesaNombre={errorCapacidad.mesaNombre}
              capacidad={errorCapacidad.capacidad}
              asignados={errorCapacidad.asignados}
              onCerrar={limpiarErrorCapacidad}
            />
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Panel izquierdo: invitados sin asignar */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 overflow-y-auto">
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Sin asignar ({sinAsignar.length})
              </p>
              <input
                type="text"
                placeholder="Buscar invitado…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              {invitadosFiltrados.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center mt-4">
                  {busqueda ? 'Sin resultados' : 'Todos los invitados ya tienen mesa'}
                </p>
              )}
              {invitadosFiltrados.map(inv => (
                <InvitadoItem key={inv.id} invitado={inv} origen="sinAsignar" />
              ))}
            </div>

            <p className="text-xs text-slate-400 mt-3 text-center leading-snug">
              Arrastrá un invitado hacia una mesa
            </p>
          </aside>

          {/* Panel derecho: grid de mesas */}
          <main className="flex-1 overflow-y-auto p-6">
            {mesasConInvitados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p className="text-sm">El salón no tiene mesas configuradas.</p>
                <Link
                  to="/mesas/editor"
                  className="mt-2 text-indigo-600 hover:underline text-sm"
                >
                  Ir al editor para crearlas →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mesasConInvitados.map(mesa => (
                  <MesaDropZone
                    key={mesa.id}
                    mesa={mesa}
                    invitados={mesa.invitados}
                    onDesasignar={desasignarInvitado}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Ghost visual del elemento que se está arrastrando */}
      <DragOverlay>
        {invitadoActivo && (
          <div className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white shadow-lg opacity-90">
            {invitadoActivo.nombre}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
