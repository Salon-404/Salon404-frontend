import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RedirectConBanner({ to }) {
  const navigate = useNavigate()
  const [segundos, setSegundos] = useState(5)
  const [activo, setActivo] = useState(true)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!activo) return

    if (segundos <= 0) {
      navigate(to)
      return
    }

    timeoutRef.current = setTimeout(() => {
      setSegundos(prev => prev - 1)
    }, 1000)

    return () => clearTimeout(timeoutRef.current)
  }, [activo, segundos, to, navigate])

  function handleIrAhora() {
    clearTimeout(timeoutRef.current)
    navigate(to, { replace: true })
  }

  function handleCancelar() {
    clearTimeout(timeoutRef.current)
    setActivo(false)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-lg" data-testid="redirect-banner">
      <div className="flex items-center gap-2 text-sm">
        <span aria-hidden="true">ℹ️</span>
        <span>Esta vista se mudó. Te llevamos a <strong>{to}</strong> en {segundos}s.</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleIrAhora} className="text-sm font-medium bg-white text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-50" data-testid="btn-ir-ahora">
          Ir ahora
        </button>
        <button onClick={handleCancelar} className="text-sm font-medium text-indigo-200 hover:text-white px-3 py-1" data-testid="btn-cancelar">
          Cancelar
        </button>
      </div>
    </div>
  )
}
