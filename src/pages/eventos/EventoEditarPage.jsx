import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvento, updateEvento } from '../../services/eventosService'

const MAX_NOMBRE = 100
const MAX_DESCRIPCION = 500
const MAX_INVITADOS = 500

const INPUT_CLASS =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
const LABEL_CLASS = 'block text-sm font-medium text-slate-700 mb-1'
const CHAR_COUNT_CLASS = 'mt-1 text-xs text-slate-500 text-right'
const ERROR_TEXT_CLASS = 'mt-1 text-xs text-red-600'
const BTN_PRIMARY =
  'rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
const BTN_SECONDARY =
  'rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors'

function validarFormulario(form) {
  const errores = {}
  if (!form.nombre || !form.nombre.trim()) {
    errores.nombre = 'El nombre del evento es obligatorio'
  } else if (form.nombre.length > MAX_NOMBRE) {
    errores.nombre = `Máximo ${MAX_NOMBRE} caracteres`
  }
  if (form.cantidadInvitados === '' || form.cantidadInvitados == null) {
    errores.cantidadInvitados = 'La cantidad de invitados es obligatoria'
  } else if (Number(form.cantidadInvitados) < 1) {
    errores.cantidadInvitados = 'Debe ser un número positivo'
  } else if (Number(form.cantidadInvitados) > MAX_INVITADOS) {
    errores.cantidadInvitados = `Máximo ${MAX_INVITADOS} invitados`
  }
  if (form.descripcion && form.descripcion.length > MAX_DESCRIPCION) {
    errores.descripcion = `Máximo ${MAX_DESCRIPCION} caracteres`
  }
  return errores
}

export default function EventoEditarPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [conflictError, setConflictError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    cantidadInvitados: '',
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const data = await getEvento(id)
        if (!cancelled) {
          setEvento(data)
          setForm({
            nombre: data.nombre || '',
            descripcion: data.descripcion || '',
            cantidadInvitados: data.cantidadInvitados ?? '',
          })
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err?.response?.status === 404 ? 'Evento no encontrado' : 'Error al cargar el evento')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setConflictError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const errores = validarFormulario(form)
    setValidationErrors(errores)
    if (Object.keys(errores).length > 0) return

    setSaving(true)
    setConflictError(null)

    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        cantidadInvitados: Number(form.cantidadInvitados),
      }
      await updateEvento(id, payload)
      navigate(`/eventos/${id}`)
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflictError('Este evento fue modificado por otro usuario. Recargá la página.')
      } else {
        setConflictError('No se pudieron guardar los cambios del evento. Revisa que el backend de eventos este actualizado.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500" data-testid="loading-indicator">
          Cargando evento…
        </p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div
            className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 mb-4"
            role="alert"
            data-testid="error-indicator"
          >
            {loadError}
          </div>
          <button
            type="button"
            onClick={() => navigate('/eventos')}
            className={BTN_PRIMARY}
            data-testid="btn-volver-lista"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    )
  }

  const puedeGuardar = Object.keys(validarFormulario(form)).length === 0 && !saving

  return (
    <div className="min-h-screen bg-slate-50" data-testid="evento-editar-page">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(`/eventos/${id}`)}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4"
          data-testid="btn-volver"
        >
          ← Volver al detalle
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar evento</h1>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {conflictError && (
            <div
              className="mb-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
              data-testid="conflict-error"
            >
              {conflictError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-editar-evento">
            <div>
              <label htmlFor="nombre" className={LABEL_CLASS}>
                Nombre del evento <span className="text-red-600">*</span>
              </label>
              <input
                id="nombre"
                type="text"
                data-testid="input-nombre"
                maxLength={MAX_NOMBRE}
                className={INPUT_CLASS}
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />
              <p className={CHAR_COUNT_CLASS} data-testid="char-count-nombre">
                {form.nombre.length}/{MAX_NOMBRE}
              </p>
              {validationErrors.nombre && <p className={ERROR_TEXT_CLASS}>{validationErrors.nombre}</p>}
            </div>

            <div>
              <label htmlFor="descripcion" className={LABEL_CLASS}>
                Descripción del evento
              </label>
              <textarea
                id="descripcion"
                rows={3}
                data-testid="input-descripcion"
                maxLength={MAX_DESCRIPCION}
                className={`${INPUT_CLASS} resize-none`}
                value={form.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
              />
              <p className={CHAR_COUNT_CLASS} data-testid="char-count-descripcion">
                {form.descripcion.length}/{MAX_DESCRIPCION}
              </p>
              {validationErrors.descripcion && <p className={ERROR_TEXT_CLASS}>{validationErrors.descripcion}</p>}
            </div>

            <div>
              <label htmlFor="cantidad-invitados" className={LABEL_CLASS}>
                Cantidad de invitados <span className="text-red-600">*</span>
              </label>
              <input
                id="cantidad-invitados"
                type="number"
                data-testid="input-invitados"
                min="1"
                max={MAX_INVITADOS}
                className={INPUT_CLASS}
                value={form.cantidadInvitados}
                onChange={(e) => handleChange('cantidadInvitados', e.target.value)}
              />
              {validationErrors.cantidadInvitados && (
                <p className={ERROR_TEXT_CLASS}>{validationErrors.cantidadInvitados}</p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate(`/eventos/${id}`)}
                className={BTN_SECONDARY}
                data-testid="btn-cancelar"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!puedeGuardar}
                className={BTN_PRIMARY}
                data-testid="btn-guardar"
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
