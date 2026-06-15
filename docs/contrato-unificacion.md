# Contrato Frontend → Backend: Unificación Reserva+Evento

**Autor:** Federico Oviedo (Frontend)
**Fecha:** Junio 2026
**Backend repo:** salon404-eventos (David Sepúlveda / Juan Bautista)
**Frontend branch:** `feature/unificacion-reserva-evento`

---

## Modelo Evento (esperado del backend)

Cada evento se representa como un único recurso que contiene la reserva embebida 1:1. El frontend espera el siguiente shape:

```json
{
  "id": "evt-002",
  "nombre": "XV de María García",
  "descripcion": "Decoración temática rosa y blanco.",
  "tipoEventoId": 1,
  "fecha": "2026-06-14",
  "horaInicio": "14:00",
  "horaFin": "18:00",
  "franja": "tarde",
  "estado": "en_curso",
  "cantidadInvitados": 120,
  "version": 3,
  "eventOwner": "7d3f985f-b01d-47a8-aee9-6b82a5db70b9",
  "cliente": {
    "id": "7d3f985f-b01d-47a8-aee9-6b82a5db70b9",
    "nombre": "María García",
    "email": "garcia@email.com",
    "telefono": "+54 11 1234-5678"
  },
  "reserva": {
    "id": "res-002",
    "estado": "confirmada",
    "montoTotal": 300000,
    "creadoEn": "2026-05-10T10:00:00Z",
    "expiraEn": "2026-05-17T10:00:00Z",
    "fechaPago": "2026-05-11T10:00:00Z"
  },
  "proveedoresIds": []
}
```

### Campos obligatorios

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string (GUID) | Identificador único del evento |
| `nombre` | string | Nombre descriptivo del evento |
| `tipoEventoId` | number | FK al catálogo de tipos de evento |
| `fecha` | string (YYYY-MM-DD) | Fecha del evento |
| `horaInicio` | string (HH:mm) | Hora de inicio |
| `horaFin` | string (HH:mm) | Hora de fin |
| `franja` | string | `manana`, `tarde` o `noche` |
| `estado` | string | `pendiente`, `en_curso`, `finalizado`, `cancelado` |
| `cantidadInvitados` | number | Cantidad de invitados estimada |
| `version` | number | Versión para optimistic locking |
| `eventOwner` | string (GUID) | ID del usuario propietario |
| `cliente` | object | Datos denormalizados del cliente |
| `reserva` | object | Reserva embebida con `estado`, `montoTotal`, `expiraEn`, `fechaPago` |

---

## Endpoints requeridos

### GET /api/v1/events

Devuelve el listado paginado/filtrado de eventos.

**Query params:**

| Param | Tipo | Descripción |
|---|---|---|
| `estado` | string | Filtra por estado del evento |
| `tipoEventoId` | number | Filtra por tipo de evento |
| `fechaDesde` | string (YYYY-MM-DD) | Fecha mínima |
| `fechaHasta` | string (YYYY-MM-DD) | Fecha máxima |
| `eventOwner` | string (GUID) | Filtra por propietario |
| `busqueda` | string | Búsqueda por nombre, cliente o email |

**Response:** `200 OK` → `Array<Evento>`

### GET /api/v1/events/{id}

Devuelve el detalle completo de un evento.

**Response:** `200 OK` → `Evento`

**Errores:**
- `404 Not Found` si el evento no existe.

### POST /api/v1/events

Crea un nuevo evento con reserva embebida.

**Body de creación:**

```json
{
  "nombre": "Bautismo Valentino",
  "descripcion": "Celebración de bautismo con almuerzo.",
  "tipoEventoId": 5,
  "fecha": "2026-06-20",
  "horaInicio": "09:00",
  "horaFin": "12:00",
  "eventOwner": "user-guid-101",
  "cliente": {
    "id": "user-guid-101",
    "nombre": "Marcela Romero",
    "email": "mromero@email.com",
    "telefono": "+54 11 4321-0011"
  },
  "reserva": {
    "estado": "pendiente",
    "montoTotal": 150000,
    "expiraEn": "2026-06-20T09:15:00Z"
  }
}
```

