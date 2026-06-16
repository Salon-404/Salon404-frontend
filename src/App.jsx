import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import PlanoPage from './pages/mesas/PlanoPage'
import EditorPage from './pages/mesas/EditorPage'
import AsignarPage from './pages/mesas/AsignarPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/home/HomePage'
import DisponibilityPage from './pages/Disponibility/DisponibilityPage'
import EventoNuevoPage from './pages/eventos/EventoNuevoPage'
import EventosPage from './pages/eventos/EventosPage'
import EventoDetailPage from './pages/eventos/EventoDetailPage'
import EventoEditarPage from './pages/eventos/EventoEditarPage'
import CalendarioEventosPage from './pages/eventos/CalendarioEventosPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ClienteLayout from './components/global/ClienteLayout'
import RedirectConBanner from './components/common/RedirectConBanner'
import { ROLES } from './constants/auth'
import PagosPage from './pages/pagos/PagosPage'
// Módulo Invitados — Victor Balbuena
import { InvitadosRoutes } from './pages/invitados/InvitadosRoutes'

// Nuevos Módulos
import ProveedoresPage from './pages/proveedores/ProveedoresPage'
import CronogramaPage from './pages/eventos/CronogramaPage'
import CateringPage from './pages/eventos/CateringPage'


// Módulo Proveedores
import ProveedoresList from "./pages/proveedores/ProveedoresList";
import SugerenciaCatering from "./pages/catering/SugerenciaCatering";
import CronogramaEvento from "./pages/cronograma/CronogramaEvento";

// Módulo Invitados — Victor Balbuena
import { InvitadosRoutes } from './pages/invitados/InvitadosRoutes'

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
        {/* Inicio de la aplicación (Landing Page pública) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/disponibilidad" element={<DisponibilityPage />} />

        {/* Módulo Auth — Federico Oviedo */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Redirects — rutas legacy /reservas → /cliente/eventos */}
        <Route path="/reservas" element={<RedirectConBanner to="/cliente/eventos" />} />
        <Route path="/reservas/calendario" element={<RedirectConBanner to="/cliente/cronograma" />} />
        <Route path="/reservas/nueva" element={<RedirectConBanner to="/admin/eventos/nuevo" />} />
        <Route path="/reservas/:id" element={<ReservaRedirect />} />
        <Route path="/reservas/:id/editar" element={<ReservaEditarRedirect />} />

        {/* ======================= RUTAS DEL CLIENTE ======================= */}
        <Route path="/cliente" element={<ProtectedRoute rolRequerido={ROLES.CLIENTE}><ClienteLayout /></ProtectedRoute>}>
          <Route path="pagos" element={<PagosPage />} />
          <Route path="invitados/*" element={<InvitadosRoutes />} />
          <Route path="mesas" element={<PlanoPage />} />
          <Route path="cronograma" element={<CronogramaPage />} />
          <Route path="catering" element={<CateringPage />} />
          <Route path="proveedores" element={<ProveedoresPage />} />
        </Route>
        {/* Redirects — rutas legacy /reservas → /eventos */}
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
        {/* Redirects reservas → eventos */}
        <Route path="/reservas" element={<RedirectConBanner to="/eventos" />} />
        <Route path="/reservas/calendario" element={<RedirectConBanner to="/eventos/calendario" />} />
        <Route path="/reservas/nueva" element={<RedirectConBanner to="/eventos/nuevo" />} />
        <Route path="/reservas/:id" element={<ReservaRedirect />} />
        <Route path="/reservas/:id/editar" element={<ReservaEditarRedirect />} />

        {/* ======================= RUTAS DEL ADMIN ======================= */}
        <Route path="/admin" element={<ProtectedRoute rolRequerido={ROLES.ADMIN}><ClienteLayout /></ProtectedRoute>}>
          {/* Reutilizo ClienteLayout temporalmente para Admin, pero podria ser AdminLayout */}
          <Route path="eventos" element={<EventosPage />} />
          <Route path="eventos/:id" element={<EventoDetailPage />} />
          <Route path="eventos/:id/editar" element={<EventoEditarPage />} />
          <Route path="eventos/nuevo" element={<EventoNuevoPage />} />
          <Route path="eventos/calendario" element={<CalendarioEventosPage />} />
          <Route path="eventos/:id/cronograma" element={<CronogramaPage />} />
          <Route path="eventos/:id/catering" element={<CateringPage />} />

          <Route path="proveedores" element={<ProveedoresPage />} />

          <Route path="mesas" element={<PlanoPage />} />
          <Route path="mesas/editor" element={<EditorPage />} />
          <Route path="mesas/asignar/:reservaId" element={<AsignarPage />} />

          <Route path="pagos" element={<PagosPage />} />
          <Route path="invitados/*" element={<InvitadosRoutes />} />
        </Route>

        {/* Rutas Legacy Globales (Mantenidas por compatibilidad temporal si hace falta) */}
        <Route path="/pagos" element={<Navigate to="/login" replace />} />
        <Route path="/proveedores" element={<Navigate to="/admin/proveedores" replace />} />
        {/* Módulo Pagos — Mariano Figueroa */}
        <Route path="/pagos" element={<PagosPage />} />

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
        <Route path="/pagos" element={<PagosPage />} />

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
        <Route
          path="/evento/:id/cronograma"
          element={
            <ProtectedRoute>
              <CronogramaEvento />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

