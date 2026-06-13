import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useTiposEvento } from '../../hooks/useTiposEvento'
import { useEventos } from '../../hooks/useEventos'
import CalendarioEventos from '../../components/eventos/CalendarioEventos'
import UserMenu from '../../components/auth/UserMenu'

export default function CalendarioEventosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const today = new Date()
  const [year, setYear] = useState(Number(searchParams.get('year')) || today.getFullYear())
  const [month, setMonth] = useState(Number(searchParams.get('mes')) || today.getMonth() + 1)

  const { tipos, tiposById, loading: loadingTipos, error: errorTipos } = useTiposEvento()
  const { eventos, loading: loadingEventos, error: errorEventos } = useEventos(year, month)

  const loading = loadingTipos || loadingEventos
  const error = errorTipos || errorEventos

  const initialDate = `${year}-${String(month).padStart(2, '0')}-01`

  function handleMonthChange(newYear, newMonth) {
    if (newYear !== year || newMonth !== month) {
      setYear(newYear)
      setMonth(newMonth)
      setSearchParams({ year: newYear, mes: newMonth })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-wide">SALON 404</span>
        <div className="flex items-center gap-4">
          <Link to="/reservas" className="text-slate-300 hover:text-white text-sm transition-colors">
            ← Reservas
          </Link>
          <UserMenu />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Agenda de Eventos</h1>
          {/* TODO (próximo slice): implementar alta de evento */}
          <button
            disabled
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md opacity-40 cursor-not-allowed"
            title="Próximamente"
          >
            + Nuevo Evento
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 animate-pulse">
            {/* Toolbar simulada */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-200 rounded" />
                <div className="h-8 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-6 w-40 bg-slate-200 rounded" />
              <div className="h-8 w-24 bg-slate-200 rounded" />
            </div>
            {/* Cabecera de días */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-4 bg-slate-100 rounded" />
              ))}
            </div>
            {/* Filas de celdas */}
            {Array.from({ length: 5 }).map((_, row) => (
              <div key={row} className="grid grid-cols-7 gap-1 mb-1">
                {Array.from({ length: 7 }).map((_, col) => (
                  <div key={col} className="h-16 bg-slate-100 rounded" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <CalendarioEventos
                eventos={eventos}
                tiposById={tiposById}
                tipos={tipos}
                initialDate={initialDate}
                onMonthChange={handleMonthChange}
              />
            </div>

            {/* Nota de ayuda */}
            {eventos.length === 0 && !error && (
              <p className="mt-3 text-sm text-slate-400 text-center">
                No hay eventos en este mes.
              </p>
            )}

            <p className="mt-3 text-xs text-slate-400 text-center">
              Pasá el cursor sobre un día para ver los eventos de esa jornada.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
