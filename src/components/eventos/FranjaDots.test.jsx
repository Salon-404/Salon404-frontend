import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FranjaDots from './FranjaDots'

describe('FranjaDots', () => {
  it('renders nothing when eventos is empty', () => {
    const { container } = render(<FranjaDots eventos={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when eventos is null', () => {
    const { container } = render(<FranjaDots eventos={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders 1 dot for a single morning event', () => {
    const eventos = [
      { id: 1, franja: 'manana', estado: 'pendiente' },
    ]
    const { container } = render(<FranjaDots eventos={eventos} />)

    const dots = container.querySelectorAll('.salon404-franja-dot')
    expect(dots).toHaveLength(1)
    expect(dots[0].classList.contains('salon404-franja-dot--manana')).toBe(true)
  })

  it('renders 3 dots for events in all three franjas', () => {
    const eventos = [
      { id: 1, franja: 'manana', estado: 'pendiente' },
      { id: 2, franja: 'tarde', estado: 'pendiente' },
      { id: 3, franja: 'noche', estado: 'pendiente' },
    ]
    const { container } = render(<FranjaDots eventos={eventos} />)

    const dots = container.querySelectorAll('.salon404-franja-dot')
    expect(dots).toHaveLength(3)

    const classNames = Array.from(dots).map((d) => d.className)
    expect(classNames.some((c) => c.includes('salon404-franja-dot--manana'))).toBe(true)
    expect(classNames.some((c) => c.includes('salon404-franja-dot--tarde'))).toBe(true)
    expect(classNames.some((c) => c.includes('salon404-franja-dot--noche'))).toBe(true)
  })

  it('all dots have aria-hidden=true', () => {
    const eventos = [
      { id: 1, franja: 'manana', estado: 'pendiente' },
      { id: 2, franja: 'tarde', estado: 'pendiente' },
      { id: 3, franja: 'noche', estado: 'pendiente' },
    ]
    const { container } = render(<FranjaDots eventos={eventos} />)

    const dots = container.querySelectorAll('.salon404-franja-dot')
    dots.forEach((dot) => {
      expect(dot).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('wrapper div also has aria-hidden=true', () => {
    const eventos = [
      { id: 1, franja: 'manana', estado: 'pendiente' },
    ]
    const { container } = render(<FranjaDots eventos={eventos} />)

    const wrapper = container.querySelector('.salon404-franja-dots')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
  })

  it('deduplicates franjas when multiple events share the same franja', () => {
    const eventos = [
      { id: 1, franja: 'noche', estado: 'pendiente' },
      { id: 2, franja: 'noche', estado: 'confirmado' },
    ]
    const { container } = render(<FranjaDots eventos={eventos} />)

    const dots = container.querySelectorAll('.salon404-franja-dot')
    expect(dots).toHaveLength(1)
  })

  it('ignores cancelled events', () => {
    const eventos = [
      { id: 1, franja: 'manana', estado: 'cancelado' },
      { id: 2, franja: 'tarde', estado: 'pendiente' },
    ]
    const { container } = render(<FranjaDots eventos={eventos} />)

    const dots = container.querySelectorAll('.salon404-franja-dot')
    expect(dots).toHaveLength(1)
    expect(dots[0].classList.contains('salon404-franja-dot--tarde')).toBe(true)
  })
})
