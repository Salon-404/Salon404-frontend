import { useNavigate } from 'react-router-dom';
import { useState,useEffect,useMemo } from "react";
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Eventos</h1>
          <button
            onClick={() => navigate('/eventos/nuevo')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
            data-testid="btn-nuevo-evento"
          >
            + Nuevo Evento
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <EventoFiltros
            filtros={filtros}
            onCambiarFiltros={setFiltros}
            tiposEvento={tiposEvento}
          />
          <button
            onClick={() => navigate('/eventos/calendario')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium border border-indigo-300 hover:border-indigo-500 px-4 py-2 rounded-lg"
          >
            Ver Calendario
          </button>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 mb-4"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <p
              className="text-sm text-slate-400 py-8 text-center"
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
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Inv.
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Estado evento
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Estado reserva
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-sm text-slate-400 py-8 text-center"
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
