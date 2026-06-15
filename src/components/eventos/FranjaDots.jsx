import { obtenerFranjasOcupadas } from '../../utils/eventos'

const DOT_COLORS = {
  manana: 'salon404-franja-dot--manana',
  tarde: 'salon404-franja-dot--tarde',
  noche: 'salon404-franja-dot--noche',
}

function Dot({ franja }) {
  return (
    <span
      className={`salon404-franja-dot ${DOT_COLORS[franja] || ''}`}
      aria-hidden="true"
    />
  )
}

export default function FranjaDots({ eventos }) {
  const franjas = obtenerFranjasOcupadas(eventos)

  if (franjas.length === 0) return null

  return (
    <div className="salon404-franja-dots" aria-hidden="true">
      {franjas.map((franja) => (
        <Dot key={franja} franja={franja} />
      ))}
    </div>
  )
}
