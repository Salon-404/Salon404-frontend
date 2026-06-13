import { useDroppable } from '@dnd-kit/core'

export default function UnassignedDropZone({ children }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'lista-sin-asignar' })

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col flex-1 transition-all duration-150
        ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-400 ring-inset rounded-lg' : ''}
      `}
    >
      {children}
    </div>
  )
}
