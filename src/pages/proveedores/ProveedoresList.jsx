import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../../services/proveedoresService'
import ProveedorForm from './ProveedorForm'
import Navbar from '../../components/global/Navbar'

/**
 * ProveedoresList — ABM completo de proveedores
 * Diseño: fondo blanco, cards crema, acento dorado, sin fondos oscuros
 */

// Mapa de rubros
const MAPA_RUBROS = {
  1: 'DJ', 2: 'Catering', 3: 'Fotografía',
  4: 'Decoración', 5: 'Animación', 6: 'Iluminación', 7: 'Sonido',
}

// Mapa de estados con badge styles
const MAPA_ESTADOS = {
  1: { etiqueta: 'Disponible', clase: 'bg-green-50 text-green-700 border border-green-200' },
  2: { etiqueta: 'Reservado', clase: 'bg-amber-50 text-amber-700 border border-amber-200' },
  3: { etiqueta: 'Inactivo', clase: 'bg-red-50 text-red-600 border border-red-200' },
}

// Opciones filtro rubro
const OPCIONES_RUBRO = [
  { valor: '', etiqueta: 'Todos los rubros' },
  { valor: 1, etiqueta: 'DJ' }, { valor: 2, etiqueta: 'Catering' },
  { valor: 3, etiqueta: 'Fotografía' }, { valor: 4, etiqueta: 'Decoración' },
  { valor: 5, etiqueta: 'Animación' }, { valor: 6, etiqueta: 'Iluminación' },
  { valor: 7, etiqueta: 'Sonido' },
]

