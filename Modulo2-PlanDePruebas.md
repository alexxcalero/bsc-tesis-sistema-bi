# Plan de Pruebas - Módulo 2: Carga de Información

## 1. Introducción

El presente documento describe el plan de pruebas funcionales para el **Módulo 2 de Carga de Información** del Sistema BI Bancario. Este módulo permite registrar, validar, publicar y consultar procesos de carga masiva de información, así como visualizar estadísticas y errores asociados.

## 2. Alcance

El plan cubre las siguientes funcionalidades del módulo:

- Registro de carga con archivo (`POST /api/v1/cargas`)
- Validación asíncrona de cargas (`POST /api/v1/cargas/{id}/validar`)
- Publicación de cargas (`POST /api/v1/cargas/{id}/publicar`)
- Listado y filtrado de cargas (`GET /api/v1/cargas`)
- Resumen estadístico de cargas (`GET /api/v1/cargas/estadisticas/resumen`)
- Consulta de errores y detalles de carga (`GET /api/v1/cargas/{id}/errores`, `GET /api/v1/cargas/{id}/detalles`)
- Recálculo de métricas de campañas tras publicación

Se incluyen pruebas unitarias backend (servicios y controllers) y pruebas end-to-end mediante Playwright.

## 3. Herramientas Propuestas

| Tipo de prueba | Herramienta |
|---|---|
| Unitarias backend | JUnit 5, Mockito, Spring Boot Test, `@WithMockUser`, Awaitility |
| End-to-End | Playwright (TypeScript/JavaScript) |
| Base de datos de pruebas | H2 en perfil `test` |

## 4. Datos de Prueba Base

### 4.1 Usuarios y roles

| Usuario | Contraseña | Rol | Permisos relevantes |
|---|---|---|---|
| `admin` | `admin123` | ADMINISTRADOR | Todos los permisos de carga |
| `especialista` | `especialista123` | ESPECIALISTA | `CARGAS_CREAR`, `CARGAS_VALIDAR`, `CARGAS_PUBLICAR` |
| `analista` | `analista123` | ANALISTA | `CARGAS_VER` |

### 4.2 Archivos de prueba

| Nombre de archivo | Contenido | Propósito |
|---|---|---|
| `campanias_validas.csv` | 3 filas válidas con datos completos | Flujo feliz de validación y publicación |
| `campanias_con_errores.csv` | 1 fila con celda vacía | Validación con errores |
| `vacio.csv` | Archivo vacío | Caso negativo |
| `una_columna.csv` | Solo encabezado `dato`, sin filas | Caso de borde |
| ` formato_invalido.txt` | Contenido de texto plano no CSV | Caso negativo de tipo de archivo |

### 4.3 Estados de carga

```
PENDIENTE -> EN_VALIDACION -> VALIDADA -> PUBLICADA
                        |
                        +-> CON_ERRORES -> PUBLICADA
```

## 5. Pruebas Unitarias Backend

### M2-U-01: Registro de carga

| Campo | Descripción |
|---|---|
| **ID** | M2-U-01 |
| **Tipo** | Unitario (servicio) |
| **Funcionalidad** | `ProcesoCargaServiceImpl.registrarCarga(...)` |
| **Descripción** | Verificar que al registrar una carga se genera un código único, se almacena el archivo y el estado inicial es `PENDIENTE`. |
| **Precondiciones** | Existe un tipo de carga y un usuario en base de datos. |
| **Pasos** | 1. Crear `MultipartFile` con `campanias_validas.csv`. <br> 2. Llamar `registrarCarga(request, file, usuarioId)`. |
| **Datos de prueba** | Archivo `campanias_validas.csv`, tipo de carga id `1`, usuario id `1`. |
| **Resultado esperado** | - Respuesta con código `CARGA-XXXXXXXX`. <br> - Estado `PENDIENTE`. <br> - Archivo persistido en `ArchivoCarga`. |

### M2-U-02: Validación asíncrona exitosa

| Campo | Descripción |
|---|---|
| **ID** | M2-U-02 |
| **Tipo** | Unitario (servicio + async) |
| **Funcionalidad** | `AsyncCargaProcessor.procesarCarga(...)` |
| **Descripción** | Verificar que el procesador asíncrono valida un archivo CSV correcto y deja la carga en estado `VALIDADA`. |
| **Precondiciones** | Existe una carga en estado `PENDIENTE` con archivo válido. |
| **Pasos** | 1. Publicar evento `CargaRegistradaEvent`. <br> 2. Esperar procesamiento (Awaitility). <br> 3. Consultar la carga. |
| **Datos de prueba** | Carga id `1`, archivo `campanias_validas.csv`. |
| **Resultado esperado** | - Estado final `VALIDADA`. <br> - `totalRegValidos = 3`. <br> - `totalRegInvalidos = 0`. <br> - No existen `ErrorCarga`. |

### M2-U-03: Validación asíncrona con errores

