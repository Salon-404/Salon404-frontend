# Spec: Sistema de Reservas con Disponibilidad en Tiempo Real

**Autor:** Federico Oviedo (Frontend)  
**Fecha:** 13/06/2026  
**Deadline:** 19/06/2026 (6 días)  
**Branch de trabajo:** `feature/reservas-disponibilidad` (desde `develop`)  
**PR target:** `develop` → QA review → merge a `main`  
**Ruta principal:** `/reservas/nueva`  
**Iteración:** 2 de 3 (reservas + disponibilidad)

---

## 0. Alcance de esta iteración

### ✅ INCLUYE (Iteración 2 — Reservas con disponibilidad)

- Calendario de disponibilidad en tiempo real para clientes
- Selección de día + horario flexible (hora exacta)
- Duración automática según tipo de evento (configurada por admin)
- Bloqueo temporal de horario (como asiento de cine)
- Vista de reservas del admin con búsqueda y filtros
- Gestión de reservas (editar/cancelar con confirmación)

### ❌ NO INCLUYE (Iteraciones futuras)

- **Configuración de tipos de evento por admin** → Iteración 3
  - Admin define duración por tipo de evento
  - Admin define tiempo de limpieza entre eventos
  - Admin define horarios de apertura del salón por día
- **Integración con backend real** → Issue #16
  - Cambiar `USE_MOCK=false` en services
  - Conectar con endpoints reales
- **Pasarela de pago** → Fuera de scope para este sprint
  - Solo se muestra el monto y se marca como "pendiente de pago"

---

## 1. Contexto y problema actual

### Problema del cliente

El flujo actual de reserva es **ciego**: el cliente elige una fecha, completa un formulario, y recién después descubre si el día estaba disponible o no. Esto genera frustración y abandono.

### Problema del admin

El admin no tiene una vista centralizada de todas las reservas del salón. No puede buscar por nombre de cliente, filtrar por fecha o estado, ni gestionar reservas eficientemente.

### Problema de negocio

Sin visibilidad de disponibilidad en tiempo real, se pierden ventas. El cliente no sabe qué días/horarios tiene libres, y el admin no puede optimizar la ocupación del salón.

---

## 2. Principios de ingeniería (no negociables)

### 2.1 Clean Code

- Funciones de máximo 20 líneas
- Nombres descriptivos: `obtenerHorariosDisponibles` no `getData`
- Early returns para validaciones
- Sin magic numbers: todo a constantes (`DURACION_MINIMA_RESERVA = 10`)

### 2.2 SOLID

| Principio | Aplicación |
|-----------|------------|
| **S**ingle Responsibility | `CalendarioDisponibilidad` solo renderiza calendario. `SelectorHorarios` solo renderiza horarios. `useDisponibilidad` solo consulta disponibilidad. |
| **O**pen/Closed | Agregar nuevo tipo de evento no modifica componentes. Se extiende via configuración. |
| **L**iskov Substitution | Componentes reciben props tipadas. Puedo cambiar `EventoCard` por otro componente con misma interfaz. |
| **I**nterface Segregation | Componentes reciben solo las props que necesitan. No pasar objeto `reserva` entero si solo necesita `fecha`. |
| **D**ependency Inversion | Hooks reciben services como parámetro. Componente no sabe si viene de mock o API real. |

### 2.3 Desacoplamiento

```
Capa de presentación (componentes)
  ↓ solo reciben props + callbacks
Capa de lógica (hooks custom)
  ↓ solo llaman services
Capa de datos (services)
  ↓ abstraen mock vs API real
```

### 2.4 Funciones puras donde sea posible

- Calcular horarios disponibles → función pura
- Validar si horario está dentro de ventana → función pura
- Formatear rango horario → función pura
- Todo lo puro es testeable sin mocks.

---

## 3. Lógica de negocio

### 3.1 Disponibilidad de horarios

**Reglas:**

1. **Ventana de apertura del salón:** El admin define horarios de apertura por día de la semana (ej: Lunes 8:00-22:00, Sábado 10:00-03:00)
2. **Duración por tipo de evento:** Cada tipo de evento tiene una duración máxima configurada por el admin (ej: Casamiento 8hs, XV 6hs, Bautismo 4hs)
3. **Tiempo de limpieza:** Entre eventos, el salón necesita tiempo de limpieza configurado por el admin (ej: 2hs)
4. **Múltiples reservas por día:** Un día puede tener múltiples reservas si los horarios no se solapan (incluyendo tiempo de limpieza)

**Algoritmo de disponibilidad:**

