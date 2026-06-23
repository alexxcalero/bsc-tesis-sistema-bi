# Plan de Pruebas - Módulo 1: Visualización

## 1. Introducción

El presente documento describe el plan de pruebas funcionales para el **Módulo 1 de Visualización** del Sistema BI Bancario. Este módulo permite a los usuarios consultar y analizar información relacionada con campañas, ofertas, clientes y reportes, además de visualizar indicadores clave en el dashboard.

## 2. Alcance

El plan cubre las siguientes funcionalidades del módulo:

- Dashboard de KPIs (`/api/v1/dashboard/resumen`)
- Gestión de campañas (`/api/v1/campanias`)
- Ofertas asociadas a campañas (`/api/v1/campanias/{id}/ofertas`)
- Gestión de clientes (`/api/v1/clientes`)
- Generación de reportes (`/api/v1/reportes`)

Se incluyen pruebas unitarias backend (servicios y controllers) y pruebas end-to-end mediante Playwright.

## 3. Herramientas Propuestas

| Tipo de prueba | Herramienta |
|---|---|
| Unitarias backend | JUnit 5, Mockito, Spring Boot Test, `@WithMockUser` |
| End-to-End | Playwright (TypeScript/JavaScript) |
| Base de datos de pruebas | H2 en perfil `test` |

## 4. Datos de Prueba Base

### 4.1 Usuarios y roles

| Usuario | Contraseña | Rol | Permisos relevantes |
|---|---|---|---|
| `admin` | `admin123` | ADMINISTRADOR | Todos |
| `analista` | `analista123` | ANALISTA | `CAMPANIAS_VER`, `CLIENTES_VER`, `REPORTES_VER` |
| `empleado` | `empleado123` | EMPLEADO | `CLIENTES_VER` |
| `auditor` | `auditor123` | AUDITOR | `CAMPANIAS_VER`, `CLIENTES_VER` |

### 4.2 Entidades de ejemplo

| Entidad | Identificador | Datos |
|---|---|---|
| Campaña | id `1` | Código `CAMP-001`, nombre `Campaña Crédito Personal Q1`, estado `ACTIVA` |
| Cliente | id `1` | `Juan Carlos Pérez García`, DNI `12345678`, tipo `NATURAL` |
| Oferta | id `1` | Monto `15000.00`, tasa `12.50%`, estado `ACEPTADA`, campaña id `1` |
| Oferta | id `2` | Monto `25000.00`, tasa `11.00%`, estado `PENDIENTE`, campaña id `1` |

## 5. Pruebas Unitarias Backend

### M1-U-01: Dashboard - KPIs principales

| Campo | Descripción |
|---|---|
| **ID** | M1-U-01 |
| **Tipo** | Unitario (servicio) |
| **Funcionalidad** | `DashboardService.obtenerDashboard()` |
| **Descripción** | Verificar que el servicio retorna los KPIs principales y las series de evolución correctamente. |
| **Precondiciones** | Existen campañas, ofertas y clientes en la base de datos. |
| **Pasos** | 1. Invocar `dashboardService.obtenerDashboard()`. <br> 2. Verificar cada campo del `DashboardResponse`. |
| **Datos de prueba** | 2 ofertas (`15000.00` y `25000.00`), 1 cliente. |
| **Resultado esperado** | - Total de campañas activas >= 1. <br> - Monto total ofertado = `40000.00`. <br> - Ticket promedio = `20000.00`. <br> - Series de evolución y segmentos no son nulas. |

### M1-U-02: Campañas - Listado con filtros

| Campo | Descripción |
|---|---|
| **ID** | M1-U-02 |
| **Tipo** | Unitario (servicio) |
| **Funcionalidad** | `CampaniaService.listarCampanias(...)` |
| **Descripción** | Verificar que el listado de campañas aplica correctamente los filtros por código, nombre, producto, periodo y estado. |
| **Precondiciones** | Existen al menos 2 campañas con estados diferentes. |
| **Pasos** | 1. Llamar al servicio filtrando por `estado = ACTIVA`. <br> 2. Llamar al servicio filtrando por `codigo = CAMP-001`. |
| **Datos de prueba** | `estado = ACTIVA`, `codigo = CAMP-001`. |
| **Resultado esperado** | - El filtro por estado retorna solo campañas `ACTIVA`. <br> - El filtro por código retorna exactamente la campaña `CAMP-001`. |

### M1-U-03: Campañas - Recálculo de métricas

