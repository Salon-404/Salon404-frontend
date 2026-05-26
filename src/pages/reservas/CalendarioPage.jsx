import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getDisponibilidad } from '../../services/reservasService'
import CalendarView from '../../components/reservas/CalendarView'

export default function CalendarioPage() {
  const [searchParams] = useSearchParams()
  const today = new Date()
  const [year, setYear] = useState(Number(searchParams.get('year')) || today.getFullYear())
  const [month, setMonth] = useState(Number(searchParams.get('mes')) || today.getMonth() + 1)
  const [fechasOcupadas, setFechasOcupadas] = useState([])
  const [fechasPendientes, setFechasPendientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDisponibilidad(year, month)
      .then(({ fechasOcupadas, fechasPendientes }) => {
        setFechasOcupadas(fechasOcupadas)
        setFechasPendientes(fechasPendientes)
      })
      .catch(() => setError('No se pudo cargar la disponibilidad.'))
      .finally(() => setLoading(false))
  }, [year, month])

  function handleMonthChange(newYear, newMonth) {
    if (newYear !== year || newMonth !== month) {
      setYear(newYear)
      setMonth(newMonth)
    }
  }

  const initialDate = `${year}-${String(month).padStart(2, '0')}-01`

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-wide">SALON 404</span>
        <Link to="/reservas" className="text-slate-300 hover:text-white text-sm">
          ← Volver a Reservas
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Calendario de Disponibilidad</h1>
          <Link
            to="/reservas/nueva"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            + Nueva Reserva
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Cargando calendario...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <CalendarView
              fechasOcupadas={fechasOcupadas}
              fechasPendientes={fechasPendientes}
              initialDate={initialDate}
              onMonthChange={handleMonthChange}
            />
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400 text-center">
          Hacé clic en un día disponible para crear una nueva reserva con esa fecha precargada.
        </p>
      </main>
    </div>
  )
}
