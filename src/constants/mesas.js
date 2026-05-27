// Formas visuales que puede tener una mesa en el plano
export const FORMAS = {
  REDONDA: 'redonda',
  RECTANGULAR: 'rectangular',
}

// Grupos para organizar las mesas por tipo de invitados
export const GRUPOS = {
  FAMILIA: 'familia',
  AMIGOS: 'amigos',
  NINOS: 'ninos',
  PAREJA: 'pareja',
  SIN_GRUPO: 'sin_grupo',
}

// Opciones para el selector de grupo en el formulario
export const GRUPOS_OPCIONES = [
  { value: GRUPOS.SIN_GRUPO, label: 'Sin grupo' },
  { value: GRUPOS.FAMILIA,   label: 'Familia' },
  { value: GRUPOS.AMIGOS,    label: 'Amigos' },
  { value: GRUPOS.NINOS,     label: 'Niños' },
  { value: GRUPOS.PAREJA,    label: 'Pareja' },
]

// Clases Tailwind para el color de fondo de cada mesa según su grupo
export const GRUPO_COLORES = {
  [GRUPOS.FAMILIA]:   'bg-blue-200 border-blue-400 text-blue-900',
  [GRUPOS.AMIGOS]:    'bg-green-200 border-green-400 text-green-900',
  [GRUPOS.NINOS]:     'bg-yellow-200 border-yellow-400 text-yellow-900',
  [GRUPOS.PAREJA]:    'bg-pink-200 border-pink-400 text-pink-900',
  [GRUPOS.SIN_GRUPO]: 'bg-slate-200 border-slate-400 text-slate-700',
}

// Dimensiones del canvas del plano del salón (en píxeles)
export const CANVAS_ANCHO_DEFAULT = 900
export const CANVAS_ALTO_DEFAULT  = 600

// Tamaños por defecto al crear una mesa nueva
export const MESA_REDONDA_DIAMETRO_DEFAULT    = 100
export const MESA_RECTANGULAR_ANCHO_DEFAULT   = 130
export const MESA_RECTANGULAR_ALTO_DEFAULT    = 85
export const CAPACIDAD_DEFAULT                = 8
export const ROTACION_DEFAULT                 = 0

// Tamaños mínimos al redimensionar (evitan que la mesa desaparezca)
export const MESA_ANCHO_MIN    = 60
export const MESA_ALTO_MIN     = 50
export const MESA_DIAMETRO_MIN = 60

// Umbrales de ocupación para el indicador de color
export const OCUPACION_UMBRAL_MEDIA = 0.8  // 80% → amarillo
