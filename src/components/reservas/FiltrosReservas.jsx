import { ESTADOS_OPCIONES, TIPOS_EVENTO } from '../../constants/reservas'

export default function FiltrosReservas({ filtros, onCambiarFiltros }) {
  function update(key, value) {
    onCambiarFiltros({ ...filtros, [key]: value })
  }
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input
        type="text"
        placeholder="Buscar por cliente..."
        value={filtros.nombreCliente}
        onChange={(e) => update('nombreCliente', e.target.value)}
        className="border border-slate-300 bg-white text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select
        value={filtros.estado}
        onChange={(e) => update('estado', e.target.value)}
        className="border border-slate-300 bg-white text-slate-700 text-sm rounded-lg px-3 py-2"
      >
        {ESTADOS_OPCIONES.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
      <select
        value={filtros.tipoEventoId || ''}
        onChange={(e) => update('tipoEventoId', e.target.value ? Number(e.target.value) : null)}
        className="border border-slate-300 bg-white text-slate-700 text-sm rounded-lg px-3 py-2"
      >
        <option value="">Todos los tipos</option>
        {TIPOS_EVENTO.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <input
        type="date"
        value={filtros.fechaDesde}
        onChange={(e) => update('fechaDesde', e.target.value)}
        className="border border-slate-300 bg-white text-slate-700 text-sm rounded-lg px-3 py-2"
      />
      <span className="text-slate-400 text-sm">a</span>
      <input
        type="date"
        value={filtros.fechaHasta}
        onChange={(e) => update('fechaHasta', e.target.value)}
        className="border border-slate-300 bg-white text-slate-700 text-sm rounded-lg px-3 py-2"
      />
    </div>
  )
}