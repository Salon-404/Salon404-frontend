import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PlanoPage from './pages/mesas/PlanoPage'
import EditorPage from './pages/mesas/EditorPage'
import AsignarPage from './pages/mesas/AsignarPage'
import LoginPage from './pages/auth/LoginPage'
import EventoNuevoPage from './pages/eventos/EventoNuevoPage'
import EventosPage from './pages/eventos/EventosPage'
import EventoDetailPage from './pages/eventos/EventoDetailPage'
import EventoEditarPage from './pages/eventos/EventoEditarPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { ROLES } from './constants/auth'

// Rutas de cada módulo se descomentan a medida que se desarrollan

// Módulo Auth — Juan Cruz Merino / Federico Oviedo
// import { AuthRoutes } from './pages/auth/AuthRoutes'

// Módulo Reservas — Federico Oviedo
// import { ReservasRoutes } from './pages/reservas/ReservasRoutes'

// Módulo Invitados — Victor Balbuena
import { InvitadosRoutes } from './pages/invitados/InvitadosRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La app arranca por el login de Fede */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Módulo Auth — Federico Oviedo */}
        <Route path="/login" element={<LoginPage />} />

        {/* Módulo Eventos — Federico Oviedo */}
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/eventos/:id" element={<EventoDetailPage />} />
        <Route path="/eventos/:id/editar" element={<EventoEditarPage />} />
        <Route path="/eventos/nuevo" element={<EventoNuevoPage />} />

        {/* Módulo Mesas — Federico Oviedo */}
        <Route path="/mesas" element={<PlanoPage />} />
        <Route path="/mesas/editor" element={
          <ProtectedRoute rolRequerido={ROLES.ADMIN}><EditorPage /></ProtectedRoute>
        } />
        <Route path="/mesas/asignar/:reservaId" element={
          <ProtectedRoute rolRequerido={ROLES.ADMIN}><AsignarPage /></ProtectedRoute>
        } />

        {/* Módulo Invitados — Victor Balbuena */}
        <Route path="/invitados/*" element={<InvitadosRoutes />} />
      </Routes>
    </BrowserRouter>
  )
}
