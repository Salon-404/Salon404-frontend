import { useState } from 'react'

/**
 * ProveedorForm — Modal de alta/edición de proveedor
 * Diseño: fondo blanco, bordes suaves #E8DDD0, acento dorado #C9913A
 */

// Opciones de rubro para el select
const RUBROS = [
  { valor: 1, etiqueta: 'DJ' },
  { valor: 2, etiqueta: 'Catering' },
  { valor: 3, etiqueta: 'Fotografía' },
  { valor: 4, etiqueta: 'Decoración' },
  { valor: 5, etiqueta: 'Animación' },
  { valor: 6, etiqueta: 'Iluminación' },
  { valor: 7, etiqueta: 'Sonido' },
]

// Opciones de estado
const ESTADOS = [
  { valor: 1, etiqueta: 'Disponible' },
  { valor: 2, etiqueta: 'Reservado' },
  { valor: 3, etiqueta: 'Inactivo' },
]

export default function ProveedorForm({ abierto, onCerrar, onGuardar, proveedorEditar, cargando }) {
  const estadoInicial = {
    name: proveedorEditar?.name || '',
    type: proveedorEditar?.type || 2,
    phone: proveedorEditar?.phone || '',
    email: proveedorEditar?.email || '',
    notas: proveedorEditar?.notas || '',
    price: proveedorEditar?.price || 0,
    status: proveedorEditar?.status || 1,
    eventId: proveedorEditar?.eventId || '',
  }

  const [formulario, setFormulario] = useState(estadoInicial)
  const [errores, setErrores] = useState({})

  const esEdicion = !!proveedorEditar

  // Manejar cambios en los inputs
  const manejarCambio = (campo, valor) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }))
    }
  }

  // Validación básica
  const validarFormulario = () => {
    const erroresNuevos = {}
    if (!formulario.name.trim()) erroresNuevos.name = 'El nombre es obligatorio'
    if (!formulario.phone.trim()) erroresNuevos.phone = 'El teléfono es obligatorio'
    if (!formulario.email.trim()) erroresNuevos.email = 'El email es obligatorio'
    if (formulario.price < 0) erroresNuevos.price = 'El precio no puede ser negativo'
    setErrores(erroresNuevos)
    return Object.keys(erroresNuevos).length === 0
  }

  // Enviar formulario
  const manejarEnvio = (e) => {
    e.preventDefault()
    if (!validarFormulario()) return
    onGuardar(formulario)
  }

  if (!abierto) return null

  /* Estilos reutilizables para inputs */
  const estiloInput = (campo) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-texto-principal bg-white focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado transition-all ${errores[campo] ? 'border-red-300' : 'border-borde'}`

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Modal */}
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden animate-fadeIn" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

        {/* Encabezado */}
        <div className="bg-crema border-b border-borde px-6 py-4 flex items-center justify-between">
          <div>
            <span className="label-seccion block mb-1">{esEdicion ? 'EDITAR' : 'NUEVO PROVEEDOR'}</span>
            <h2 className="titulo-pagina text-lg">
              {esEdicion ? 'Editar Proveedor' : 'Agregar Proveedor'}
            </h2>
          </div>
          <button
            onClick={onCerrar}
            className="text-texto-secundario hover:text-texto-principal transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-borde/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="p-6 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Nombre *</label>
            <input
              type="text"
              value={formulario.name}
              onChange={(e) => manejarCambio('name', e.target.value)}
              className={estiloInput('name')}
              placeholder="Nombre del proveedor"
            />
            {errores.name && <p className="text-red-500 text-xs mt-1">{errores.name}</p>}
          </div>

          {/* Rubro */}
          <div>
            <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Rubro</label>
            <select
              value={formulario.type}
              onChange={(e) => manejarCambio('type', Number(e.target.value))}
              className="w-full border border-borde rounded-lg px-3 py-2 text-sm text-texto-principal bg-white focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado transition-all"
            >
              {RUBROS.map(r => (
                <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
              ))}
            </select>
          </div>

          {/* Teléfono + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Teléfono *</label>
              <input
                type="tel"
                value={formulario.phone}
                onChange={(e) => manejarCambio('phone', e.target.value)}
                className={estiloInput('phone')}
                placeholder="+54 11..."
              />
              {errores.phone && <p className="text-red-500 text-xs mt-1">{errores.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Email *</label>
              <input
                type="email"
                value={formulario.email}
                onChange={(e) => manejarCambio('email', e.target.value)}
                className={estiloInput('email')}
                placeholder="email@ejemplo.com"
              />
              {errores.email && <p className="text-red-500 text-xs mt-1">{errores.email}</p>}
            </div>
          </div>

          {/* Precio + Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Precio</label>
              <input
                type="number"
                value={formulario.price}
                onChange={(e) => manejarCambio('price', Number(e.target.value))}
                className={estiloInput('price')}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errores.price && <p className="text-red-500 text-xs mt-1">{errores.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Estado</label>
              <select
                value={formulario.status}
                onChange={(e) => manejarCambio('status', Number(e.target.value))}
                className="w-full border border-borde rounded-lg px-3 py-2 text-sm text-texto-principal bg-white focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado transition-all"
              >
                {ESTADOS.map(e => (
                  <option key={e.valor} value={e.valor}>{e.etiqueta}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notas y Evento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Notas</label>
              <textarea
                value={formulario.notas}
                onChange={(e) => manejarCambio('notas', e.target.value)}
                rows={2}
                className="w-full border border-borde rounded-lg px-3 py-2 text-sm text-texto-principal bg-white focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado transition-all resize-none"
                placeholder="Observaciones adicionales..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">ID de Evento</label>
              <input
                type="number"
                value={formulario.eventId}
                onChange={(e) => manejarCambio('eventId', e.target.value ? Number(e.target.value) : '')}
                className={estiloInput('eventId')}
                placeholder="Vincular a Evento #..."
                min="1"
              />
              <p className="text-xs text-texto-secundario mt-1">Opcional: Vincular a un evento existente</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-3 border-t border-borde">
            <button
              type="button"
              onClick={onCerrar}
              className="btn-secundario text-sm"
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primario text-sm"
              disabled={cargando}
            >
              {cargando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
