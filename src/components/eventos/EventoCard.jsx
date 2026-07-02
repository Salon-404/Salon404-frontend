import { format, parseISO } from 'date-fns'
import { useState,useEffect } from 'react'
import EstadoEventoBadge from './EstadoEventoBadge'
import EstadoReservaBadge from './EstadoReservaBadge'
import { getSalonsName } from '../../services/salonService'
import {
  formatearMonto,
  getEventoClienteNombre,
  getEventoEstado,
  getEventoFecha,
  getEventoHoraFin,
  getEventoHoraInicio,
  getEventoInvitados,
  getEventoReserva,
  getEventoTipoId,
  getReservaEstado,
  getReservaMonto,
} from '../../utils/eventos'

function getTipoNombre(tipoEventoId, tiposById) {
  const tipo = tiposById?.[tipoEventoId]
  return tipo?.nombre ?? tipo?.name ?? `Tipo ${tipoEventoId ?? '-'}`
}

function formatFecha(fecha) {
  if (!fecha) return '-'
  try {
    return format(parseISO(fecha), 'dd/MM/yyyy', { locale: es })
  } catch {
    return fecha
  }
}

function formatHora(hora) {
  if (!hora) return '-'
  return String(hora).slice(0, 5)
}

function formatCliente(evento) {
  const nombre = getEventoClienteNombre(evento)
  if (nombre) return nombre

  return 'Sin datos de cliente'
}

export default function EventoCard({ evento, onSeleccionar, tiposById = {} }) {
  const reserva = getEventoReserva(evento)
  const estado = getEventoEstado(evento)
  const fecha = getEventoFecha(evento)
  const horaInicio = formatHora(getEventoHoraInicio(evento))
  const horaFin = formatHora(getEventoHoraFin(evento))
  const clienteNombre = formatCliente(evento)
  const tipoEventoId = getEventoTipoId(evento)
  const cantidadInvitados = getEventoInvitados(evento) ?? '-'
  const estadoReserva = getReservaEstado(reserva)
  const montoTotal = getReservaMonto(reserva)
  const hayInconsistencia = estado === 'en_curso' && estadoReserva === 'expirada'
  const [salonNombre, setSalonNombre] = useState("");

  useEffect(() => {
    async function cargarSalon() {
      if (!evento.salonId) return;

      try {
        const salones = await getSalonsName();
        const salon = salones.find((s) => s.salonId === evento.salonId);
        setSalonNombre(salon.salonName); 
      } catch (e) {
        console.error(e);
      }
    }

    cargarSalon();
  }, [evento.salonId]);

  return (
    <tr
      onClick={() => onSeleccionar(evento)}
      className="hover:bg-slate-50 cursor-pointer"
      data-testid="evento-card"
    >
      <td className="px-4 py-3 text-sm text-slate-700">
        {formatFecha(fecha)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {horaInicio}-{horaFin}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">
        {clienteNombre}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {getTipoNombre(tipoEventoId, tiposById)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {cantidadInvitados}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <EstadoEventoBadge estado={estado} />
          {hayInconsistencia && (
            <span
              className="text-yellow-600"
              title="Inconsistencia: el evento esta en curso pero la reserva expiro"
              data-testid="inconsistencia-warning"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.652 11.526c.673 1.167-.17 2.625-1.516 2.625H3.35c-1.346 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5Zm0 9a1 1 0 100-2 1 1 0 000 2Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <EstadoReservaBadge estado={estadoReserva} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-700 font-medium">
        {formatearMonto(montoTotal)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700 font-medium">
        {salonNombre}
      </td>
    </tr>
  )
}
