import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from "react";
import { useEventos } from '../../hooks/useEventos';
import EventoCard from '../../components/eventos/EventoCard';
import EventoFiltros from '../../components/eventos/EventoFiltros';
import { getAllTypes } from "../../services/eventTypeService";
import Navbar from '../../components/global/Navbar';
import { useAuth } from '../../context/AuthContext';

function getEventoKey(evento, index) {
  return (
    evento.id ||
    evento.eventId ||
    evento.reserva?.id ||
    `${evento.fecha ?? 'sin-fecha'}-${evento.horaInicio ?? 'sin-inicio'}-${evento.nombre ?? 'sin-nombre'}-${index}`
  )
}

export default function EventosPage() {
  const navigate = useNavigate()
  const { user, loading: loadingAuth } = useAuth()
  const { eventos, loading, error, filtros, setFiltros, refetch } = useEventos(
    {},
    300,
    { user, loading: loadingAuth }
  )
  const [tiposEvento, setTiposEvento] = useState([]);
  const [tipoEventoId, setTipoEventoId] = useState('');
  const [loadingTipos, setLoadingTipos] = useState(true)
  const [errorTipos, setErrorTipos] = useState(null)

  useEffect(() => {
    let cancelado = false;
    async function cargarTipos() {
      setLoadingTipos(true);
      setErrorTipos(null);
      try {
        const data = await getAllTypes();
        if (!cancelado) setTiposEvento(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelado) setErrorTipos(err.message);
      } finally {
        if (!cancelado) setLoadingTipos(false);
      }
    }
    cargarTipos();
    return () => { cancelado = true; };
  }, []);

  const tiposById = useMemo(() => {
    return tiposEvento.reduce((acc, tipo) => {
      acc[tipo.id] = tipo
      return acc
    }, {})
  }, [tiposEvento])

  function handleSeleccionar(evento) {
    const id = evento.id || evento.eventId
    if (id) navigate(`/eventos/${id}`)
  }

  return (
    <div className="min-h-screen bg-[#E6F1FB]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs tracking-widest text-[#378ADD] uppercase">
              Gestión de eventos
            </span>
            <h1 className="text-2xl font-semibold text-[#0C447C] mt-1">
              Eventos
            </h1>
          </div>
          <button
            onClick={() => navigate('/disponibilidad')}
            className="bg-[#378ADD] hover:bg-[#185FA5] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            data-testid="btn-nuevo-evento"
          >
            + Nuevo Evento
          </button>
        </div>

        {/* ── FILTROS ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <EventoFiltros
            filtros={filtros}
            onCambiarFiltros={setFiltros}
            tiposEvento={tiposEvento}
          />
          <button
            onClick={() => navigate('/eventos/calendario')}
            className="text-[#185FA5] hover:text-[#0C447C] text-sm font-medium border border-[#B5D4F4] hover:border-[#378ADD] bg-white px-4 py-2 rounded-lg transition-colors"
          >
            Ver Calendario ↗
          </button>
        </div>

        {/* ── ERROR ────────────────────────────────────────────────────── */}
        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 mb-4"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ── TABLA ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-[#B5D4F4] overflow-hidden">
          {loading ? (
            <p
              className="text-sm text-[#185FA5] py-8 text-center"
              data-testid="loading-indicator"
            >
              Cargando eventos…
            </p>
          ) : (
            <table
              className="w-full text-left"
              aria-label="Lista de eventos"
            >
              <thead>
                <tr className="bg-[#E6F1FB] border-b border-[#B5D4F4]">
                  <th className="px-4 py-3 text-xs font-semibold text-[#185FA5] uppercase tracking-wide">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#185FA5] uppercase tracking-wide">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#185FA5] uppercase tracking-wide">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#185FA5] uppercase tracking-wide">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#185FA5] uppercase tracking-wide">
                    Inv.
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#185FA5] uppercase tracking-wide">
                    Estado evento
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#185FA5] uppercase tracking-wide">
                    Estado reserva
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#185FA5] uppercase tracking-wide">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6F1FB]">
                {eventos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-sm text-slate-400 py-10 text-center"
                    >
                      No hay eventos para mostrar.
                    </td>
                  </tr>
                ) : (
                  eventos.map((evento, index) => (
                    <EventoCard
                      key={getEventoKey(evento, index)}
                      evento={evento}
                      onSeleccionar={handleSeleccionar}
                      tiposById={tiposById}
                    />
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}