import { useDroppable } from '@dnd-kit/core'
import { GRUPO_COLORES, GRUPOS } from '../../constants/mesas'
import OcupacionBadge from './OcupacionBadge'
import InvitadoItem from './InvitadoItem'

// Tarjeta de mesa que actúa como área de drop para asignar invitados.
// Resalta visualmente cuando un invitado se arrastra encima.
export default function MesaDropZone({ mesa, invitados }) {
  const { setNodeRef, isOver } = useDroppable({ id: `mesa-${mesa.id}` })

  const colorClases = GRUPO_COLORES[mesa.grupo] || GRUPO_COLORES[GRUPOS.SIN_GRUPO]
  const llena       = invitados.length >= mesa.capacidad

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border-2 p-4 transition-all duration-150
        ${isOver && !llena ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white'}
        ${llena && isOver  ? 'border-red-400 bg-red-50' : ''}
      `}
    >
      {/* Encabezado de la mesa */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Indicador visual de forma */}
          <span
            className={`
              inline-flex items-center justify-center text-xs font-bold border-2
              ${colorClases}
              ${mesa.forma === 'redonda' ? 'w-7 h-7 rounded-full' : 'w-8 h-6 rounded'}
            `}
          >
            {mesa.forma === 'redonda' ? '○' : '□'}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{mesa.nombre}</p>
            <p className="text-xs text-slate-500 capitalize">{mesa.grupo.replace('_', ' ')}</p>
          </div>
        </div>
        <OcupacionBadge asignados={invitados.length} capacidad={mesa.capacidad} variante="compacto" />
      </div>

      {/* Lista de invitados asignados */}
      <div className="min-h-10 flex flex-wrap gap-1.5">
        {invitados.map(inv => {
          // Los invitados dentro de una mesa también son arrastrables (para moverlos a otra mesa)
          return (
            <InvitadoItem
              key={inv.id}
              invitado={inv}
              origen={{ mesaId: mesa.id }}
              asignacionId={inv._asignacionId}
            />
          )
        })}

        {/* Placeholder cuando la mesa está vacía */}
        {invitados.length === 0 && (
          <p className="text-xs text-slate-400 italic w-full text-center pt-1">
            {isOver ? 'Soltá acá' : 'Arrastrá invitados acá…'}
          </p>
        )}
      </div>
    </div>
  )
}
