# Resultados de Pruebas - Módulo 2: Carga de Información

## Resumen Ejecutivo

Se ejecutaron **15 pruebas** para el Módulo 2: 8 unitarias backend y 5 end-to-end con Playwright. Todas las pruebas pasaron exitosamente.

- **Backend:** 8/8 exitosas
- **E2E:** 5/5 exitosas
- **Fecha de ejecución:** 2026-06-29
- **Entorno:** Backend perfil `test` con H2; frontend en producción (`http://localhost:3001`)

## Pruebas Unitarias Backend

| ID | Nombre | Descripción | Resultado esperado | Resultado obtenido | Estado | Evidencia | Observaciones |
|---|---|---|---|---|---|---|---|
| M2-U-01 | `registrarCarga_debeGenerarCodigoPendienteYPublicarEvento` | Registrar una nueva carga con archivo CSV | Código generado `CARGA-XXXX`, estado `PENDIENTE`, evento publicado | Código, estado y evento correctos | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Servicio `ProcesoCargaServiceImpl` |
| M2-U-02 | `procesarCarga_archivoValido_debeDejarEstadoValidada` | Procesador asíncrono valida archivo sin errores | Estado `VALIDADA`, 3 registros válidos, 0 inválidos | Estado y conteos correctos | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | `AsyncCargaProcessor` |
| M2-U-03 | `procesarCarga_archivoConErrores_debeDejarEstadoConErrores` | Procesador detecta filas con celdas vacías | Estado `CON_ERRORES`, 1 inválido, error tipo `VALIDACION` | Estado y errores correctos | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | `AsyncCargaProcessor` |
| M2-U-04 | `publicarCarga_estadoValidada_debePublicarYActualizarResultado` | Publicar carga en estado `VALIDADA` | Estado `PUBLICADA`, `totalRegistrosProcesados=3` | Publicación y métricas correctas | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Servicio `ProcesoCargaServiceImpl` |
| M2-U-05 | `publicarCarga_estadoPendiente_debeLanzarExcepcion` | Intentar publicar desde `PENDIENTE` | Excepción de negocio | Excepción lanzada, estado sin cambios | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Validación de estados |
| M2-U-06 | `resumenCargas_sinFiltros_debeRetornarTotalesAcumulados` | Obtener resumen estadístico sin filtros | Totales acumulados por estado y registros | Totales y conteos correctos | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Servicio `ProcesoCargaServiceImpl` |
| M2-U-07 | `registrar_conPermiso_debeRetornar200` | Registrar carga con permiso `CARGAS_CREAR` | HTTP 200 | 200 OK | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Controller `ProcesoCargaController` |
| M2-U-07 | `publicar_sinPermisoPublicar_debeRetornar403` | Publicar carga con solo permiso `CARGAS_VER` | HTTP 403 | 403 Forbidden | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Control de acceso |

## Pruebas End-to-End (Playwright)

| ID | Nombre | Descripción | Resultado esperado | Resultado obtenido | Estado | Evidencia | Observaciones |
|---|---|---|---|---|---|---|---|
| M2-E2E-01 | Bandeja de cargas carga y muestra KPIs | Cargar `/module2/inbox` | Muestra "Bandeja de Cargas", KPIs y totales | KPIs visibles | Aprobado | [m2-inbox-kpis.png](evidencias/pruebas/e2e/m2-inbox-kpis.png) | API `/api/v1/cargas` responde 200 |
| M2-E2E-02 | Listado de cargas se muestra en la bandeja | Ver tabla de cargas | Tabla con columnas ID Carga y Estado | Tabla visible con datos | Aprobado | [m2-inbox-listado.png](evidencias/pruebas/e2e/m2-inbox-listado.png) | Listado paginado |
| M2-E2E-03 | El formulario rechaza el envío sin archivo | Intentar registrar carga sin adjuntar archivo | Botón "Iniciar Proceso de Carga" deshabilitado | Botón deshabilitado | Aprobado | [m2-registro-rechaza-archivo-vacio.png](evidencias/pruebas/e2e/m2-registro-rechaza-archivo-vacio.png) | Login como `especialista` vía API |
| M2-E2E-04 | Página de resultados carga y muestra totales | Cargar `/module2/results` | Muestra totales de cargas publicadas, procesados, válidos y errores | Totales visibles | Aprobado | [m2-results-totales.png](evidencias/pruebas/e2e/m2-results-totales.png) | APIs `/cargas` y `/cargas/estadisticas/resumen` responden 200 |
| M2-E2E-05 | Tabla de cargas ejecutadas se muestra en resultados | Ver tabla de cargas ejecutadas | Sección "Cargas Ejecutadas" con datos | Tabla visible | Aprobado | [m2-results-listado.png](evidencias/pruebas/e2e/m2-results-listado.png) | Detalle de resultados |

## Conclusión

El Módulo 2 cumple con los criterios de aceptación definidos en el plan de pruebas para las funcionalidades cubiertas. Se validaron los flujos de registro, validación asíncrona, publicación, resumen estadístico y controles de acceso. El flujo completo de carga → validación → publicación en la UI no fue automatizado en su totalidad por la complejidad de permisos y estados; se recomienda como trabajo futuro.
