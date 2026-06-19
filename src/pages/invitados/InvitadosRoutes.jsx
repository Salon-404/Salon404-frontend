import { Routes, Route, Link, useLocation } from "react-router-dom";
import { InvitadosPage } from "./InvitadosPage";
import { GestionMenu } from "./GestionMenu";

export const InvitadosRoutes = () => {
  const location = useLocation();

  return (
    <div>
      {/* Barra de navegación interna del módulo de Invitados */}
      <div className="bg-white shadow-sm border-b px-8 py-4 mb-4 flex space-x-6">
        <Link
          to="/invitados"
          className={`font-semibold pb-2 border-b-2 transition-all ${location.pathname === "/invitados" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Lista de Invitados
        </Link>
        <Link
          to="/invitados/menu"
          className={`font-semibold pb-2 border-b-2 transition-all ${location.pathname === "/invitados/menu" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Gestión de Menú
        </Link>
      </div>

      {/* Enrutamiento interno */}
      <Routes>
        <Route path="/" element={<InvitadosPage />} />
        <Route path="/menu" element={<GestionMenu />} />
      </Routes>
    </div>
  );
};
