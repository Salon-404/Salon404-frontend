import { ESTADO_CLASES } from '../../constants/reservas'

const ESTADO_LABELS = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
}

export default function StatusBadge({ estado }) {
  const clases = ESTADO_CLASES[estado] ?? 'bg-slate-100 text-slate-700'
  const label = ESTADO_LABELS[estado] ?? estado

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clases}`}>
      {label}
    </span>
  )
}
