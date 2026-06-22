# Sistema BI Bancario - Estado de Implementación

## 1. Resumen General

Sistema full-stack para un **Banco**: backend en **Java 21 + Spring Boot 3 + PostgreSQL** (con perfil local H2) y frontend en **Next.js 16 + React 19 + Tailwind CSS**.

Incluye autenticación JWT, roles/permisos, catálogos parametrizables, dos módulos principales y procesos de carga masiva con validación asíncrona.

---

## 2. Backend Implementado

| Área | Funcionalidad |
|---|---|---|
| **Seguridad** | Login JWT, 5 roles (`ADMINISTRADOR`, `ANALISTA`, `ESPECIALISTA`, `EMPLEADO`, `AUDITOR`), permisos granulares con `@PreAuthorize`. |
| **Catálogos** | Tipos de cliente/documento, segmentos, zonas, agencias, canales, productos, subproductos, períodos, tipos/estados de carga. |
| **Module 1 - Visualización** | Clientes + Cliente 360, campañas con KPIs y ofertas asociadas, ofertas, dashboard, reportes CSV. |
| **Module 2 - Captura Digital** | Registro de cargas, upload de archivos, procesamiento asíncrono, validación, publicación, errores, detalles, resultados. |
| **Gestión de usuarios** | CRUD completo: listar, crear, editar, activar/desactivar y cambiar contraseña. Eliminación lógica por estado. |
| **Auditoría** | Aspecto que registra automáticamente cada endpoint REST (acción, entidad, usuario, IP, user-agent). Login/logout e intentos fallidos incluidos. |
| **Resúmenes dinámicos** | Endpoints `/clientes/resumen`, `/campanias/resumen`, `/cargas/estadisticas/resumen`, `/campanias/{id}/ofertas/resumen` que responden a los filtros activos para alimentar KPIs. |
| **Paginación server-side** | Endpoints de listado paginados con filtros: clientes, campañas, cargas, ofertas por campaña, campañas/ofertas por cliente. |
| **Infraestructura** | Flyway migrations `V1` a `V12` (incluye índices de rendimiento), almacenamiento local (`uploads/`), perfil `local` con H2 para desarrollo. |
| **Optimizaciones** | `DashboardService` reescrito con queries agregadas (`SUM`, `AVG`, `GROUP BY`) para evitar cargar tablas completas en memoria. |

### Endpoints nuevos / refactorizados recientemente

- `GET /api/v1/cargas` → ahora soporta filtros `estados`, `usuarioId`, `search` (código, archivo, usuario).
- `GET /api/v1/cargas/estadisticas/resumen` → acepta los mismos filtros que el listado.
- `GET /api/v1/cargas/usuarios-responsables` → usuarios que tienen cargas asociadas.
- `GET /api/v1/campanias/{id}/ofertas` → ahora acepta `search` (cliente/documento) y pagina en BD.
- `GET /api/v1/campanias/{id}/ofertas/resumen` → KPIs dinámicos de ofertas filtradas.
- `GET /api/v1/clientes/{id}/campanias` → campañas donde el cliente tiene ofertas, paginadas y filtrables.
- `GET /api/v1/clientes/{id}/ofertas` → ofertas del cliente, paginadas y filtrables por estado y rango de monto.
- `GET /api/v1/dashboard/resumen` → KPIs y series calculados con queries agregadas.

---

## 3. Frontend Implementado

| Pantalla | Estado |
|---|---|---|
| Login | Conectado a backend JWT. |
| Dashboard | Conectado a `/dashboard/resumen`; KPIs y gráficos reales. |
| Campañas | Listado con filtros automáticos, paginación `DataTablePagination` y KPIs dinámicos. |
| Detalle de Campaña | KPIs dinámicos, ofertas paginadas con búsqueda server-side por cliente/documento. |
| Clientes 360 | Listado con filtros por tipo de cliente y segmento + paginación. |
| Detalle Cliente 360 | Datos del cliente; campañas y ofertas paginadas con filtros (estado, período, producto, monto). |
| Reportes | Listado + generación/descarga CSV. |
| Módulo 2 | Bandeja, registro, validación, publicación, resultados, historial y detalle de carga conectados al backend. Validación, historial y resultados con paginación server-side. |
| Administración | Gestión de usuarios (`/admin/usuarios`) con crear, editar, activar/desactivar y cambiar contraseña. Auditoría (`/admin/auditoria`) con filtros. Ambos con paginación server-side. |
| Navegación | Sidebar filtra ítems automáticamente según permisos. `RouteGuard` redirige rutas directas no autorizadas. |
| Componentes | Sidebar, topbar, breadcrumbs, KPIs, status badges, tablas paginadas, modales, toasts, `DataTablePagination` reutilizable. |

