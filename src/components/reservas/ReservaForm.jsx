import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { TOKEN_KEY } from '../../constants/auth'
import { successToast,errorToast } from '../../globals/toast'
import { createReservation } from '../../services/reservationService'
import { TIPOS_EVENTO, HORARIOS } from '../../constants/reservas'
import { getAvailability } from '../../services/reservationService'
import DoubleBookingAlert from './DoubleBookingAlert'
import { decodeToken } from '../../globals/decodeToken'


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

  const navigate = useNavigate();
  const [fechaOcupada, setFechaOcupada] = useState(false)
  const [checkingFecha, setCheckingFecha] = useState(false)

  const fechaWatched = watch('fecha')

  useEffect(() => {
        if (!fechaWatched) {
          setFechaOcupada(false);
          return;
        }

        let cancelled = false;
        setCheckingFecha(true);

        getAvailability()
          .then((availableDays) => {
            if (cancelled) return;

            const availableSet = new Set(availableDays);
            setFechaOcupada(!availableSet.has(fechaWatched));
          })
          .finally(() => {
            if (!cancelled) setCheckingFecha(false);
          });

        return () => {
          cancelled = true;
        };
      }, [fechaWatched]);

  async function  handleFormSubmit(data) {
    try
    {
      const token = localStorage.getItem(TOKEN_KEY);
      const tokenData = decodeToken(token)
      const payload = 
      {
        userId:tokenData.id,
        totalAmount:100000,
        dateReserved:data.fecha
      }
      await createReservation(payload);
     
      successToast("Reserva éxitosa","La reserva fue creada con éxito.");
       setTimeout(()=>navigate("/disponibilidad"),1500)
    }
    catch(error)
    {
      errorToast("Error al reservar",error?.response?.data?.message || 'No se pudo realizar la reserva.');
    }
  }

  const fechaDisplay = fechaWatched
    ? (() => { try { return format(new Date(fechaWatched + 'T12:00:00'), 'dd/MM/yyyy') } catch { return fechaWatched } })()
    : null

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

      {/* Fecha */}
      <div>
        <label className={LABEL_CLASS}>Fecha del evento</label>
        <input
          type="date"
          className={INPUT_CLASS}
          {...register('fecha', {
            required: 'La fecha es obligatoria',
          })}
        />
        {errors.fecha && (
          <p className={ERROR_CLASS}>{errors.fecha.message}</p>
        )}
      </div>

      {/* Horario */}
      <div>
        <label className={LABEL_CLASS}>Horario</label>
        <select
          className={INPUT_CLASS}
          {...register('horario', {
            required: 'El horario es obligatorio',
          })}
        >
          <option value="">Seleccioná un horario</option>
          {HORARIOS.map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>
        {errors.horario && (
          <p className={ERROR_CLASS}>{errors.horario.message}</p>
        )}
      </div>

      {/* Tipo de evento */}
      <div>
        <label className={LABEL_CLASS}>Tipo de evento</label>
        <select
          className={INPUT_CLASS}
          {...register('tipoEvento', {
            required: 'El tipo de evento es obligatorio',
          })}
        >
          <option value="">Seleccioná un tipo</option>
          {TIPOS_EVENTO.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {errors.tipoEvento && (
          <p className={ERROR_CLASS}>{errors.tipoEvento.message}</p>
        )}
      </div>

      {/* Cliente */}
      <div>
        <label className={LABEL_CLASS}>Nombre del cliente</label>
        <input
          type="text"
          placeholder='Juan Perez'
          className={INPUT_CLASS}
          {...register('nombreCliente', {
            required: 'El nombre es obligatorio',
          })}
        />
        {errors.nombreCliente && (
          <p className={ERROR_CLASS}>{errors.nombreCliente.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className={LABEL_CLASS}>Email</label>
        <input
          type="email"
          placeholder='JuanPerez@gmail.com'
          className={INPUT_CLASS}
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email inválido',
            },
          })}
        />
        {errors.email && (
          <p className={ERROR_CLASS}>{errors.email.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label className={LABEL_CLASS}>Teléfono</label>
        <input
          type="tel"
          placeholder='+54 11 2898 0098'
          className={INPUT_CLASS}
          {...register('telefono', {
            required: 'El teléfono es obligatorio',
          })}
        />
        {errors.telefono && (
          <p className={ERROR_CLASS}>{errors.telefono.message}</p>
        )}
      </div>

      {/* Invitados */}
      <div>
        <label className={LABEL_CLASS}>Invitados</label>
        <input
          type="number"
          min="1"
          placeholder='80'
          className={INPUT_CLASS}
          {...register('cantidadInvitados', {
            valueAsNumber: true,
            min: {
              value: 1,
              message: 'Debe ser al menos 1',
            },
          })}
        />
        {errors.cantidadInvitados && (
          <p className={ERROR_CLASS}>{errors.cantidadInvitados.message}</p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className={LABEL_CLASS}>Notas</label>
        <textarea
          rows={3}
          className={INPUT_CLASS}
          {...register('notas')}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting || fechaOcupada} 
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Reserva'}
        </button>
      </div>
    </form>
  )
}
