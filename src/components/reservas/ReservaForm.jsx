import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { TIPOS_EVENTO, HORARIOS } from '../../constants/reservas'
import { getDisponibilidad } from '../../services/reservasService'
import DoubleBookingAlert from './DoubleBookingAlert'

const INPUT_CLASS =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
const LABEL_CLASS = 'block text-sm font-medium text-slate-700 mb-1'
const ERROR_CLASS = 'mt-1 text-xs text-red-600'

export default function ReservaForm({ defaultValues = {}, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues })

  const [fechaOcupada, setFechaOcupada] = useState(false)
  const [checkingFecha, setCheckingFecha] = useState(false)

  const fechaWatched = watch('fecha')

  useEffect(() => {
    if (!fechaWatched) {
      setFechaOcupada(false)
      return
    }
    // Si estamos editando y la fecha no cambió, no chequear
    if (defaultValues.fecha && fechaWatched === defaultValues.fecha) {
      setFechaOcupada(false)
      return
    }

    let cancelled = false
    setCheckingFecha(true)
    const [year, month] = fechaWatched.split('-').map(Number)

    getDisponibilidad(year, month)
      .then(({ fechasOcupadas, fechasPendientes }) => {
        if (cancelled) return
        const ocupada = [...fechasOcupadas, ...fechasPendientes].includes(fechaWatched)
        setFechaOcupada(ocupada)
      })
      .catch(() => { if (!cancelled) setFechaOcupada(false) })
      .finally(() => { if (!cancelled) setCheckingFecha(false) })

    return () => { cancelled = true }
  }, [fechaWatched, defaultValues.fecha])

  function handleFormSubmit(data) {
    if (fechaOcupada) return
    onSubmit(data)
  }

  const fechaDisplay = fechaWatched
    ? (() => { try { return format(new Date(fechaWatched + 'T12:00:00'), 'dd/MM/yyyy') } catch { return fechaWatched } })()
    : null

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-5">

      {/* Fecha */}
      <div>
        <label className={LABEL_CLASS}>Fecha del evento</label>
        <input
          type="date"
          className={INPUT_CLASS}
          {...register('fecha', { required: 'La fecha es obligatoria' })}
        />
        {errors.fecha && <p className={ERROR_CLASS}>{errors.fecha.message}</p>}
        {checkingFecha && (
          <p className="mt-1 text-xs text-slate-500">Verificando disponibilidad…</p>
        )}
        {!checkingFecha && fechaOcupada && <DoubleBookingAlert fecha={fechaDisplay} />}
      </div>

      {/* Horario */}
      <div>
        <label className={LABEL_CLASS}>Horario</label>
        <select
          className={INPUT_CLASS}
          {...register('horario', { required: 'El horario es obligatorio' })}
        >
          <option value="">Seleccioná un horario</option>
          {HORARIOS.map((h) => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>
        {errors.horario && <p className={ERROR_CLASS}>{errors.horario.message}</p>}
      </div>

      {/* Tipo de evento */}
      <div>
        <label className={LABEL_CLASS}>Tipo de evento</label>
        <select
          className={INPUT_CLASS}
          {...register('tipoEvento', { required: 'El tipo de evento es obligatorio' })}
        >
          <option value="">Seleccioná un tipo</option>
          {TIPOS_EVENTO.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {errors.tipoEvento && <p className={ERROR_CLASS}>{errors.tipoEvento.message}</p>}
      </div>

      {/* Nombre del cliente */}
      <div>
        <label className={LABEL_CLASS}>Nombre del cliente</label>
        <input
          type="text"
          placeholder="Ej: María García"
          className={INPUT_CLASS}
          {...register('nombreCliente', { required: 'El nombre es obligatorio' })}
        />
        {errors.nombreCliente && <p className={ERROR_CLASS}>{errors.nombreCliente.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className={LABEL_CLASS}>Email</label>
        <input
          type="email"
          placeholder="cliente@email.com"
          className={INPUT_CLASS}
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Ingresá un email válido',
            },
          })}
        />
        {errors.email && <p className={ERROR_CLASS}>{errors.email.message}</p>}
      </div>

      {/* Teléfono */}
      <div>
        <label className={LABEL_CLASS}>Teléfono</label>
        <input
          type="tel"
          placeholder="+54 11 1234-5678"
          className={INPUT_CLASS}
          {...register('telefono', {
            required: 'El teléfono es obligatorio',
            pattern: {
              value: /^[0-9+\s\-()]+$/,
              message: 'Solo se permiten números, +, espacios y guiones',
            },
          })}
        />
        {errors.telefono && <p className={ERROR_CLASS}>{errors.telefono.message}</p>}
      </div>

      {/* Invitados */}
      <div>
        <label className={LABEL_CLASS}>Invitados aprox.</label>
        <input
          type="number"
          min="1"
          placeholder="120"
          className={`${INPUT_CLASS} max-w-[160px]`}
          {...register('cantidadInvitados', {
            min: { value: 1, message: 'Debe ser al menos 1' },
            valueAsNumber: true,
          })}
        />
        {errors.cantidadInvitados && <p className={ERROR_CLASS}>{errors.cantidadInvitados.message}</p>}
      </div>

      {/* Notas */}
      <div>
        <label className={LABEL_CLASS}>Notas</label>
        <textarea
          rows={3}
          placeholder="Decoración, requerimientos especiales, etc."
          className={`${INPUT_CLASS} resize-none`}
          {...register('notas')}
        />
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || fechaOcupada || checkingFecha}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Guardando…' : 'Guardar Reserva'}
        </button>
      </div>
    </form>
  )
}
