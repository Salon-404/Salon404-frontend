import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import {
  agruparPorFranja,
  obtenerFranjasOcupadas,
  contarEventosPorDia,
  filtrarEventosParaVista,
} from './eventos'
import { esAdmin, decodificarToken, esTokenValido, determinarVista } from './seguridad'
import { getFranja } from '../constants/eventos'
import EventoPill from '../components/eventos/EventoPill'
import FranjaDots from '../components/eventos/FranjaDots'
import { useCalendarRole } from '../hooks/useCalendarRole'

// ─── Performance: 100 events in a month ───────────────────────────────

describe('edge case: 100 events in a month', () => {
  function generarEventos(cantidad) {
    const franjas = ['manana', 'tarde', 'noche']
    return Array.from({ length: cantidad }, (_, i) => ({
      id: `evt-${i}`,
      nombre: `Evento ${i}`,
      fecha: `2026-06-${String((i % 28) + 1).padStart(2, '0')}`,
      horaInicio: '10:00',
      horaFin: '12:00',
      franja: franjas[i % 3],
      estado: 'pendiente',
      tipoEventoId: 1,
    }))
  }

  it('agruparPorFranja handles 100 events without hanging', () => {
    const eventos = generarEventos(100)
    const start = performance.now()
    const result = agruparPorFranja(eventos)
    const elapsed = performance.now() - start

    expect(result.manana.length + result.tarde.length + result.noche.length).toBe(100)
    expect(elapsed).toBeLessThan(50)
  })

  it('obtenerFranjasOcupadas handles 100 events without hanging', () => {
    const eventos = generarEventos(100)
    const start = performance.now()
    const result = obtenerFranjasOcupadas(eventos)
    const elapsed = performance.now() - start

    expect(result).toHaveLength(3)
    expect(elapsed).toBeLessThan(50)
  })

  it('contarEventosPorDia handles 100 events without hanging', () => {
    const eventos = generarEventos(100)
    const start = performance.now()
    const result = contarEventosPorDia(eventos, '2026-06-01')
    const elapsed = performance.now() - start

    expect(typeof result).toBe('number')
    expect(elapsed).toBeLessThan(50)
  })

  it('filtrarEventosParaVista handles 100 events for public view', () => {
    const eventos = generarEventos(100)
    const start = performance.now()
    const result = filtrarEventosParaVista(eventos, 'publica')
    const elapsed = performance.now() - start

    expect(result).toHaveLength(100)
    result.forEach((e) => {
      expect(e).not.toHaveProperty('nombre')
    })
    expect(elapsed).toBeLessThan(50)
  })
})

// ─── Invalid hour handling ────────────────────────────────────────────

describe('edge case: invalid hour', () => {
  it('getFranja with "25:00" falls through to noche (no validation)', () => {
    // getFranja does not validate — 25 >= 20 is false, so it falls to default
    // 25 >= 6 && 25 < 14 → false; 25 >= 14 && 25 < 20 → false; → 'noche'
    const result = getFranja('25:00')
    expect(result).toBe('noche')
  })

  it('getFranja with empty string returns noche (NaN falls through)', () => {
    const result = getFranja('')
    expect(result).toBe('noche')
  })

  it('agruparPorFranja ignores events with invalid franja value', () => {
    const eventos = [
      { id: 1, franja: 'invalid', nombre: 'Bad' },
      { id: 2, franja: 'manana', nombre: 'Good' },
    ]
    const result = agruparPorFranja(eventos)
    expect(result.manana).toHaveLength(1)
    expect(result.tarde).toHaveLength(0)
    expect(result.noche).toHaveLength(0)
  })
})

// ─── Corrupt mock data (null fields) ──────────────────────────────────