---

## 4. Funcionalidades Probadas

- Login/logout con JWT.
- Carga, validación y publicación de archivos CSV.
- Filtros de clientes por `tipoClienteId` y `segmentoId` con paginación y KPIs dinámicos.
- Filtros de campañas por `estado`, `productoId`, `periodoId` con paginación y KPIs dinámicos.
- Filtros de cargas por `tipoCargaId`, `estados`, `usuarioId`, `search` y fechas con paginación y KPIs dinámicos.
- Cálculo automático y persistencia de KPIs de campaña.
- Descarga de reportes CSV.
- CRUD de usuarios (crear, editar, activar/desactivar, cambiar contraseña).
- Auditoría automática de endpoints, login, logout e intentos fallidos.
- Navegación por rol: sidebar muestra/oculta pestañas según permisos.
- Pantallas de administración de usuarios y auditoría.
- Protección de rutas directas con `RouteGuard`.
- Botones condicionales por permisos en usuarios y carga de datos.
- Paginación server-side con componente `DataTablePagination` en clientes, campañas, detalle de campaña, bandeja de cargas, validación, historial, resultados, usuarios, auditoría y detalle 360.
- KPIs dinámicos a filtros mediante endpoints de resumen.
- CORS configurado entre frontend y backend.

---

## 5. Pendientes y Mejoras

### Frontend

1. **Eliminar `frontend/lib/mock-data.ts`**
   - Aún existe como dependencia residual; ya ninguna página debería usarlo.

2. **Skeletons / estados de carga**
   - Algunas páginas solo muestran un spinner genérico.

3. **Tests**
   - Unitarios de componentes y tests E2E (Playwright/Cypress).

4. **Responsive**
   - Revisar tablas y filtros en móvil.

5. **Middleware de Next.js para protección SSR**
   - Actualmente `RouteGuard` protege en cliente; agregar middleware aportaría seguridad en SSR.

### Backend

1. **Gestión de catálogos**
   - Endpoints de admin para crear/editar catálogos (productos, segmentos, etc.).

2. **Validación específica por tipo de carga**
   - Actualmente solo valida que no haya columnas vacías.
   - Se podría validar formatos según `CAMPANIAS`, `CLIENTES`, `OFERTAS`.

3. **Optimización de `ReporteService`**
   - `ReporteService` aún carga `campaniaRepository.findAll()`, `ofertaRepository.findAll()` y `clienteRepository.findAll()` en memoria. Con millones de registros esto es inviable; debería moverse a queries SQL agregadas o streaming por lotes.

4. **Notificaciones en tiempo real**
   - WebSocket o SSE para avisar cuando una carga cambia de estado.

5. **Más formatos de reporte**
   - PDF y Excel además de CSV.

6. **Almacenamiento en S3**
   - Actualmente es local; preparar integración con AWS S3.

7. **Tests**
   - Unitarios, de integración y de seguridad.

8. **Dockerización**
   - `Dockerfile` para backend/frontend y `docker-compose.yml` con PostgreSQL.

9. **Auditoría: exportar logs**
   - Exportar logs de auditoría a CSV/Excel.

### Arquitectura / DevOps

1. Pipeline CI/CD.
2. Logs centralizados.
3. Health checks y monitoreo.
4. Variables de entorno para producción.
5. Rate limiting y headers de seguridad.

---

## 6. Próximos Pasos Recomendados

1. **Optimizar `ReporteService`** para evitar cargar tablas completas en memoria.
2. Agregar **tests** básicos de integración para los endpoints de paginación y resumen.
3. Dockerizar el proyecto para facilitar despliegues.
4. Mejorar la **validación de archivos de carga** por tipo.
5. Exportar logs de auditoría a CSV/Excel.