| Campo | Descripción |
|---|---|
| **ID** | M1-U-03 |
| **Tipo** | Unitario (servicio) |
| **Funcionalidad** | `CampaniaService.recalcularMetricas(Long id)` |
| **Descripción** | Verificar que el recálculo de métricas actualiza correctamente los campos de la campaña a partir de sus ofertas. |
| **Precondiciones** | La campaña id `1` tiene 2 ofertas (`15000.00` y `25000.00`) para 2 clientes distintos. |
| **Pasos** | 1. Invocar `recalcularMetricas(1L)`. <br> 2. Recuperar la campaña actualizada. |
| **Datos de prueba** | Campaña id `1`, ofertas con montos `15000.00` y `25000.00`. |
| **Resultado esperado** | - `clientesAlcanzados = 2`. <br> - `montoOfertado = 40000.00`. <br> - `ticketPromedio = 20000.00`. |

### M1-U-04: Ofertas - Resumen por campaña

| Campo | Descripción |
|---|---|
| **ID** | M1-U-04 |
| **Tipo** | Unitario (repositorio/servicio) |
| **Funcionalidad** | `CampaniaService.resumenOfertasPorCampania(id, search)` |
| **Descripción** | Verificar que el resumen de ofertas por campaña calcula totales, clientes alcanzados, monto total y ticket promedio. |
| **Precondiciones** | Existen ofertas asociadas a la campaña id `1`. |
| **Pasos** | 1. Llamar `resumenOfertasPorCampania(1L, null)`. <br> 2. Llamar `resumenOfertasPorCampania(1L, "Juan")`. |
| **Datos de prueba** | Campaña id `1`, búsqueda `null` y búsqueda `"Juan"`. |
| **Resultado esperado** | - Con `search = null`: `totalOfertas = 2`, `clientesAlcanzados = 2`, `montoTotalOfertado = 40000.00`. <br> - Con `search = "Juan"`: retorna la oferta del cliente Juan Carlos Pérez García. |

### M1-U-05: Clientes - Vista 360

| Campo | Descripción |
|---|---|
| **ID** | M1-U-05 |
| **Tipo** | Unitario (servicio) |
| **Funcionalidad** | `ClienteService.obtenerCliente360(Long id)` |
| **Descripción** | Verificar que la vista 360 de un cliente incluye sus datos personales, campañas asociadas y ofertas. |
| **Precondiciones** | El cliente id `1` tiene al menos una oferta. |
| **Pasos** | 1. Invocar `obtenerCliente360(1L)`. |
| **Datos de prueba** | Cliente id `1`. |
| **Resultado esperado** | - El objeto retornado no es nulo. <br> - Incluye datos del cliente. <br> - Incluye campañas donde tiene ofertas. <br> - Incluye ofertas del cliente. |

### M1-U-06: Reportes - Generación CSV

| Campo | Descripción |
|---|---|
| **ID** | M1-U-06 |
| **Tipo** | Unitario (controller) |
| **Funcionalidad** | `ReporteController.generarReporte(id, filtros)` |
| **Descripción** | Verificar que la generación de reportes produce un archivo CSV con encabezados y contenido correcto. |
| **Precondiciones** | Existen datos para el reporte `CAMPANIAS`. |
| **Pasos** | 1. Realizar `POST /api/v1/reportes/1/generar` con filtros. <br> 2. Verificar el `Content-Type` y cuerpo de la respuesta. |
| **Datos de prueba** | Reporte `CAMPANIAS`, `periodoId = 1`. |
| **Resultado esperado** | - Respuesta HTTP 200. <br> - `Content-Type` incluye `text/csv` o `application/octet-stream`. <br> - El contenido incluye encabezados y al menos una fila de datos. |

### M1-U-07: Seguridad - Acceso sin permiso

| Campo | Descripción |
|---|---|
| **ID** | M1-U-07 |
| **Tipo** | Unitario (controller) |
| **Funcionalidad** | `CampaniaController.listar(...)` |
| **Descripción** | Verificar que un usuario sin el permiso `CAMPANIAS_VER` recibe 403 al intentar listar campañas. |
| **Precondiciones** | Usuario autenticado con rol `EMPLEADO` (solo `CLIENTES_VER`). |
| **Pasos** | 1. Realizar `GET /api/v1/campanias` con token de empleado. |
| **Datos de prueba** | Token JWT de `empleado`/`empleado123`. |
| **Resultado esperado** | - Respuesta HTTP 403. |

## 6. Pruebas End-to-End (Playwright)

### M1-E2E-01: Login y visualización del dashboard

| Campo | Descripción |
|---|---|
| **ID** | M1-E2E-01 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Login + Dashboard |
| **Descripción** | Verificar que un analista puede iniciar sesión y visualizar los KPIs del dashboard. |
| **Precondiciones** | Frontend corriendo en `http://localhost:3000`. Backend disponible. |
| **Pasos** | 1. Navegar a `http://localhost:3000/login`. <br> 2. Ingresar `analista` / `analista123`. <br> 3. Presionar "Iniciar sesión". <br> 4. Esperar redirección al dashboard. |
| **Datos de prueba** | Usuario `analista`, contraseña `analista123`. |
| **Resultado esperado** | - Se muestra la página `/dashboard`. <br> - Aparecen tarjetas de KPIs. <br> - Se visualizan gráficos sin errores. |

