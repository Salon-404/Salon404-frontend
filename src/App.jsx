
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import PlanoPage from './pages/mesas/PlanoPage';
import EditorPage from './pages/mesas/EditorPage';
import AsignarPage from './pages/mesas/AsignarPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EventoNuevoPage from './pages/eventos/EventoNuevoPage';
import EventosPage from './pages/eventos/EventosPage';
import EventoDetailPage from './pages/eventos/EventoDetailPage';
import EventoEditarPage from './pages/eventos/EventoEditarPage';
import CalendarioEventosPage from './pages/eventos/CalendarioEventosPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RedirectConBanner from './components/common/RedirectConBanner';
import { ROLES } from './constants/auth';
import DisponibilityPage from './pages/Disponibility/DisponibilityPage';
import ProveedoresList from "./pages/proveedores/ProveedoresList";
import SugerenciaCatering from "./pages/catering/SugerenciaCatering";
import HomePage from './pages/home/HomePage';
import SalonesPage from './pages/salon/SalonesPage';
import SalonDetailPage from './pages/salon/SalonDetailPage';
import { InvitadosRoutes } from './pages/invitados/InvitadosRoutes';

function ReservaRedirect() {
  const { id } = useParams()
  return <RedirectConBanner to={`/eventos/${id}`} />
}

function ReservaEditarRedirect() {
  const { id } = useParams()
  return <RedirectConBanner to={`/eventos/${id}/editar`} />
}

// Módulo Pagos — Mariano Figueroa
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*RUTAS PARA EL USUARIO. LAS PUEDE VER SIN LOGUEARSE*/}
        <Route path="/" element={<HomePage />} />
        <Route path="/salones" element={<SalonesPage />} />
        <Route path="/salones/:id" element={<SalonDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/disponibilidad" element={<DisponibilityPage />} />
        

        {/* Redirects — rutas legacy /reservas → /eventos */}
        {/*<Route path="/reservas" element={<RedirectConBanner to="/eventos" />} />*/}
        <Route path="/reservas/calendario" element={<RedirectConBanner to="/eventos/calendario" />} />
        <Route path="/reservas/nueva" element={<RedirectConBanner to="/eventos/nuevo" />} />
        <Route path="/reservas/:id" element={<ReservaRedirect />} />
        <Route path="/reservas/:id/editar" element={<ReservaEditarRedirect />} />

        {/* Módulo Eventos — Federico Oviedo */}
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/eventos/:id" element={<EventoDetailPage />} />
        <Route path="/eventos/:id/editar" element={<EventoEditarPage />} />
        <Route path="/eventos/nuevo" element={<EventoNuevoPage />} />
        <Route path="/eventos/calendario" element={<CalendarioEventosPage />} />
        {/* Redirects reservas → eventos */}
        <Route path="/reservas" element={<RedirectConBanner to="/eventos" />} />
        <Route path="/reservas/calendario" element={<RedirectConBanner to="/eventos/calendario" />} />
        <Route path="/reservas/nueva" element={<RedirectConBanner to="/eventos/nuevo" />} />
        <Route path="/reservas/:id" element={<ReservaRedirect />} />
        <Route path="/reservas/:id/editar" element={<ReservaEditarRedirect />} />

        {/* Módulo Eventos — Federico Oviedo */}
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/eventos/:id" element={<EventoDetailPage />} />
        <Route path="/eventos/:id/editar" element={<EventoEditarPage />} />
        <Route path="/eventos/nuevo" element={<EventoNuevoPage />} />
        <Route path="/eventos/calendario" element={<CalendarioEventosPage />} />

        {/* Módulo Mesas — Federico Oviedo */}
        <Route path="/mesas" element={<PlanoPage />} />
        <Route path="/mesas/editor" element={
          <ProtectedRoute rolRequerido={ROLES.ADMIN}><EditorPage /></ProtectedRoute>
        } />
        <Route path="/mesas/asignar/:reservaId" element={
          <ProtectedRoute rolRequerido={ROLES.ADMIN}><AsignarPage /></ProtectedRoute>
        } />

        {/* Módulo Pagos — Mariano Figueroa */}
       

        {/* Módulo Invitados — Victor Balbuena */}
        <Route path="/invitados/*" element={<InvitadosRoutes />} />

        {/* Módulo Proveedores */}
        <Route
          path="/proveedores"
          element={
            <ProtectedRoute rolRequerido={ROLES.ADMIN}>
              <ProveedoresList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evento/:id/catering"
          element={
            <ProtectedRoute>
              <SugerenciaCatering />
            </ProtectedRoute>
          }
        />
      
      </Routes>
    </BrowserRouter>
  )
}
