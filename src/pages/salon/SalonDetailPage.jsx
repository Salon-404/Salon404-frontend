import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/global/Navbar'
import { getSalons } from '../../services/salonService'

function SalonImage({ salon }) {
  if (salon.profilePicture) {
    return (
      <img
        src={salon.profilePicture}
        alt={salon.salonName}
        className="h-80 w-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-80 w-full items-center justify-center bg-slate-200">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-indigo-600 shadow-sm">
          404
        </div>
        <p className="text-sm font-medium text-slate-500">Imagen no disponible</p>
      </div>
    </div>
  )
}

export default function SalonDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [salon, setSalon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const salones = await getSalons()
        const encontrado = salones.find((item) => String(item.salonId ?? item.id) === String(id))
        if (!cancelled) {
          if (encontrado) setSalon(encontrado)
          else setError('Salon no encontrado')
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el salon')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {loading && (
          <p className="text-center text-sm text-slate-500">Cargando salon...</p>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && salon && (
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SalonImage salon={salon} />

            <div className="p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    {salon.salonName}
                  </h1>
                  <p className="mt-2 text-slate-600">
                    {salon.description || 'Sin descripcion disponible.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/salones')}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Volver a salones
                </button>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-slate-500">Capacidad</dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-800">
                    {salon.maxCap ?? '-'} personas
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-slate-500">Direccion</dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-800">
                    {salon.address || '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