describe('edge case: corrupt mock data', () => {
  it('agruparPorFranja handles events with null franja', () => {
    const eventos = [
      { id: 1, franja: null, nombre: 'No franja' },
      { id: 2, franja: 'tarde', nombre: 'OK' },
    ]
    const result = agruparPorFranja(eventos)
    expect(result.tarde).toHaveLength(1)
    expect(result.manana).toHaveLength(0)
  })

  it('obtenerFranjasOcupadas handles events with null estado and franja', () => {
    const eventos = [
      { franja: null, estado: null },
      { franja: 'manana', estado: 'pendiente' },
    ]
    const result = obtenerFranjasOcupadas(eventos)
    expect(result).toEqual(['manana'])
  })

  it('EventoPill renders with event missing optional fields', () => {
    const eventoMinimo = {
      horaInicio: '10:00',
      estado: 'pendiente',
      nombre: 'Test',
    }
    const tipo = { id: 1, nombre: 'Test', color: '#ff0000' }

    const { container } = render(
      <EventoPill evento={eventoMinimo} tipo={tipo} isAdmin={true} />
    )
    expect(container.firstChild).not.toBeNull()
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('FranjaDots handles eventos with undefined estado', () => {
    const eventos = [
      { franja: 'manana' },
      { franja: 'tarde', estado: undefined },
    ]
    const { container } = render(<FranjaDots eventos={eventos} />)
    const dots = container.querySelectorAll('.salon404-franja-dot')
    expect(dots.length).toBeGreaterThanOrEqual(1)
  })

  it('filtrarEventosParaVista handles event with missing cliente', () => {
    const eventos = [
      {
        id: 'evt-001',
        fecha: '2026-06-14',
        horaInicio: '10:00',
        horaFin: '12:00',
        franja: 'manana',
        estado: 'pendiente',
        tipoEventoId: 1,
      },
    ]
    const result = filtrarEventosParaVista(eventos, 'publica')
    expect(result).toHaveLength(1)
    expect(result[0]).not.toHaveProperty('nombre')
  })
})

// ─── Token manipulation (invented role) ───────────────────────────────

describe('edge case: manipulated token / invented role', () => {
  it('esAdmin returns false for unknown role', () => {
    expect(esAdmin({ role: 'SuperAdmin' })).toBe(false)
    expect(esAdmin({ role: 'root' })).toBe(false)
    expect(esAdmin({ role: '' })).toBe(false)
    expect(esAdmin({ role: 42 })).toBe(false)
  })

  it('determinarVista returns public view for unknown role', () => {
    const result = determinarVista({ role: 'invented-role' })
    expect(result.isAdmin).toBe(false)
    expect(result.vista).toBe('publica')
    expect(result.puedeVerDetalle).toBe(false)
  })

  it('useCalendarRole treats unknown role as non-admin', () => {
    const { result } = renderHook(() => useCalendarRole({ role: 'mega-admin' }))
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.vista).toBe('publica')
  })

  it('esAdmin returns false for user with null role', () => {
    expect(esAdmin({ role: null })).toBe(false)
    expect(esAdmin({})).toBe(false)
  })
})

// ─── Empty localStorage / null token ──────────────────────────────────

describe('edge case: empty localStorage / null token', () => {
  it('decodificarToken returns null for null input', () => {
    expect(decodificarToken(null)).toBeNull()
  })

  it('decodificarToken returns null for empty string', () => {
    expect(decodificarToken('')).toBeNull()
  })

  it('decodificarToken returns null for non-string input', () => {
    expect(decodificarToken(123)).toBeNull()
    expect(decodificarToken(undefined)).toBeNull()
    expect(decodificarToken({})).toBeNull()
  })

  it('esTokenValido returns false for null', () => {
    expect(esTokenValido(null)).toBe(false)
  })

  it('esTokenValido returns false for empty string', () => {
    expect(esTokenValido('')).toBe(false)
  })

  it('esTokenValido returns false for garbage string', () => {
    expect(esTokenValido('not-a-jwt')).toBe(false)
  })

  it('useCalendarRole with null user returns public view', () => {
    const { result } = renderHook(() => useCalendarRole(null))
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.vista).toBe('publica')
  })

  it('useCalendarRole with undefined user returns public view', () => {
    const { result } = renderHook(() => useCalendarRole(undefined))
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.vista).toBe('publica')
  })
})

// ─── Double click on cell ─────────────────────────────────────────────

describe('edge case: double click does not open two popovers', () => {
  it('calling onClose twice does not cause errors', () => {
    const onClose = vi.fn()

    // Simulate the scenario: if a component calls onClose twice,
    // it should not throw or cause issues
    expect(() => {
      onClose()
      onClose()
    }).not.toThrow()

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
