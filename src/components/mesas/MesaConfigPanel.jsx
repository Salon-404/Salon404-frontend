import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FORMAS, GRUPOS_OPCIONES } from '../../constants/mesas'

// Panel lateral del editor para configurar nombre, capacidad, grupo y forma de una mesa.
// Llama onChange en cada cambio para actualizar el canvas en tiempo real.
export default function MesaConfigPanel({
  mesa,
  onChange,
  onEliminar,
  onCerrar,
  isEliminating,
  errorEliminar,
  onLimpiarError,
}) {
  const { register, reset, watch } = useForm({ defaultValues: mesa })

  // Cuando la mesa seleccionada cambia, recarga el formulario con sus valores
  useEffect(() => { reset(mesa) }, [mesa?.id, reset])

  // Propaga cada cambio al estado del editor sin necesidad de submit
  useEffect(() => {
    const sub = watch((valores) => {
      onChange({
        ...valores,
        capacidad: Number(valores.capacidad),
      })
    })
    return () => sub.unsubscribe()
  }, [watch, onChange])

  const [confirmarEliminar, setConfirmarEliminar] = [
    watch('_confirmarEliminar'),
    (v) => {},
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 text-sm">Configurar mesa</h2>
        <button
          onClick={onCerrar}
          className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold"
          aria-label="Cerrar panel"
        >
          ×
        </button>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
        <input
          {...register('nombre')}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Mesa 1"
        />
      </div>

      {/* Capacidad */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Capacidad (personas)</label>
        <input
          {...register('capacidad', { min: 1, max: 50 })}
          type="number"
          min={1}
          max={50}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Grupo */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Grupo</label>
        <select
          {...register('grupo')}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {GRUPOS_OPCIONES.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </div>

      {/* Forma */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Forma</label>
        <select
          {...register('forma')}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value={FORMAS.REDONDA}>○ Redonda</option>
          <option value={FORMAS.RECTANGULAR}>□ Rectangular</option>
        </select>
      </div>

      {/* Error al eliminar */}
      {errorEliminar && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {errorEliminar}
          <button onClick={onLimpiarError} className="ml-2 underline">Entendido</button>
        </div>
      )}

      {/* Botón eliminar con confirmación inline */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => onEliminar(mesa.id)}
          disabled={isEliminating}
          className="w-full text-sm text-red-600 hover:text-red-800 hover:bg-red-50 font-medium py-2 rounded-md border border-red-200 transition-colors disabled:opacity-50"
        >
          {isEliminating ? 'Eliminando…' : 'Eliminar mesa'}
        </button>
      </div>
    </div>
  )
}
