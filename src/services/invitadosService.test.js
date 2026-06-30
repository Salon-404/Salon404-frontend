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

  describe("downloadTemplate e importExcel", () => {
    beforeEach(() => {
      localStorage.setItem(TOKEN_KEY, FAKE_TOKEN);
    });

    it("downloadTemplate manda Bearer, responseType blob y params maxRows", async () => {
      const fakeBlob = new Blob(["fake excel"]);
      axios.get.mockResolvedValue({
        data: fakeBlob,
        headers: { "content-disposition": 'attachment; filename="plantilla.xlsx"' },
      });

      // Mockear URL APIs y espiar el link real
      vi.spyOn(window.URL, "createObjectURL").mockReturnValue("blob:mock");
      vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => {});
      vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      const removeSpy = vi.spyOn(HTMLAnchorElement.prototype, "remove").mockImplementation(() => {});

      await invitadosService.downloadTemplate("ev-1");

      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:5201/api/v1/events/ev-1/Guests/excel-template",
        expect.objectContaining({
          params: { maxRows: 150 },
          headers: { Authorization: `Bearer ${FAKE_TOKEN}` },
          responseType: "blob",
        }),
      );
      // Verificar que el link se creó con el nombre correcto
      const link = document.body.appendChild.mock.calls[0][0];
      expect(link.getAttribute("download")).toBe("plantilla.xlsx");
      expect(clickSpy).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it("downloadTemplate (sin content-disposition) usa nombre por defecto", async () => {
      axios.get.mockResolvedValue({
        data: new Blob(["fake"]),
        headers: {},
      });

      vi.spyOn(window.URL, "createObjectURL").mockReturnValue("blob:mock");
      vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => {});
      vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      vi.spyOn(HTMLAnchorElement.prototype, "remove").mockImplementation(() => {});

      await invitadosService.downloadTemplate("ev-1");

      const link = document.body.appendChild.mock.calls[0][0];
      expect(link.getAttribute("download")).toBe("plantilla_invitados_ev-1.xlsx");

      vi.restoreAllMocks();
    });

    it("importExcel manda Bearer sin Content-Type manual (lo setea el browser)", async () => {
      const fakeResponse = { data: { Message: "Ok", TotalImported: 3 } };
      axios.post.mockResolvedValue(fakeResponse);

      const fakeFile = new File(["a"], "datos.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const result = await invitadosService.importExcel("ev-1", fakeFile);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5201/api/v1/events/ev-1/Guests/import-excel",
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${FAKE_TOKEN}`,
          }),
        }),
      );
      // No debe incluir Content-Type manual (lo setea axios/browser con boundary)
      const configHeaders = axios.post.mock.calls[0][2]?.headers;
      expect(configHeaders).not.toHaveProperty('Content-Type');
      expect(result).toEqual({ Message: "Ok", TotalImported: 3 });
    });
  });
});
