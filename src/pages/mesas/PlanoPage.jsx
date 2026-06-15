import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import MesaShape from '../../components/mesas/MesaShape'
import { getPlano } from '../../services/mesasService'
import { getEventoPorReservaId } from '../../services/eventosService'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants/auth'
import UserMenu from '../../components/auth/UserMenu'

export default function PlanoPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === ROLES.ADMIN
  const [searchParams]           = useSearchParams()
  const reservaParam             = searchParams.get('reserva')
  const reservaId                = reservaParam || 'res-001'

  const [plano,    setPlano]     = useState(null)
  const [loading,  setLoading]   = useState(true)
  const [error,    setError]     = useState(null)
  const [mesaOpen, setMesaOpen]  = useState(null) // mesa seleccionada para ver invitados
  const [evento,   setEvento]    = useState(null)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      try {
        const data = await getPlano(reservaId)
        setPlano(data)
      } catch {
        setError('No se pudo cargar el plano del salón')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [reservaId])

  useEffect(() => {
    if (!reservaParam) return
    getEventoPorReservaId(reservaId).then(setEvento).catch(() => {})
  }, [reservaId, reservaParam])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando plano del salón…</p>
      </div>
    )
  }

  if (error || !plano) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600">{error || 'Error al cargar el plano'}</p>
      </div>
    )
  }

  const { layout, ocupacion } = plano
  const totalAsignados = ocupacion.reduce((acc, o) => acc + o.asignados, 0)
  const totalCapacidad = ocupacion.reduce((acc, o) => acc + o.capacidad, 0)

  // Busca la ocupación (con lista de invitados) de una mesa específica
  function ocupacionDe(mesaId) {
    return ocupacion.find(o => o.mesaId === mesaId)
  }

  const mesaSeleccionada = mesaOpen
    ? layout.mesas.find(m => m.id === mesaOpen)
    : null
  const ocSeleccionada = mesaOpen ? ocupacionDe(mesaOpen) : null

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Distribución de mesas</h1>
            {evento ? (
              <p className="text-sm text-slate-500 mt-0.5">
                Evento #{evento.reserva?.id ?? evento.id} — {evento.cliente?.nombre} · Hacé click en una mesa para ver los invitados
              </p>
            ) : (
              <p className="text-sm text-slate-500 mt-0.5">Hacé click en una mesa para ver los invitados</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={evento ? `/eventos/${evento.id}` : '/eventos'}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {evento ? '← Volver al evento' : '← Volver a eventos'}
            </Link>
            {isAdmin && (
              <Link
                to="/mesas/editor"
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Editar plano
              </Link>
            )}
            <UserMenu />
          </div>
        </div>

        {/* Canvas del plano */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-auto">
          <div
            className="relative bg-slate-50 rounded-lg border-2 border-dashed border-slate-300"
            style={{ width: layout.canvasAncho, height: layout.canvasAlto }}
          >
            {layout.mesas.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-400 text-sm">El salón aún no tiene mesas configuradas</p>
              </div>
            )}

            {layout.mesas.map(mesa => (
              <MesaShape
                key={mesa.id}
                mesa={mesa}
                seleccionada={mesaOpen === mesa.id}
                ocupacion={ocupacionDe(mesa.id)}
                onClick={() => setMesaOpen(mesaOpen === mesa.id ? null : mesa.id)}
              />
            ))}
          </div>
        </div>

        {/* Resumen de ocupación */}
        <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
          <span>{layout.mesas.length} {layout.mesas.length === 1 ? 'mesa' : 'mesas'}</span>
          <span>·</span>
          <span>{totalAsignados}/{totalCapacidad} lugares asignados</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded-full border-2 border-slate-400 bg-slate-200" />
            Redonda
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-5 h-3.5 rounded border-2 border-slate-400 bg-slate-200" />
            Rectangular
          </span>
        </div>

        {/* Panel de invitados de la mesa seleccionada */}
        {mesaSeleccionada && ocSeleccionada && (
          <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">
                {mesaSeleccionada.nombre}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({ocSeleccionada.asignados}/{ocSeleccionada.capacidad} lugares)
                </span>
              </h2>
              <button
                onClick={() => setMesaOpen(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none font-bold"
              >
                ×
              </button>
            </div>

            {ocSeleccionada.invitados?.length === 0 ? (
              <p className="text-sm text-slate-400">Ningún invitado asignado aún</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {ocSeleccionada.invitados?.map(inv => (
                  <li
                    key={inv.id}
                    className="text-sm bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700"
                  >
                    {inv.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
