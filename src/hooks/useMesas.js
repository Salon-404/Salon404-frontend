import { useState, useEffect, useCallback } from 'react'
import { getLayout } from '../services/mesasService'

// Obtiene el layout global del salón (lista de mesas y dimensiones del canvas)
export function useMesas() {
  const [layout,  setLayout]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchLayout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLayout()
      setLayout(data)
    } catch (err) {
      setError('No se pudo cargar el plano del salón')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLayout() }, [fetchLayout])

  return { layout, loading, error, refetch: fetchLayout }
}
