import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CheckIn from "./CheckIn";
import { invitadosService } from "../../services/invitadosService";
import { getEvento } from "../../services/eventosService";
import { successToast, errorToast } from "../../globals/toast";

// useParams fijo para la ruta /checkin/:eventId/:qrToken
vi.mock("react-router-dom", () => ({
  useParams: () => ({ eventId: "ev-1", qrToken: "qr-1" }),
}));

vi.mock("../../services/invitadosService", () => ({
  invitadosService: {
    getByTicket: vi.fn(),
    updateTicketStatus: vi.fn(),
  },
}));

vi.mock("../../services/eventosService", () => ({
  getEvento: vi.fn(),
}));

vi.mock("../../globals/toast", () => ({
  successToast: vi.fn(),
  errorToast: vi.fn(),
}));

// useAuth devuelve un usuario mutable por test (canManageEvent es real, no se mockea).
let authState = { user: null, loading: false };
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => authState,
}));

const EVENTO = { id: "ev-1", eventOwner: "owner-1" };
const TICKET_NO_INGRESADO = {
  guestName: "Ana García",
  eventName: "Boda",
  eventDate: "2026-07-01",
  tableName: "Mesa 1",
  qrCodeToken: "qr-1",
  isScanned: false,
};

describe("CheckIn — gating y confirmación real", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { user: null, loading: false };
    getEvento.mockResolvedValue(EVENTO);
    invitadosService.getByTicket.mockResolvedValue(TICKET_NO_INGRESADO);
    invitadosService.updateTicketStatus.mockResolvedValue({});
  });

  it("bloquea el check-in si el usuario no es admin ni responsable", async () => {
    authState = { user: { id: "otro", role: "User" }, loading: false };

    render(<CheckIn />);

    await waitFor(() => {
      expect(screen.getByText(/Acceso restringido/i)).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /registrar ingreso/i }),
    ).not.toBeInTheDocument();
  });

  it("permite registrar el ingreso a un admin y muestra éxito", async () => {
    authState = { user: { id: "x", role: "Admin" }, loading: false };
    // Tras escanear, el re-fetch devuelve el ticket ya usado.
    invitadosService.getByTicket
      .mockResolvedValueOnce(TICKET_NO_INGRESADO)
      .mockResolvedValueOnce({ ...TICKET_NO_INGRESADO, isScanned: true, scannedAt: "2026-07-01T20:00:00Z" });

    render(<CheckIn />);

    const boton = await screen.findByRole("button", { name: /registrar ingreso/i });
    fireEvent.click(boton);

    await waitFor(() => {
      expect(invitadosService.updateTicketStatus).toHaveBeenCalledWith("ev-1", "qr-1");
    });
    expect(successToast).toHaveBeenCalled();
    // El re-fetch trae el ticket escaneado: la UI debe reflejar el ingreso.
    expect(await screen.findByText(/Esta entrada ya fue utilizada/i)).toBeInTheDocument();
  });

  it("no finge éxito si el backend rechaza el ingreso", async () => {
    authState = { user: { id: "owner-1", role: "User" }, loading: false }; // owner del evento
    invitadosService.updateTicketStatus.mockRejectedValue({
      response: { status: 409, data: { details: "El ticket ya fue usado" } },
    });

    render(<CheckIn />);

    const boton = await screen.findByRole("button", { name: /registrar ingreso/i });
    fireEvent.click(boton);

    await waitFor(() => {
      expect(errorToast).toHaveBeenCalled();
    });
    expect(successToast).not.toHaveBeenCalled();
    // Sigue mostrando el botón (no se marcó como ingresado falsamente).
    expect(
      screen.getByRole("button", { name: /registrar ingreso/i }),
    ).toBeInTheDocument();
  });
});
