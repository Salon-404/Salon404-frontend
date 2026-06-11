import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import DisponibilityPage from "./pages/Disponibility/DisponibilityPage";
import ReservasPage from "./pages/reservas/ReservasPage";
import NuevaReservaPage from "./pages/reservas/NuevaReservaPage";
import EditarReservaPage from "./pages/reservas/EditarReservaPage";
import CalendarioPage from "./pages/reservas/CalendarioPage";
import ReservaDetailPage from "./pages/reservas/ReservaDetailPage";
import PlanoPage from "./pages/mesas/PlanoPage";
import EditorPage from "./pages/mesas/EditorPage";
import AsignarPage from "./pages/mesas/AsignarPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardPage from "./pages/dashboard/DashboardPage";
import { ROLES } from "./constants/auth";
import CalendarioEventosPage from "./pages/eventos/CalendarioEventosPage";

// Módulo Invitados — Victor Balbuena (por hacer)
// import { InvitadosRoutes } from './pages/invitados/InvitadosRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Módulo Auth — Federico Oviedo */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/home" element={<HomePage />} />
        <Route path="/disponibilidad" element={<DisponibilityPage />} />

        {/* Módulo Reservas — Federico Oviedo */}
        <Route path="/reservas" element={<ReservasPage />} />
        <Route path="/reservas/calendario" element={<CalendarioPage />} />
        <Route
          path="/reservas/nueva"
          element={
            <ProtectedRoute rolRequerido={ROLES.CLIENTE}>
              <NuevaReservaPage />
            </ProtectedRoute>
          }
        />
        <Route path="/reservas/:id" element={<ReservaDetailPage />} />
        <Route path="/reservas/:id/editar" element={<EditarReservaPage />} />

        {/* Módulo Mesas — Federico Oviedo */}
        <Route path="/mesas" element={<PlanoPage />} />
        <Route
          path="/mesas/editor"
          element={
            <ProtectedRoute rolRequerido={ROLES.ADMIN}>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mesas/asignar/:reservaId"
          element={
            <ProtectedRoute rolRequerido={ROLES.ADMIN}>
              <AsignarPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Eventos (agenda unificada) — Federico Oviedo */}
        <Route path="/eventos/calendario" element={<CalendarioEventosPage />} />

        {/* <Route path="/invitados/*" element={<InvitadosRoutes />} /> */}

        {/* Módulo Dashboard — EXCLUSIVO ADMIN */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute rolRequerido={ROLES.ADMIN}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
