# Resultados de Pruebas - Módulo 1: Visualización de Información

## Resumen Ejecutivo

Se ejecutaron **17 pruebas** para el Módulo 1: 11 unitarias backend y 6 end-to-end con Playwright. Todas las pruebas pasaron exitosamente.

- **Backend:** 11/11 exitosas
- **E2E:** 6/6 exitosas
- **Fecha de ejecución:** 2026-06-29
- **Entorno:** Backend perfil `test` con H2; frontend en producción (`http://localhost:3001`)

## Pruebas Unitarias Backend

| ID | Nombre | Descripción | Resultado esperado | Resultado obtenido | Estado | Evidencia | Observaciones |
|---|---|---|---|---|---|---|---|
| M1-U-01 | `recalcularMetricas_debeActualizarClientesMontoYTicketPromedio` | Recalcular métricas de una campaña a partir de sus ofertas | Clientes=2, Monto=40000, Ticket=20000 | Valores calculados correctamente | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Servicio `CampaniaServiceImpl` |
| M1-U-02 | `listarCampanias_debeAplicarFiltrosYPaginar` | Listar campañas aplicando filtros y paginación | Retorna página con 1 campaña | Página con campaña `CAMP-001` | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Servicio `CampaniaServiceImpl` |
| M1-U-03 | `resumenCampanias_debeRetornarTotalYActivas` | Obtener resumen de campañas | Total=5, Activas=5 | Totales correctos | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Servicio `CampaniaServiceImpl` |
| M1-U-04 | `resumenOfertasPorCampania_debeCalcularTotalesCorrectamente` | Calcular resumen de ofertas por campaña | Total=2, Clientes=2, Monto=40000 | Totales y ticket promedio correctos | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Servicio `CampaniaServiceImpl` |
| M1-U-05 | `obtenerCliente360_debeRetornarDatosDelCliente` | Consultar vista 360 de un cliente | Retorna datos del cliente con documento 12345678 | Cliente encontrado y mapeado | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Servicio `ClienteServiceImpl` |
| M1-U-06 | `generar_conPermiso_debeRetornarCsv` | Generar reporte CSV con permiso `REPORTES_CREAR` | HTTP 200 con header `Content-Disposition: attachment` | Respuesta 200 con CSV adjunto | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Controller `ReporteController` |
| M1-U-07 | `listar_conPermiso_debeRetornar200` | Listar campañas con permiso `CAMPANIAS_VER` | HTTP 200 | 200 OK | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Controller `CampaniaController` |
| M1-U-07 | `listar_sinPermiso_debeRetornar403` | Listar campañas sin permiso | HTTP 403 | 403 Forbidden | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Control de acceso |
| M1-U-07 | `resumen_conPermiso_debeRetornar200` | Obtener resumen con permiso | HTTP 200 | 200 OK | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Controller `CampaniaController` |
| M1-U-08 | `obtenerDashboard_debeRetornarKpisYSeries` | Obtener datos del dashboard | KPIs y 3 series correctamente formadas | KPIs y series con tamaños esperados | Aprobado | [backend-test-results.log](evidencias/pruebas/unitarias/backend-test-results.log) | Servicio `DashboardService` |

## Pruebas End-to-End (Playwright)

| ID | Nombre | Descripción | Resultado esperado | Resultado obtenido | Estado | Evidencia | Observaciones |
|---|---|---|---|---|---|---|---|
| M1-E2E-01 | Login y visualización del dashboard | Usuario `analista` accede al dashboard | Página `/module1/dashboard` carga y muestra texto dashboard | Dashboard visible | Aprobado | [dashboard-piloto.png](evidencias/pruebas/e2e/dashboard-piloto.png) | Autenticación vía `auth.setup.ts` |
| M1-E2E-02 | Listado de campañas carga y muestra datos | Cargar página `/module1/campaigns` | Muestra "Campañas Comerciales", totales y tabla con datos | Página y datos visibles | Aprobado | [m1-campaigns-listado.png](evidencias/pruebas/e2e/m1-campaigns-listado.png) | API `/api/v1/campanias` responde 200 |
| M1-E2E-03 | Filtro de estado en listado de campañas | Aplicar filtro `Activa` | Recarga datos con `estado=ACTIVA` y muestra resultados | Filtro aplicado correctamente | Aprobado | [m1-campaigns-filtro-estado.png](evidencias/pruebas/e2e/m1-campaigns-filtro-estado.png) | Select de estado funciona |
| M1-E2E-04 | Listado de clientes carga correctamente | Cargar página `/module1/clients` | Muestra "Clientes 360" y tabla con clientes | Página y datos visibles | Aprobado | [m1-clients-listado.png](evidencias/pruebas/e2e/m1-clients-listado.png) | API `/api/v1/clientes` responde 200 |
| M1-E2E-05 | Página de reportes carga y muestra reportes disponibles | Cargar página `/module1/reports` | Muestra secciones de reportes y botón generar CSV | Reportes disponibles visibles | Aprobado | [m1-reports-disponibles.png](evidencias/pruebas/e2e/m1-reports-disponibles.png) | API `/api/v1/reportes` responde 200 |
| M1-E2E-06 | Generar un reporte en CSV | Click en "Generar y Descargar CSV" | API responde 200 y se descarga archivo `.csv` | Descarga exitosa | Aprobado | [m1-reports-generado.png](evidencias/pruebas/e2e/m1-reports-generado.png) | Botón de generación habilitado |

## Conclusión

El Módulo 1 cumple con los criterios de aceptación definidos en el plan de pruebas. Todas las funcionalidades críticas (dashboard, campañas, clientes, reportes) fueron verificadas tanto a nivel unitario como end-to-end, incluyendo controles de seguridad basados en permisos.
