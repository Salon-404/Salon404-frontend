import { useDraggable } from '@dnd-kit/core'

// Chip arrastrable que representa un invitado.
// 'origen' indica si viene de la lista sin asignar o de una mesa específica,
// lo que permite al handler de drop decidir qué acción realizar.
export default function InvitadoItem({ invitado, origen, asignacionId }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id:   `invitado-${invitado.id}`,
    data: { invitadoId: invitado.id, origen, asignacionId },
  })

  const estilo = {
    opacity: isDragging ? 0 : 1,
    cursor:  isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      {...listeners}
      {...attributes}
      className="
        flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
        bg-white border border-slate-300 text-slate-700 shadow-sm
        hover:border-indigo-400 hover:bg-indigo-50 select-none
        transition-colors
      "
    >
      <span className="text-slate-400 text-xs">⠿</span>
      {invitado.nombre}
    </div>
  )
}
