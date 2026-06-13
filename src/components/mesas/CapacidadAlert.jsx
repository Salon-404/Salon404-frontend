// Banner de error que aparece cuando se intenta agregar un invitado a una mesa ya llena
export default function CapacidadAlert({ mesaNombre, capacidad, asignados, onCerrar }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
      <span className="text-xl leading-none select-none">⚠</span>
      <div className="flex-1">
        <p className="font-semibold text-sm">
          {mesaNombre} está llena ({asignados}/{capacidad} lugares ocupados)
        </p>
        <p className="text-xs mt-0.5">
          Mové a otro invitado a otra mesa o aumentá la capacidad desde el editor.
        </p>
      </div>
      <button
        onClick={onCerrar}
        className="text-red-400 hover:text-red-600 text-lg leading-none font-bold"
        aria-label="Cerrar alerta"
      >
        ×
      </button>
    </div>
  )
}
