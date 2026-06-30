# Spec v2: Mejora del Calendario de Eventos — Iteración 1

> **Autor:** Federico Oviedo (Frontend)
> **Fecha:** 13/06/2026
> **Deadline:** 16/06/2026 (3 días)
> **Branch de trabajo:** `feature/calendario-mejoras` (desde `develop`)
> **PR target:** `develop` → QA review (Ramiro Tonelli) → merge a `main`
> **Ruta:** `/eventos/calendario`
> **Iteración:** 1 de 3 (solo calendario)

---

## 0. Alcance de esta iteración

### ✅ INCLUYE (Iteración 1 — Calendario)

- Calendario con múltiples eventos por día (mañana/tarde/noche)
- Diferenciación por rol (admin ve todo, cliente ve "Ocupado")
- Estética premium orientada a ventas
- Popover/bottom-sheet con eventos agrupados por franja
- Indicadores visuales (dots) en celdas
- Accesibilidad completa (keyboard, ARIA, focus, mobile)
- Testing exhaustivo (unit, hooks, componentes, edge cases)

### ❌ NO INCLUYE (Iteraciones futuras)

- **Horarios flexibles por tipo de evento** → Iteración 2
  - Duraciones variables según tipo (Casamiento 8hs vs Bautismo 4hs)
  - Visualización de duración en calendario
  - Sugerencias de horario al crear evento
- **Unificación reserva + evento en la vista** → Iteración 3
  - Vista unificada de reserva+evento como entidad
  - Navegación al detalle de reserva desde calendario
  - Consolidación de datos financieros + evento

---

## 1. Contexto y problema

El calendario actual funciona pero tiene cuatro problemas de fondo:

1. **Privacidad rota**: admin y cliente ven exactamente lo mismo. Un cliente puede ver el nombre del evento, el cliente que lo contrató y la cantidad de invitados de otro cliente. Esto es inaceptable en producción.
2. **Estética que no vende**: el calendario es la vidriera del salón. Hoy parece una grilla genérica de FullCalendar sin identidad.
3. **UX inaccesible**: no hay keyboard navigation, no hay ARIA labels, el popover no maneja focus trap, y en mobile el hover no existe.
4. **Sin testing**: el proyecto no tiene framework de testing configurado. Cualquier cambio puede romper algo sin que nadie se entere.

### Rol de Federico (Guía v7)

- Calendario con múltiples eventos por día (mañana/tarde/noche)
- Horarios flexibles por tipo de evento
- Unificación reserva + evento en la vista

---

## 2. Principios de ingeniería (no negociables)

Estos principios rigen TODO el código que se escriba. No son sugerencias.

### 2.1 Clean Code

- **Funciones pequeñas**: máximo 20 líneas por función. Si necesita más, se descompone.
- **Nombres descriptivos**: `obtenerEventosPorFranja` no `getData`. `esUsuarioAdmin` no `check`.
- **Early returns**: evitar nesting profundo. Validar y salir rápido.
- **Sin magic numbers/strings**: todo a constantes con nombre (`FRANJA_MANANA_HORA_INICIO = 6`).
- **Comentarios solo cuando el POR QUÉ no es obvio**: nunca comentar QUÉ hace el código.

### 2.2 SOLID

| Principio | Aplicación concreta |
|-----------|-------------------|
| **S**ingle Responsibility | Cada componente hace UNA cosa. `EventoPill` renderiza un pill. `FranjaDots` renderiza dots. `useEventosPorDia` agrupa eventos. No mezclar. |
| **O**pen/Closed | Los tipos de evento y franjas se extienden via constantes/arrays. Agregar un tipo nuevo no modifica componentes. |
| **L**iskov Substitution | Los componentes de presentación reciben props tipadas. Si cambio `EventoPill` por otro componente con la misma interfaz, todo sigue funcionando. |
| **I**nterface Segregation | Los componentes reciben SOLO las props que necesitan. No pasar el objeto `evento` entero si solo necesita `nombre` y `horaInicio`. |
| **D**ependency Inversion | Los hooks reciben el service como parámetro (o lo importan de un módulo). El componente no sabe si viene de mock o API real. |

