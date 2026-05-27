import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { ROLES } from './constants/auth'

// Rutas de cada módulo se descomentan a medida que se desarrollan

// Módulo Reservas — Federico Oviedo
// import { ReservasRoutes } from './pages/reservas/ReservasRoutes'

// Módulo Invitados — Victor Balbuena
// import { InvitadosRoutes } from './pages/invitados/InvitadosRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/reservas" replace />} />

        {/* Módulo Auth — Federico Oviedo */}
        <Route path="/login" element={<LoginPage />} />

        {/* <Route path="/reservas/*" element={<ReservasRoutes />} /> */}
        {/* <Route path="/invitados/*" element={<InvitadosRoutes />} /> */}

        {/*
          Al integrar feature/mesas, wrappear las rutas admin así:
          <Route path="/mesas/editor" element={
            <ProtectedRoute rolRequerido={ROLES.ADMIN}><EditorPage /></ProtectedRoute>
          } />
          <Route path="/mesas/asignar/:reservaId" element={
            <ProtectedRoute rolRequerido={ROLES.ADMIN}><AsignarPage /></ProtectedRoute>
          } />
        */}
      </Routes>
    </BrowserRouter>
  )
}
