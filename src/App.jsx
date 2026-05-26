import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ReservasPage from './pages/reservas/ReservasPage'
import NuevaReservaPage from './pages/reservas/NuevaReservaPage'
import EditarReservaPage from './pages/reservas/EditarReservaPage'
import CalendarioPage from './pages/reservas/CalendarioPage'
import ReservaDetailPage from './pages/reservas/ReservaDetailPage'

// Módulo Auth — Juan Cruz Merino
// import { AuthRoutes } from './pages/auth/AuthRoutes'

// Módulo Invitados — Victor Balbuena
// import { InvitadosRoutes } from './pages/invitados/InvitadosRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/reservas" replace />} />

        {/* Módulo Reservas — Federico Oviedo */}
        <Route path="/reservas" element={<ReservasPage />} />
        <Route path="/reservas/calendario" element={<CalendarioPage />} />
        <Route path="/reservas/nueva" element={<NuevaReservaPage />} />
        <Route path="/reservas/:id" element={<ReservaDetailPage />} />
        <Route path="/reservas/:id/editar" element={<EditarReservaPage />} />

        {/* <Route path="/login" element={<AuthRoutes />} /> */}
        {/* <Route path="/invitados/*" element={<InvitadosRoutes />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