### 2.3 Desacoplamiento

```
Capa de presentación (componentes)
  ↓ solo reciben props + callbacks
Capa de lógica (hooks custom)
  ↓ solo llaman services
Capa de datos (services)
  ↓ abstraen mock vs API real
```

- **Ningún componente hace fetch directo.** Todo pasa por hooks.
- **Ningún hook conoce la UI.** Devuelve datos, no JSX.
- **Los services son intercambiables.** `USE_MOCK = true/false` cambia la fuente, no la interfaz.

### 2.4 Funciones puras donde sea posible

- Agrupar eventos por franja → función pura (mismos inputs → mismo output)
- Calcular si un usuario es admin → función pura
- Formatear horarios → función pura
- Todo lo puro es testeable sin mocks.

---

## 3. Seguridad frontend

### 3.1 Diferenciación por rol (defensa en profundidad)

La diferenciación admin/cliente NO es solo cosmética. Es una capa de seguridad.

```
┌─────────────────────────────────────────────────┐
│  AuthContext                                      │
│  └── decodeToken(token) → { id, name, role }     │
│       └── validar expiración del JWT             │
│            └── useCalendarRole(user) → roleInfo   │
│                 ├── ADMIN → ver todo              │
│                 ├── CLIENTE → ver "Ocupado"       │
│                 └── ANONYMOUS → ver "Ocupado"     │
└─────────────────────────────────────────────────┘
```

**Reglas:**

1. **El rol se lee del JWT**, no de un estado de UI que se pueda manipular.
2. **Se valida la expiración** del token antes de confiar en el rol.
3. **Los datos privados NUNCA llegan al DOM del cliente.** No es "ocultar con CSS". El componente de cliente literalmente no recibe el nombre del evento ni del cliente en sus props.
4. **El mock data contiene datos sensibles** (nombres, emails, teléfonos). Cuando `USE_MOCK = false`, el backend debe filtrar por rol. Mientras tanto, el frontend hace el filtrado.

### 3.2 Sanitización

- **No usar `dangerouslySetInnerHTML`** en ningún lado.
- **Los datos del mock/API se renderizan como texto**, nunca como HTML.
- **Los URLs del servicio se validan** (que empiecen con `http`/`https`).

### 3.3 Token handling

- El token se lee de `localStorage` via la constante `TOKEN_KEY`, nunca hardcodeado.
- Si el token es inválido o expiró → se trata como anonymous (no se rompe, no muestra error).
- No loggear tokens en `console.log` (ni en desarrollo).

---

## 4. UX y accesibilidad

### 4.1 Keyboard navigation

| Tecla | Acción |
|-------|--------|
| `Tab` | Navegar entre celdas del calendario y botones |
| `Enter` / `Space` | Abrir popover del día focuseado |
| `Escape` | Cerrar popover |
| `Arrow keys` | Navegar entre días (FullCalendar lo maneja) |

### 4.2 ARIA

- Cada celda del día: `aria-label="14 de junio, 2 eventos"` (o "14 de junio, sin eventos")
- Popover: `role="dialog"`, `aria-modal="false"`, `aria-labelledby` con la fecha
- Botón cerrar popover: `aria-label="Cerrar"`
- Pills: `role="listitem"` dentro de un `role="list"` por franja
- Dots de franja: `aria-hidden="true"` (son decorativos, la info ya está en el aria-label de la celda)

### 4.3 Focus management

- Popover abre → focus va al primer elemento interactivo dentro del popover
- Popover cierra → focus vuelve a la celda del día que lo abrió
- Click fuera del popover → cierra (con `useEffect` + event listener)

### 4.4 Mobile / Touch

- **Hover no existe en touch.** El popover se abre con TAP en la celda.
- En mobile el popover es un **bottom sheet** (slide up desde abajo) en lugar de floating.
- Breakpoint: `< 768px` → bottom sheet. `>= 768px` → popover flotante.

