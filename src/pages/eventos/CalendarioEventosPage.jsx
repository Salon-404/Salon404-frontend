import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTiposEvento } from '../../hooks/useTiposEvento'
import { useEventos } from '../../hooks/useEventos'
import { useAuth } from '../../context/AuthContext'
import { useCalendarRole } from '../../hooks/useCalendarRole'
import { useCalendarSummary } from '../../hooks/useCalendarSummary'
import { filtrarEventosParaVista } from '../../utils/eventos'
import CalendarioEventos from '../../components/eventos/CalendarioEventos'
import UserMenu from '../../components/auth/UserMenu'
import '../../styles/calendario.css'

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ProximoEventoCard({ diasHastaProximo, proximoEvento }) {
  if (!proximoEvento) return null

  const label = diasHastaProximo === 0
    ? 'Hoy'
    : diasHastaProximo === 1
      ? 'Mañana'
      : `En ${diasHastaProximo} días`

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
      <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
        Próximo evento
      </p>
      <p className="text-white text-lg font-bold">{label}</p>
    </div>
  )
}

function SummaryCards({ total, diasHastaProximo, proximoEvento, isAdmin }) {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
        <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
          Eventos este mes
        </p>
        <p className="text-white text-lg font-bold">{total}</p>
      </div>

      <ProximoEventoCard
        diasHastaProximo={diasHastaProximo}
        proximoEvento={proximoEvento}
      />

      {isAdmin && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
            Vista
          </p>
          <p className="text-white text-lg font-bold">Admin</p>
        </div>
      )}
    </div>
  )
}

export default function CalendarioEventosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const today = new Date()
  const [year, setYear] = useState(
    Number(searchParams.get('year')) || today.getFullYear()
  )
  const [month, setMonth] = useState(
    Number(searchParams.get('mes')) || today.getMonth() + 1
  )

  const { user } = useAuth()
  const { isAdmin, vista } = useCalendarRole(user)

  const { tipos, tiposById, loading: loadingTipos, error: errorTipos } = useTiposEvento()
  const { eventos, loading: loadingEventos, error: errorEventos } = useEventos(year, month)

  const eventosFiltrados = useMemo(
    () => filtrarEventosParaVista(eventos, vista),
    [eventos, vista]
  )

  const fechaHoy = todayStr()
  const summary = useCalendarSummary(eventos, fechaHoy)

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

      {/* Premium header with gradient */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Agenda de Eventos</h1>
          <p className="text-white/80 mt-1 text-sm">
            Descubrí los eventos que se vienen en Salón 404
          </p>

          <SummaryCards
            total={summary.total}
            diasHastaProximo={summary.diasHastaProximo}
            proximoEvento={summary.proximoEvento}
            isAdmin={isAdmin}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="salon404-calendar-card animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-200 rounded" />
                <div className="h-8 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-6 w-40 bg-slate-200 rounded" />
              <div className="h-8 w-24 bg-slate-200 rounded" />
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-4 bg-slate-100 rounded" />
              ))}
            </div>
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
            <div className="salon404-calendar-card">
              <CalendarioEventos
                eventos={eventosFiltrados}
                tiposById={tiposById}
                tipos={tipos}
                initialDate={initialDate}
                onMonthChange={handleMonthChange}
                isAdmin={isAdmin}
              />
            </div>

            {eventosFiltrados.length === 0 && !error && (
              <p className="mt-3 text-sm text-slate-400 text-center">
                No hay eventos programados este mes.
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
