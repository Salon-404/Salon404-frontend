import StatusBadge from './StatusBadge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TablaReservas({ reservas, onSeleccionarReserva }) {
  if (reservas.length === 0) {
    return <p className="text-sm text-slate-400 py-8 text-center">No hay reservas para mostrar.</p>
  }
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-100 border-b border-slate-200">
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Horario</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Inv.</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {reservas.map((r) => (
          <tr key={r.id} onClick={() => onSeleccionarReserva(r)} className="hover:bg-slate-50 cursor-pointer">
            <td className="px-4 py-3 text-sm text-slate-700">{format(parseISO(r.fecha), 'dd/MM/yyyy', { locale: es })}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{r.horaInicio}–{r.horaFin}</td>
            <td className="px-4 py-3 text-sm text-slate-700">{r.nombreCliente}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{r.tipoEvento}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{r.cantidadInvitados}</td>
            <td className="px-4 py-3"><StatusBadge estado={r.estado} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}