### 4.5 Color contrast y motion

- Todos los textos cumplen WCAG AA (ratio 4.5:1 mínimo).
- `prefers-reduced-motion: reduce` → desactiva animaciones del popover (muestra/oculta instantáneo).
- Los dots de franja no son el ÚNICO indicador: también hay texto en el aria-label.

### 4.6 Estados vacíos y de error

| Estado | Qué se muestra |
|--------|----------------|
| Mes sin eventos | "No hay eventos programados este mes" + CTA "¿Querés reservar una fecha?" |
| Error de carga | Banner con mensaje + botón "Reintentar" |
| Loading | Skeleton del calendario (no spinner genérico) |
| Token inválido | Se trata como anonymous, no se muestra error |

---

## 5. Testing

### 5.1 Setup (Paso 0 — antes de cualquier código)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Configurar `vitest.config.js`:
```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
})
```

`src/test/setup.js`:
```js
import '@testing-library/jest-dom'
```

Agregar a `package.json`:
```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

### 5.2 Estrategia de testing por capa

```
┌──────────────────────────────────────────────┐
│  E2E / Visual (manual + QA)                  │  → Ramiro/QA verifica en browser
├──────────────────────────────────────────────┤
│  Component tests (React Testing Library)     │  → Popover, Pills, Dots por rol
├──────────────────────────────────────────────┤
│  Hook tests (renderHook)                     │  → useEventosPorDia, useCalendarRole
├──────────────────────────────────────────────┤
│  Unit tests (funciones puras)                │  → agruparPorFranja, esAdmin, formatearHora
└──────────────────────────────────────────────┘
```

### 5.3 Tests unitarios (funciones puras)

**Archivo: `src/utils/eventos.test.js`**

| Función | Tests |
|---------|-------|
| `agruparPorFranja(eventos)` | Vacío → `{}`, 1 evento mañana, 3 franjas completas, evento que cruza medianoche |
| `esAdmin(user)` | null → false, role=User → false, role=Admin → true, token expirado → false |
| `formatearRangoHorario(inicio, fin)` | "09:00"-"13:00" → "09:00 - 13:00", cruza medianoche → "21:00 - 03:00" |
| `contarEventosPorDia(eventos, fecha)` | 0 eventos, 1 evento, múltiples eventos |
| `obtenerFranjasOcupadas(eventos)` | Deduplica franjas, ignora cancelados |
| `filtrarEventosParaCliente(eventos)` | Solo devuelve franja + horaInicio + horaFin (sin nombre, sin cliente) |

**Archivo: `src/utils/seguridad.test.js`**

| Función | Tests |
|---------|-------|
| `decodificarToken(token)` | Token válido, token expirado, token malformado, null |
| `esTokenValido(token)` | Válido → true, expirado → false, sin exp → false |

### 5.4 Tests de hooks

**Archivo: `src/hooks/useEventosPorDia.test.js`**

| Escenario | Expected |
|-----------|----------|
| Sin eventos | Devuelve array vacío |
| Con eventos del mes | Devuelve eventos agrupados por fecha |
| Cambio de mes | Re-fetch con nuevas fechas |
| Error de red | Devuelve error + función retry |

**Archivo: `src/hooks/useCalendarRole.test.js`**

| Escenario | Expected |
|-----------|----------|
| Sin user (anonymous) | `{ isAdmin: false, vista: 'publica' }` |
| User role=User | `{ isAdmin: false, vista: 'cliente' }` |
| User role=Admin | `{ isAdmin: true, vista: 'admin' }` |
| Token expirado | `{ isAdmin: false, vista: 'publica' }` |

### 5.5 Tests de componentes

**Archivo: `src/components/eventos/EventoPill.test.jsx`**

| Escenario | Expected |
|-----------|----------|
| isAdmin=true | Renderiza nombre del evento + hora |
| isAdmin=false | Renderiza "Horario reservado" + hora |
| Evento cancelado | Muestra tachado + badge "Cancelado" |
| Sin evento (null) | No renderiza nada |

**Archivo: `src/components/eventos/DayEventsPopover.test.jsx`**

| Escenario | Expected |
|-----------|----------|
| isAdmin=true, 2 eventos | Muestra ambos con detalle completo |
| isAdmin=false, 2 eventos | Muestra 2 "Horario reservado" sin datos |
| Tecla Escape | Cierra el popover |
| Click fuera | Cierra el popover |
| aria-labels presentes | Fecha en heading, role=dialog |
| prefers-reduced-motion | Sin animaciones |

**Archivo: `src/components/eventos/FranjaDots.test.jsx`**

| Escenario | Expected |
|-----------|----------|
| 0 eventos | No renderiza dots |
| 1 evento mañana | 1 dot amber |
| 3 franjas | 3 dots (amber, orange, indigo) |
| aria-hidden | Todos los dots tienen aria-hidden=true |

### 5.6 Tests de edge cases y condiciones adversas

| Escenario | Qué se testea |
|-----------|---------------|
| 100 eventos en un mes | Performance: no se cuelga, no hay layout break |
| Evento con hora inválida ("25:00") | Se ignora gracefully, no rompe el calendario |
| Mock data corrupta (campos null) | Componentes hacen fallback sin crash |
| Token manipulado (rol inventado) | Se trata como anonymous |
| localStorage vacío | No crash, se trata como anonymous |
| Navegación rápida entre meses | No race conditions en fetch |
| Doble click en celda | No abre dos popovers |

### 5.7 Cuándo se testea

```
Código nuevo → test ANTES del commit
Código modificado → correr tests afectados + related
Antes del PR → npm run test:run (todo)
```

**Regla: si no tiene test, no se commitea.**

---

## 6. Diseño técnico

### 6.1 Arquitectura de componentes

```
CalendarioEventosPage (page — orquestador)
  ├── CalendarHeader (header premium + cards resumen)
  ├── CalendarioEventos (wrapper FullCalendar)
  │   ├── dayCellContent → FranjaDots (dots por franja)
  │   ├── eventContent → EventoPill (pill por evento)
  │   └── DayEventsPopover (popover/bottom-sheet)
  │       ├── FranjaGroup (agrupa eventos por franja)
  │       │   ├── EventoCard (admin: detalle completo)
  │       │   └── EventoOculto (cliente: "Horario reservado")
  │       └── EstadoEventoBadge
  └── CalendarioLegend (tipos + franjas + estados)
