# Contrato Backend — Módulo de Eventos

> Consumer-driven: el frontend define qué necesita. El backend (David / Juan Bautista) cubre los gaps listados en la sección 3.
> El frontend opera con `USE_MOCK = true` hasta que estos endpoints estén disponibles.

---

## 1. Contexto

El módulo de eventos unifica la agenda del salón: cada evento tiene una reserva embebida y pertenece a un tipo que define duración y tiempo de limpieza. El frontend necesita saber los **slots disponibles por día** (no si el día entero está ocupado), porque un día puede tener múltiples eventos en distintas franjas.

---

## 2. Modelos que el frontend consume

### TipoEvento

| Campo              | Tipo      | Descripción                            |
|--------------------|-----------|----------------------------------------|
| `id`               | number    | Clave primaria                         |
| `nombre`           | string    | Nombre del tipo (XV, Casamiento, etc.) |
| `duracionMinutos`  | number    | Duración del evento en minutos         |
| `limpiezaMinutos`  | number    | Tiempo de limpieza post-evento         |
| `color`            | string    | Color hex para la UI                   |
| `activo`           | boolean   | Indica si está disponible para reservar|

### Evento (agregado unificado — reserva embebida)

| Campo             | Tipo                                              | Descripción                              |
|-------------------|---------------------------------------------------|------------------------------------------|
| `id`              | string                                            | UUID del evento                          |
| `nombre`          | string                                            | Nombre del evento                        |
| `descripcion`     | string                                            | Descripción libre                        |
| `tipoEventoId`    | number                                            | Referencia a TipoEvento.id               |
| `fecha`           | string `YYYY-MM-DD`                               | Fecha del evento                         |
| `horaInicio`      | string `HH:mm`                                    | Hora de inicio                           |
| `horaFin`         | string `HH:mm`                                    | Hora de fin (inicio + duracionMinutos)   |
| `franja`          | `'manana'` \| `'tarde'` \| `'noche'`              | Derivado de horaInicio                   |
| `estado`          | `'pendiente'` \| `'en_curso'` \| `'finalizado'` \| `'cancelado'` | Estado del evento |
| `cantidadInvitados` | number                                          | Cantidad de invitados esperados          |
| `cliente.nombre`  | string                                            | Nombre del cliente                       |
| `cliente.email`   | string                                            | Email del cliente                        |
| `cliente.telefono`| string                                            | Teléfono del cliente                     |
| `reserva.id`      | string                                            | UUID de la reserva asociada              |
| `reserva.estado`  | `'pendiente'` \| `'confirmada'` \| `'expirada'` \| `'cancelada'` | Estado de la reserva |
| `reserva.montoTotal` | number                                         | Monto total en pesos                     |
| `reserva.creadoEn`  | string ISO 8601                                 | Fecha de creación                        |
| `reserva.expiraEn`  | string ISO 8601                                 | Fecha de expiración del link de pago     |
| `reserva.fechaPago` | string ISO 8601 \| null                         | Fecha de pago efectivo                   |
| `proveedoresIds`  | string[]                                          | IDs de proveedores contratados           |

---

## 3. Gaps del backend actual (`salon404-eventos`) a cubrir

### Gap 1 — TipoEvento: campos faltantes y endpoints CRUD

El modelo `EventType` actual no expone `DurationMinutes`, `CleanupMinutes`, `Color` ni `IsActive`.

**Endpoints requeridos:**

```
GET    /api/v1/eventtypes              → TipoEvento[]
POST   /api/v1/eventtypes              body: { nombre, duracionMinutos, limpiezaMinutos, color, activo }
PUT    /api/v1/eventtypes/:id          body: campos a actualizar
DELETE /api/v1/eventtypes/:id
```

### Gap 2 — Disponibilidad por slot en vez de bloqueo de día completo

El handler actual `GetDisponibility` excluye el día entero cuando existe una reserva, y la relación evento-reserva es 1:1 por día. El frontend necesita slots libres dentro del día.

**Endpoint requerido:**

```
GET /api/v1/events/availability?date=YYYY-MM-DD&eventTypeId=N
→ string[]   // horarios disponibles en formato 'HH:mm'
```

