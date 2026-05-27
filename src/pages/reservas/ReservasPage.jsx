import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReservas } from '../../services/reservasService'
import { ESTADOS_OPCIONES, MESES } from '../../constants/reservas'
import ReservaCard from '../../components/reservas/ReservaCard'

const ANIO_ACTUAL = new Date().getFullYear()
const MES_ACTUAL = new Date().getMonth() + 1

export default function ReservasPage() {
  const navigate = useNavigate()
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroMes, setFiltroMes] = useState(MES_ACTUAL)
  const [filtroAnio] = useState(ANIO_ACTUAL)

  useEffect(() => {
    setCargando(true)
    setError(null)
    getReservas({ estado: filtroEstado, mes: filtroMes, anio: filtroAnio })
      .then((res) => setReservas(res.data))
      .catch(() => setError('No se pudieron cargar las reservas.'))
      .finally(() => setCargando(false))
  }, [filtroEstado, filtroMes, filtroAnio])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Reservas</h1>
          <button
            onClick={() => navigate('/reservas/nueva')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nueva Reserva
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-slate-300 bg-white text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ESTADOS_OPCIONES.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(Number(e.target.value))}
              className="border border-slate-300 bg-white text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los meses</option>
              {MESES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label} {filtroAnio}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => navigate('/reservas/calendario')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium border border-indigo-300 hover:border-indigo-500 px-4 py-2 rounded-lg transition-colors"
          >
            Ver Calendario
          </button>
        </div>

        {/* Tabla */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Fecha
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Cliente
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tipo
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Estado
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    Cargando reservas…
                  </td>
                </tr>
              ) : reservas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    No hay reservas para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                reservas.map((r) => <ReservaCard key={r.id} reserva={r} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
