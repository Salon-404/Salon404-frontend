import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReservas } from '../../hooks/useReservas'
import { updateEstado } from '../../services/reservasService'
import TablaReservas from '../../components/reservas/TablaReservas'
import FiltrosReservas from '../../components/reservas/FiltrosReservas'
import ModalDetalleReserva from '../../components/reservas/ModalDetalleReserva'
import UserMenu from '../../components/auth/UserMenu'

export default function ReservasPage() {
  const navigate = useNavigate()
  const { reservas, loading, error, filtros, setFiltros, refetch } = useReservas()
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  function handleSeleccionar(r) {
    setReservaSeleccionada(r)
    setModalAbierto(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Reservas</h1>
          <div className="flex items-center gap-3">
            <UserMenu />
            <button onClick={() => navigate('/reservas/nueva')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              + Nueva Reserva
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <FiltrosReservas filtros={filtros} onCambiarFiltros={setFiltros} />
          <button onClick={() => navigate('/reservas/calendario')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium border border-indigo-300 hover:border-indigo-500 px-4 py-2 rounded-lg">
            Ver Calendario
          </button>
          <Link
            to="/eventos/calendario"
            className="text-slate-600 hover:text-slate-800 text-sm font-medium border border-slate-300 hover:border-slate-400 px-4 py-2 rounded-lg transition-colors"
          >
            Agenda de Eventos
          </Link>
        </div>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <p className="text-sm text-slate-400 py-8 text-center">Cargando reservas…</p>
          ) : (
            <TablaReservas reservas={reservas} onSeleccionarReserva={handleSeleccionar} />
          )}
        </div>
      </div>

      <ModalDetalleReserva
        reserva={reservaSeleccionada}
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onEditar={() => { setModalAbierto(false); navigate(`/reservas/${reservaSeleccionada.id}/editar`) }}
        onCancelar={async () => {
          if (confirm('¿Cancelar esta reserva?')) {
            await updateEstado(reservaSeleccionada.id, 'cancelada')
            setModalAbierto(false)
            refetch()
          }
        }}
      />
    </div>
  )
}