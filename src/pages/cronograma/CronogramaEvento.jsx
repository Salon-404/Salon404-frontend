import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { obtenerCronograma, agregarActividad, actualizarActividad, eliminarActividad } from '../../services/cronogramaService'
import Navbar from '../../components/global/Navbar'
import { decodeToken } from '../../globals/decodeToken'
import { TOKEN_KEY } from '../../constants/auth'

/**
 * CronogramaEvento — Timeline vertical del cronograma
 * Diseño: fondo blanco, línea dorada vertical, cards crema, sin fondos oscuros
 */

// Íconos por tipo de actividad
const obtenerIconoActividad = (titulo) => {
  const t = (titulo || '').toLowerCase()
  if (t.includes('apertura') || t.includes('recepción') || t.includes('bienvenida')) return '🚪'
  if (t.includes('cena') || t.includes('comida') || t.includes('almuerzo')) return '🍽️'
  if (t.includes('baile') || t.includes('fiesta') || t.includes('música')) return '💃'
  if (t.includes('ceremonia') || t.includes('brindis')) return '🥂'
  if (t.includes('foto') || t.includes('video')) return '📸'
  if (t.includes('torta') || t.includes('postre') || t.includes('dulce')) return '🎂'
  if (t.includes('juego') || t.includes('show')) return '🎭'
  if (t.includes('cierre') || t.includes('despedida')) return '🌟'
  return '📌'
}

const formularioVacio = { hora: '', titulo: '', descripcion: '' }