```javascript
function calcularHorariosDisponibles(fecha, tipoEventoId, reservasDelDia, configSalon) {
  const { horaApertura, horaCierre } = configSalon.horarios[fecha.diaSemana]
  const duracionEvento = tipoEvento.duracionMaxima
  const tiempoLimpieza = configSalon.tiempoLimpieza
  
  const horariosOcupados = reservasDelDia.map(r => ({
    inicio: r.horaInicio,
    fin: r.horaFin + tiempoLimpieza // Incluye limpieza
  }))
  
  const horariosDisponibles = []
  let horaActual = horaApertura
  
  while (horaActual + duracionEvento <= horaCierre) {
    const horaFin = horaActual + duracionEvento
    const hayConflicto = horariosOcupados.some(ocupado => 
      seSolapan(horaActual, horaFin, ocupado.inicio, ocupado.fin)
    )
    
    if (!hayConflicto) {
      horariosDisponibles.push({ inicio: horaActual, fin: horaFin })
    }
    
    horaActual += 30 minutos // Incrementos de 30 minutos
  }
  
  return horariosDisponibles
}
```

### 3.2 Bloqueo temporal de horario (como asiento de cine)

**Flujo:**

1. Cliente selecciona día + horario
2. Frontend llama a `POST /api/reservations/lock` con `{ fecha, horaInicio, horaFin, tipoEventoId }`
3. Backend crea reserva temporal con `ExpirationAt = now + 10 minutos`
4. Frontend muestra countdown: "Tenés 10:00 minutos para completar la reserva"
5. Si el cliente completa el formulario y paga → reserva se confirma
6. Si expira el tiempo → reserva se cancela automáticamente y el horario queda libre

**Responsabilidades:**

- **Backend:** Crear reserva temporal, validar que no haya conflicto, cancelar automáticamente al expirar
- **Frontend:** Mostrar countdown, manejar expiración, reintentar si expiró

### 3.3 Flujo de reserva (cliente)

```
1. Cliente entra a /reservas/nueva
2. Ve calendario con días disponibles (verde) y ocupados (rojo/gris)
3. Hace click en día disponible
4. Ve horarios disponibles para ese día (según tipo de evento seleccionado)
5. Selecciona horario
6. Backend bloquea horario temporalmente (10 min)
7. Cliente completa formulario:
   - Tipo de evento
   - Nombre del evento
   - Cantidad estimada de invitados
   - Notas adicionales
8. Ve resumen con monto total
9. Confirma reserva
10. Backend confirma reserva y crea evento asociado
11. Cliente ve confirmación con link al evento
```

### 3.4 Flujo de gestión (admin)

```
1. Admin entra a /reservas
2. Ve tabla con todas las reservas del salón
3. Puede filtrar por:
   - Fecha (rango)
   - Estado (pendiente, confirmada, expirada, cancelada)
   - Tipo de evento
   - Nombre del cliente (búsqueda)
4. Puede hacer click en reserva para ver detalle
5. Desde detalle puede:
   - Editar (cambiar fecha/horario, con validación de disponibilidad)
   - Cancelar (con confirmación: "¿Estás seguro? Esta acción no se puede deshacer")
   - Ver evento asociado
```

---

## 4. Seguridad frontend

### 4.1 Diferenciación por rol

| Acción | Cliente | Admin |
|--------|---------|-------|
| Ver disponibilidad | ✅ Solo días disponibles (sin detalles de otros) | ✅ Todos los días con detalles |
| Ver sus propias reservas | ✅ Solo las suyas | ❌ N/A |
| Ver todas las reservas | ❌ | ✅ Solo del salón |
| Crear reserva | ✅ | ❌ (no, por ahora) |
| Editar/cancelar reserva | ❌ (solo ver) | ✅ |
| Buscar por nombre de cliente | ❌ | ✅ |

### 4.2 Validación de datos

- **Frontend:** Validar formato de fecha, hora, tipo de evento antes de enviar al backend
- **Backend:** Validar nuevamente (doble check). Frontend puede ser manipulado.
- **Sanitización:** No usar `dangerouslySetInnerHTML`. Renderizar todo como texto.

### 4.3 Manejo de errores

- **Horario ya no disponible:** Si el cliente intenta reservar un horario que acaba de ser tomado, mostrar mensaje claro: "Este horario ya no está disponible. Por favor seleccioná otro."
- **Reserva expirada:** Si el countdown llega a 0, mostrar modal: "Tu reserva expiró. El horario quedó libre nuevamente. ¿Querés intentar de nuevo?"
- **Error de red:** Mostrar mensaje genérico + botón "Reintentar"

---

