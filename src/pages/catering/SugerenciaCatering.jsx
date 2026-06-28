import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { obtenerSugerenciasCatering } from '../../services/proveedoresService'
import Navbar from '../../components/global/Navbar'

/**
 * SugerenciaCatering — 3 cards comparativas de catering
 * Diseño: fondo blanco, cards crema, acento dorado en bordes y badges
 */

// Configuración visual por nivel
const CONFIGURACION_NIVELES = {
  bajo: {
    titulo: 'Opción Básica',
    subtitulo: 'Ideal para eventos íntimos',
    icono: '🍽️',
    badgeTexto: 'NIVEL BAJO',
    destacado: false,
  },
  medio: {
    titulo: 'Opción Media',
    subtitulo: 'El equilibrio perfecto',
    icono: '🥂',
    badgeTexto: 'NIVEL MEDIO',
    destacado: true,
  },
  alto: {
    titulo: 'Opción Premium',
    subtitulo: 'Experiencia gastronómica de lujo',
    icono: '✨',
    badgeTexto: 'NIVEL ALTO',
    destacado: false,
  },
}

export default function SugerenciaCatering() {
  const { id: eventoId } = useParams()
  const [sugerencias, setSugerencias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [nivelSeleccionado, setNivelSeleccionado] = useState(null)

  useEffect(() => {
    cargarSugerencias();
    // Cargar nivel de catering preseleccionado de localStorage
    const savedLevel = localStorage.getItem(`catering_evento_${eventoId}`);
    if (savedLevel) {
      setNivelSeleccionado(savedLevel);
    }
  }, [eventoId])

  const cargarSugerencias = async () => {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await obtenerSugerenciasCatering()
      const datos = respuesta.data || []
      setSugerencias(Array.isArray(datos) ? datos : [])
    } catch (err) {
      console.warn("Backend suggestions endpoint not found, using frontend mockup:", err);
      setSugerencias([]);
    } finally {
      setCargando(false)
    }
  }

  const manejarSeleccionar = async (sugerencia) => {
    // Confirmación visual
    const resultado = await Swal.fire({
      title: 'Confirmar selección',
      html: `¿Querés seleccionar la <strong>${sugerencia.titulo || CONFIGURACION_NIVELES[sugerencia.nivel].titulo}</strong> para el evento #${eventoId}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#C9913A',
      cancelButtonColor: '#6B5744',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    })

    if (resultado.isConfirmed) {
      // Guardar selección en localStorage
      localStorage.setItem(`catering_evento_${eventoId}`, sugerencia.nivel);
      setNivelSeleccionado(sugerencia.nivel)
      
      Swal.fire({
        icon: 'success',
        title: '¡Selección guardada!',
        text: 'La opción de catering fue vinculada al evento.',
        confirmButtonColor: '#C9913A',
        timer: 2000,
        showConfirmButton: false
      })
    }
  }

  // Orden: bajo → medio → alto
  const ordenNiveles = ['bajo', 'medio', 'alto']
  const sugerenciasOrdenadas = [...sugerencias].sort(
    (a, b) => ordenNiveles.indexOf(a.nivel) - ordenNiveles.indexOf(b.nivel)
  )

  // Datos de ejemplo cuando la API no devuelve datos
  const datosMuestra = [
    { proveedorId: 0, nombreProveedor: 'Catering Express', descripcionMenu: 'Menú clásico: entrada fría, plato principal con guarnición, postre individual y bebidas.', precioPorPersona: 4500, nivel: 'bajo' },
    { proveedorId: 0, nombreProveedor: 'Gourmet & Co.', descripcionMenu: 'Menú selección: 2 entradas a elección, plato principal premium, mesa dulce y barra de tragos.', precioPorPersona: 8500, nivel: 'medio' },
    { proveedorId: 0, nombreProveedor: 'Le Petit Chef', descripcionMenu: 'Menú premium: 3 pasos con maridaje, cocina en vivo, mesa de quesos importados y open bar.', precioPorPersona: 15000, nivel: 'alto' },
  ]

  const datosAMostrar = sugerenciasOrdenadas.length > 0 ? sugerenciasOrdenadas : datosMuestra

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Encabezado */}
        <div className="text-center mb-10">
          <span className="label-seccion block mb-2">SELECCIÓN DE CATERING</span>
          <h1 className="titulo-pagina mb-3">Sugerencias de Catering</h1>
          <p className="subtitulo max-w-xl mx-auto">
            Elegí la opción que mejor se adapte a tu evento. Comparamos proveedores
            por nivel de servicio y precio por persona.
          </p>
          {/* Separador dorado */}
          <div className="flex justify-center mt-5">
            <div className="separador-dorado" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {cargando ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-dorado border-t-transparent rounded-full animate-spin" />
            <span className="subtitulo">Cargando sugerencias…</span>
          </div>
        ) : (
          /* Cards comparativas */
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {datosAMostrar.map((sugerencia) => {
              const config = CONFIGURACION_NIVELES[sugerencia.nivel] || CONFIGURACION_NIVELES.bajo
              const estaSeleccionado = nivelSeleccionado === sugerencia.nivel

              return (
                <div
                  key={sugerencia.nivel}
                  className={`relative bg-crema rounded-xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
                    config.destacado
                      ? 'border-dorado md:-mt-3 md:mb-0'
                      : 'border-borde'
                  }`}
                  style={{
                    boxShadow: config.destacado
                      ? '0 4px 20px rgba(201,145,58,0.15)'
                      : '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Borde superior dorado para la destacada */}
                  {config.destacado && (
                    <div className="h-1 bg-dorado w-full" />
                  )}

                  <div className="p-6 flex flex-col">
                    {/* Badge recomendado */}
                    {config.destacado && (
                      <div className="flex justify-center mb-4 -mt-1">
                        <span className="badge-dorado text-xs">⭐ RECOMENDADO</span>
                      </div>
                    )}

                    {/* Ícono y título */}
                    <div className="text-center mb-4">
                      <span className="text-3xl block mb-2">{config.icono}</span>
                      <h3 className="text-lg font-semibold text-texto-principal">{config.titulo}</h3>
                      <p className="subtitulo mt-1">{config.subtitulo}</p>
                    </div>

                    {/* Badge de nivel */}
                    <div className="flex justify-center mb-4">
                      <span className="label-seccion">{config.badgeTexto}</span>
                    </div>

                    {/* Separador */}
                    <div className="flex justify-center mb-4">
                      <div className="separador-dorado" />
                    </div>

                    {/* Proveedor */}
                    <div className="text-center mb-3">
                      <span className="text-xs text-texto-secundario">Proveedor sugerido</span>
                      <p className="text-sm font-semibold text-texto-principal mt-0.5">
                        {sugerencia.nombreProveedor}
                      </p>
                    </div>

                    {/* Descripción menú */}
                    <p className="text-sm text-texto-secundario text-center leading-relaxed mb-5 flex-1">
                      {sugerencia.descripcionMenu || 'Menú a definir con el proveedor.'}
                    </p>

                    {/* Precio */}
                    <div className="text-center mb-5">
                      <span className="text-2xl font-semibold text-dorado">
                        ${sugerencia.precioPorPersona?.toLocaleString('es-AR') || '—'}
                      </span>
                      <span className="subtitulo block mt-0.5">por persona</span>
                    </div>

                    {/* Botón seleccionar */}
                    <button
                      onClick={() => manejarSeleccionar(sugerencia)}
                      disabled={estaSeleccionado}
                      className={estaSeleccionado
                        ? 'w-full py-2.5 rounded-lg text-sm font-medium bg-green-500 text-white'
                        : config.destacado
                          ? 'btn-primario w-full py-2.5'
                          : 'btn-secundario w-full py-2.5'
                      }
                    >
                      {estaSeleccionado ? '✓ Seleccionado' : 'Seleccionar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Nota */}
        <div className="mt-10 text-center">
          <p className="subtitulo">
            Los precios son estimativos y pueden variar según la cantidad de invitados y personalización del menú.
          </p>
        </div>
      </div>
    </div>
  )
}
