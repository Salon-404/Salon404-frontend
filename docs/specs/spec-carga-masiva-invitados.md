# Especificación: Carga Masiva de Invitados (Excel)

**Feature ID:** `FEAT-IMPORT-EXCEL`  
**Branch:** `feature/integracion-invitados-confirmacion`  
**Autor:** Federico Oviedo (Frontend)  
**Backend:** David Sepúlveda — endpoints ya implementados y mergeados a `main` en `salon404-invitados` (puerto 5201)  
**Fecha:** 30 de junio de 2026

## 1. Alcance

### Incluido

1. Botón "Carga masiva Excel" en el header de `InvitadosList`, al lado de "Enviar correos a todos" y "+ Agregar Invitado".
2. Modal de carga masiva con tres pasos visuales (wizard inline dentro del modal):
   - Paso 1 — Subir archivo: drag & drop + file picker para `.xlsx`, con validaciones client-side.
   - Paso 2 — Previsualizar: parseo client-side del Excel con la librería `xlsx` (SheetJS), mostrando una tabla con las filas detectadas y un resumen.
   - Paso 3 — Confirmar y enviar: botón de envío al backend, spinner, y resultado final.
3. Descarga de plantilla desde `GET /api/v1/events/{eventId}/Guests/excel-template`.
4. Dos métodos nuevos en `invitadosService`: `downloadTemplate` e `importExcel`.
5. Hook `useExcelImport` que encapsula parseo, validación y envío.
6. Componente `ExcelImportModal` que orquesta los tres pasos.
7. Refresco automático de la lista de invitados tras importación exitosa.
8. Tests unitarios para servicio y hook.

### No incluido

- Edición de filas en la previsualización.
- Soporte para `.csv`.
- Mapeo custom de columnas.
- Reintentos automáticos.
- Deshacer importación.
- Tests E2E.

## 2. Contrato del backend

### GET /api/v1/events/{eventId}/Guests/excel-template?maxRows=150
- Retorna binario .xlsx
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Hoja: "Plantilla Invitados"
- Columnas: FullName, Phone, Email

### POST /api/v1/events/{eventId}/Guests/import-excel
- Content-Type: multipart/form-data (campo `file`)
- Respuesta 200: `{ "Message": "...", "TotalImported": <int> }`
- Validaciones: archivo ≤ 5 MB, extensión .xlsx, hoja "Plantilla Invitados", columnas FullName/Phone/Email, máx 150 filas
- Cada invitado creado con DietTypeId=1, GuestStatusId=1, TableId=null
- 400 si archivo inválido, 401 sin JWT, 404 si evento no existe

## 3. Arquitectura

### Archivos a crear
- `src/hooks/useExcelImport.js` + test
- `src/components/invitados/ExcelImportModal.jsx` + test

### Archivos a modificar
- `src/services/invitadosService.js` — agregar `downloadTemplate()` e `importExcel()`
- `src/components/invitados/InvitadosList.jsx` — agregar botón + estado del modal

### Dependencia nueva
- `xlsx` (SheetJS) para parseo client-side

## 4. Criterios de aceptación

- AC-01: Botón visible solo para usuarios con permiso de gestión
- AC-02: Modal se abre con Paso 1 (Subir archivo)
- AC-03: Descarga de plantilla funciona
- AC-04: Drop zone y file picker aceptan .xlsx
- AC-05: Rechaza archivos no .xlsx, > 5 MB, sin hoja correcta, sin columnas, > 150 filas
- AC-06: Previsualización muestra tabla con filas válidas y omitidas
- AC-07: Navegación entre pasos (Volver / Siguiente)
- AC-08: Importación exitosa → Swal.fire + refrescar lista
- AC-09: Error 400 → Swal.fire con mensaje del backend, modal abierto
- AC-10: Error 401 → redirigir a /login
- AC-11: Error 404 → Swal.fire "Evento no existe"
- AC-12: Error de red → Swal.fire "No se pudo conectar"
- AC-13: Cerrar modal limpia el estado