```

### 6.2 Hooks (lógica desacoplada)

| Hook | Responsabilidad | Inputs | Output |
|------|----------------|--------|--------|
| `useCalendarRole` | Determinar vista según auth | `user` (de AuthContext) | `{ isAdmin, vista, puedeVerDetalle }` |
| `useEventosPorDia` | Agrupar eventos por fecha | `eventos[]` | `Map<fecha, eventos[]>` |
| `useEventosPorFranja` | Agrupar eventos de un día por franja | `eventos[]` (de un día) | `{ manana[], tarde[], noche[] }` |
| `usePopoverPosition` | Calcular posición del popover | `targetRef` | `{ top, left, placement }` |
| `useReducedMotion` | Detectar preferencia de motion | — | `boolean` |
| `useCalendarSummary` | Calcular stats del mes | `eventos[]` | `{ total, proximoEvento, porFranja }` |

### 6.3 Utils (funciones puras, 100% testeables)

| Función | Archivo | Qué hace |
|---------|---------|----------|
| `agruparPorFranja(eventos)` | `utils/eventos.js` | Agrupa eventos en manana/tarde/noche |
| `esAdmin(user)` | `utils/seguridad.js` | Verifica rol desde token |
| `formatearRangoHorario(inicio, fin)` | `utils/formato.js` | "09:00 - 13:00" |
| `contarEventosPorDia(eventos, fecha)` | `utils/eventos.js` | Cuenta eventos en una fecha |
| `filtrarEventosParaVista(eventos, vista)` | `utils/seguridad.js` | Si vista=publica, strip datos privados |
| `decodificarToken(token)` | `utils/seguridad.js` | Wrapper de jwt-decode con validación |
| `esTokenValido(token)` | `utils/seguridad.js` | Verifica existencia + expiración |

### 6.4 Diferenciación por rol (flujo completo)

```
1. CalendarioEventosPage lee user de AuthContext
2. useCalendarRole(user) → { isAdmin, vista }
3. useEventos(month, year) → eventos[] (raw, completos)
4. filtrarEventosParaVista(eventos, vista) → eventosFiltrados[]
   ├── vista='admin' → eventos completos (nombre, cliente, invitados, estado)
   └── vista='publica' → solo { id, fecha, horaInicio, horaFin, franja, estado }
