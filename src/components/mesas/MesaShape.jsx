import { GRUPO_COLORES, GRUPOS } from '../../constants/mesas'

// Representa visualmente una mesa sobre el canvas del plano.
// En modo editor (onResizeStart presente) muestra handles de resize y rotación
// cuando está seleccionada. Se posiciona con CSS absoluto usando x/y de la mesa.
export default function MesaShape({ mesa, seleccionada, onClick, onMouseDown, onResizeStart, onRotateStart, ocupacion }) {
  const colorClases = GRUPO_COLORES[mesa.grupo] || GRUPO_COLORES[GRUPOS.SIN_GRUPO]
  const rotacion    = mesa.rotacion ?? 0
  const modoEditor  = !!onResizeStart

  const labelOcupacion = ocupacion
    ? `${ocupacion.asignados}/${ocupacion.capacidad}`
    : `${mesa.capacidad} pl.`

  const handleMouseDownMesa = onMouseDown
    ? (e) => { e.preventDefault(); onMouseDown(e, mesa.id) }
    : undefined

  const estiloComun = {
    position:        'absolute',
    userSelect:      'none',
    cursor:          onMouseDown ? 'grab' : 'pointer',
    transform:       `rotate(${rotacion}deg)`,
    transformOrigin: 'center',
  }

  const claseComun = `
    flex flex-col items-center justify-center
    border-2 shadow-sm select-none
    transition-shadow duration-150
    ${colorClases}
    ${seleccionada ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
  `

  if (mesa.forma === 'redonda') {
    const d = mesa.diametro ?? 100
    return (
      <div
        style={{ ...estiloComun, left: mesa.x, top: mesa.y, width: d, height: d, borderRadius: '50%' }}
        className={claseComun}
        onClick={() => onClick?.(mesa)}
        onMouseDown={handleMouseDownMesa}
        title={mesa.nombre}
      >
        <span className="text-xs font-bold leading-tight text-center px-1 truncate max-w-full">
          {mesa.nombre}
        </span>
        <span className="text-xs leading-tight opacity-75">{labelOcupacion}</span>

        {seleccionada && modoEditor && (
          <>
            <RotateHandle onRotateStart={onRotateStart} mesaId={mesa.id} />
            <ResizeHandle
              estilo={{ right: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }}
              onResizeStart={onResizeStart}
              mesaId={mesa.id}
              campo="diametro"
              title="Cambiar diámetro"
            />
          </>
        )}
      </div>
    )
  }

  // Forma rectangular
  const w = mesa.ancho ?? 130
  const h = mesa.alto  ?? 85
  return (
    <div
      style={{ ...estiloComun, left: mesa.x, top: mesa.y, width: w, height: h, borderRadius: '0.5rem' }}
      className={claseComun}
      onClick={() => onClick?.(mesa)}
      onMouseDown={handleMouseDownMesa}
      title={mesa.nombre}
    >
      <span className="text-xs font-bold leading-tight text-center px-2 truncate max-w-full">
        {mesa.nombre}
      </span>
      <span className="text-xs leading-tight opacity-75">{labelOcupacion}</span>

      {seleccionada && modoEditor && (
        <>
          <RotateHandle onRotateStart={onRotateStart} mesaId={mesa.id} />
          <ResizeHandle
            estilo={{ right: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }}
            onResizeStart={onResizeStart}
            mesaId={mesa.id}
            campo="ancho"
            title="Cambiar ancho"
          />
          <ResizeHandle
            estilo={{ bottom: -6, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' }}
            onResizeStart={onResizeStart}
            mesaId={mesa.id}
            campo="alto"
            title="Cambiar alto"
          />
        </>
      )}
    </div>
  )
}

function RotateHandle({ onRotateStart, mesaId }) {
  return (
    <div
      className="absolute bg-white border-2 border-indigo-500 rounded-full w-5 h-5 flex items-center justify-center text-indigo-600 text-xs shadow z-10"
      style={{ top: -26, left: '50%', transform: 'translateX(-50%)', cursor: 'crosshair' }}
      title="Rotar"
      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onRotateStart(e, mesaId) }}
      onClick={(e) => e.stopPropagation()}
    >
      ↻
    </div>
  )
}

function ResizeHandle({ estilo, onResizeStart, mesaId, campo, title }) {
  return (
    <div
      className="absolute bg-white border-2 border-indigo-500 rounded-sm w-3 h-3 shadow z-10"
      style={{ ...estilo, position: 'absolute' }}
      title={title}
      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart(e, mesaId, campo, 1) }}
      onClick={(e) => e.stopPropagation()}
    />
  )
}
