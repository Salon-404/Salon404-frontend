// Traduce un error de axios (o un Error con .response) a un mensaje claro para la UI.
// Prioriza el detalle del backend (details/message) y cae en mensajes por código de estado.
const MENSAJE_POR_DEFECTO = "Ocurrió un error. Intentá de nuevo.";

export function getApiErrorMessage(error, fallback = MENSAJE_POR_DEFECTO) {
  const response = error?.response;

  // Sin respuesta del servidor: red caída, CORS, timeout.
  if (!response) {
    if (error?.request) {
      return "No se pudo conectar con el servidor. Revisá tu conexión.";
    }
    return fallback;
  }

  const backendMsg = response.data?.details || response.data?.message;
  const status = response.status;

  switch (status) {
    case 400:
      return backendMsg || "Datos inválidos. Revisá la información ingresada.";
    case 401:
      return "Tu sesión expiró. Iniciá sesión de nuevo.";
    case 403:
      return "No tenés permiso para realizar esta acción.";
    case 404:
      return backendMsg || "No se encontró el recurso solicitado.";
    case 409:
      return backendMsg || "Conflicto: la operación no se pudo completar.";
    default:
      if (status >= 500) {
        return "Error del servidor. Intentá de nuevo más tarde.";
      }
      return backendMsg || fallback;
  }
}