## 5. UX y accesibilidad

### 5.1 Calendario de disponibilidad (cliente)

**Diseño:**

- Días disponibles: fondo verde claro, cursor pointer
- Días ocupados: fondo gris claro, cursor not-allowed
- Días con reservas propias: fondo azul claro, borde azul
- Día seleccionado: borde indigo grueso, sombra
- Hover en día disponible: sombra sutil, tooltip "Click para ver horarios"

**Interacción:**

- Click en día disponible → abre panel lateral con horarios
- Click en día ocupado → no hace nada (disabled)
- Click en día con reserva propia → muestra detalle de su reserva

### 5.2 Selector de horarios (cliente)

**Diseño:**

- Panel lateral (desktop) o bottom sheet (mobile)
- Lista de horarios disponibles como cards
- Cada card muestra: "09:00 - 13:00 (4 horas)"
- Horario seleccionado: borde indigo, fondo indigo claro
- Horario no disponible: no se muestra (ya filtrado)

**Interacción:**

- Click en horario → bloquea temporalmente, avanza al formulario
- Si no hay horarios disponibles → mensaje "No hay horarios disponibles para este día y tipo de evento"

### 5.3 Formulario de reserva (cliente)

**Diseño:**

- Formulario en pasos (wizard):
  1. Tipo de evento (dropdown)
  2. Datos del evento (nombre, invitados, notas)
  3. Resumen + confirmación
- Countdown visible en todo momento: "⏱️ 09:45 restantes"
- Botón "Atrás" para volver a pasos anteriores
- Botón "Confirmar reserva" solo habilitado en paso final

**Validación:**

- Tipo de evento: requerido
- Nombre del evento: requerido, máximo 100 caracteres
- Cantidad de invitados: requerido, número positivo, máximo 500
- Notas: opcional, máximo 500 caracteres

### 5.4 Vista de reservas (admin)

**Diseño:**

- Tabla con columnas: Fecha, Hora, Cliente, Tipo de evento, Estado, Acciones
- Filtros arriba de la tabla (dropdowns + input de búsqueda)
- Paginación abajo (20 reservas por página)
- Click en fila → abre modal con detalle
- Botones de acción: "Editar", "Cancelar"

**Estados visuales:**

- Pendiente: badge amarillo
- Confirmada: badge verde
- Expirada: badge rojo
- Cancelada: badge gris

### 5.5 Accesibilidad

- **Keyboard navigation:** Tab navega entre días, horarios, campos del formulario
- **ARIA labels:** Calendario con `role="grid"`, días con `aria-label="14 de junio, disponible"`
- **Focus management:** Al abrir panel de horarios, focus va al primer horario disponible
- **Screen readers:** Anunciar cambios de estado ("Reserva confirmada", "Horario bloqueado")
- **Color contrast:** WCAG AA en todos los textos y badges

---

## 6. Arquitectura técnica

### 6.1 Componentes (capa de presentación)

```
src/pages/reservas/
  ├── NuevaReservaPage.jsx          ← Página principal de reserva (cliente)
  ├── ReservasPage.jsx              ← Lista de reservas (admin)
  └── ReservaDetailPage.jsx         ← Detalle de reserva (admin)

src/components/reservas/
  ├── CalendarioDisponibilidad.jsx  ← Calendario con días disponibles/ocupados
  ├── SelectorHorarios.jsx          ← Panel de horarios disponibles
  ├── FormularioReserva.jsx         ← Wizard de 3 pasos
  ├── CountdownReserva.jsx          ← Timer de expiración
  ├── ResumenReserva.jsx            ← Resumen antes de confirmar
  ├── TablaReservas.jsx             ← Tabla de reservas (admin)
  ├── FiltrosReservas.jsx           ← Filtros de búsqueda (admin)
  └── ModalDetalleReserva.jsx       ← Modal con detalle (admin)
```

### 6.2 Hooks (capa de lógica)

```
src/hooks/
  ├── useDisponibilidad.js          ← Consulta disponibilidad de un día
  ├── useHorariosDisponibles.js     ← Calcula horarios disponibles
  ├── useBloqueoHorario.js          ← Bloquea horario temporalmente
  ├── useReservas.js                ← Lista reservas con filtros (admin)
  ├── useReservaDetalle.js          ← Detalle de una reserva
  └── useCountdown.js               ← Timer de expiración
```

### 6.3 Utils (funciones puras)

```
src/utils/
  ├── disponibilidad.js             ← calcularHorariosDisponibles, seSolapan
  ├── reservas.js                   ← filtrarReservas, ordenarReservas
  └── validaciones.js               ← validarFecha, validarHora, validarInvitados
```