**Response:** `201 Created` → `Evento` (con `id`, `version: 1` y reserva con `id` asignado)

**Errores:**
- `409 Conflict` si el horario ya no está disponible.

### PUT /api/v1/events/{id}

Actualiza un evento existente usando optimistic locking.

**Body:**

```json
{
  "nombre": "Nuevo nombre",
  "descripcion": "...",
  "cantidadInvitados": 80,
  "notas": "...",
  "version": 3
}
```

**Response:** `200 OK` → `Evento` actualizado (con `version` incrementada)

**Errores:**
- `404 Not Found`
- `409 Conflict` si la versión no coincide.

### PATCH /api/v1/events/{id}/status

Cambia el estado del evento.

**Body:**

```json
{
  "estado": "cancelado",
  "version": 3
}
```

**Response:** `200 OK` → `Evento` actualizado

**Errores:**
- `404 Not Found`
- `409 Conflict` si la versión no coincide.

### PATCH /api/v1/events/{id}/reservation/status

Cambia el estado de la reserva embebida.

**Body:**

```json
{
  "estado": "cancelada",
  "version": 3
}
```

**Response:** `200 OK` → `Evento` actualizado (reserva embebida modificada y `version` incrementada)

**Errores:**
- `404 Not Found`
- `409 Conflict` si la versión no coincide.

### GET /api/v1/events/availability?fecha={fecha}

Devuelve los eventos de una fecha específica para el calendario de disponibilidad.

**Response:** `200 OK` → `{ eventos: Array<Evento> }`

---

## Gaps identificados

| # | Gap | Impacto | Prioridad |
|---|---|---|---|
| 1 | **Optimistic locking:** el modelo `Event` no expone `version`. | Edición concurrente insegura. | Alta |
| 2 | **GET /events/{id}:** no existe endpoint RESTful por ID. | El frontend usa filtro por query (`?eventId=X`). | Media |
| 3 | **PUT/PATCH /events/{id}:** no existen endpoints de edición/cancelación. | Admin no puede editar ni cancelar eventos. | Alta |
| 4 | **Cliente expandido:** `EventResponse` solo devuelve `eventOwner` (GUID). | La lista y el detalle no muestran nombre/email del cliente. | Media |
| 5 | **GET /user/{id} en auth:** no existe endpoint para resolver usuarios. | Workaround si no se expande el cliente en `EventResponse`. | Baja |
| 6 | **Autenticación real:** los endpoints no requieren `[Authorize]`. | Seguridad post-MVP. | Baja |

> Ver detalle completo en [`docs/gaps-backend-unificacion.md`](./gaps-backend-unificacion.md).

---

## Códigos de error esperados

| Código | Cuándo ocurre | Mensaje esperado (frontend) |
|---|---|---|
| `400 Bad Request` | Payload inválido | Depende del campo fallido |
| `404 Not Found` | Evento no encontrado | "Evento no encontrado" |
| `409 Conflict` | Conflicto de versión (optimistic locking) | "Este evento fue modificado por otro usuario. Recargá la página." |
| `409 Conflict` | Capacidad/horario excedido al crear | "Ese horario ya no está disponible. Elegí otro." |

---

## Notas de integración

- El frontend trabaja actualmente con `USE_MOCK = true` en `src/services/eventosService.js`.
- Cuando el backend cumpla este contrato, se debe cambiar `USE_MOCK = false` y ajustar `VITE_API_EVENTOS_URL` en `.env.local`.
- Los IDs de evento son GUIDs en el backend; el frontend ya usa strings en los mocks.
- El campo `version` debe incrementarse en cada mutación exitosa del evento.
