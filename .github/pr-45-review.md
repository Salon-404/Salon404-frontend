## 🔴 Revisión QA - PR #45: Feat/sugerencia catering - BLOQUEADO

### ⚠️ Estado: **NO PUEDE SER APROBADO**

He revisado el PR y los microservicios. El frontend espera 5 endpoints en `salon404-proveedores` que **NO están implementados**.

---

### ❌ **ENDPOINTS FALTANTES EN BACKEND**

#### ProvidersController - FALTAN estos 2:
```
GET    /api/v1/providers/catering/seleccion/{eventId}
POST   /api/v1/providers/catering/seleccion
```

#### EventProvidersController - FALTAN estos 2:
```
DELETE /api/v1/event-providers/{assignmentId}
GET    /api/v1/event-providers/schedule/{eventScheduleId}
```

---

### 🔴 **IMPACTO EN FUNCIONALIDAD**

| Funcionalidad | Estado |
|---|---|
| Ver sugerencias de catering | ✅ Funciona |
| **Guardar selección de catering** | ❌ **FALLA - falta endpoint POST** |
| **Cambiar catering** | ❌ **FALLA - falta endpoint POST** |
| Ver resumen de dietas | ✅ Funciona |
| Asignar proveedor a actividad | ✅ Funciona |
| **Desasignar proveedor** | ❌ **FALLA - falta endpoint DELETE** |

---

### ✅ **QUÉ SÍ FUNCIONA**

- ✅ Interfaz de CateringPage está bien diseñada
- ✅ Mapeo de datos correcto (proveedorId, precioPorPersona, etc)
- ✅ Endpoint `GET /api/v1/event-providers/schedule/{id}` para ver asignados
- ✅ Endpoint `GET /api/v1/guests/catering-summary` existe en invitados
- ✅ Error handling con toasts

---

### 📋 **QUÉ HACER**

1. Implementar los **5 endpoints faltantes** en `salon404-proveedores`
2. Validar que `invitadosService.getCateringSummary()` existe en frontend
3. Hacer prueba end-to-end del flujo completo
4. Re-crear el PR o rebasar con los cambios del backend

**Sin el backend, la funcionalidad NO FUNCIONA. Por eso no puedo aprobar.**

---

### 📞 Preguntas para Eze:

1. ¿Los endpoints van a estar listos pronto?
2. ¿Necesitás detalles de los DTOs que esperan esos endpoints?
3. ¿Ya compartiste con el backend qué datos necesita guardar/devolver?

Avísame cuando esté listo el backend y aprobamos sin drama. 🚀
