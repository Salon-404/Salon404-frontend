# Spec: Unificación Reserva + Evento

**Autor:** Federico Oviedo (Frontend)
**Fecha:** 13/06/2026
**Deadline:** 26/06/2026 (8 días)
**Branch de trabajo:** `feature/unificacion-reserva-evento` (desde `develop`)
**PR target:** `develop` → QA (Ramiro Tonelli) → `main`
**Rutas principales:** `/eventos`, `/eventos/nuevo`, `/eventos/:id`, `/eventos/calendario`
**Iteración:** 3 de 3 del scope asignado a Federico en Sprint 2 (cierre)

---

## 0. Alcance de esta iteración

### ✅ INCLUYE

- Derribar la pantalla `/reservas` como entidad separada. El objeto de dominio es `Evento` con `reserva` embebida (1:1).
- Lista unificada `/eventos` que reemplaza a `/reservas`.
- Wizard unificado `/eventos/nuevo` que reemplaza a `/reservas/nueva`.
- Pantalla de detalle unificada `/eventos/:id` que reemplaza a `/reservas/:id` y `/reservas/:id/editar`.
- Calendario `/eventos/calendario` consume la misma lista unificada.
- Redirects con banner temporal en todas las rutas viejas `/reservas/*`.
- Diferenciación de roles: admin ve todo, cliente ve solo SUS eventos (coherente con el calendario de PR #15).
- Campo `descripcion` del evento agregado al wizard (opcional, max 500 chars).

### ❌ NO INCLUYE (futuro)

- Pasarela de pago (Mercado Pago, etc.) → fuera de scope del sprint
- Notificaciones por email (confirmación, recordatorio) → futuro sprint
- ABM de proveedores vinculados a un evento → otro equipo (Eliana + Juan)
- Integración con backend real (`USE_MOCK = true` durante toda la iteración) → issue ya existente

---

## 1. Contexto y problema actual

Hoy el frontend tiene **dos entidades separadas** que en realidad son la misma cosa vista desde dos ángulos:

- `Reserva` con CRUD propio en `/reservas`, `/reservas/nueva`, `/reservas/:id`, `/reservas/:id/editar`
- `Evento` con vista de calendario en `/eventos/calendario`

El backend ya consolidó esto: `salon404-reservas` está **archivado** y fusionado en `salon404-eventos`. El modelo de dominio del backend es `Evento` con `reserva` embebida (1:1). El frontend refleja la situación vieja.

Esto genera:

- **Duplicación de UI**: dos wizards, dos listas, dos páginas de detalle
- **Datos desincronizados**: los mocks de `reservasMock.js` y `eventosMock.js` no se hablan
- **Doble fuente de verdad para el cliente**: si el admin edita un evento desde el calendario, no se refleja en la lista de reservas
- **Inconsistencia con el backend**: el contrato del backend (`docs/contrato-backend-eventos.md`) define `Evento.reserva` embebida; el frontend lo ignora

---

## 2. Decisiones tomadas en la fase de planning

| # | Decisión | Resolución | Motivo |
|---|----------|------------|--------|
| 1 | ¿Qué significa "unificación reserva+evento"? | Opción B: derribar `/reservas` como entidad separada, consolidar en `/eventos` | El backend ya lo hizo, la guía lo insinúa, menos deuda técnica |
| 2 | ¿Pantalla vieja `/reservas` durante la transición? | Banner "Mudamos a /eventos" + redirect con vuelta atrás 30 días | Menos fricción con QA, links viejos siguen funcionando |
| 3 | ¿Campo `descripcion` del evento? | Sí, agregarlo al wizard ahora (opcional, max 500 chars) | El backend ya lo pide, evitar migración doble |
| 4 | ¿Diferenciación de roles en `/eventos`? | Admin ve todo, cliente ve solo SUS eventos | Coherente con el patrón del calendario (PR #15) |
| 5 | ¿Reutilizar lo que ya funciona? | Sí: `useDisponibilidad`, `useHorariosDisponibles`, `useBloqueoHorario`, `calcularHorariosDisponibles`, `CalendarioDisponibilidad`, `SelectorHorarios`, `CountdownReserva` | No tocar lo que está verde |
| 6 | ¿Renegociar PRs #15 y #19 con QA? | Sí, comunicar ANTES de empezar | La unificación cambia parte de lo que prometen esas PRs (asumen `Reserva` como destino) |
| 7 | ¿Cuándo se borra `ReservaForm` viejo? | Al final de Día 6, una vez que `EventoEditarPage` use el `FormularioReserva` nuevo | Migración atómica, sin ventana de "no funciona nada" |

---

## 3. Principios de ingeniería (no negociables)

### 3.1 Clean Code

- Funciones de máximo 20 líneas
- Nombres descriptivos: `calcularFranjaDeEvento` no `getData`
- Early returns para validaciones
- Sin magic numbers: todo a constantes
- **Sanitización de inputs**: renderizar `descripcion` como texto plano, nunca con `dangerouslySetInnerHTML`. Sanitizar con DOMPurify si se permite markdown en el futuro

### 3.2 SOLID

| Principio | Aplicación |
|-----------|------------|
| **S**ingle Responsibility | `EventoCard` solo renderiza fila. `EventoFiltros` solo renderiza filtros. `useEventos` solo consulta eventos. |
| **O**pen/Closed | Agregar nuevo campo al `Evento` no modifica componentes. Se extiende via modelo. |
| **L**iskov Substitution | Componentes reciben props tipadas. `EventoCard` reemplazable por otro con misma interfaz. |
| **I**nterface Segregation | `EventoDetalleModal` recibe evento entero, pero `EventoCard` solo recibe los campos que renderiza. |
| **D**ependency Inversion | Hooks reciben services como parámetro (vía mock). Componente no sabe si viene de mock o API real. |

### 3.3 Reutilización

- `calcularHorariosDisponibles` (Día 1) → se REUTILIZA en `EventoNuevoPage` (Día 2)
- `useHorariosDisponibles` (Día 2) → se REUTILIZA en `EventoNuevoPage` (Día 2)
- `useBloqueoHorario` (Día 2) → se REUTILIZA en `EventoNuevoPage` (Día 2)
- `CalendarioDisponibilidad`, `SelectorHorarios`, `CountdownReserva` (Día 3) → se REUTILIZAN
- `FormularioReserva` (Día 3) → se REUTILIZA con un campo extra (`descripcion`)
- `CalendarioEventos`, `DayEventsPopover` (PR #15) → se ACTUALIZAN para consumir la lista unificada

### 3.4 Funciones puras donde sea posible

- `getFranja(horaInicio)` → ya existe, se REUTILIZA
- `sumarMinutos(horaInicio, minutos)` → ya existe, se REUTILIZA
- `formatearFecha(fecha, locale)` → ya existe (date-fns con locale `es`)
- `calcularMontoTotal(precioBase, extras)` → NUEVO, función pura testeable
- `agruparEventosPorFranja(eventos)` → ya existe en `DayEventsPopover`, se mueve a `utils/eventos.js`

---

## 4. Modelo de datos destino (alineado con `docs/contrato-backend-eventos.md`)

```js
// src/constants/eventos.js
export const FRANJAS = {
  MANANA: { value: 'manana', label: 'Mañana', desde: 6, hasta: 14 },
  TARDE: { value: 'tarde', label: 'Tarde', desde: 14, hasta: 20 },
  NOCHE: { value: 'noche', label: 'Noche', desde: 20, hasta: 6 },
}

export const ESTADOS_EVENTO = [
  { value: 'pendiente',  label: 'Pendiente',  badge: 'bg-yellow-100 text-yellow-800' },
  { value: 'en_curso',   label: 'En curso',   badge: 'bg-blue-100 text-blue-800'     },
  { value: 'finalizado', label: 'Finalizado', badge: 'bg-green-100 text-green-800'   },
  { value: 'cancelado',  label: 'Cancelado',  badge: 'bg-slate-100 text-slate-600'   },
]

export const ESTADOS_RESERVA = [
  { value: 'pendiente',  label: 'Pendiente',  badge: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmada', label: 'Confirmada', badge: 'bg-green-100 text-green-800'   },
  { value: 'expirada',   label: 'Expirada',   badge: 'bg-red-100 text-red-700'       },
  { value: 'cancelada',  label: 'Cancelada',  badge: 'bg-slate-100 text-slate-600'   },
]

export function getFranja(horaInicio) { /* ya existe */ }
export function sumarMinutos(horaInicio, minutos) { /* ya existe */ }
```

```js
// src/mocks/eventosMock.js (consolidado, reemplaza a reservasMock.js)
export const eventosMock = [
  {
    id: 'evt-001',
    nombre: 'Bautismo Valentino Romero',
    descripcion: 'Celebración de bautismo con almuerzo posterior.',
    tipoEventoId: 5,
    fecha: '2026-07-05',
    horaInicio: '09:00',
    horaFin: '12:00',
    franja: 'manana',
    estado: 'pendiente',
    cantidadInvitados: 55,
    version: 1, // Optimistic locking — se incrementa en cada update
    eventOwner: 'user-guid-101', // Referencia al User (Guid) — reemplaza a cliente.id
    cliente: { id: 'user-guid-101', nombre: 'Marcela Romero', email: 'mromero@email.com', telefono: '+54 11 4321-0011' },
    reserva: {
      id: 'res-001',
      estado: 'confirmada',
      montoTotal: 180000,
      creadoEn: '2026-05-10T09:00:00Z',
      expiraEn: '2026-05-17T09:00:00Z',
      fechaPago: '2026-05-11T14:30:00Z',
    },
    proveedoresIds: [],
  },
  // ... 8 reservas migradas de reservasMock con su reserva embebida
]
```

---

## 5. Arquitectura técnica

### 5.1 Estructura de archivos (objetivo)

```
src/
  pages/eventos/
    CalendarioEventosPage.jsx           [YA EXISTE — se actualiza en Día 5]
    EventoDetailPage.jsx                [NUEVO — Día 4]
    EventoNuevoPage.jsx                 [NUEVO — Día 2]
    EventoEditarPage.jsx                [NUEVO — Día 4]
    EventosPage.jsx                     [NUEVO — Día 3]

  pages/reservas/
    CalendarioPage.jsx                  [REEMPLAZADO por redirect — Día 6]
    NuevaReservaPage.jsx                [REEMPLAZADO por redirect — Día 6]
    EditarReservaPage.jsx               [REEMPLAZADO por redirect — Día 6]
    ReservaDetailPage.jsx               [REEMPLAZADO por redirect — Día 6]
    ReservasPage.jsx                    [REEMPLAZADO por redirect — Día 6]

  components/eventos/
    CalendarioEventos.jsx               [EXISTE — Día 5]
    CalendarioLegend.jsx                [EXISTE — se mantiene]
    DayEventsPopover.jsx                [EXISTE — Día 5, agrega badge de reserva]
    EstadoEventoBadge.jsx               [EXISTE]
    EventoPill.jsx                      [EXISTE]
    EventoCard.jsx                      [NUEVO — Día 3]
    EstadoReservaBadge.jsx              [NUEVO — Día 3]
    EventoDetalleModal.jsx              [NUEVO — Día 4]
    EventoFiltros.jsx                   [NUEVO — Día 3]

  components/reservas/
    CalendarioDisponibilidad.jsx        [KEEP — reutilizado en EventoNuevoPage]
    SelectorHorarios.jsx                [KEEP — reutilizado]
    CountdownReserva.jsx                [KEEP — reutilizado]
    FormularioReserva.jsx               [KEEP — se le agrega campo descripcion en Día 2]
    ReservaForm.jsx                     [DELETE — Día 6]
    CalendarView.jsx                    [DELETE — Día 6]
    ReservaCard.jsx                     [DELETE — Día 6]
    StatusBadge.jsx                     [DELETE — Día 6 (reemplazado por EstadoReservaBadge)]
    DoubleBookingAlert.jsx              [DELETE — Día 6]
    TablaReservas.jsx                   [DELETE — Día 6]
    FiltrosReservas.jsx                 [DELETE — Día 6]
    ModalDetalleReserva.jsx             [DELETE — Día 6]

  hooks/
    useDisponibilidad.js                [KEEP — actualizado para devolver eventos (Día 1)]
    useHorariosDisponibles.js           [KEEP — actualizado para usar eventos (Día 1)]
    useBloqueoHorario.js                [KEEP — actualizado para usar endpoint de eventos (Día 1)]
    useReservas.js                      [DELETE — reemplazado por useEventos (Día 3)]
    useEventos.js                       [NUEVO — Día 3]

  services/
    reservasService.js                  [DELETE — reemplazado por eventosService (Día 1)]
    disponibilidadService.js            [MODIFY — el lock endpoint pasa a /events/lock (Día 1)]
    eventosService.js                   [NUEVO/MEJORA — Día 1]

  mocks/
    reservasMock.js                     [DELETE — migrado a eventosMock (Día 1)]
    disponibilidadMock.js               [KEEP — sigue siendo la config del salón]
    eventosMock.js                      [YA EXISTE en feature/calendario-eventos — se trae consolidado (Día 1)]
    tiposEventoMock.js                  [NUEVO — unifica los dos mocks duplicados (Día 1)]

  constants/
    eventos.js                          [YA EXISTE — se mantiene]
    reservas.js                         [KEEP — ESTADOS_OPCIONES, MESES siguen siendo útiles, se mueven o se quedan]
```

### 5.2 Hooks (capa de lógica)

```
src/hooks/
  useDisponibilidad.js              ← actualizado: devuelve { eventos, loading, error, refetch }
                                     ← usa AbortController para cancelar requests anteriores cuando cambia la fecha
  useHorariosDisponibles.js         ← actualizado: usa eventos en vez de reservas
  useBloqueoHorario.js              ← actualizado: usa endpoint /events/lock
  useEventos.js                     ← NUEVO: lista de eventos con filtros (reemplaza useReservas)
                                     ← usa AbortController para cancelar requests anteriores cuando cambian los filtros
                                     ← debounce de 300ms en el campo de búsqueda antes de disparar el fetch
  useEventoUpdate.js                ← NUEVO: hook para actualizar eventos con optimistic locking
                                     ← recibe el evento actual, maneja el version, y muestra error si hay conflicto (409)
```

### 5.3 Services (capa de datos)

```
src/services/eventosService.js
  getEventos({ filtros })            → eventos[] (reemplaza getReservas)
  getEvento(id)                      → evento
  createEvento(data)                 → evento (reemplaza createReserva, payload incluye reserva embebida)
  updateEvento(id, data, version)    → evento (incluye version para optimistic locking — backend rechaza con 409 si la versión no coincide)
  updateEstadoEvento(id, estado, version) → evento (incluye version)
  updateEstadoReserva(id, estado, version) → evento (cambia el estado de la reserva embebida, incluye version)
  bloquearHorario(datos)             → reserva temporal (movido de disponibilidadService)
  getDisponibilidad(fecha)           → { eventos: [...] } (movido de disponibilidadService)
```

---

## 6. Testing

### 6.1 Setup

Ya configurado en iteraciones anteriores (Vitest + RTL + jsdom). No se toca.

### 6.2 Tests unitarios (funciones puras)

**Archivo: `src/utils/eventos.js` (NUEVO, consolida helpers)**

| Función | Tests |
|---------|-------|
| `calcularMontoTotal(precioBase, extras)` | Sin extras → precioBase, con extras suma correctamente, extras negativos rechazados |
| `agruparEventosPorFranja(eventos)` | Lista vacía, 1 evento, múltiples franjas, orden por horaInicio |
| `filtrarEventos(eventos, filtros)` | Sin filtros → todos, por estado evento, por estado reserva, por fecha, por cliente, combinados |
| `formatearMonto(monto)` | $1.000, $1.000.000, $0, null/undefined → "$0" |

### 6.3 Tests de hooks

**Archivo: `src/hooks/useEventos.test.js` (NUEVO, reemplaza useReservas.test.js)**

| Escenario | Expected |
|-----------|----------|
| Initial state | loading=true, eventos=[] |
| Fetch success | eventos=[...], loading=false |
| Fetch error | error="...", eventos=[] |
| Set filtros → re-fetch | getEventos llamado con los nuevos filtros |
| Refetch | getEventos llamado de nuevo |

**Archivos actualizados (Día 1):**
- `useDisponibilidad.test.js` — los mocks de service ahora devuelven `eventos` con `reserva` embebida
- `useHorariosDisponibles.test.js` — idem
- `useBloqueoHorario.test.js` — el endpoint ahora es `/events/lock`

### 6.4 Tests de componentes

**Archivos NUEVOS:**
- `EventoCard.test.jsx` — renderiza fila, click abre detalle, badges de estado correctos
- `EstadoReservaBadge.test.jsx` — mapea estado a badge correcto
- `EventoFiltros.test.jsx` — todos los inputs, onCambiarFiltros
- `EventoDetalleModal.test.jsx` — no render si abierto=false, muestra campos del evento Y de la reserva
- `EventoNuevoPage.test.jsx` — integración del wizard
- `EventoDetailPage.test.jsx` — carga, muestra, acciones
- `EventoEditarPage.test.jsx` — carga con datos, submit actualiza, maneja error de conflicto (409)
- `EventosPage.test.jsx` — renderiza lista, filtros, click abre modal
- `useEventoUpdate.test.js` — update exitoso, conflicto de versión (409), retry después de conflicto

**Archivos ACTUALIZADOS (Día 5):**
- `CalendarioEventosPage.test.jsx` — consume useEventos en vez de su propio fetch
- `DayEventsPopover.test.jsx` — muestra badge de reserva

**Archivos BORRADOS (Día 6):**
- `ReservaCard.test.jsx`, `StatusBadge.test.jsx`, `TablaReservas.test.jsx`, `FiltrosReservas.test.jsx`, `ModalDetalleReserva.test.jsx`

### 6.5 Tests de integración

**Archivo: `src/pages/eventos/EventosPage.test.jsx` (NUEVO)**

- Renderiza lista con eventos mock
- Filtros actualizan la lista
- Click en una fila abre el modal
- Modal muestra datos del evento Y de la reserva
- Click en "Editar" navega a `/eventos/:id/editar`
- Click en "Cancelar" pide confirm y llama `updateEstadoEvento`

### 6.6 Tests de edge cases (Día 7)

| Escenario | Qué se testea |
|-----------|---------------|
| 100 eventos en la lista | Performance: render < 1s |
| Evento sin reserva embebida (caso legacy) | Muestra badge "Sin reserva" |
| Reserva expirada pero evento en curso | Warning visual: "Inconsistencia" |
| Doble click en "Confirmar" del wizard | Solo crea un evento |
| Click rápido entre filtros | No race conditions |
| Navegación rápida entre días en el wizard | No race conditions en useHorariosDisponibles |

### 6.7 Cuándo se testea

```
Código nuevo → test ANTES del commit
Código modificado → correr tests afectados + related
Antes del PR → npm run test:run (todo)
```

**Regla: si no tiene test, no se commitea.**

---

## 7. UX y accesibilidad

### 7.1 Lista unificada `/eventos`

**Diseño:**

- Tabla con columnas: Fecha | Horario | Cliente | Tipo | Inv. | Estado evento | Estado reserva | Monto
- Click en una fila → modal de detalle (con datos completos del evento Y de la reserva)
- Filtros arriba: estado evento, estado reserva, rango de fechas, búsqueda por nombre/email de cliente
- Botón "+ Nuevo Evento" arriba a la derecha (visible solo para admin)
- Para clientes: la lista muestra solo SUS eventos (filtro **server-side** por `eventOwner === user.id`). El frontend solo muestra lo que recibe del backend. El filtrado client-side es solo para UX (búsqueda, filtros combinados), no para autorización.

**Estados visuales:**

- Estado evento: `ESTADO_EVENTO` badges
- Estado reserva: `ESTADO_RESERVA` badges (con tooltip si está expirada)
- Reserva pendiente de pago: ícono ⚠️ al lado del monto

### 7.2 Wizard unificado `/eventos/nuevo`

Mismo flujo que la iteración 2 (PR #19), con un campo nuevo:

- Paso 1 (Datos): tipo de evento, **descripcion** (NUEVO, max 500), nombre, invitados, notas, cliente (nombre, email, teléfono)
- Paso 2 (Resumen): muestra todo + el monto total calculado
- Paso 3 (Confirmación): "Evento creado"

El campo `descripcion` se agrega al `FormularioReserva` como un textarea opcional entre "nombre" y "cantidad de invitados".

### 7.3 Detalle unificado `/eventos/:id`

Muestra:
- Header: nombre del evento + estado evento + estado reserva
- Datos del evento: tipo, fecha, horario, franja, invitados, descripción
- Datos del cliente: nombre, email, teléfono
- Datos de la reserva: monto total, fecha de pago, fecha de expiración, estado
- Acciones: Editar, Cancelar evento, Cancelar reserva, Confirmar pago (admin)

### 7.4 Accesibilidad

- ARIA labels en tabla, modal, formulario (idem PR #19)
- Focus trap en modal (deuda técnica conocida del PR #19, **se paga acá**)
- Screen readers anuncian cambios de estado
- Color contrast WCAG AA

---

## 8. Routing y redirects

### 8.1 Nuevas rutas

```jsx
// App.jsx
<Route path="/eventos"                  element={<EventosPage />} />
<Route path="/eventos/calendario"       element={<CalendarioEventosPage />} />
<Route path="/eventos/nuevo"            element={<EventoNuevoPage />} />
<Route path="/eventos/:id"              element={<EventoDetailPage />} />
<Route path="/eventos/:id/editar"       element={<EventoEditarPage />} />
```

### 8.2 Redirects (Día 6)

```jsx
// App.jsx
<Route path="/reservas"                  element={<RedirectConBanner to="/eventos" />} />
<Route path="/reservas/calendario"       element={<RedirectConBanner to="/eventos/calendario" />} />
<Route path="/reservas/nueva"            element={<RedirectConBanner to="/eventos/nuevo" />} />
<Route path="/reservas/:id"              element={<RedirectConBanner to="/eventos/:id" />} />
<Route path="/reservas/:id/editar"       element={<RedirectConBanner to="/eventos/:id/editar" />} />
```

`RedirectConBanner` es un componente que muestra un banner en la parte superior por 5 segundos:

> ℹ️ Esta vista se mudó. Te llevamos a `/eventos` en 5s. [Ir ahora] [Cancelar]

El banner desaparece cuando el usuario hace click en "Ir ahora" o cuando expira el timeout. Mientras tanto, el redirect no se ejecuta (es soft, no `<Navigate replace>`).

### 8.3 Compatibilidad temporal

Las páginas viejas (`pages/reservas/*`) se BORRAN en Día 6, pero `RedirectConBanner` se queda por 30 días desde el merge a `main`. Después, en una iteración futura, se cambia a `<Navigate replace>` directo.

---

## 9. Branching y flujo de trabajo

### 9.1 Branches

```
main ← develop ← feature/unificacion-reserva-evento (ESTA RAMA)
                  ├── (ya mergeada) feature/calendario-mejoras (PR #15)
                  └── (ya mergeada) feature/reservas-disponibilidad (PR #19)
```

### 9.2 Commits (formato)

```
feature: agregar modelo unificado de evento con reserva embebida
refactor: migrar services de reservas a eventos
feature: agregar useEventos hook con filtros
feature: agregar EventoCard con badges de estado evento y reserva
feature: agregar EventoFiltros con búsqueda por cliente
feature: agregar EventoDetalleModal con datos del evento y la reserva
feature: crear EventoNuevoPage reusando CalendarioDisponibilidad y FormularioReserva
feature: agregar campo descripcion al FormularioReserva
feature: crear EventoDetailPage con datos unificados
feature: crear EventoEditarPage
refactor: calendario consume la lista unificada de eventos
refactor: agregar RedirectConBanner para rutas /reservas/*
remove: eliminar pages/reservas, components/reservas, services/reservasService
remove: eliminar mocks/reservasMock (migrado a eventosMock)
test: agregar tests de componentes de eventos
test: agregar edge cases (100 eventos performance, inconsistencia evento/reserva)
docs: agregar autocrítica de iteración 3
docs: actualizar contrato backend con gaps de unificación
```

### 9.3 PR a develop

- **Target:** `develop`
- **Descripción:** escrita con `/humanizer`, con pasos concretos para QA
- **Debe incluir:** screenshots del flujo unificado, edge cases conocidos, qué NO se hizo
- **Tamaños:** 8 días de trabajo, va a ser PR grande. Si supera 400 líneas de changed, considerar split en 2 PRs:
  - **PR-A**: Día 1-4 (modelo + wizard + lista + detalle, ~600 líneas)
  - **PR-B**: Día 5-8 (calendario + redirects + cleanup + edge cases, ~400 líneas)

---

## 10. Plan de ejecución (8 días)

### Día 1 — Sábado 20/06: Setup y consolidación de modelos

| Paso | Tarea | Commits |
|------|-------|---------|
| 1 | Crear branch `feature/unificacion-reserva-evento` desde develop (post-merge de #15 y #19) | (branch) |
| 2 | Traer `src/constants/eventos.js` y `src/mocks/eventosMock.js` desde `feature/calendario-eventos` (consolidados) | `feature: agregar modelo unificado de evento` |
| 3 | Migrar las 8 reservas de `reservasMock.js` a `eventosMock.js` con `reserva` embebida | (parte del anterior) |
| 4 | Crear `src/mocks/tiposEventoMock.js` (unifica los dos mocks duplicados) | (parte del anterior) |
| 5 | Crear `src/services/eventosService.js` con `getEventos`, `getEvento`, `createEvento`, `updateEvento`, `updateEstadoEvento`, `updateEstadoReserva`, `bloquearHorario`, `getDisponibilidad` | `refactor: migrar services de reservas a eventos` |
| 6 | Borrar `src/services/reservasService.js` y `src/mocks/reservasMock.js` | `remove: eliminar services/reservasService` |
| 7 | Actualizar `useDisponibilidad` para que llame a `getEventosPorFecha(fecha)` y devuelva `{ eventos }` en vez de `{ reservas }` | (parte del refactor) |
| 8 | Actualizar `useHorariosDisponibles` para consumir la nueva shape de `useDisponibilidad` | (parte del refactor) |
| 9 | Actualizar `useBloqueoHorario` para que el endpoint sea `/events/lock` | (parte del refactor) |
| 10 | Actualizar los tests de los 3 hooks con la nueva shape | (parte del refactor) |

**Entregable día 1:** modelo de datos consolidado, services migrados, hooks actualizados, 100% de tests pasando.

### Día 2 — Domingo 21/06: Wizard unificado

| Paso | Tarea | Commits |
|------|-------|---------|
| 11 | Crear `src/utils/eventos.js` con `calcularMontoTotal`, `agruparEventosPorFranja`, `filtrarEventos`, `formatearMonto` | `feature: agregar utils puras de eventos` |
| 12 | Crear tests de las utils | `test: agregar tests de utils de eventos` |
| 13 | Agregar campo `descripcion` (textarea, max 500, opcional) al `FormularioReserva` | `feature: agregar campo descripcion al FormularioReserva` |
| 14 | Actualizar el `FormularioReserva` para aceptar `tipoEventoSeleccionado` Y `datosReserva.descripcion` | (parte del anterior) |
| 15 | Tests del campo nuevo | (parte del anterior) |
| 16 | Crear `src/pages/eventos/EventoNuevoPage.jsx` que REUTILIZA `CalendarioDisponibilidad`, `SelectorHorarios`, `CountdownReserva`, `FormularioReserva` (estos 4 no se tocan) | `feature: crear EventoNuevoPage reusando componentes` |
| 17 | Cambiar el submit de `createReserva` a `createEvento` con payload `{ nombre, descripcion, tipoEventoId, fecha, horaInicio, horaFin, cliente, reserva: { montoTotal, estado, expiraEn } }` | (parte del anterior) |
| 18 | Tests de integración del wizard unificado | `test: agregar tests de EventoNuevoPage` |

**Entregable día 2:** wizard unificado que crea un evento con reserva embebida en un solo submit.

### Día 3 — Lunes 22/06: Lista unificada

| Paso | Tarea | Commits |
|------|-------|---------|
| 19 | Crear `src/hooks/useEventos.js` (reemplaza `useReservas`) | `feature: agregar useEventos hook con filtros` |
| 20 | Tests del hook | (parte del anterior) |
| 21 | Crear `src/components/eventos/EstadoReservaBadge.jsx` (reemplaza `StatusBadge`) | `feature: agregar EstadoReservaBadge` |
| 22 | Crear `src/components/eventos/EventoCard.jsx` (reemplaza `ReservaCard`) — fila de la tabla con: fecha, horario, cliente, tipo, invitados, estado evento, estado reserva, monto | `feature: agregar EventoCard con badges` |
| 23 | Crear `src/components/eventos/EventoFiltros.jsx` (reemplaza `FiltrosReservas`) — filtra por estado evento, estado reserva, rango fechas, cliente | `feature: agregar EventoFiltros` |
| 24 | Crear `src/pages/eventos/EventosPage.jsx` (reemplaza `ReservasPage`) | `feature: crear EventosPage con lista unificada` |
| 25 | Tests de los nuevos componentes y página | `test: agregar tests de componentes de eventos` |
| 26 | Borrar `src/hooks/useReservas.js` y sus tests | `remove: eliminar useReservas (reemplazado por useEventos)` |

**Entregable día 3:** lista unificada en `/eventos` con todos los datos visibles.

### Día 4 — Martes 23/06: Detalle y edición unificada

| Paso | Tarea | Commits |
|------|-------|---------|
| 27 | Crear `src/components/eventos/EventoDetalleModal.jsx` (reemplaza `ModalDetalleReserva`) — muestra datos del evento Y de la reserva | `feature: agregar EventoDetalleModal` |
| 28 | Tests del modal | (parte del anterior) |
| 29 | Crear `src/pages/eventos/EventoDetailPage.jsx` (reemplaza `ReservaDetailPage`) | `feature: crear EventoDetailPage` |
| 30 | Tests de la página | (parte del anterior) |
| 31 | Crear `src/pages/eventos/EventoEditarPage.jsx` (reemplaza `EditarReservaPage`) — usa el `FormularioReserva` nuevo con campo `descripcion` | `feature: crear EventoEditarPage` |
| 32 | Tests de la página | (parte del anterior) |

**Entregable día 4:** detalle y edición unificada.

### Día 5 — Miércoles 24/06: Calendario consume la lista unificada

| Paso | Tarea | Commits |
|------|-------|---------|
| 33 | `CalendarioEventosPage` actualizado para consumir `useEventos` en vez de su propio fetch | `refactor: calendario consume la lista unificada` |
| 34 | `DayEventsPopover` actualizado para mostrar el estado de la reserva embebida como segundo badge | (parte del anterior) |
| 35 | Tests del calendario actualizado | (parte del anterior) |
| 36 | Tests del popover actualizado | (parte del anterior) |

**Entregable día 5:** el calendario muestra los mismos datos que la lista, sin duplicación.

### Día 6 — Jueves 25/06: Redirects y limpieza

| Paso | Tarea | Commits |
|------|-------|---------|
| 37 | Crear `src/components/common/RedirectConBanner.jsx` | `refactor: agregar RedirectConBanner para rutas legacy` |
| 38 | Actualizar `App.jsx` con redirects de `/reservas/*` → `/eventos/*` | (parte del anterior) |
| 39 | Borrar `src/pages/reservas/*` (los 5 archivos) | `remove: eliminar pages/reservas` |
| 40 | Borrar `src/components/reservas/{ReservaForm,CalendarView,ReservaCard,StatusBadge,DoubleBookingAlert,TablaReservas,FiltrosReservas,ModalDetalleReserva}.jsx` | `remove: eliminar components/reservas no reutilizados` |
| 41 | Tests pasan en verde | (verificación) |
| 42 | Build de Vite OK | (verificación) |

**Entregable día 6:** las rutas `/reservas/*` redirigen suavemente a `/eventos/*`, los archivos viejos están borrados.

### Día 7 — Viernes 26/06: Edge cases y contratos

| Paso | Tarea | Commits |
|------|-------|---------|
| 43 | Test: 100 eventos en la lista → performance | `test: agregar edge case 100 eventos performance` |
| 44 | Test: evento sin reserva embebida → muestra "Sin reserva" | `test: agregar edge case evento sin reserva` |
| 45 | Test: reserva expirada + evento en curso → warning visual | `test: agregar edge case inconsistencia evento/reserva` |
| 46 | Test: doble click en "Confirmar" del wizard | `test: agregar edge case doble click confirmar` |
| 47 | Test: navegación rápida entre filtros → no race conditions | `test: agregar edge case race conditions filtros` |
| 48 | Test: edición concurrente → error 409 con mensaje claro | `test: agregar edge case conflicto de versión (optimistic locking)` |
| 49 | Documentar contrato frontend → backend en `docs/contrato-unificacion.md` (extensión del contrato existente) | `docs: actualizar contrato backend con gaps de unificación` |
| 50 | Abrir issues en `salon404-eventos` para los gaps | (externo, sin commit) |

**Entregable día 7:** edge cases cubiertos, contrato documentado, gaps del backend identificados.

### Día 8 — Lunes 29/06: PR + autocrítica

| Paso | Tarea | Commits |
|------|-------|---------|
| 51 | Testing manual cross-browser | (sin commit, verificación) |
| 52 | Agregar sección "Autocrítica — Iteración 3" al spec | `docs: agregar autocrítica de iteración 3` |
| 53 | PR a develop con descripción para QA | (externo, sin commit) |
| 54 | Avisar a Valeria | (externo, sin commit) |

**Entregable día 8:** todo testeado, PR abierto, QA puede probar.

---

## 11. Criterios de aceptación

### Funcionalidad

- [ ] Cliente entra a `/eventos` y ve solo SUS eventos (filtro server-side por cliente)
- [ ] Admin entra a `/eventos` y ve TODOS los eventos del salón
- [ ] Cliente entra a `/eventos/calendario` y ve solo "Horario reservado" (sin datos privados)
- [ ] Admin entra a `/eventos/calendario` y ve nombre del evento, cliente, invitados
- [ ] Wizard `/eventos/nuevo` crea un evento con `reserva` embebida en un solo submit
- [ ] Campo `descripcion` se guarda correctamente (opcional, max 500)
- [ ] Detalle `/eventos/:id` muestra datos del evento Y de la reserva (monto, estado pago, expiraEn)
- [ ] Edición `/eventos/:id/editar` actualiza el evento y refleja cambios en la lista
- [ ] Optimistic locking: si dos admins editan el mismo evento, el segundo recibe error "Este evento fue modificado, recargá la página"
- [ ] Cancelar evento cambia `estado` del evento Y opcionalmente el de la reserva
- [ ] Filtros de la lista funcionan combinados (estado evento + estado reserva + fecha + cliente)
- [ ] Rutas `/reservas/*` redirigen a `/eventos/*` con banner

### Migración de datos

- [ ] Los 8 reservas del mock viejo se migraron a `eventosMock` con su `reserva` embebida
- [ ] El admin ve los mismos 8 registros en `/eventos` que antes veía en `/reservas`
- [ ] El calendario consume la misma data que la lista (no hay duplicación)

### Accesibilidad

- [ ] Keyboard navigation completa (Tab, Enter, Escape)
- [ ] ARIA labels en tabla, modal, formulario
- [ ] Focus trap en modal (deuda técnica del PR #19, **se paga acá**)
- [ ] Color contrast WCAG AA en todos los textos y badges
- [ ] Screen readers anuncian cambios de estado

### Testing

- [ ] `npm run test:run` pasa sin errores
- [ ] Tests previos (PR #15 + #19) siguen pasando después de los cambios
- [ ] Tests nuevos para utils, hooks, componentes
- [ ] Edge cases: 100 eventos, inconsistencia, doble click, race conditions
- [ ] Sin `console.error` en output de tests

### Código

- [ ] Funciones de máximo ~20 líneas
- [ ] Sin magic numbers/strings
- [ ] Componentes con responsabilidad única
- [ ] Hooks desacoplados de la UI
- [ ] Services intercambiables (mock/API)
- [ ] Early returns, sin nesting profundo
- [ ] Cero archivos en `pages/reservas/` (excepto redirects)
- [ ] Cero archivos en `components/reservas/` no reutilizados

### Builds y contratos

- [ ] `npm run build` pasa sin errores ni warnings críticos
- [ ] `docs/contrato-unificacion.md` documenta los gaps que el backend necesita cubrir
- [ ] Issues abiertos en `salon404-eventos` para los gaps

---

## 12. Decisiones tomadas durante el planning

| # | Decisión | Resolución | Motivo |
|---|----------|------------|--------|
| 1 | ¿Qué significa "unificación reserva+evento"? | Opción B: derribar `/reservas` como entidad separada, consolidar en `/eventos` | El backend ya lo hizo, la guía lo insinúa, menos deuda técnica |
| 2 | ¿Pantalla vieja `/reservas` durante la transición? | Banner "Mudamos a /eventos" + redirect con vuelta atrás 30 días | Menos fricción con QA, links viejos siguen funcionando |
| 3 | ¿Campo `descripcion` del evento? | Sí, agregarlo al wizard ahora (opcional, max 500 chars) | El backend ya lo pide, evitar migración doble |
| 4 | ¿Diferenciación de roles en `/eventos`? | Admin ve todo, cliente ve solo SUS eventos | Coherente con el patrón del calendario (PR #15) |
| 5 | ¿Reutilizar lo que ya funciona? | Sí: `useDisponibilidad`, `useHorariosDisponibles`, `useBloqueoHorario`, `calcularHorariosDisponibles`, `CalendarioDisponibilidad`, `SelectorHorarios`, `CountdownReserva` | No tocar lo que está verde |
| 6 | ¿Renegociar PRs #15 y #19 con QA? | Sí, comunicar ANTES de empezar | La unificación cambia parte de lo que prometen esas PRs (asumen `Reserva` como destino) |
| 7 | ¿Cuándo se borra `ReservaForm` viejo? | Al final de Día 6, una vez que `EventoEditarPage` use el `FormularioReserva` nuevo | Migración atómica, sin ventana de "no funciona nada" |
| 8 | ¿Cómo identificar al cliente en la lista? | Por `EventOwner` (Guid) — referencia al User | El backend usa `EventOwner` (Guid) como identificador del cliente. Es estable y único. El frontend filtra por `evento.eventOwner === user.id`. |
| 9 | ¿El monto total se calcula en el front o viene del backend? | Front lo calcula (`tipo.precioBase * invitados * factor` simplificado) hasta que el backend lo implemente | El backend actual no expone el cálculo, lo mockeamos |
| 10 | ¿El foco trap del modal es deuda técnica de quién? | Se paga en esta iteración (Día 4, en `EventoDetalleModal`) | El modal de `ModalDetalleReserva` ya tenía el problema, lo arreglamos al reescribirlo |
| 11 | ¿Cómo manejar edición concurrente de eventos? | Campo `version` (integer) en el modelo de Evento para optimistic locking | Si dos admins editan el mismo evento a la vez, el último que guarda pisa todo sin aviso. El frontend manda la versión que leyó; si el backend detecta que cambió, rechaza con "este evento fue modificado, recargá". Solo se implementa desde el frontend (el backend lo provee David). |

---

## 13. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Las PRs #15 y #19 abiertas se renegocian con QA | Alta | Alto | Comunicar ANTES de empezar. La unificación cambia parte de lo que prometen esas PRs. |
| David no quiere romper el shape de `createReserva` que está verde | Media | Alto | El spec del contrato dice `Evento.reserva` embebida — David ya está alineado |
| El banner de "mudamos" confunde a Valeria/QA | Baja | Medio | El banner dice exactamente "Esta vista se mudó a /eventos" + botón directo |
| `useDisponibilidad` cambia de shape y rompe el calendario #15 | Media | Alto | El calendario consume `eventos` ya, no `reservas`. Actualizo el hook para que devuelva `eventos.filter(e => e.fecha === fecha)` |
| El `FormularioReserva` se usa en el wizard de PR #19 — si le agrego `descripcion` rompe esa PR | Alta | Medio | El cambio es aditivo (campo nuevo). El test sigue pasando. |
| El redirect con banner genera flash visual (la pantalla `/reservas` se ve por 5s) | Baja | Bajo | El componente `RedirectConBanner` muestra el banner superpuesto, no carga la página vieja. Es instantáneo. |
| 8 días no alcanzan | Media | Alto | Día 1-4 son los más importantes (funcionalidad core). Si falta tiempo, Día 5-7 son nice-to-have. |
| El cliente no tiene `id` en el modelo viejo y hay que identificarlo solo por `email` | Media | Medio | Se resuelve en esta iteración: el modelo de Evento usa `eventOwner` (Guid) como referencia al User. El frontend filtra por `evento.eventOwner === user.id`. El backend filtra server-side. |
| Los 2 archivos de PRs mergeadas a develop entren en conflicto con esta rama | Alta | Medio | Merge develop a esta rama al inicio de cada día, no al final. |

---

## 14. Fuera de scope (explícito)

- Pasarela de pago (Mercado Pago, etc.) → fuera de scope del sprint
- Notificaciones por email (confirmación, recordatorio) → futuro sprint
- ABM de proveedores vinculados a un evento → otro equipo (Eliana + Juan)
- Integración con backend real (`USE_MOCK = true` durante toda la iteración) → issue #16
- Migración de `EditarReservaPage` con un editor rico para `descripcion` (markdown) → futuro
- Vista de evento individual con timeline de cambios → futuro
- Búsqueda fuzzy en el filtro de cliente → futuro
- Persistencia del filtro en localStorage → futuro
- Drag & drop de eventos entre días en el calendario → futuro
- Export de la lista a CSV/PDF → futuro

---

## 15. Dependencias

### Backend (David Sepúlveda / Juan Bautista)

Ya alineado con el contrato `docs/contrato-backend-eventos.md`. Gaps específicos a cerrar antes de `USE_MOCK = false`:

- `GET /api/v1/events` debe devolver `EventStart` y `EventFinish` (Gap 3)
- `GET /api/v1/events` debe incluir `cliente.nombre`, `cliente.email`, `cliente.telefono` (Gap 5)
- `GET /api/v1/events/{id}` debe existir (Gap 5)
- `POST /api/v1/events` debe aceptar el payload unificado `{ nombre, descripcion, tipoEventoId, fecha, horaInicio, horaFin, cliente, reserva: {...} }`
- `PATCH /api/v1/events/{id}/status` para cambiar estado del evento
- `PATCH /api/v1/events/{id}/reservation/status` para cambiar estado de la reserva embebida
- `PATCH /api/v1/events/{id}` debe aceptar `version` en el body para optimistic locking (rechaza con 409 Conflict si la versión no coincide)
- `GET /api/v1/events?eventOwner={userId}` para filtrar por cliente (autorización server-side por `eventOwner`)

### Frontend (Federico Oviedo)

- Iteración 1 completada (calendario de eventos) ✅
- Iteración 2 completada (reservas con disponibilidad) ✅
- Iteración 3 en progreso (unificación reserva+evento) ← **ESTA**
- PRs #15 y #19 abiertas (deben mergear a develop antes de empezar Día 1)

### QA (Ramiro Tonelli)

- Aprobar PRs #15 y #19 antes de que se mergeen
- Aprobar la PR final de esta iteración
- Reportar bugs en GitHub Issues

### Scrum Master (Valeria Díaz)

- Avisar a David/Ramiro sobre la renegociación de PRs #15 y #19
- Coordinar la transición de `/reservas` a `/eventos` con el equipo

---

## Autocrítica — Iteración 3

_Pendiente (se completa al final del ciclo)_
