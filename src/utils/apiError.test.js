import { describe, it, expect } from "vitest";
import { getApiErrorMessage } from "./apiError";

// Construye un error tipo-axios con respuesta del servidor.
function axiosError(status, data) {
  return { isAxiosError: true, response: { status, data }, request: {} };
}

describe("getApiErrorMessage", () => {
  it("error de red (sin response) devuelve mensaje de conexión", () => {
    const err = { isAxiosError: true, request: {} }; // request sin response
    expect(getApiErrorMessage(err)).toMatch(/conectar|conexión/i);
  });

  it("401 indica sesión expirada", () => {
    expect(getApiErrorMessage(axiosError(401, {}))).toMatch(/sesión/i);
  });

  it("403 indica falta de permisos", () => {
    expect(getApiErrorMessage(axiosError(403, {}))).toMatch(/permiso/i);
  });

  it("404 sin detalle devuelve mensaje de no encontrado", () => {
    expect(getApiErrorMessage(axiosError(404, {}))).toMatch(/encontr/i);
  });

  it("409 prioriza el detalle del backend", () => {
    const msg = getApiErrorMessage(
      axiosError(409, { details: "La mesa superó su capacidad" }),
    );
    expect(msg).toBe("La mesa superó su capacidad");
  });

  it("400 usa message del backend si está presente", () => {
    const msg = getApiErrorMessage(
      axiosError(400, { message: "El nombre es obligatorio" }),
    );
    expect(msg).toBe("El nombre es obligatorio");
  });

  it("500 devuelve error de servidor", () => {
    expect(getApiErrorMessage(axiosError(500, {}))).toMatch(/servidor/i);
  });

  it("usa el fallback provisto cuando no hay status ni detalle", () => {
    expect(getApiErrorMessage({}, "Algo salió mal")).toBe("Algo salió mal");
  });

  it("acepta un Error nativo con .response preservada", () => {
    const err = new Error("boom");
    err.response = { status: 403, data: {} };
    expect(getApiErrorMessage(err)).toMatch(/permiso/i);
  });

  it("en contexto público (authContext:false) un 401 no menciona la sesión", () => {
    const msg = getApiErrorMessage(
      axiosError(401, {}),
      "No se pudo cargar tu invitación",
      { authContext: false },
    );
    expect(msg).toBe("No se pudo cargar tu invitación");
    expect(msg).not.toMatch(/sesión/i);
  });

  it("en contexto público un 403 cae al fallback en vez de hablar de permisos", () => {
    const msg = getApiErrorMessage(axiosError(403, {}), "Algo falló", {
      authContext: false,
    });
    expect(msg).toBe("Algo falló");
  });
});
