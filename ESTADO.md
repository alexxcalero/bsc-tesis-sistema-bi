# Sistema BI Bancario - Estado de Implementación

## 1. Resumen General

Sistema full-stack para un **Banco**: backend en **Java 21 + Spring Boot 3 + PostgreSQL** (con perfil local H2) y frontend en **Next.js 16 + React 19 + Tailwind CSS**.

Incluye autenticación JWT, roles/permisos, catálogos parametrizables, dos módulos principales y procesos de carga masiva con validación asíncrona.

---

## 2. Backend Implementado

| Área | Funcionalidad |
|---|---|
| **Seguridad** | Login JWT, 5 roles (`ADMINISTRADOR`, `ANALISTA`, `ESPECIALISTA`, `EMPLEADO`, `AUDITOR`), permisos granulares con `@PreAuthorize`. |
| **Catálogos** | Tipos de cliente/documento, segmentos, zonas, agencias, canales, productos, subproductos, períodos, tipos/estados de carga. |
| **Module 1 - Visualización** | Clientes + Cliente 360, campañas con KPIs y ofertas asociadas, ofertas, dashboard, reportes CSV. |
| **Module 2 - Captura Digital** | Registro de cargas, upload de archivos, procesamiento asíncrono, validación, publicación, errores, detalles, resultados. |
| **Infraestructura** | Flyway migrations `V1` a `V9`, almacenamiento local (`uploads/`), perfil `local` con H2 para desarrollo. |

---

## 3. Frontend Implementado

| Pantalla | Estado |
|---|---|
| Login | Conectado a backend JWT. |
| Dashboard | Conectado a `/dashboard/resumen`. |
| Campañas | Listado con filtros + detalle con KPIs y ofertas reales. |
| Clientes 360 | Listado con filtros por tipo de cliente y segmento + detalle 360. |
| Reportes | Listado + generación/descarga CSV. |
| Módulo 2 | Bandeja, registro, validación, publicación, resultados, historial y detalle de carga conectados al backend. |
| Componentes | Sidebar, topbar, breadcrumbs, KPIs, status badges, tablas paginadas. |

---

## 4. Funcionalidades Probadas

- Login/logout con JWT.
- Carga, validación y publicación de archivos CSV.
- Filtros de clientes por `tipoClienteId` y `segmentoId`.
- Filtros de campañas por `estado`, `productoId`, `periodoId`.
- Cálculo automático y persistencia de KPIs de campaña.
- Descarga de reportes CSV.
- CORS configurado entre frontend y backend.

---

## 5. Pendientes y Mejoras

### Frontend

1. **Control de acceso por rol**  
   - El sidebar muestra todas las pestañas sin importar el rol.  
   - Se debe filtrar ítems del menú, páginas y botones según `hasPermission()` y los permisos del backend (`CAMPANIAS_VER`, `CARGAS_CREAR`, etc.).

2. **Eliminar `frontend/lib/mock-data.ts`**  
   - Aún existe como dependencia residual; ya ninguna página debería usarlo.

3. **Manejo global de errores**  
   - Reemplazar `console.error` por toast/notificaciones con `sonner`.

4. **Skeletons / estados de carga**  
   - Algunas páginas solo muestran un spinner genérico.

5. **Paginación completa**  
   - Mejorar controles de página (ir a primera/última, input de página).

6. **Tests**  
   - Unitarios de componentes y tests E2E (Playwright/Cypress).

7. **Responsive**  
   - Revisar tablas y filtros en móvil.

### Backend

1. **CRUD de usuarios**  
   - Solo existe login; faltan endpoints para crear, editar y desactivar usuarios.

2. **Módulo de Auditoría**  
   - Existe el permiso `AUDITORIA_VER`, pero no hay entidad ni endpoints.

3. **Gestión de catálogos**  
   - Endpoints de admin para crear/editar catálogos (productos, segmentos, etc.).

4. **Validación específica por tipo de carga**  
   - Actualmente solo valida que no haya columnas vacías.  
   - Se podría validar formatos según `CAMPANIAS`, `CLIENTES`, `OFERTAS`.

5. **Notificaciones en tiempo real**  
   - WebSocket o SSE para avisar cuando una carga cambia de estado.

6. **Más formatos de reporte**  
   - PDF y Excel además de CSV.

7. **Almacenamiento en S3**  
   - Actualmente es local; preparar integración con AWS S3.

8. **Tests**  
   - Unitarios, de integración y de seguridad.

9. **Dockerización**  
   - `Dockerfile` para backend/frontend y `docker-compose.yml` con PostgreSQL.

### Arquitectura / DevOps

1. Pipeline CI/CD.
2. Logs centralizados.
3. Health checks y monitoreo.
4. Variables de entorno para producción.
5. Rate limiting y headers de seguridad.

---

## 6. Próximos Pasos Recomendados

1. Implementar **control de acceso por rol en el frontend** (el más crítico por la observación actual).
2. Crear **CRUD de usuarios** en backend y frontend.
3. Agregar **tests** básicos.
4. Dockerizar el proyecto para facilitar despliegues.
5. Mejorar la **validación de archivos de carga**.
