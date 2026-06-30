import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvitadosList } from "./InvitadosList";
import { invitadosService } from "../../services/invitadosService";
import { getEvento } from "../../services/eventosService";

vi.mock("../../services/invitadosService", () => ({
  invitadosService: { getAll: vi.fn() },
}));

vi.mock("../../services/eventosService", () => ({
  getEvento: vi.fn(),
  getSalonDiagram: vi.fn(),
}));

vi.mock("../../services/mesasService", () => ({
  getTablesByEventId: vi.fn(),
}));

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

let authState = { user: null, loading: false };
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => authState,
}));

describe("InvitadosList — gating de administración", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { user: null, loading: false };
    getEvento.mockResolvedValue({ id: "ev-1", eventOwner: "owner-1" });
    invitadosService.getAll.mockResolvedValue({
      data: [],
      total: 0,
      totalPages: 1,
    });
  });

  it("muestra acceso restringido a un usuario que no es admin ni dueño", async () => {
    authState = { user: { id: "otro", role: "User" }, loading: false };

    render(<InvitadosList eventId="ev-1" />);

    expect(await screen.findByText(/Acceso restringido/i)).toBeInTheDocument();
    expect(screen.queryByText(/Agregar Invitado/i)).not.toBeInTheDocument();
  });

  it("permite administrar y lista los invitados a un admin", async () => {
    authState = { user: { id: "x", role: "SuperAdmin" }, loading: false };
    invitadosService.getAll.mockResolvedValue({
      data: [
        {
          id: "g1",
          fullName: "Ana García",
          guestStatusId: 2,
          guestStatusName: "Confirmado",
        },
      ],
      total: 1,
      totalPages: 1,
    });

    render(<InvitadosList eventId="ev-1" />);

    expect(await screen.findByText("Ana García")).toBeInTheDocument();
    expect(screen.getByText(/Agregar Invitado/i)).toBeInTheDocument();
  });

  it("permite administrar al responsable/dueño del evento", async () => {
    authState = { user: { id: "owner-1", role: "User" }, loading: false };

    render(<InvitadosList eventId="ev-1" />);

    expect(await screen.findByText(/Agregar Invitado/i)).toBeInTheDocument();
    expect(screen.queryByText(/Acceso restringido/i)).not.toBeInTheDocument();
  });
});