| Campo | Descripción |
|---|---|
| **ID** | M2-U-03 |
| **Tipo** | Unitario (servicio + async) |
| **Funcionalidad** | `AsyncCargaProcessor.procesarCarga(...)` |
| **Descripción** | Verificar que el procesador detecta filas con campos vacíos y deja la carga en estado `CON_ERRORES`. |
| **Precondiciones** | Existe una carga en estado `PENDIENTE` con archivo con errores. |
| **Pasos** | 1. Publicar evento de procesamiento. <br> 2. Esperar finalización. <br> 3. Consultar errores de la carga. |
| **Datos de prueba** | Carga id `2`, archivo `campanias_con_errores.csv`. |
| **Resultado esperado** | - Estado final `CON_ERRORES`. <br> - `totalRegInvalidos >= 1`. <br> - Existe al menos un `ErrorCarga` con `tipoError = VALIDACION`. |

### M2-U-04: Publicación de carga válida

| Campo | Descripción |
|---|---|
| **ID** | M2-U-04 |
| **Tipo** | Unitario (servicio) |
| **Funcionalidad** | `ProcesoCargaServiceImpl.publicarCarga(Long id)` |
| **Descripción** | Verificar que una carga en estado `VALIDADA` puede publicarse y pasa a `PUBLICADA`. |
| **Precondiciones** | Existe carga id `1` en estado `VALIDADA`. |
| **Pasos** | 1. Llamar `publicarCarga(1L)`. <br> 2. Verificar estado y `ResultadoCarga`. |
| **Datos de prueba** | Carga id `1` (`VALIDADA`). |
| **Resultado esperado** | - Estado `PUBLICADA`. <br> - `ResultadoCarga.totalRegistrosProcesados` actualizado. <br> - Métricas de campaña recalculadas. |

### M2-U-05: Publicación desde estado inválido

| Campo | Descripción |
|---|---|
| **ID** | M2-U-05 |
| **Tipo** | Unitario (servicio) |
| **Funcionalidad** | `ProcesoCargaServiceImpl.publicarCarga(Long id)` |
| **Descripción** | Verificar que no se puede publicar una carga que está en estado `PENDIENTE`. |
| **Precondiciones** | Existe carga id `3` en estado `PENDIENTE`. |
| **Pasos** | 1. Llamar `publicarCarga(3L)`. |
| **Datos de prueba** | Carga id `3` (`PENDIENTE`). |
| **Resultado esperado** | - Se lanza excepción de negocio. <br> - Estado permanece `PENDIENTE`. |

### M2-U-06: Resumen estadístico con filtros

| Campo | Descripción |
|---|---|
| **ID** | M2-U-06 |
| **Tipo** | Unitario (servicio) |
| **Funcionalidad** | `ProcesoCargaServiceImpl.resumenCargas(...)` |
| **Descripción** | Verificar que el resumen estadístico calcula correctamente totales de registros, válidos e inválidos, aplicando filtros opcionales. |
| **Precondiciones** | Existen cargas con diferentes estados y totales. |
| **Pasos** | 1. Llamar `resumenCargas(null, null, null, null, null, null)`. <br> 2. Llamar `resumenCargas(null, List.of("PUBLICADA"), null, null, null, null)`. |
| **Datos de prueba** | Sin filtros y filtro por estado `PUBLICADA`. |
| **Resultado esperado** | - Sin filtros: totales acumulan todas las cargas. <br> - Con filtro: totales corresponden solo a cargas `PUBLICADA`. |

### M2-U-07: Seguridad - Publicación sin permiso

| Campo | Descripción |
|---|---|
| **ID** | M2-U-07 |
| **Tipo** | Unitario (controller) |
| **Funcionalidad** | `ProcesoCargaController.publicarCarga(...)` |
| **Descripción** | Verificar que un usuario con solo permiso `CARGAS_VER` recibe 403 al intentar publicar. |
| **Precondiciones** | Usuario autenticado como `analista`. |
| **Pasos** | 1. Realizar `POST /api/v1/cargas/1/publicar` con token de analista. |
| **Datos de prueba** | Token JWT de `analista`/`analista123`. |
| **Resultado esperado** | - Respuesta HTTP 403. |

## 6. Pruebas End-to-End (Playwright)

### M2-E2E-01: Flujo completo de carga, validación y publicación

| Campo | Descripción |
|---|---|
| **ID** | M2-E2E-01 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Registro, validación y publicación de carga |
| **Descripción** | Verificar que un especialista puede subir un archivo CSV válido, validarlo y publicarlo exitosamente. |
| **Precondiciones** | Frontend en `http://localhost:3000`. Backend disponible. |
| **Pasos** | 1. Login con `especialista` / `especialista123`. <br> 2. Navegar a `/module2/inbox` o `/cargas`. <br> 3. Click en "Nueva carga". <br> 4. Seleccionar tipo de carga. <br> 5. Adjuntar `campanias_validas.csv`. <br> 6. Enviar formulario. <br> 7. Esperar estado `PENDIENTE` -> `EN_VALIDACION` -> `VALIDADA` (polling). <br> 8. Click en "Publicar". <br> 9. Esperar estado `PUBLICADA`. |
| **Datos de prueba** | Usuario `especialista`, archivo `campanias_validas.csv`. |
| **Resultado esperado** | - Carga creada con código generado. <br> - Estado final `PUBLICADA`. <br> - Aparece mensaje de éxito. <br> - Métricas de campaña actualizadas. |

