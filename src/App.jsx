import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Rutas de cada módulo se descomentan a medida que se desarrollan

// Módulo Auth — Juan Cruz Merino
// import { AuthRoutes } from './pages/auth/AuthRoutes'

// Módulo Reservas — Federico Oviedo
// import { ReservasRoutes } from './pages/reservas/ReservasRoutes'

// Módulo Invitados — Victor Balbuena
// import { InvitadosRoutes } from './pages/invitados/InvitadosRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/reservas" replace />} />

        {/* <Route path="/login" element={<AuthRoutes />} /> */}
        {/* <Route path="/reservas/*" element={<ReservasRoutes />} /> */}
        {/* <Route path="/invitados/*" element={<InvitadosRoutes />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