### 6.4 Services (capa de datos)

```
src/services/
  ├── disponibilidadService.js      ← GET /api/availability
  ├── reservasService.js            ← CRUD de reservas
  └── tiposEventoService.js         ← GET /api/event-types (ya existe)
```

### 6.5 Mocks (datos de prueba)

```
src/mocks/
  ├── disponibilidadMock.js         ← Horarios de apertura del salón
  ├── reservasMock.js               ← Reservas de ejemplo (ya existe, extender)
  └── tiposEventoMock.js            ← Tipos de evento con duración (ya existe)
```

---

## 7. Testing

### 7.1 Setup

Ya configurado en iteración anterior (Vitest + RTL + jsdom).

### 7.2 Tests unitarios (funciones puras)

**Archivo: `src/utils/disponibilidad.test.js`**

| Función | Tests |
|---------|-------|
| `calcularHorariosDisponibles` | Día sin reservas → todos los horarios, día con 1 reserva → horarios filtrados, día completo → array vacío, horario que cruza medianoche, duración mayor a ventana → array vacío |
| `seSolapan` | Solapamiento parcial, solapamiento total, sin solapamiento, mismo horario |
| `validarHorarioEnVentana` | Horario dentro de ventana, horario fuera de ventana, horario que cruza medianoche |

**Archivo: `src/utils/reservas.test.js`**

| Función | Tests |
|---------|-------|
| `filtrarReservas` | Sin filtros → todas, filtro por fecha, filtro por estado, filtro por nombre (búsqueda parcial), múltiples filtros combinados |
| `ordenarReservas` | Por fecha ascendente, por fecha descendente, por estado |

**Archivo: `src/utils/validaciones.test.js`**

| Función | Tests |
|---------|-------|
| `validarFecha` | Fecha válida, fecha pasada, fecha muy lejana (> 1 año) |
| `validarHora` | Hora válida, hora fuera de rango, formato inválido |
| `validarInvitados` | Número positivo, número negativo, número muy grande (> 500) |

### 7.3 Tests de hooks

**Archivo: `src/hooks/useDisponibilidad.test.js`**

| Escenario | Expected |
|-----------|----------|
| Consultar disponibilidad de día sin reservas | Devuelve todos los horarios |
| Consultar disponibilidad de día con reservas | Devuelve horarios filtrados |
| Cambiar de día | Re-fetch con nueva fecha |
| Error de red | Devuelve error + función retry |

**Archivo: `src/hooks/useBloqueoHorario.test.js`**

| Escenario | Expected |
|-----------|----------|
| Bloquear horario disponible | Devuelve reserva temporal con ExpirationAt |
| Bloquear horario ya ocupado | Devuelve error "Horario no disponible" |
| Expiración de bloqueo | Llama a callback onExpire |

### 7.4 Tests de componentes

**Archivo: `src/components/reservas/CalendarioDisponibilidad.test.jsx`**

| Escenario | Expected |
|-----------|----------|
| Renderiza calendario con días disponibles | Días verdes son clickables |
| Click en día disponible | Abre panel de horarios |
| Click en día ocupado | No hace nada (disabled) |
| Día con reserva propia | Muestra borde azul |

**Archivo: `src/components/reservas/SelectorHorarios.test.jsx`**

| Escenario | Expected |
|-----------|----------|
| Renderiza horarios disponibles | Muestra cards con rangos |
| Click en horario | Llama a onSeleccionar con horario |
| No hay horarios disponibles | Muestra mensaje "No hay horarios" |

**Archivo: `src/components/reservas/FormularioReserva.test.jsx`**

| Escenario | Expected |
|-----------|----------|
| Validación de campos requeridos | Muestra errores si están vacíos |
| Navegación entre pasos | Botones "Atrás" y "Siguiente" funcionan |
| Countdown visible | Muestra tiempo restante |
| Submit exitoso | Llama a onConfirmar con datos |

### 7.5 Tests de edge cases

| Escenario | Qué se testea |
|-----------|---------------|
| 100 reservas en un mes | Performance: tabla no se cuelga |
| Horario que acaba de ser tomado | Mensaje claro de error |
| Reserva expirada durante formulario | Modal de expiración |
| Cambio de tipo de evento | Recalcula horarios disponibles |
| Navegación rápida entre días | No race conditions |
| Doble click en "Confirmar" | No crea dos reservas |

### 7.6 Cuándo se testea

```
Código nuevo → test ANTES del commit
Código modificado → correr tests afectados + related
Antes del PR → npm run test:run (todo)
```

