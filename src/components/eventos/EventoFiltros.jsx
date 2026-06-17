import { ESTADOS_EVENTO, ESTADOS_RESERVA } from '../../constants/eventos'

const INPUT_CLASS =
  'border border-slate-300 bg-white text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function EventoFiltros({ filtros = {}, onCambiarFiltros, tiposEvento = [] }) {
  function update(key, value) {
    onCambiarFiltros({ ...filtros, [key]: value })
  }

  return (
    <div
      className="flex items-center gap-3 flex-wrap"
      data-testid="evento-filtros"
    >
      <input
        type="text"
        placeholder="Buscar por cliente..."
        value={filtros.busqueda || ''}
        onChange={(e) => update('busqueda', e.target.value)}
        className={INPUT_CLASS}
        data-testid="filtro-busqueda"
        aria-label="Buscar por cliente"
      />
      <select
        value={filtros.estadoEvento || ''}
        onChange={(e) => update('estadoEvento', e.target.value)}
        className={INPUT_CLASS}
        data-testid="filtro-estado-evento"
        aria-label="Filtrar por estado del evento"
      >
        <option value="">Todos los estados</option>
        {ESTADOS_EVENTO.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      <select
        value={filtros.estadoReserva || ''}
        onChange={(e) => update('estadoReserva', e.target.value)}
        className={INPUT_CLASS}
        data-testid="filtro-estado-reserva"
        aria-label="Filtrar por estado de la reserva"
      >
        <option value="">Todas las reservas</option>
        {ESTADOS_RESERVA.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      <select
        value={filtros.tipoEventoId || ''}
        onChange={(e) =>
          update('tipoEventoId', e.target.value ? Number(e.target.value) : null)
        }
        className={INPUT_CLASS}
        data-testid="filtro-tipo-evento"
        aria-label="Filtrar por tipo de evento"
      >
        <option value="">Todos los tipos</option>
        {tiposEvento.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={filtros.fechaDesde || ''}
        onChange={(e) => update('fechaDesde', e.target.value)}
        className={INPUT_CLASS}
        data-testid="filtro-fecha-desde"
        aria-label="Fecha desde"
      />
      <span className="text-slate-400 text-sm">a</span>
      <input
        type="date"
        value={filtros.fechaHasta || ''}
        onChange={(e) => update('fechaHasta', e.target.value)}
        className={INPUT_CLASS}
        data-testid="filtro-fecha-hasta"
        aria-label="Fecha hasta"
      />
    </div>
  )
}