export default function CronogramaEvento() {
  const { id: eventoId } = useParams()

  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formulario, setFormulario] = useState(formularioVacio)
  const [actividadEditarId, setActividadEditarId] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const token = localStorage.getItem(TOKEN_KEY)
  const usuario = token ? decodeToken(token) : null
  const esAdmin = usuario?.role === 'ADMIN'

  // Datos de ejemplo
  const actividadesEjemplo = [
    { id: 1, hora: '19:30', titulo: 'Recepción de invitados', descripcion: 'Bienvenida con cocktail y música ambiental en el hall principal.' },
    { id: 2, hora: '20:00', titulo: 'Apertura del salón', descripcion: 'Ingreso al salón con presentación de la ambientación.' },
    { id: 3, hora: '20:30', titulo: 'Ceremonia / Brindis', descripcion: 'Palabras de bienvenida y brindis inicial.' },
    { id: 4, hora: '21:00', titulo: 'Cena formal', descripcion: 'Entrada, plato principal y postre servido en las mesas.' },
    { id: 5, hora: '22:30', titulo: 'Corte de torta', descripcion: 'Momento especial con torta y mesa dulce.' },
    { id: 6, hora: '23:00', titulo: 'Apertura del baile', descripcion: 'Primer baile y apertura de la pista con DJ en vivo.' },
    { id: 7, hora: '01:00', titulo: 'Show en vivo', descripcion: 'Espectáculo de banda o artista invitado.' },
    { id: 8, hora: '03:00', titulo: 'Cierre del evento', descripcion: 'Despedida y recuerdos para los invitados.' },
  ]

  useEffect(() => { cargarCronograma() }, [eventoId])

  const cargarCronograma = async () => {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await obtenerCronograma(eventoId)
      const datos = respuesta.data || []
      setActividades(Array.isArray(datos) ? datos : [])
    } catch {
      setError('No se pudo conectar con el servidor de eventos. Mostrando datos de ejemplo.')
      setActividades(actividadesEjemplo)
    } finally {
      setCargando(false)
    }
  }

  // Ordenar por hora
  const actividadesOrdenadas = [...actividades].sort((a, b) => {
    const horaA = a.hora || a.startTime || ''
    const horaB = b.hora || b.startTime || ''
    return horaA.localeCompare(horaB)
  })

  const abrirCrear = () => { setFormulario(formularioVacio); setActividadEditarId(null); setModalAbierto(true) }
  const abrirEditar = (act) => {
    setFormulario({
      hora: act.hora || act.startTime || '',
      titulo: act.titulo || act.title || '',
      descripcion: act.descripcion || act.description || '',
    })
    setActividadEditarId(act.id)
    setModalAbierto(true)
  }

  const manejarGuardar = async (e) => {
    e.preventDefault()
    if (!formulario.hora || !formulario.titulo) return
    setGuardando(true)
    try {
      if (actividadEditarId) {
        await actualizarActividad(eventoId, actividadEditarId, formulario)
      } else {
        await agregarActividad(eventoId, formulario)
      }
      setModalAbierto(false)
      cargarCronograma()
    } catch {
      if (actividadEditarId) {
        setActividades(prev => prev.map(a => a.id === actividadEditarId ? { ...a, ...formulario } : a))
      } else {
        setActividades(prev => [...prev, { id: Date.now(), ...formulario }])
      }
      setModalAbierto(false)
    } finally { setGuardando(false) }
  }

  const manejarEliminar = async (act) => {
    const resultado = await Swal.fire({
      title: '¿Eliminar actividad?',
      html: `Vas a eliminar <strong>${act.titulo || act.title}</strong> del cronograma.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#C9913A', cancelButtonColor: '#6B5744',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
    })
    if (resultado.isConfirmed) {
      try { await eliminarActividad(eventoId, act.id); cargarCronograma() }
      catch { setActividades(prev => prev.filter(a => a.id !== act.id)) }
    }
  }

  const manejarCambioFormulario = (campo, valor) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }))
  }

  /* Estilo input del modal */
  const estiloInput = "w-full border border-borde rounded-lg px-3 py-2 text-sm text-texto-principal bg-white focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado transition-all"

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="label-seccion block mb-1">EVENTO #{eventoId}</span>
            <h1 className="titulo-pagina">Cronograma del Evento</h1>
            <p className="subtitulo mt-1">Timeline de actividades programadas</p>
          </div>
          {esAdmin && (
            <button onClick={abrirCrear} className="btn-primario flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar Actividad
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {cargando ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-dorado border-t-transparent rounded-full animate-spin" />
            <span className="subtitulo">Cargando cronograma…</span>
          </div>
        ) : (
          /* Timeline vertical */
          <div className="relative">
            {/* Línea vertical dorada */}
            <div
              className="absolute left-8 top-0 bottom-0 w-0.5"
              style={{ background: 'linear-gradient(to bottom, #C9913A, rgba(201,145,58,0.3))' }}
            />

            <div className="space-y-1">
              {actividadesOrdenadas.map((actividad, indice) => {
                const hora = actividad.hora || actividad.startTime || '--:--'
                const titulo = actividad.titulo || actividad.title || 'Sin título'
                const descripcion = actividad.descripcion || actividad.description || ''
                const icono = obtenerIconoActividad(titulo)

                return (
                  <div key={actividad.id || indice} className="relative flex items-start gap-5 group py-3">
                    {/* Nodo en la línea */}
                    <div className="relative z-10 flex-shrink-0 w-16 flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-full bg-crema border-2 border-dorado flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
                        style={{ boxShadow: '0 2px 8px rgba(201,145,58,0.15)' }}
                      >
                        {icono}
                      </div>
                    </div>

                    {/* Card de actividad — borde izquierdo dorado */}
                    <div className="flex-1 card-destacada p-4 group-hover:shadow-elegante-md transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          {/* Badge hora */}
                          <span className="badge-dorado inline-flex items-center mb-2">
                            🕐 {hora}
                          </span>
                          {/* Título */}
                          <h3 className="text-sm font-semibold text-texto-principal">{titulo}</h3>
                          {/* Descripción */}
                          {descripcion && (
                            <p className="subtitulo mt-1 leading-relaxed">{descripcion}</p>
                          )}
                        </div>

                        {/* Acciones (visibles en hover) */}
                        {esAdmin && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => abrirEditar(actividad)} className="text-dorado hover:text-dorado-hover p-1.5 rounded-lg hover:bg-dorado/5 transition-colors" title="Editar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => manejarEliminar(actividad)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Vacío */}
              {actividadesOrdenadas.length === 0 && (
                <div className="text-center py-16">
                  <span className="text-4xl block mb-3">📋</span>
                  <p className="subtitulo">No hay actividades en el cronograma.</p>
                  {esAdmin && (
                    <button onClick={abrirCrear} className="mt-4 text-dorado hover:text-dorado-hover text-sm font-medium underline">
                      Agregar la primera actividad
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de actividad */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

            {/* Encabezado */}
            <div className="bg-crema border-b border-borde px-6 py-4 flex items-center justify-between">
              <div>
                <span className="label-seccion block mb-1">{actividadEditarId ? 'EDITAR' : 'NUEVA ACTIVIDAD'}</span>
                <h2 className="titulo-pagina text-lg">{actividadEditarId ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-texto-secundario hover:text-texto-principal transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-borde/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={manejarGuardar} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Hora *</label>
                <input type="time" value={formulario.hora} onChange={(e) => manejarCambioFormulario('hora', e.target.value)} className={estiloInput} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Título *</label>
                <input type="text" value={formulario.titulo} onChange={(e) => manejarCambioFormulario('titulo', e.target.value)} className={estiloInput} placeholder="Ej: Cena formal" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-texto-secundario mb-1.5 uppercase tracking-wide">Descripción</label>
                <textarea value={formulario.descripcion} onChange={(e) => manejarCambioFormulario('descripcion', e.target.value)} rows={3} className={`${estiloInput} resize-none`} placeholder="Detalles de la actividad..." />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-borde">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-secundario text-sm">Cancelar</button>
                <button type="submit" className="btn-primario text-sm" disabled={guardando}>
                  {guardando ? 'Guardando...' : actividadEditarId ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