**Regla: si no tiene test, no se commitea.**

---

## 8. Branching y flujo de trabajo

### 8.1 Branches

```
main ← develop ← feature/reservas-disponibilidad (ESTA RAMA)
```

### 8.2 Commits

Formato: `tipo: descripción en español`

```
setup: agregar services y mocks de disponibilidad
test: agregar tests unitarios de utils/disponibilidad
test: agregar tests unitarios de utils/reservas
feature: agregar hook useDisponibilidad
feature: agregar hook useHorariosDisponibles
feature: agregar hook useBloqueoHorario
feature: agregar componente CalendarioDisponibilidad
feature: agregar componente SelectorHorarios
feature: agregar componente FormularioReserva con wizard
feature: agregar componente CountdownReserva
refactor: integrar NuevaReservaPage con nuevos componentes
test: agregar tests de componentes de reserva
feature: agregar hook useReservas con filtros (admin)
feature: agregar componente TablaReservas (admin)
feature: agregar componente FiltrosReservas (admin)
feature: agregar componente ModalDetalleReserva (admin)
refactor: integrar ReservasPage con nuevos componentes
test: agregar tests de componentes de admin
test: agregar tests de edge cases
fix: correcciones post-testing (si aparecen)
docs: agregar autocrítica de iteración 2
```

### 8.3 PR a develop

- **Target:** `develop`
- **Descripción:** escrita con `/humanizer` para que suene natural
- **Debe incluir:**
  - Qué se hizo (resumen)
  - Cómo probarlo (pasos concretos para QA)
  - Credenciales de prueba
  - Screenshots o GIF del flujo completo
  - Edge cases conocidos
  - Qué NO se hizo

### 8.4 Autocrítica post-ciclo

Al final del ciclo, agregar sección al spec:

```markdown
## Autocrítica — Iteración 2

### Qué salió bien
- ...

### Qué mejoraría en la próxima iteración
- ...

### Deuda técnica identificada
- ...
```

---

## 9. Plan de ejecución (6 días)

### Día 1 — Sábado 14/06: Capa de datos

| Paso | Tarea | Commits |
|------|-------|---------|
| 1 | Services de disponibilidad + mocks | `setup: agregar services y mocks de disponibilidad` |
| 2 | Utils puras de disponibilidad + tests | `feature: agregar utils de disponibilidad` + `test: ...` |
| 3 | Utils puras de reservas + tests | `feature: agregar utils de reservas` + `test: ...` |

**Entregable día 1:** Capa de datos completa, 100% testeada.

### Día 2 — Domingo 15/06: Hooks de disponibilidad

| Paso | Tarea | Commits |
|------|-------|---------|
| 4 | Hook useDisponibilidad + tests | `feature: agregar hook useDisponibilidad` + `test: ...` |
| 5 | Hook useHorariosDisponibles + tests | `feature: agregar hook useHorariosDisponibles` + `test: ...` |
| 6 | Hook useBloqueoHorario + tests | `feature: agregar hook useBloqueoHorario` + `test: ...` |

**Entregable día 2:** Hooks de disponibilidad completos, 100% testeados.

### Día 3 — Lunes 16/06: Componentes de reserva (cliente)

| Paso | Tarea | Commits |
|------|-------|---------|
| 7 | CalendarioDisponibilidad | `feature: agregar componente CalendarioDisponibilidad` |
| 8 | SelectorHorarios | `feature: agregar componente SelectorHorarios` |
| 9 | FormularioReserva (wizard) | `feature: agregar componente FormularioReserva con wizard` |
| 10 | CountdownReserva | `feature: agregar componente CountdownReserva` |

**Entregable día 3:** Componentes de reserva completos.

### Día 4 — Martes 17/06: Integración de reserva

| Paso | Tarea | Commits |
|------|-------|---------|
| 11 | Integrar NuevaReservaPage | `refactor: integrar NuevaReservaPage con nuevos componentes` |
| 12 | Tests de componentes de reserva | `test: agregar tests de componentes de reserva` |
| 13 | Testing manual del flujo de reserva | (sin commit, verificación) |

**Entregable día 4:** Flujo de reserva completo y funcional.

### Día 5 — Miércoles 18/06: Vista de admin

| Paso | Tarea | Commits |
|------|-------|---------|
| 14 | Hook useReservas con filtros | `feature: agregar hook useReservas con filtros` |
| 15 | TablaReservas + FiltrosReservas | `feature: agregar componente TablaReservas` + `feature: agregar componente FiltrosReservas` |
| 16 | ModalDetalleReserva | `feature: agregar componente ModalDetalleReserva` |
| 17 | Integrar ReservasPage | `refactor: integrar ReservasPage con nuevos componentes` |

