import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import RedirectConBanner from './RedirectConBanner'

function LocationReader() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderWithRouter(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<RedirectConBanner to="/eventos" />} />
        <Route path="/eventos" element={<LocationReader />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RedirectConBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders banner with destination and initial countdown', () => {
    renderWithRouter()

    expect(screen.getByTestId('redirect-banner')).toBeInTheDocument()
    expect(screen.getByText(/Te llevamos a/i)).toBeInTheDocument()
    expect(screen.getByText('/eventos')).toBeInTheDocument()
    expect(screen.getByText(/en 5s\./i)).toBeInTheDocument()
  })

  it('decrements countdown every second', () => {
    renderWithRouter()

    expect(screen.getByText(/en 5s\./i)).toBeInTheDocument()

    act(() => { vi.runOnlyPendingTimers() })
    expect(screen.getByText(/en 4s\./i)).toBeInTheDocument()

    act(() => { vi.runOnlyPendingTimers() })
    expect(screen.getByText(/en 3s\./i)).toBeInTheDocument()

    act(() => { vi.runOnlyPendingTimers() })
    expect(screen.getByText(/en 2s\./i)).toBeInTheDocument()
  })

  it('navigates immediately when "Ir ahora" is clicked', () => {
    renderWithRouter()

    fireEvent.click(screen.getByTestId('btn-ir-ahora'))

    expect(screen.getByTestId('location')).toHaveTextContent('/eventos')
  })

  it('stops countdown when "Cancelar" is clicked', () => {
    renderWithRouter()

    fireEvent.click(screen.getByTestId('btn-cancelar'))
    act(() => { vi.advanceTimersByTime(5000) })

    expect(screen.getByTestId('redirect-banner')).toBeInTheDocument()
    expect(screen.queryByTestId('location')).not.toBeInTheDocument()
  })

  it('navigates after 5 seconds', () => {
    renderWithRouter()

    act(() => { vi.runOnlyPendingTimers() })
    act(() => { vi.runOnlyPendingTimers() })
    act(() => { vi.runOnlyPendingTimers() })
    act(() => { vi.runOnlyPendingTimers() })
    act(() => { vi.runOnlyPendingTimers() })

    expect(screen.queryByTestId('redirect-banner')).not.toBeInTheDocument()
  })
})