5. eventosFiltrados se pasan a CalendarioEventos
6. CalendarioEventos pasa isAdmin a EventoPill y DayEventsPopover
7. Cada componente renderiza según isAdmin
```

**La clave:** el filtrado ocurre en el paso 4, ANTES de llegar a cualquier componente de presentación. Los componentes de cliente literalmente no tienen los datos privados en memoria.

### 6.5 Popover vs Bottom Sheet (responsive)

```
useMediaQuery('(min-width: 768px)')
├── true → DayEventsPopover (floating, positioned, con arrow)
└── false → DayEventsBottomSheet (fixed bottom, slide up, full width)
```

Ambos comparten la misma lógica interna (`FranjaGroup`, `EventoCard`/`EventoOculto`). Solo cambia el contenedor.

### 6.6 Estética premium (resumen)

- **Header**: gradient `from-indigo-600 via-purple-600 to-indigo-700`, título blanco, cards de resumen con glass effect
- **Calendario**: celdas con `rounded-lg`, hover `shadow-md`, transición 200ms
- **Pills**: gradient sutil según tipo de evento, texto truncado con ellipsis
- **Franja dots**: 6px, colores `amber-400`, `orange-400`, `indigo-500`
- **Popover**: `backdrop-blur-sm`, `shadow-xl`, `rounded-xl`, animación scale+fade
- **Bottom sheet**: `rounded-t-2xl`, drag handle, slide up con spring
- **Empty state**: ilustración SVG inline + CTA

---

## 7. Branching y flujo de trabajo

### 7.1 Branches

```
main ← develop ← feature/calendario-mejoras (ESTA RAMA)
```

- **NO tocar** `main` ni `develop` directamente.
- Crear `feature/calendario-mejoras` desde `develop` actualizado.
- Cada commit es atómico (un componente/feature por commit).

### 7.2 Commits

Formato: `tipo: descripción en español`

```
setup: configurar vitest y testing-library
test: agregar tests unitarios de utils/eventos y utils/seguridad
test: agregar tests de hooks useCalendarRole y useEventosPorDia
feature: actualizar mock data con eventos de junio 2026
feature: agregar hook useCalendarRole para diferenciación por rol
feature: agregar utils de seguridad (decodificarToken, esTokenValido)
feature: agregar utils de eventos (agruparPorFranja, filtrarParaVista)
refactor: extraer lógica de filtrado por rol a hook desacoplado
feature: rediseñar CalendarioEventosPage con header premium y cards resumen
feature: agregar FranjaDots como indicador visual en celdas del calendario
feature: diferenciar EventoPill entre vista admin y cliente
feature: rediseñar DayEventsPopover con animación y soporte responsive
feature: agregar bottom sheet para mobile en DayEventsPopover
feature: mejorar CalendarioLegend con franjas y diseño compacto
style: agregar CSS custom para FullCalendar con estética premium
test: agregar tests de componentes (EventoPill, DayEventsPopover, FranjaDots)
test: agregar tests de edge cases y condiciones adversas
fix: correcciones post-testing (si aparecen)
```

### 7.3 PR a develop

- **Target:** `develop`
- **Descripción:** escrita con `/humanizer` para que suene natural, no AI-generated
- **Debe incluir:**
  - Qué se hizo (resumen, no lista de archivos)
  - Cómo probarlo (pasos concretos para QA)
  - Credenciales de prueba (admin@salon404.com / cliente@salon404.com)
  - Screenshots o GIF del antes/después
  - Edge cases conocidos
  - Qué NO se hizo (fuera de scope)

### 7.4 Autocrítica post-ciclo

Al final de cada ciclo de implementación, se agrega una sección al final de este spec:

```markdown
## Autocrítica — Iteración N