### M2-E2E-02: Visualización del resumen estadístico

| Campo | Descripción |
|---|---|
| **ID** | M2-E2E-02 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Dashboard/resumen de cargas |
| **Descripción** | Verificar que el resumen de cargas muestra los totales correctos. |
| **Precondiciones** | Existen cargas publicadas con registros válidos/inválidos. |
| **Pasos** | 1. Login con `analista`. <br> 2. Navegar a `/module2/results` o sección de estadísticas. <br> 3. Verificar tarjetas de totales. |
| **Datos de prueba** | Cargas con totales conocidos. |
| **Resultado esperado** | - Tarjetas muestran `totalRegistros`, `totalRegValidos`, `totalRegInvalidos` correctos. |

### M2-E2E-03: Carga con archivo vacío

| Campo | Descripción |
|---|---|
| **ID** | M2-E2E-03 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Validación de archivo vacío |
| **Descripción** | Verificar que el sistema rechaza un archivo vacío con un mensaje claro. |
| **Precondiciones** | Usuario autenticado como especialista. |
| **Pasos** | 1. Navegar a "Nueva carga". <br> 2. Seleccionar tipo de carga. <br> 3. Adjuntar `vacio.csv`. <br> 4. Enviar. |
| **Datos de prueba** | Archivo `vacio.csv`. |
| **Resultado esperado** | - El formulario muestra error: "El archivo no puede estar vacío". <br> - No se crea proceso de carga. |

### M2-E2E-04: Filtrado de cargas por estado

| Campo | Descripción |
|---|---|
| **ID** | M2-E2E-04 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Filtros del listado de cargas |
| **Descripción** | Verificar que se pueden filtrar cargas por estado y usuario responsable. |
| **Precondiciones** | Existen cargas en estados `PENDIENTE`, `VALIDADA`, `PUBLICADA`. |
| **Pasos** | 1. Navegar a listado de cargas. <br> 2. Seleccionar filtro `estado = PUBLICADA`. <br> 3. Aplicar filtro. |
| **Datos de prueba** | Estado `PUBLICADA`. |
| **Resultado esperado** | - La tabla muestra solo cargas `PUBLICADA`. <br> - El paginador refleja el total filtrado. |

### M2-E2E-05: Consulta de errores de validación

| Campo | Descripción |
|---|---|
| **ID** | M2-E2E-05 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Detalle de errores de carga |
| **Descripción** | Verificar que se pueden visualizar los errores de una carga en estado `CON_ERRORES`. |
| **Precondiciones** | Existe carga id `2` en estado `CON_ERRORES`. |
| **Pasos** | 1. Navegar al detalle de la carga `2`. <br> 2. Ingresar a pestaña "Errores". |
| **Datos de prueba** | Carga `2` con archivo `campanias_con_errores.csv`. |
| **Resultado esperado** | - Se listan los errores con número de fila, campo y mensaje. <br> - Se muestra tipo de error `VALIDACION`. |

### M2-E2E-06: Caso negativo - Publicación sin permisos

| Campo | Descripción |
|---|---|
| **ID** | M2-E2E-06 |
| **Tipo** | E2E (Playwright) |
| **Funcionalidad** | Control de acceso en publicación |
| **Descripción** | Verificar que un analista no puede publicar una carga. |
| **Precondiciones** | Usuario `analista` autenticado. Existe carga `VALIDADA`. |
| **Pasos** | 1. Login con `analista`. <br> 2. Navegar al detalle de una carga `VALIDADA`. <br> 3. Verificar que el botón "Publicar" no está presente o está deshabilitado. |
| **Datos de prueba** | Usuario `analista`, carga `VALIDADA`. |
| **Resultado esperado** | - No se muestra opción de publicar. <br> - Si se intenta llamada directa (mock), se recibe 403. |

## 7. Casos Negativos Adicionales

| ID | Funcionalidad | Escenario | Resultado esperado |
|---|---|---|---|
| M2-N-01 | Registro de carga | Usuario no autenticado intenta subir archivo | 401/Redirección a login |
| M2-N-02 | Validación | Archivo con formato no CSV (`.txt`) | Error de validación de tipo de archivo |
| M2-N-03 | Publicación | Intentar publicar carga `CON_ERRORES` según reglas futuras | Actualmente permitido; verificar comportamiento documentado |
| M2-N-04 | Listado | Filtro por estado inexistente (`ESTADO_FALSO`) | Tabla vacía, sin excepciones |

## 8. Criterios de Aceptación

El Módulo 2 se considera aprobado cuando:

- Todas las pruebas unitarias de servicios y controllers pasan exitosamente.
- Los flujos E2E de carga, validación y publicación se ejecutan sin errores.
- El procesamiento asíncrono actualiza correctamente los estados de la carga.
- Los errores de validación se registran y se pueden consultar.
- Los controles de seguridad impiden acciones no autorizadas (403).
- Las métricas de campañas se recalculan tras la publicación de una carga.
- El resumen estadístico refleja correctamente los totales según los filtros aplicados.