### M1-E2E-02: Filtrado de campañas por estado

| Campo | Descripción |
|---|---|
| **ID** | M1-E2E-02 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Listado y filtro de campañas |
| **Descripción** | Verificar que el usuario puede filtrar campañas por estado y obtener resultados acordes. |
| **Precondiciones** | Usuario autenticado como analista. Existen campañas `ACTIVA` y `INACTIVA`. |
| **Pasos** | 1. Navegar a `/campanias`. <br> 2. Seleccionar filtro `estado = ACTIVA`. <br> 3. Aplicar filtro. |
| **Datos de prueba** | Estado `ACTIVA`. |
| **Resultado esperado** | - La tabla muestra solo campañas con estado `ACTIVA`. <br> - El paginador refleja el número de resultados filtrados. |

### M1-E2E-03: Detalle de campaña y recálculo de métricas

| Campo | Descripción |
|---|---|
| **ID** | M1-E2E-03 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Detalle de campaña + recálculo |
| **Descripción** | Verificar que se puede ingresar al detalle de una campaña y recalcular sus métricas. |
| **Precondiciones** | Campaña `CAMP-001` existe. |
| **Pasos** | 1. Navegar a `/campanias`. <br> 2. Click en fila de `CAMP-001`. <br> 3. Click en botón "Recalcular métricas". <br> 4. Esperar mensaje de éxito. |
| **Datos de prueba** | Campaña `CAMP-001`. |
| **Resultado esperado** | - Se muestra el detalle de la campaña. <br> - Los KPIs se actualizan correctamente. <br> - Aparece notificación de éxito. |

### M1-E2E-04: Búsqueda de ofertas por documento

| Campo | Descripción |
|---|---|
| **ID** | M1-E2E-04 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Búsqueda de ofertas |
| **Descripción** | Verificar que se pueden buscar ofertas de una campaña por número de documento del cliente. |
| **Precondiciones** | Campaña `CAMP-001` tiene ofertas. |
| **Pasos** | 1. Navegar a `/campanias/1/ofertas`. <br> 2. Ingresar `12345678` en campo de búsqueda. <br> 3. Presionar Enter o botón buscar. |
| **Datos de prueba** | Número de documento `12345678`. |
| **Resultado esperado** | - La tabla muestra la oferta del cliente con DNI `12345678`. <br> - No se muestran ofertas de otros clientes. |

### M1-E2E-05: Generación y descarga de reporte CSV

| Campo | Descripción |
|---|---|
| **ID** | M1-E2E-05 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Generación de reportes |
| **Descripción** | Verificar que un analista puede generar y descargar un reporte CSV. |
| **Precondiciones** | Usuario autenticado como analista. |
| **Pasos** | 1. Navegar a `/reportes`. <br> 2. Seleccionar reporte `CAMPANIAS`. <br> 3. Aplicar filtro `periodoId = 1`. <br> 4. Click en "Generar". |
| **Datos de prueba** | Reporte `CAMPANIAS`, periodo `1`. |
| **Resultado esperado** | - Se inicia la descarga de un archivo `.csv`. <br> - El archivo contiene encabezados y datos. |

### M1-E2E-06: Caso negativo - Acceso a reportes sin permiso

| Campo | Descripción |
|---|---|
| **ID** | M1-E2E-06 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Control de acceso por roles |
| **Descripción** | Verificar que un empleado (sin permiso de reportes) no puede acceder a la sección de reportes. |
| **Precondiciones** | Usuario `empleado` existe con rol `EMPLEADO`. |
| **Pasos** | 1. Login con `empleado` / `empleado123`. <br> 2. Intentar navegar directamente a `/reportes`. |
| **Datos de prueba** | Usuario `empleado`, contraseña `empleado123`. |
| **Resultado esperado** | - El menú de reportes no está visible. <br> - Al navegar directamente se muestra página 403 o redirección a inicio. |

## 7. Casos Negativos Adicionales

| ID | Funcionalidad | Escenario | Resultado esperado |
|---|---|---|---|
| M1-N-01 | Dashboard | Usuario no autenticado accede a `/dashboard/resumen` | 401/Redirección a login |
| M1-N-02 | Clientes | Filtro por documento inexistente | Tabla vacía, sin errores |
| M1-N-03 | Reportes | Generar reporte sin filtros obligatorios | Validación frontend/backend con mensaje claro |

## 8. Criterios de Aceptación

El Módulo 1 se considera aprobado cuando:

- Todas las pruebas unitarias de servicios y controllers pasan exitosamente.
- Todos los flujos E2E críticos se ejecutan sin errores.
- Los casos negativos demuestran que los controles de seguridad funcionan correctamente.
- Las métricas calculadas (dashboard, campañas, ofertas) coinciden con los datos esperados.
- Los reportes generados contienen información consistente y descargable.