### Qué salió bien
- ...

### Qué mejoraría en la próxima iteración
- ...

### Deuda técnica identificada
- ...
```

---

## 8. Plan de ejecución (3 días)

### Día 1 — Sábado 14/06: Fundación

| Paso | Tarea | Commits |
|------|-------|---------|
| 0 | Setup testing (vitest + RTL + jsdom) | `setup: configurar vitest y testing-library` |
| 1 | Utils puras + tests | `feature: agregar utils de seguridad y eventos` + `test: ...` |
| 2 | Hooks + tests | `feature: agregar hooks useCalendarRole y useEventosPorDia` + `test: ...` |
| 3 | Mock data junio 2026 | `feature: actualizar mock data con eventos de junio 2026` |

**Entregable día 1:** Capa de lógica completa, 100% testeada, sin UI tocada.

### Día 2 — Domingo 15/06: UI y diferenciación

| Paso | Tarea | Commits |
|------|-------|---------|
| 4 | CSS custom FullCalendar | `style: agregar CSS custom para FullCalendar` |
| 5 | Header premium + cards resumen | `feature: rediseñar CalendarioEventosPage con header premium` |
| 6 | FranjaDots en celdas | `feature: agregar FranjaDots como indicador visual` |
| 7 | EventoPill por rol | `feature: diferenciar EventoPill entre vista admin y cliente` |
| 8 | DayEventsPopover rediseñado | `feature: rediseñar DayEventsPopover con animación y responsive` |
| 9 | CalendarioLegend mejorada | `feature: mejorar CalendarioLegend con franjas` |

**Entregable día 2:** UI completa, diferenciación por rol funcional.

### Día 3 — Lunes 16/06: Testing final + PR

| Paso | Tarea | Commits |
|------|-------|---------|
| 10 | Tests de componentes | `test: agregar tests de componentes` |
| 11 | Tests de edge cases | `test: agregar tests de edge cases y condiciones adversas` |
| 12 | Fixes post-testing | `fix: correcciones post-testing` (si hacen falta) |
| 13 | Testing manual cross-browser | (sin commit, verificación) |
| 14 | Autocrítica | Se agrega al spec |
| 15 | PR a develop | Con descripción para QA |

**Entregable día 3:** Todo testeado, PR abierto, QA puede probar.

---

## 9. Archivos a crear/modificar

### Crear (nuevos)

| Archivo | Descripción |
|---------|-------------|
| `vitest.config.js` | Configuración de Vitest |
| `src/test/setup.js` | Setup de testing (jest-dom matchers) |
| `src/utils/eventos.js` | Funciones puras: agruparPorFranja, contarEventosPorDia, etc. |
| `src/utils/seguridad.js` | Funciones puras: decodificarToken, esTokenValido, esAdmin |
| `src/utils/formato.js` | Funciones puras: formatearRangoHorario, formatearFecha |
| `src/utils/eventos.test.js` | Tests unitarios de utils/eventos |
| `src/utils/seguridad.test.js` | Tests unitarios de utils/seguridad |
| `src/utils/formato.test.js` | Tests unitarios de utils/formato |
| `src/hooks/useCalendarRole.js` | Hook: determina vista según auth |
| `src/hooks/useEventosPorDia.js` | Hook: agrupa eventos por fecha |
| `src/hooks/useEventosPorFranja.js` | Hook: agrupa eventos de un día por franja |
| `src/hooks/useCalendarSummary.js` | Hook: stats del mes |
| `src/hooks/useReducedMotion.js` | Hook: detecta prefers-reduced-motion |
| `src/hooks/useCalendarRole.test.js` | Tests del hook |
| `src/hooks/useEventosPorDia.test.js` | Tests del hook |
| `src/components/eventos/FranjaDots.jsx` | Dots de franja en celdas |
| `src/components/eventos/FranjaDots.test.jsx` | Tests del componente |
| `src/components/eventos/EventoCard.jsx` | Card de evento (vista admin, dentro del popover) |
| `src/components/eventos/EventoOculto.jsx` | Card "Horario reservado" (vista cliente) |
| `src/components/eventos/FranjaGroup.jsx` | Agrupa cards por franja dentro del popover |
| `src/components/eventos/CalendarHeader.jsx` | Header premium con cards de resumen |
| `src/components/eventos/DayEventsBottomSheet.jsx` | Variante mobile del popover |
| `src/styles/calendario.css` | CSS overrides para FullCalendar |

### Modificar (existentes)

| Archivo | Qué cambia |
|---------|------------|
| `src/pages/eventos/CalendarioEventosPage.jsx` | Header premium, AuthContext, useCalendarRole |
| `src/components/eventos/CalendarioEventos.jsx` | Custom styling, FranjaDots, isAdmin prop |
| `src/components/eventos/DayEventsPopover.jsx` | Rediseño completo, animación, responsive, role-based |
| `src/components/eventos/EventoPill.jsx` | Vista admin vs cliente |
| `src/components/eventos/CalendarioLegend.jsx` | Franjas + diseño compacto |
| `src/mocks/eventosMock.js` | Eventos junio 2026 |
| `package.json` | Scripts de test + devDependencies |

---

## 10. Criterios de aceptación

### Funcionalidad

- [ ] Admin ve nombre, cliente, invitados y estado en pills y popover
- [ ] Cliente/anonymous ve solo "Horario reservado" sin datos privados
- [ ] El filtrado ocurre ANTES de llegar al DOM (no es CSS hiding)
- [ ] Hover/tap en día con eventos abre popover/bottom-sheet
- [ ] Celdas muestran dots de color por franja ocupada
- [ ] Header premium con gradient y cards de resumen
- [ ] Mock data incluye junio 2026 (14/06 con 2+ eventos)
- [ ] Responsive: mobile usa bottom-sheet, desktop usa popover

### Accesibilidad

- [ ] Keyboard: Tab navega, Enter abre popover, Escape cierra
- [ ] ARIA: role=dialog en popover, aria-labels en celdas, aria-hidden en dots
- [ ] Focus management: focus va al popover al abrir, vuelve al cerrar
- [ ] Color contrast WCAG AA en todos los textos
- [ ] prefers-reduced-motion respeta la preferencia del usuario

### Seguridad

- [ ] Rol se lee del JWT, no de estado de UI
- [ ] Token expirado → anonymous (no crash, no error visible)
- [ ] Sin `dangerouslySetInnerHTML`
- [ ] Sin tokens en console.log
- [ ] Datos privados no llegan a props de componentes de cliente

### Testing

- [ ] `npm run test:run` pasa sin errores
- [ ] Utils: 100% de funciones puras con tests
- [ ] Hooks: todos los hooks custom con tests
- [ ] Componentes: EventoPill, DayEventsPopover, FranjaDots con tests
- [ ] Edge cases: datos vacíos, token inválido, 100 eventos, hora inválida
- [ ] Sin `console.error` en output de tests

### Código

- [ ] Funciones de máximo ~20 líneas
- [ ] Sin magic numbers/strings
- [ ] Componentes con responsabilidad única
- [ ] Hooks desacoplados de la UI
- [ ] Services intercambiables (mock/API)
- [ ] Early returns, sin nesting profundo

---

## 11. Decisiones tomadas

| # | Decisión | Resolución | Motivo |
|---|----------|------------|--------|
| 1 | Calendario público o protegido | **Público** (vidriera de ventas) | El objetivo es generar ventas. Un calendario público genera FOMO. |
| 2 | Cliente ve "Ocupado" o nada | **Ve "Ocupado"** | Genera urgencia. "Ese día ya lo reservaron, yo también quiero." |
| 3 | Animación del popover | **Fade+scale** | Sutil, profesional, no distrae. |
| 4 | Mobile: popover o bottom sheet | **Bottom sheet** | Es el patrón nativo mobile. El popover flotante se siente raro en touch. |
| 5 | Testing framework | **Vitest + RTL** | Nativo de Vite, rápido, compatible con el stack. |

---

## 12. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| FullCalendar CSS overrides frágiles | Alta | Medio | Selectores específicos con prefijo `.salon404-fc-`, no `!important` |
| AuthContext sin session restore | Alta | Alto | Documentar como deuda técnica. No bloquea esta iteración. |
| Backend sin auth real | Alta | Alto | Frontend hace el filtrado. Cuando backend tenga auth, se simplifica. |
| 3 días es ajustado | Media | Alto | Día 1 = lógica pura (rápido). Día 2 = UI (más lento). Día 3 = testing (buffer). |
| QA encuentra bugs el día 16 | Media | Medio | Testing exhaustivo día 3 reduce probabilidad. Fixes rápidos si aparecen. |

---

## 13. Fuera de scope (explícito)

- Creación/edición de eventos (botón disabled "Próximamente")
- Integración con backend real (`USE_MOCK = true`)
- Página de detalle de evento (`/eventos/:id`)
- Cambios en backend (auth, DTOs, endpoints)
- Arreglar session restore de AuthContext (deuda técnica)
- Arreglar prop mismatch del calendario viejo de reservas (deuda técnica)
- Testing E2E automatizado (Cypress/Playwright — futuro)

---

## Autocrítica — Iteración 1

### Qué salió bien

- **La separación en capas (utils → hooks → componentes) pagó dividendos inmediatamente.** Las funciones puras fueron triviales de testear sin mocks, y los hooks se pudieron probar con `renderHook` sin necesidad de montar el calendario completo.
- **La diferenciación por rol quedó sólida.** El filtrado ocurre en `filtrarEventosParaVista` antes de llegar a cualquier componente. No hay forma de que un cliente vea datos privados porque literalmente no están en las props.
- **El setup de testing con Vitest + RTL fue rápido y sin fricción.** 122 tests corren en ~8 segundos. El mock de `matchMedia` en el setup global evitó problemas repetidos.
- **La estética premium del calendario quedó muy bien.** El header con gradient, los dots por franja y el popover con backdrop-blur le dan una identidad visual que el calendario genérico de FullCalendar no tenía.
- **Los edge cases no revelaron bugs críticos.** El código defensivo (early returns, validación de nulls) funcionó como se esperaba.

### Qué mejoraría en la próxima iteración

- **`getFranja` no valida horas inválidas.** Con "25:00" devuelve 'noche' por fallback, lo cual es silencioso pero incorrecto. Debería devolver null y que el caller decida qué hacer.
- **El popover no tiene focus trap.** El spec lo pide pero la implementación actual no atrapa el foco dentro del popover. Un usuario con teclado puede tab-ear fuera del dialog.
- **El bottom sheet mobile no se testeó en profundidad.** La lógica de responsive (popover vs bottom sheet) está pero falta testing manual más exhaustivo en viewports chicos.
- **Los tests de componentes usan fake timers para el click-outside.** El `setTimeout(50ms)` en `DayEventsPopover` es un code smell — en la próxima iteración lo reemplazaría por un ref-based approach que no necesite timers.
- **Faltan tests de integración entre el calendario y los popovers.** Los tests actuales son unitarios por componente; no hay tests que verifiquen el flujo completo de click en celda → popover → cierre.

### Deuda técnica identificada

- **Focus trap en popover:** El popover no implementa focus trap. Necesita un `useFocusTrap` hook o librería como `focus-trap-react`.
- **Session restore de AuthContext:** El AuthContext no persiste la sesión entre refreshes. Cada reload pierde el usuario logueado. No bloquea esta iteración pero es un problema de UX real.
- **`getFranja` sin validación:** Agregar validación de rango horario (0-23) y devolver null para horas inválidas. Los callers deben manejar el null gracefully.