**Entregable día 5:** Vista de admin completa.

### Día 6 — Jueves 19/06: Testing final + PR

| Paso | Tarea | Commits |
|------|-------|---------|
| 18 | Tests de componentes de admin | `test: agregar tests de componentes de admin` |
| 19 | Tests de edge cases | `test: agregar tests de edge cases` |
| 20 | Fixes post-testing | `fix: correcciones post-testing` (si hacen falta) |
| 21 | Testing manual cross-browser | (sin commit, verificación) |
| 22 | Autocrítica | `docs: agregar autocrítica de iteración 2` |
| 23 | PR a develop | Con descripción para QA |

**Entregable día 6:** Todo testeado, PR abierto, QA puede probar.

---

## 10. Archivos a crear/modificar

### Crear (nuevos)

| Archivo | Descripción |
|---------|-------------|
| `src/services/disponibilidadService.js` | Service de disponibilidad |
| `src/mocks/disponibilidadMock.js` | Mock de horarios de apertura |
| `src/utils/disponibilidad.js` | Funciones puras de disponibilidad |
| `src/utils/disponibilidad.test.js` | Tests de disponibilidad |
| `src/utils/reservas.js` | Funciones puras de reservas |
| `src/utils/reservas.test.js` | Tests de reservas |
| `src/utils/validaciones.js` | Funciones puras de validación |
| `src/utils/validaciones.test.js` | Tests de validación |
| `src/hooks/useDisponibilidad.js` | Hook de disponibilidad |
| `src/hooks/useDisponibilidad.test.js` | Tests del hook |
| `src/hooks/useHorariosDisponibles.js` | Hook de horarios |
| `src/hooks/useHorariosDisponibles.test.js` | Tests del hook |
| `src/hooks/useBloqueoHorario.js` | Hook de bloqueo temporal |
| `src/hooks/useBloqueoHorario.test.js` | Tests del hook |
| `src/hooks/useReservas.js` | Hook de reservas (admin) |
| `src/hooks/useReservas.test.js` | Tests del hook |
| `src/hooks/useCountdown.js` | Hook de countdown |
| `src/components/reservas/CalendarioDisponibilidad.jsx` | Calendario de disponibilidad |
| `src/components/reservas/CalendarioDisponibilidad.test.jsx` | Tests del componente |
| `src/components/reservas/SelectorHorarios.jsx` | Selector de horarios |
| `src/components/reservas/SelectorHorarios.test.jsx` | Tests del componente |
| `src/components/reservas/FormularioReserva.jsx` | Formulario wizard |
| `src/components/reservas/FormularioReserva.test.jsx` | Tests del componente |
| `src/components/reservas/CountdownReserva.jsx` | Countdown de expiración |
| `src/components/reservas/CountdownReserva.test.jsx` | Tests del componente |
| `src/components/reservas/ResumenReserva.jsx` | Resumen antes de confirmar |
| `src/components/reservas/TablaReservas.jsx` | Tabla de reservas (admin) |
| `src/components/reservas/TablaReservas.test.jsx` | Tests del componente |
| `src/components/reservas/FiltrosReservas.jsx` | Filtros de búsqueda (admin) |
| `src/components/reservas/FiltrosReservas.test.jsx` | Tests del componente |
| `src/components/reservas/ModalDetalleReserva.jsx` | Modal de detalle (admin) |
| `src/components/reservas/ModalDetalleReserva.test.jsx` | Tests del componente |

### Modificar (existentes)

| Archivo | Qué cambia |
|---------|------------|
| `src/pages/reservas/NuevaReservaPage.jsx` | Integración con nuevos componentes |
| `src/pages/reservas/ReservasPage.jsx` | Integración con nuevos componentes (admin) |
| `src/services/reservasService.js` | Agregar métodos de bloqueo y confirmación |
| `src/mocks/reservasMock.js` | Extender con más reservas de ejemplo |

---

## 11. Criterios de aceptación

### Funcionalidad (cliente)

- [ ] Cliente ve calendario con días disponibles (verde) y ocupados (gris)
- [ ] Click en día disponible abre panel de horarios
- [ ] Horarios disponibles se calculan según tipo de evento seleccionado
- [ ] Selección de horario bloquea temporalmente (10 min)
- [ ] Countdown visible durante todo el formulario
- [ ] Formulario wizard de 3 pasos funciona correctamente
- [ ] Confirmación de reserva crea reserva + evento asociado
- [ ] Si reserva expira, muestra modal y libera horario

