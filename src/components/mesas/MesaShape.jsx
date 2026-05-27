import { GRUPO_COLORES, GRUPOS } from '../../constants/mesas'

// Representa visualmente una mesa sobre el canvas del plano.
// Se posiciona con CSS absoluto usando las coordenadas x/y de la mesa.
// onMouseDown se usa en el editor para iniciar el arrastre.
export default function MesaShape({ mesa, seleccionada, onClick, onMouseDown, ocupacion }) {
  const colorClases = GRUPO_COLORES[mesa.grupo] || GRUPO_COLORES[GRUPOS.SIN_GRUPO]

  const borde = seleccionada
    ? 'ring-2 ring-indigo-500 ring-offset-1'
    : ''

  const estiloBase = {
    position:  'absolute',
    left:      mesa.x,
    top:       mesa.y,
    userSelect: 'none',
    cursor:    onMouseDown ? 'grab' : 'pointer',
  }

  const claseBase = `
    flex flex-col items-center justify-center
    border-2 shadow-sm select-none
    transition-shadow duration-150
    ${colorClases} ${borde}
  `

  const handleMouseDown = onMouseDown
    ? (e) => { e.preventDefault(); onMouseDown(e, mesa.id) }
    : undefined

  // Muestra el conteo de ocupación si se pasa el prop correspondiente
  const labelOcupacion = ocupacion
    ? `${ocupacion.asignados}/${ocupacion.capacidad}`
    : `${mesa.capacidad} pl.`

  if (mesa.forma === 'redonda') {
    const d = mesa.diametro ?? 100
    return (
      <div
        style={{ ...estiloBase, width: d, height: d, borderRadius: '50%' }}
        className={claseBase}
        onClick={() => onClick?.(mesa)}
        onMouseDown={handleMouseDown}
        title={mesa.nombre}
      >
        <span className="text-xs font-bold leading-tight text-center px-1 truncate max-w-full">
          {mesa.nombre}
        </span>
        <span className="text-xs leading-tight opacity-75">{labelOcupacion}</span>
      </div>
    )
  }

  // Forma rectangular
  const w = mesa.ancho ?? 130
  const h = mesa.alto  ?? 85
  return (
    <div
      style={{ ...estiloBase, width: w, height: h, borderRadius: '0.5rem' }}
      className={claseBase}
      onClick={() => onClick?.(mesa)}
      onMouseDown={handleMouseDown}
      title={mesa.nombre}
    >
      <span className="text-xs font-bold leading-tight text-center px-2 truncate max-w-full">
        {mesa.nombre}
      </span>
      <span className="text-xs leading-tight opacity-75">{labelOcupacion}</span>
    </div>
  )
}