**Lógica esperada:** para cada día, calcular intervalos ocupados como
`[horaInicio, horaFin + tipo.limpiezaMinutos)` y devolver los starts de 30 min
dentro de la ventana operativa (08:00–23:00) donde cabe el nuevo tipo sin superposición.

### Gap 3 — EventStart / EventFinish requeridos en la respuesta

Los campos `EventStart` y `EventFinish` deben estar presentes en la respuesta de
`GET /api/v1/events` y `GET /api/v1/events/:id`. Si el backend los calcula a partir del
tipo, está bien — pero deben viajar al frontend.

### Gap 4 — Bugs en handlers actuales

| Bug | Handler afectado | Descripción |
|-----|-----------------|-------------|
| `Title` / `Description` no mapeados | `GetEventHandler` | El response de `EventSchedule` solo mapea `Id`, `StartTime`, `EndTime`; `Title` y `Description` viajan en null |
| `DateReserved` no mapeado | `GetReservationsHandler`, `UpdateReservationStatusHandler` | Queda en `0001-01-01` (default de `DateOnly`) en GET y PATCH; solo `CreateReservationHandler` lo mapea |
| `StatusName` en MAYÚSCULAS | Endpoints de reservas | Devuelve el nombre del enum (`PENDING`, `CONFIRMED`…) en vez de un label legible |

### Gap 5 — Datos del cliente y ruta de evento individual

- **Cliente:** la entidad `Event` solo guarda `EventOwner` (un `Guid` de usuario). No tiene nombre/email/teléfono. El frontend necesita mostrar el nombre del cliente en el calendario y la lista. Definir si el endpoint de eventos **incluye** los datos de display del cliente (join con el servicio de usuarios/auth) o si el front debe resolverlos aparte por `EventOwner`.
- **Ruta individual:** hoy no existe `GET /api/v1/events/{id}`; el evento se trae con `GET /api/v1/events?EventId={guid}` (devuelve un array). Agregar la ruta por id simplifica el front.

---

## 4. Mapeo campo frontend ↔ campo backend actual

Nombres tomados de las entidades reales (`Domain/Entities`) y los response DTO.

| Frontend            | Backend actual                          | Estado        |
|---------------------|-----------------------------------------|---------------|
| `nombre`            | `Event.EventName`                       | Presente      |
| `descripcion`       | `Event.Description` (nullable)          | Presente      |
| `fecha`             | `Event.EventDate` (`DateOnly`)          | Presente      |
| `horaInicio`        | `Event.EventStart` (`TimeSpan?`)        | Presente pero **nullable** → debe ser requerido |
| `horaFin`           | `Event.EventFinish` (`TimeSpan?`)       | Presente pero **nullable** → debe ser requerido |
| `tipoEventoId`      | `Event.EventTypeId` (`int`)             | Presente      |
| `estado` (evento)   | `Event.EventStatusId` (`int` → enum)    | Presente como id; falta label legible |
| `cantidadInvitados` | `EventConfiguration.EstimatedGuests`    | Presente, pero en entidad aparte (`EventConfiguration`), no en `Event` |
| `cliente.*`         | — (`Event.EventOwner` es un `Guid`)     | **Falta** — ver Gap 5 |
| `reserva.id`        | `Reservation.Id` / `Event.ReservationId`| Presente      |
| `reserva.estado`    | `Reservation.StatusName`                | Presente pero en MAYÚSCULAS (enum name) |
| `reserva.montoTotal`| `Reservation.TotalAmount` (`decimal`)   | Presente      |
| `reserva.creadoEn`  | `Reservation.CreatedAt`                 | Presente      |
| `reserva.expiraEn`  | `Reservation.ExpirationAt`              | Presente      |
| `reserva.fechaPago` | `Reservation.PaymentDate` (nullable)    | Presente      |
| `franja`            | —                                       | Derivado en el front de `horaInicio` |
| `proveedoresIds`    | `Event.ProvidersIds` (`List<Guid>?`)    | Presente (ojo: el nombre lleva 's' → `ProvidersIds`) |