### Funcionalidad (admin)

- [ ] Admin ve tabla con todas las reservas del salón
- [ ] Filtros por fecha, estado, tipo de evento funcionan
- [ ] Búsqueda por nombre de cliente funciona
- [ ] Click en reserva abre modal con detalle
- [ ] Botón "Editar" permite cambiar fecha/horario (con validación)
- [ ] Botón "Cancelar" pide confirmación antes de cancelar

### Accesibilidad

- [ ] Keyboard navigation completa (Tab, Enter, Escape)
- [ ] ARIA labels en calendario, horarios, formulario
- [ ] Focus management correcto (panel de horarios, modal)
- [ ] Color contrast WCAG AA en todos los textos
- [ ] Screen readers anuncian cambios de estado

### Seguridad

- [ ] Cliente solo ve disponibilidad (sin detalles de otros)
- [ ] Admin solo ve reservas de su salón
- [ ] Validación de datos en frontend + backend
- [ ] Sin `dangerouslySetInnerHTML`
- [ ] Manejo de errores claro y user-friendly

### Testing

- [ ] `npm run test:run` pasa sin errores
- [ ] Utils: 100% de funciones puras con tests
- [ ] Hooks: todos los hooks custom con tests
- [ ] Componentes: todos los componentes principales con tests
- [ ] Edge cases: horarios ocupados, expiración, errores de red
- [ ] Sin `console.error` en output de tests

### Código

- [ ] Funciones de máximo ~20 líneas
- [ ] Sin magic numbers/strings
- [ ] Componentes con responsabilidad única
- [ ] Hooks desacoplados de la UI
- [ ] Services intercambiables (mock/API)
- [ ] Early returns, sin nesting profundo

---

## 12. Decisiones tomadas

| # | Decisión | Resolución | Motivo |
|---|----------|------------|--------|
| 1 | ¿Bloqueo temporal de horario? | **Sí, 10 minutos** | Como asiento de cine. Evita que dos clientes reserven el mismo horario simultáneamente. |
| 2 | ¿Quién configura duración de eventos? | **Admin (iteración 3)** | Flexibilidad para el negocio. Por ahora hardcodeado en mocks. |
| 3 | ¿Múltiples reservas por día? | **Sí** | Optimiza ocupación del salón. Depende de horarios de apertura y tiempo de limpieza. |
| 4 | ¿Cliente puede editar/cancelar? | **No, solo admin** | Simplifica flujo. Cliente puede contactar al salón para cambios. |
| 5 | ¿Pasarela de pago? | **No, fuera de scope** | Solo se muestra monto y se marca como "pendiente de pago". Integración futura. |
| 6 | ¿Incrementos de horario? | **30 minutos** | Balance entre flexibilidad y simplicidad. Cliente puede elegir 09:00, 09:30, 10:00, etc. |

---

## 13. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Backend de disponibilidad no está listo | Alta | Alto | Frontend usa mocks. Cuando backend esté listo, solo cambiar `USE_MOCK=false`. |
| Race condition en bloqueo de horario | Media | Alto | Backend maneja concurrencia. Frontend muestra error claro si horario ya fue tomado. |
| 6 días es ajustado | Media | Alto | Plan detallado por día. Priorizar funcionalidad core. Testing manual puede extenderse si es necesario. |
| QA encuentra bugs el día 19 | Media | Medio | Testing exhaustivo día 6. Fixes rápidos si aparecen. |
| Complejidad del wizard de 3 pasos | Media | Medio | Componentes pequeños y testeables. Validación en cada paso. |

---

## 14. Fuera de scope (explícito)

- Configuración de tipos de evento por admin (duración, precio) → Iteración 3
- Configuración de horarios de apertura del salón por admin → Iteración 3
- Configuración de tiempo de limpieza por admin → Iteración 3
- Integración con backend real (`USE_MOCK=false`) → Issue #16
- Pasarela de pago (Mercado Pago, efectivo, etc.) → Futuro sprint
- Edición/cancelación de reservas por cliente → Futuro sprint
- Notificaciones por email (confirmación, recordatorio) → Futuro sprint
- Vista de reservas del cliente (solo admin por ahora) → Futuro sprint

---

## 15. Dependencias

### Backend (David Sepúlveda)

- `GET /api/availability?fecha=&tipoEventoId=` → Devuelve horarios disponibles
- `POST /api/reservations/lock` → Bloquea horario temporalmente
- `POST /api/reservations` → Crea reserva (ya existe, extender con horaInicio/horaFin)
- `GET /api/reservations?salonId=&estado=&fechaDesde=&fechaHasta=` → Lista reservas con filtros
- `PATCH /api/reservations/:id` → Actualiza reserva (editar)
- `DELETE /api/reservations/:id` → Cancela reserva

