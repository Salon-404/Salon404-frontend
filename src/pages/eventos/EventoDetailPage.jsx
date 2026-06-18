import { useEffect, useMemo, useState,useRef,useCallback} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { differenceInDays, parseISO } from 'date-fns'
import { getEvento, getSalonDiagram } from '../../services/eventosService'
import { getAllTypes } from '../../services/eventTypeService'
import { getAllEventSchedule } from '../../services/eventScheduleService'
import { getTablesByEventId } from '../../services/mesasService'
import { updateTableLayout } from '../../services/mesasService'
import { createTable } from '../../services/mesasService'
import { successToast } from '../../globals/toast'

export default function EventoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tiposEvento, setTiposEvento] = useState([])
  const [loadingTipos, setLoadingTipos] = useState(false)
  const [errorTipos, setErrorTipos] = useState(null)

  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  const [seccion, setSeccion] = useState('resumen')

  const [schedules, setSchedules] = useState([])
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [errorSchedules, setErrorSchedules] = useState(null)

  const [diagram, setDiagram] = useState(null);
  const [tables, setTables] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const containerRef = useRef(null);
  const [resizingId, setResizingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [newTable, setNewTable] = useState({
    tableName: 'Mesa Principal',
    capacity: 10,
    shapeId: 2,
    width: 20,
    height: 20,
    posX: 5,
    posY: 10
  });

const handleMouseMove = useCallback((e) => {
  if (!containerRef.current) return

  const rect = containerRef.current.getBoundingClientRect()

  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100

  setTables((prev) =>
    prev.map((t) => {
      if (t.id !== draggingId && t.id !== resizingId) return t

      // MOVIMIENTO
      if (draggingId && t.id === draggingId) {
        return {
          ...t,
          posX: Math.max(0, Math.min(100, x)),
          posY: Math.max(0, Math.min(100, y))
        }
      }

      // RESIZE
      if (resizingId && t.id === resizingId) {
        return {
          ...t,
          width: Math.max(3, x - t.posX),
          height: Math.max(3, y - t.posY)
        }
      }

      return t
    })
  )
}, [draggingId, resizingId])


const handleCreateTable = async () => {
  try {
    const mesaCreada = await createTable(id, {
      tableName: newTable.tableName,
      capacity: Number(newTable.capacity),
      shapeId: Number(newTable.shapeId),
      width: Number(newTable.width),
      height: Number(newTable.height),
      posX: Number(newTable.posX),
      posY: Number(newTable.posY)
    });

    setTables((prev) => [...prev, mesaCreada])

    setShowCreateModal(false)

    setNewTable({
      tableName: 'Mesa Principal',
      capacity: 10,
      shapeId: 2,
      width: 20,
      height: 20,
      posX: 5,
      posY: 10
    })

    successToast("Mesa creada con éxito");
  } catch (err) {
    console.error('Error creando mesa', err)
  }
}




  useEffect(() => {
  if (!id) return

  async function loadTables() {
    try {
      const res = await getTablesByEventId(id)
      setTables(res)
    } catch (e) {
      console.error(e)
    }
  }

  loadTables()
}, [id])


  useEffect(() => {
    if (!id) return;

    getSalonDiagram(id)
      .then(setDiagram)
      .catch(console.error);
  }, [id]);


const handleMouseUp = useCallback(async () => {
  const mesa = tables.find(t => t.id === (draggingId || resizingId))
  if (!mesa) return

  setDraggingId(null)
  setResizingId(null)

  try {
    await updateTableLayout(id, mesa.id, {
      posX: Number(mesa.posX),
      posY: Number(mesa.posY),
      width: Number(mesa.width),
      height: Number(mesa.height)
    })
  } catch (err) {
    console.error('Error guardando layout', err)
  }
}, [draggingId, resizingId, tables, id])



  useEffect(() => {
  let cancelado = false

  async function cargarTipos() {
    setLoadingTipos(true)
    setErrorTipos(null)

    try {
      const data = await getAllTypes()

      if (!cancelado) {
        setTiposEvento(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      if (!cancelado) {
        setErrorTipos(err.message)
      }
    } finally {
      if (!cancelado) {
        setLoadingTipos(false)
      }
    }
  }

  cargarTipos()

  return () => {
    cancelado = true
  }
}, [])

  const diasFaltantes = useMemo(() => {
  if (!evento?.eventDate) return 0

  const fechaEvento = parseISO(evento.eventDate)
  const hoy = new Date()

  const dias = differenceInDays(fechaEvento, hoy)

  return dias < 0 ? 0 : dias
}, [evento])


  const tipoEvento = useMemo(() => {
  if (!evento) return null

  return tiposEvento.find(
    t =>
      t.id === evento.eventTypeId ||
      t.eventTypeId === evento.eventTypeId
  )
}, [evento, tiposEvento])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        const data = await getEvento(id)

        if (!cancelled) {
          setEvento(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Error al cargar el evento')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (seccion !== 'cronograma') return

    let cancelado = false

    async function cargarCronograma() {
      setLoadingSchedules(true)
      setErrorSchedules(null)

      try {
        const data = await getAllEventSchedule(id)

        if (!cancelado) {
          setSchedules(Array.isArray(data) ? data : [])
        }
      } catch {
        if (!cancelado) {
          setErrorSchedules('No se pudo cargar el cronograma.')
        }
      } finally {
        if (!cancelado) {
          setLoadingSchedules(false)
        }
      }
    }

    cargarCronograma()

    return () => {
      cancelado = true
    }
  }, [id, seccion])

const toMinutesWithNextDay = (time) => {
  if (!time) return 0

  const [h, m] = time.split(':').map(Number)
  let minutes = h * 60 + m

  // Si es madrugada (00:00 a 05:59), lo consideramos día siguiente
  if (h < 6) {
    minutes += 24 * 60
  }

  return minutes
}

const schedulesOrdenados = useMemo(() => {
  return [...schedules].sort((a, b) => {
    const startDiff =
      toMinutesWithNextDay(a.startTime) -
      toMinutesWithNextDay(b.startTime)

    if (startDiff !== 0) return startDiff

    return (
      toMinutesWithNextDay(a.endTime) -
      toMinutesWithNextDay(b.endTime)
    )
  })
}, [schedules])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E6F1FB]">

      {/* HEADER */}
      <div className="bg-[#0C447C]">
        <div className="max-w-7xl mx-auto px-10 py-10">

          <button
            onClick={() => navigate('/mis-eventos')}
            className="text-[#85B7EB] text-sm mb-6 hover:underline"
          >
            ← Volver a mis eventos
          </button>

          <div className="flex justify-between items-start">

            <div>
              <span className="text-xs uppercase tracking-widest text-[#85B7EB]">
                Panel de administración
              </span>

              <h1 className="text-4xl font-semibold text-white mt-2">
                {evento.eventName}
              </h1>

              <p className="text-[#B5D4F4] mt-3">
                {diasFaltantes > 0
                  ? `Faltan ${diasFaltantes} días para tu evento`
                  : 'Tu evento es hoy'}
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <div className="text-xs text-[#85B7EB] uppercase">
                Fecha
              </div>

              <div className="text-white text-xl font-semibold mt-1">
                {evento.eventDate}
              </div>

              <div className="text-[#B5D4F4] mt-1">
                {evento.eventStart.slice(0, 5)} -{' '}
                {evento.eventFinish.slice(0, 5)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-10 py-10">

        <div className="grid grid-cols-[260px_1fr] gap-8">

          {/* SIDEBAR */}
          <aside className="bg-white rounded-3xl shadow-sm p-4 h-fit">

            <h2 className="text-[#0C447C] font-semibold mb-4">
              Administración
            </h2>

            <nav className="flex flex-col gap-2">

              <button
                onClick={() => setSeccion('resumen')}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === 'resumen'
                    ? 'bg-[#185FA5] text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Resumen
              </button>

              <button
                onClick={() => setSeccion('invitados')}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === 'invitados'
                    ? 'bg-[#185FA5] text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Invitados
              </button>

              <button
                onClick={() => setSeccion('mesas')}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === 'mesas'
                    ? 'bg-[#185FA5] text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Mesas
              </button>

              <button
                onClick={() => setSeccion('servicios')}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === 'servicios'
                    ? 'bg-[#185FA5] text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Servicios contratados
              </button>

              <button
                onClick={() => setSeccion('cronograma')}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === 'cronograma'
                    ? 'bg-[#185FA5] text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Ver cronograma
              </button>

              <button
                onClick={() => setSeccion('editar')}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === 'editar'
                    ? 'bg-[#185FA5] text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Editar cronograma
              </button>
            </nav>
          </aside>

          {/* MAIN */}
          <main>

            {/* CARDS */}
            <div className="grid md:grid-cols-4 gap-5 mb-8">

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Días restantes
                </p>

                <h3 className="text-4xl font-bold text-[#0C447C] mt-3">
                  {diasFaltantes}
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Invitados
                </p>

                <h3 className="text-4xl font-bold text-[#0C447C] mt-3">
                  {evento.estimedGuests}
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Servicios
                </p>

                <h3 className="text-4xl font-bold text-[#0C447C] mt-3">
                  {evento.providersIds.length}
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Confirmados
                </p>

                <h3 className="text-4xl font-bold text-[#0C447C] mt-3">
                  {evento.guestsIds.length}
                </h3>
              </div>
            </div>

            {/* PANEL */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">

              {seccion === 'resumen' && (
                <>
                  <h2 className="text-2xl font-semibold text-[#0C447C] mb-6">
                    Resumen del evento
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">

                    <div className="rounded-2xl bg-[#F8FBFF] p-6 border border-[#D9EAFB]">
                      <h3 className="font-semibold text-[#0C447C] mb-3">
                        Información general
                      </h3>

                      <div className="space-y-2 text-slate-600">
                        <p>
                          <strong>Evento:</strong>{' '}
                          {evento.eventName}
                        </p>

                        <p>
                          <strong>Fecha:</strong>{' '}
                          {evento.eventDate}
                        </p>

                        <p>
                          <strong>Horario:</strong>{' '}
                          {evento.eventStart.slice(0, 5)}
                          {' - '}
                          {evento.eventFinish.slice(0, 5)}
                        </p>

                        <p>
                          <strong>Invitados:</strong>{' '}
                          {evento.estimedGuests}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#F8FBFF] p-6 border border-[#D9EAFB]">
                      <h3 className="font-semibold text-[#0C447C] mb-3">
                        Próximos pasos
                      </h3>

                      <ul className="space-y-3 text-slate-600">
                        <li>• Cargar invitados.</li>
                        <li>• Organizar las mesas.</li>
                        <li>• Contratar servicios.</li>
                        <li>• Completar el cronograma.</li>
                      </ul>
                    </div>

                  </div>
                </>
              )}

              {seccion === 'invitados' && (
                <>
                  <h2 className="text-2xl font-semibold text-[#0C447C] mb-3">
                    Invitados
                  </h2>

                  <p className="text-slate-500">
                    Actualmente tenés{' '}
                    {evento.guestsIds.length} invitados registrados.
                  </p>
                </>
              )}

             {seccion === 'mesas' && (
                <>
                        
               <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-[#0C447C]">
                  Mesas
                </h2>

                <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#185FA5] text-white px-4 py-2 rounded-lg hover:bg-[#0C447C] transition">
                  Crear mesa
                </button>
                 </div>

                  <p className="text-slate-500 mb-4">
                    Vista del plano del salón.
                  </p>

            

                  <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="relative w-full h-[750px] border-2 rounded-2xl overflow-hidden bg-gray-100"
                  >
                    {!diagram ? (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        Cargando diagrama...
                      </div>
                    ) : (
                      <>
                        {/* MAPA */}
                        <img
                          src={diagram}
                          alt="Diagrama del salón"
                          className="w-full h-full object-contain"
                        />

                        {/* MESAS */}
                        {tables.map((mesa) => {
                        const width = mesa.width || 8
                        const height = mesa.height || mesa.width || 8

                        const isCircle = mesa.shapeId === 1
                        const isRect = mesa.shapeId === 2

                        return (
                          <div
                            key={mesa.id}
                            onMouseDown={() => setDraggingId(mesa.id)}
                            className="absolute flex items-center justify-center text-xs font-semibold text-white select-none cursor-move shadow-md"
                            style={{
                              left: `${mesa.posX}%`,
                              top: `${mesa.posY}%`,

                              width: `${width}%`,
                              height: `${height}%`,

                              transform: 'translate(-50%, -50%)',

                              borderRadius: isCircle ? '50%' : '12px',

                              background: 'linear-gradient(145deg, #1e6bb8, #185FA5)',
                              border: '2px solid rgba(255,255,255,0.35)',
                              boxShadow: '0 6px 15px rgba(0,0,0,0.25)'
                            }}
                          >
                            {mesa.tableName} 
                            <br />
                            {mesa.guests?.length ?? 0} / {mesa.capacity}

                            {/* RESIZE HANDLE */}
                            <div
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                setResizingId(mesa.id)
                              }}
                              className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-[#185FA5] cursor-se-resize rounded-sm"
                            />
                          </div>
                        )
                      })}
                      </>
                    )}
                  </div>

                  {showCreateModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl">
                        <h2 className="text-2xl font-semibold text-[#0C447C] mb-6">
                          Crear mesa
                        </h2>

                        <div className="space-y-4">

                          {/* Nombre */}
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                              Nombre
                            </label>
                            <input
                              type="text"
                              value={newTable.tableName}
                              onChange={(e) =>
                                setNewTable({
                                  ...newTable,
                                  tableName: e.target.value
                                })
                              }
                              className="w-full border rounded-xl px-4 py-2"
                            />
                          </div>

                          {/* Capacidad */}
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                              Capacidad
                            </label>
                            <input
                              type="number"
                              value={newTable.capacity}
                              onChange={(e) =>
                                setNewTable({
                                  ...newTable,
                                  capacity: Number(e.target.value)
                                })
                              }
                              className="w-full border rounded-xl px-4 py-2"
                            />
                          </div>

                          {/* Forma */}
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                              Forma
                            </label>

                            <select
                              value={newTable.shapeId}
                              onChange={(e) =>
                                setNewTable({
                                  ...newTable,
                                  shapeId: Number(e.target.value)
                                })
                              }
                              className="w-full border rounded-xl px-4 py-2"
                            >
                              <option value={1}>Circular</option>
                              <option value={2}>Rectangular</option>
                            </select>
                          </div>

                          {/* Tamaño */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">
                                Ancho (%)
                              </label>

                              <input
                                type="number"
                                value={newTable.width}
                                onChange={(e) =>
                                  setNewTable({
                                    ...newTable,
                                    width: Number(e.target.value)
                                  })
                                }
                                className="w-full border rounded-xl px-4 py-2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">
                                Alto (%)
                              </label>

                              <input
                                type="number"
                                value={newTable.height}
                                onChange={(e) =>
                                  setNewTable({
                                    ...newTable,
                                    height: Number(e.target.value)
                                  })
                                }
                                className="w-full border rounded-xl px-4 py-2"
                              />
                            </div>
                          </div>

                          {/* Posición */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">
                                Posición X (%)
                              </label>

                              <input
                                type="number"
                                value={newTable.posX}
                                onChange={(e) =>
                                  setNewTable({
                                    ...newTable,
                                    posX: Number(e.target.value)
                                  })
                                }
                                className="w-full border rounded-xl px-4 py-2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">
                                Posición Y (%)
                              </label>

                              <input
                                type="number"
                                value={newTable.posY}
                                onChange={(e) =>
                                  setNewTable({
                                    ...newTable,
                                    posY: Number(e.target.value)
                                  })
                                }
                                className="w-full border rounded-xl px-4 py-2"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3 mt-8">
                          <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 rounded-xl border border-slate-300"
                          >
                            Cancelar
                          </button>

                          <button
                            onClick={() => {
                              handleCreateTable();
                              setShowCreateModal(false)
                            }}
                            className="bg-[#185FA5] text-white px-5 py-2 rounded-xl hover:bg-[#0C447C]"
                          >
                            Crear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {seccion === 'servicios' && (
                <>
                  <h2 className="text-2xl font-semibold text-[#0C447C] mb-3">
                    Servicios contratados
                  </h2>

                  <p className="text-slate-500">
                    Tenés {evento.providersIds.length} servicios asociados.
                  </p>
                </>
              )}

              {seccion === 'cronograma' && (
                <>
                  <h2 className="text-2xl font-semibold text-[#0C447C] mb-6">
                    Cronograma del evento
                  </h2>

                  {loadingSchedules ? (
                    <p className="text-slate-500">
                      Cargando cronograma...
                    </p>
                  ) : errorSchedules ? (
                    <p className="text-red-500">
                      {errorSchedules}
                    </p>
                  ) : schedulesOrdenados.length === 0 ? (
                    <p className="text-slate-500">
                      El evento todavía no tiene actividades programadas.
                    </p>
                  ) : (
                    <div className="relative ml-4 border-l-2 border-[#B5D4F4] pl-8 space-y-8">
                      {schedulesOrdenados.map((actividad) => (
                        <div
                          key={actividad.id}
                          className="relative"
                        >
                          <div className="absolute -left-[42px] top-1 h-5 w-5 rounded-full bg-[#185FA5] border-4 border-[#E6F1FB]" />

                          <div className="bg-white rounded-2xl border border-[#D6E8F8] shadow-sm p-5">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-[#0C447C] text-lg">
                                {actividad.title}
                              </h3>

                              <span className="text-sm font-medium text-[#185FA5] bg-[#E6F1FB] px-3 py-1 rounded-full">
                                {actividad.startTime.slice(0, 5)} -{' '}
                                {actividad.endTime.slice(0, 5)}
                              </span>
                            </div>

                            <p className="text-slate-600 text-sm">
                              {actividad.description}
                            </p>

                            {actividad.providers?.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs uppercase text-slate-400 mb-2">
                                  Proveedores
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {actividad.providers.map((p) => (
                                    <span
                                      key={p.id}
                                      className="bg-[#E6F1FB] text-[#185FA5] text-xs px-3 py-1 rounded-full"
                                    >
                                      {p.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {seccion === 'editar' && (
                <>
                  <h2 className="text-2xl font-semibold text-[#0C447C] mb-3">
                    Editar cronograma
                  </h2>

                  <p className="text-slate-500">
                    Desde aquí podrás agregar actividades,
                    horarios y responsables.
                  </p>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}