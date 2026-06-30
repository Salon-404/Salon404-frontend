import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { invitadosService } from "./invitadosService";
import { TOKEN_KEY } from "../constants/auth";

vi.mock("axios");

const FAKE_TOKEN = "fake.jwt.token";

// Busca, entre los argumentos de la última llamada al mock, el header Authorization enviado.
function bearerEnviado(mockFn) {
  const call = mockFn.mock.calls.at(-1) || [];
  for (const arg of call) {
    if (arg && typeof arg === "object" && arg.headers && "Authorization" in arg.headers) {
      return arg.headers.Authorization;
    }
  }
  return undefined;
}

describe("invitadosService — autenticación con token real", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    axios.get.mockResolvedValue({ data: {} });
    axios.post.mockResolvedValue({ data: {} });
    axios.put.mockResolvedValue({ data: {} });
    axios.delete.mockResolvedValue({ data: {} });
  });

  describe("endpoints autenticados envían el token del usuario logueado", () => {
    beforeEach(() => {
      localStorage.setItem(TOKEN_KEY, FAKE_TOKEN);
    });

    it("getAll manda Bearer con el token de localStorage", async () => {
      await invitadosService.getAll("ev-1", 1, 10);
      expect(bearerEnviado(axios.get)).toBe(`Bearer ${FAKE_TOKEN}`);
    });

    it("create manda Bearer", async () => {
      await invitadosService.create("ev-1", { fullName: "Ana", dietTypeId: 1 });
      expect(bearerEnviado(axios.post)).toBe(`Bearer ${FAKE_TOKEN}`);
    });

    it("update manda Bearer", async () => {
      await invitadosService.update("ev-1", "g-1", { fullName: "Ana", dietTypeId: 1 });
      expect(bearerEnviado(axios.put)).toBe(`Bearer ${FAKE_TOKEN}`);
    });

    it("delete manda Bearer", async () => {
      await invitadosService.delete("ev-1", "g-1");
      expect(bearerEnviado(axios.delete)).toBe(`Bearer ${FAKE_TOKEN}`);
    });

    it("getCateringSummary manda Bearer", async () => {
      await invitadosService.getCateringSummary("ev-1");
      expect(bearerEnviado(axios.get)).toBe(`Bearer ${FAKE_TOKEN}`);
    });

    it("getTicket manda Bearer", async () => {
      await invitadosService.getTicket("ev-1", "g-1");
      expect(bearerEnviado(axios.get)).toBe(`Bearer ${FAKE_TOKEN}`);
    });

    it("generarTicket manda Bearer", async () => {
      await invitadosService.generarTicket("ev-1", "g-1");
      expect(bearerEnviado(axios.post)).toBe(`Bearer ${FAKE_TOKEN}`);
    });

    // El check-in es una operación autenticada (admin/responsable). Hoy iba SIN token => 401.
    it("getByTicket (check-in) manda Bearer", async () => {
      await invitadosService.getByTicket("ev-1", "qr-1");
      expect(bearerEnviado(axios.get)).toBe(`Bearer ${FAKE_TOKEN}`);
    });

    it("updateTicketStatus (check-in scan) manda Bearer", async () => {
      await invitadosService.updateTicketStatus("ev-1", "qr-1");
      expect(bearerEnviado(axios.put)).toBe(`Bearer ${FAKE_TOKEN}`);
    });
  });

  describe("endpoints públicos por token NO envían Authorization", () => {
    beforeEach(() => {
      // Aunque hubiera un token, los endpoints [AllowAnonymous] no deben mandarlo.
      localStorage.setItem(TOKEN_KEY, FAKE_TOKEN);
    });

    it("getByToken no manda Authorization", async () => {
      await invitadosService.getByToken("INV-123");
      expect(bearerEnviado(axios.get)).toBeUndefined();
    });

    it("updateByToken no manda Authorization", async () => {
      await invitadosService.updateByToken("INV-123", { fullName: "Ana", dietTypeId: 1 });
      expect(bearerEnviado(axios.put)).toBeUndefined();
    });
  });

  describe("sin sesión no se filtra ningún token hardcodeado", () => {
    it("getAll sin token en localStorage no manda Authorization", async () => {
      await invitadosService.getAll("ev-1", 1, 10);
      expect(bearerEnviado(axios.get)).toBeUndefined();
    });
  });
});