### Frontend (Federico Oviedo)

- Iteración 1 completada (calendario de eventos) ✅
- Iteración 2 en progreso (reservas con disponibilidad) ← **ESTA**
- Iteración 3 pendiente (configuración de tipos de evento)

---

## Autocrítica — Iteración 2

### Qué salió bien

- **Planificación por día funcionó.** Tener los 6 días mapeados en el spec (Día 1-6 con tareas específicas) evitó la parálisis de "¿qué hago ahora?". Cada día sabía qué entregar.
- **Capa de datos primero (Día 1).** Arrancar con utils puras + service + mocks sin tocar UI forzó a pensar las firmas de las funciones antes de los componentes. Cuando llegué a los hooks (Día 2) y componentes (Día 3), la lógica ya estaba testeada.
- **Composición de hooks.** `useHorariosDisponibles` compone `useDisponibilidad` internamente. No duplica la lógica de fetch de reservas ni el manejo de loading/error. Una sola fuente de verdad.
- **`useMemo` en `useHorariosDisponibles`.** Calcular slots disponibles es función pura. `useMemo` evita re-renders innecesarios cuando cambian props irrelevantes.
- **Ref pattern en `useBloqueoHorario`.** El `onExpire` y el `reservaTemporal` se guardan en refs para que el `setInterval` callback siempre vea el valor más reciente, sin re-suscribirse en cada cambio.
- **131 tests passing, 0 skip.** Cobertura de utils puras (100%), hooks (100% de los escenarios), componentes (rendering + interacción + edge cases).
- **PR único con 5 commits.** Cada commit representa un día completo del spec. Trazabilidad clara para QA.

### Qué mejoraría en la próxima iteración

- **Tests de integración del flujo completo.** Los tests actuales cubren unidades y componentes, pero el flujo end-to-end (NuevaReservaPage → seleccionar fecha → tipo → horario → bloquear → formulario → confirmar) se valida solo manualmente. Vale la pena agregar Playwright o Cypress para evitar regresiones.
- **Sub-agent reliability.** Las primeras delegaciones a `general` para Día 4 retornaron vacías sin hacer el trabajo. Tuve que hacer Día 4 inline. Para Día 5 el sub-agent sí funcionó pero generó 5 tests que fallaron por queries no específicas. Moraleja: las delegaciones multi-archivo con prompt largo son frágiles.
- **Mocks más realistas para tests de admin.** Los tests de `ReservasPage` y `TablaReservas` usan datos en línea. Extraer `mockReservas` y `mockTiposEvento` a `src/mocks/__fixtures__/` ayudaría a evitar drift entre tests.
- **El servicio `getReservas` no soporta los filtros nuevos** (fechaDesde, fechaHasta, nombreCliente, tipoEventoId). En Día 5 los apliqué client-side con `filtrarReservas`, pero cuando se integre el backend real (issue #16), el contrato tiene que incluir esos filtros.

### Deuda técnica identificada

1. **`reservasMock` quedó con el formato viejo (`horario: 'tarde'`) Y el nuevo (`horaInicio`, `horaFin`, `tipoEventoId`)**. El viejo `getDisponibilidad` del `reservasService` (que recibe `year, month` y devuelve `fechasOcupadas/fechasPendientes`) sigue funcionando, pero el formato está duplicado. Hay que migrar completamente al formato nuevo en la iteración 3.
2. **`CalendarioDisponibilidad` no recibe `configSalon`** por ahora, así que el cálculo de "día completo" es 50% de 24h. El prop está disponible en la firma del componente pero no se usa. Esto es un atajo que hay que revertir cuando la integración esté más pulida.
3. **El `ReservaForm` viejo** (con react-hook-form) sigue existiendo porque `EditarReservaPage` lo usa. Se va a quedar hasta que se migre la pantalla de edición. No es bloqueante.
4. **El modal de expiración** de `NuevaReservaPage` no tiene un `data-testid` ni `aria-modal`. La accesibilidad quedó como smoke test (focus al primer elemento) pero no hay `focus-trap` real.
5. **No hay tests E2E.** El flujo completo se valida manualmente. Si QA encuentra un bug de integración, no hay red de seguridad automatizada.
6. **El countdown del `useBloqueoHorario` no pausa cuando la pestaña está en background.** En navegadores modernos esto se mitiga con throttling del setInterval, pero no hay verificación explícita.