export default function ProveedoresList() {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRubro, setFiltroRubro] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [proveedorEditar, setProveedorEditar] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [fechaEvento, setFechaEvento] = useState('')

  useEffect(() => { cargarProveedores() }, [])

  const cargarProveedores = async () => {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await obtenerProveedores()
      const datos = respuesta.data?.data || respuesta.data || []
      setProveedores(Array.isArray(datos) ? datos : [])
    } catch {
      setError('No se pudieron cargar los proveedores. Verificá que el backend esté corriendo.')
    } finally {
      setCargando(false)
    }
  }

  // Validación de 1 semana antes del evento
  const verificarSiPuedeAgregar = () => {
    if (!fechaEvento) return true // Si no especificó fecha, le permitimos
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const limite = new Date(hoy)
    limite.setDate(limite.getDate() + 7)
    
    // Al crear new Date desde el input type="date" (YYYY-MM-DD), usa UTC, 
    // pero sumarle el timezone offset lo alinea al día local para comparar bien.
    const fechaSeleccionada = new Date(fechaEvento + 'T00:00:00')
    return fechaSeleccionada > limite
  }
  
  const puedeAgregar = verificarSiPuedeAgregar()

  // Filtrado local
  const proveedoresFiltrados = proveedores.filter(prov => {
    const coincideNombre = prov.name?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideRubro = filtroRubro === '' || prov.type === Number(filtroRubro)
    return coincideNombre && coincideRubro
  })

  const abrirCrear = () => { setProveedorEditar(null); setModalAbierto(true) }
  const abrirEditar = (prov) => { setProveedorEditar(prov); setModalAbierto(true) }

  const manejarGuardar = async (datos) => {
    setGuardando(true)
    try {
      if (proveedorEditar) {
        await actualizarProveedor(proveedorEditar.id, datos)
        Swal.fire({ icon: 'success', title: '¡Actualizado!', text: 'El proveedor fue actualizado.', confirmButtonColor: '#C9913A', timer: 2000, showConfirmButton: false })
      } else {
        await crearProveedor(datos)
        Swal.fire({ icon: 'success', title: '¡Creado!', text: 'El proveedor fue creado.', confirmButtonColor: '#C9913A', timer: 2000, showConfirmButton: false })
      }
      setModalAbierto(false); setProveedorEditar(null); cargarProveedores()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo guardar.', confirmButtonColor: '#C9913A' })
    } finally { setGuardando(false) }
  }

  const manejarEliminar = async (prov) => {
    const resultado = await Swal.fire({
      title: '¿Eliminar proveedor?',
      html: `Estás por eliminar a <strong>${prov.name}</strong>. Esta acción no se puede deshacer.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#C9913A', cancelButtonColor: '#6B5744',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
    })
    if (resultado.isConfirmed) {
      try {
        await eliminarProveedor(prov.id)
        Swal.fire({ icon: 'success', title: 'Eliminado', confirmButtonColor: '#C9913A', timer: 2000, showConfirmButton: false })
        cargarProveedores()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.', confirmButtonColor: '#C9913A' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Encabezado */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="label-seccion block mb-1">ADMINISTRACIÓN</span>
            <h1 className="titulo-pagina">Gestión de Proveedores</h1>
            <p className="subtitulo mt-1 mb-3">Administrá los proveedores de tu evento</p>
            
            {/* Simulador de fecha de evento para validación */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-amber-800">📅 Fecha de tu evento:</span>
              <input 
                type="date" 
                value={fechaEvento}
                onChange={(e) => setFechaEvento(e.target.value)}
                className="text-sm border border-amber-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            {!puedeAgregar && fechaEvento && (
              <p className="text-xs text-red-500 mt-2 font-medium">
                Solo podés agregar nuevos proveedores hasta 1 semana antes de la fecha de tu evento.
              </p>
            )}
          </div>
          <button 
            onClick={abrirCrear} 
            className="btn-primario flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!puedeAgregar}
            title={!puedeAgregar ? "No podés agregar proveedores con menos de 1 semana de anticipación" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar Proveedor
          </button>
        </div>

        {/* Buscador y filtros */}
        <div className="card-elegante p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-texto-secundario" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full border border-borde bg-white text-texto-principal text-sm rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado transition-all"
            />
          </div>
          <select
            value={filtroRubro}
            onChange={(e) => setFiltroRubro(e.target.value)}
            className="border border-borde bg-white text-texto-principal text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado transition-all"
          >
            {OPCIONES_RUBRO.map(op => (
              <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
            ))}
          </select>
          <span className="subtitulo">
            {proveedoresFiltrados.length} proveedor{proveedoresFiltrados.length !== 1 ? 'es' : ''}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-borde overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-crema border-b border-borde">
                <th className="px-5 py-3 label-seccion">Nombre</th>
                <th className="px-5 py-3 label-seccion">Rubro</th>
                <th className="px-5 py-3 label-seccion">Teléfono</th>
                <th className="px-5 py-3 label-seccion">Estado</th>
                <th className="px-5 py-3 label-seccion text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde/40">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-3 border-dorado border-t-transparent rounded-full animate-spin" />
                      <span className="subtitulo">Cargando proveedores…</span>
                    </div>
                  </td>
                </tr>
              ) : proveedoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-borde mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span className="subtitulo">No se encontraron proveedores</span>
                  </td>
                </tr>
              ) : (
                proveedoresFiltrados.map((prov) => (
                  <tr key={prov.id} className="hover:bg-crema/40 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-texto-principal">{prov.name}</span>
                      <p className="text-xs text-texto-secundario truncate max-w-[200px]">{prov.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="badge-dorado">{MAPA_RUBROS[prov.type] || 'Otro'}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-texto-principal">{prov.phone || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${MAPA_ESTADOS[prov.status]?.clase || 'bg-gray-50 text-gray-500'}`}>
                        {MAPA_ESTADOS[prov.status]?.etiqueta || 'Desconocido'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => abrirEditar(prov)} className="text-dorado hover:text-dorado-hover p-1.5 rounded-lg hover:bg-dorado/5 transition-colors" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => manejarEliminar(prov)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ProveedorForm
        abierto={modalAbierto}
        onCerrar={() => { setModalAbierto(false); setProveedorEditar(null) }}
        onGuardar={manejarGuardar}
        proveedorEditar={proveedorEditar}
        cargando={guardando}
      />
    </div>
  )
}
