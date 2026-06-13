export default function DoubleBookingAlert({ fecha }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
      <span className="mt-0.5 text-base leading-none">⚠</span>
      <p>
        La fecha <strong>{fecha}</strong> ya tiene una reserva registrada. Por favor elegí otra
        fecha disponible.
      </p>
    </div>
  )
}
