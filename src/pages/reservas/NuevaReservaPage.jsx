import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ReservaForm from '../../components/reservas/ReservaForm'
import { createReserva } from '../../services/reservasService'

export default function NuevaReservaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState(null)

  const fechaParam = searchParams.get('fecha') ?? ''

  async function handleSubmit(data) {
    setIsSubmitting(true)
    setErrorGeneral(null)
    try {
      const nueva = await createReserva(data)
      
    } catch (err) {
      if (err?.response?.status === 409) {
        setErrorGeneral('Esa fecha ya está ocupada. Elegí otra fecha.')
      } else {
        setErrorGeneral('Ocurrió un error al guardar la reserva. Intentá de nuevo.')
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
            onClick={() => navigate('/disponibilidad')}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            ← Volver a disponibilidad
          </button>
          <h1 className="mt-3 text-2xl font-semibold text-slate-800">Nueva Reserva</h1>
        </div>

        {errorGeneral && (
          <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorGeneral}
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ReservaForm
            defaultValues={{ fecha: fechaParam }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
