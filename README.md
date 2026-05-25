# salon404-frontend

Frontend React — Sistema de Gestión Salón de Eventos

## Stack y decisiones técnicas

| Tecnología | Por qué |
|---|---|
| **React 18 + Vite** | Requerido por la cátedra. Vite reemplaza a Create React App (deprecado desde 2023) — más rápido y con mejor soporte actual. |
| **Tailwind CSS** | Permite prototipar rápido sin salir del JSX. Fácil de unificar colores y estilos entre módulos al integrar cambiando solo `tailwind.config.js`. |
| **React Router v6** | Estándar para navegación entre páginas en React. Sin alternativa real. |
| **Axios** | Manejo de errores HTTP más claro que `fetch` nativo y facilita agregar el token JWT en un solo lugar cuando se integre con el módulo de Auth. |
| **react-hook-form** | El módulo de Reservas tiene formularios con múltiples campos y validaciones. Esta librería reduce el código necesario y evita re-renders innecesarios. |
| **FullCalendar** | Nombrado explícitamente en el brief del cliente como solución para el calendario de disponibilidad. |
| **date-fns** | Utilidades de formato y manipulación de fechas, liviana y tree-shakeable. |

## Instalación

```bash
npm install
npm run dev
```

## Variables de entorno

Crear `.env.local` con:

```
VITE_API_AUTH_URL=http://localhost:5000
VITE_API_RESERVAS_URL=http://localhost:5001
VITE_API_INVITADOS_URL=http://localhost:5002
VITE_API_PROVEEDORES_URL=http://localhost:5003
VITE_API_PAGOS_URL=http://localhost:5004
VITE_API_DASHBOARD_URL=http://localhost:5005
```

## Estructura

```
src/
  pages/        ← una carpeta por módulo (auth/, reservas/, invitados/, ...)
  components/   ← componentes reutilizables, organizados por módulo
  services/     ← llamadas HTTP a cada microservicio
  hooks/        ← custom hooks
  constants/    ← constantes compartidas
```

## Módulos y responsables

| Módulo      | Developer        | Branch             |
|-------------|------------------|--------------------|
| Auth        | Juan Cruz Merino | feature/auth       |
| Reservas    | Federico Oviedo  | feature/reservas   |
| Invitados   | Victor Balbuena  | feature/invitados  |

## Workflow

1. Crear branch desde `develop`: `git checkout -b feature/mi-modulo`
2. Desarrollar en `src/pages/mi-modulo/` y `src/components/mi-modulo/`
3. Al terminar cada sesión: commit + push + PR a `develop`
4. Avisar a QA (Valeria) para revisión
5. No pushear a `main` directamente

## Integrar una nueva ruta

En `src/App.jsx`, descomentar la línea del módulo correspondiente cuando esté listo.
