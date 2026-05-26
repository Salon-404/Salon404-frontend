import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReservaForm from '../../components/reservas/ReservaForm'
import { getReserva, updateReserva } from '../../services/reservasService'

export default function EditarReservaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [reserva, setReserva] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState(null)

  useEffect(() => {
    getReserva(id)
      .then(setReserva)
      .catch((err) => {
        if (err?.response?.status === 404) {
          setErrorCarga('No se encontró la reserva.')
        } else {
          setErrorCarga('Error al cargar la reserva.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(data) {
    setIsSubmitting(true)
    setErrorGeneral(null)
    try {
      await updateReserva(id, data)
      navigate(`/reservas/${id}`)
    } catch (err) {
      if (err?.response?.status === 409) {
        setErrorGeneral('Esa fecha ya está ocupada. Elegí otra fecha.')
      } else {
        setErrorGeneral('Ocurrió un error al guardar los cambios. Intentá de nuevo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/reservas/${id}`)}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            ← Volver al detalle
          </button>
          <h1 className="mt-3 text-2xl font-semibold text-slate-800">
            Editar Reserva {reserva ? `#${reserva.id}` : ''}
          </h1>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Cargando reserva…</p>
        )}

        {errorCarga && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorCarga}
          </div>
        )}

        {!loading && !errorCarga && reserva && (
          <>
            {errorGeneral && (
              <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorGeneral}
              </div>
            )}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <ReservaForm
                defaultValues={reserva}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
