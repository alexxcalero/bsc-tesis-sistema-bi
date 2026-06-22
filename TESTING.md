# Notas de implementación y plan de pruebas

## Fecha
2026-06-22

## Contexto
Implementación completa del plan de paginación server-side y optimizaciones de rendimiento. Se completaron las fases 1 a 5 y se corrigió el `DashboardService`.

---

## 1. Lo implementado en esta sesión

### Backend

| Cambio | Detalle |
|---|---|
| Fase 2 - Cargas | `ProcesoCargaSpecification` extendido con `estados`, `usuarioId` y `search` (código, archivo, usuario). `ProcesoCargaController` y `ProcesoCargaEstadisticasController` actualizados. |
| Fase 2 - Usuarios responsables | Nuevo endpoint `GET /api/v1/cargas/usuarios-responsables`. |
| Fase 3 - Campañas | Paginación real en BD para ofertas por campaña. Nuevo endpoint `/campanias/{id}/ofertas/resumen` para KPIs dinámicos. |
| Fase 4 - Cliente 360 | `GET /clientes/{id}/detalle-360` simplificado a datos del cliente. Nuevos endpoints `/clientes/{id}/campanias` y `/clientes/{id}/ofertas` paginados y filtrables. |
| Fase 5 - Índices | Migración Flyway `V12__add_performance_indexes.sql` + anotaciones `@Index` en entidades. |
| DashboardService | Reescrito con queries agregadas (`SUM`, `AVG`, `GROUP BY`); eliminados `findAll()` de ofertas y campañas. Corregido agrupamiento de campañas por producto. Implementadas series de evolución de monto (12 meses) y ticket promedio por segmento. |

### Frontend

| Cambio | Detalle |
|---|---|
| Fase 2 | `module2/validation`, `module2/history`, `module2/results` migrados a paginación server-side con `DataTablePagination` y filtros automáticos. |
| Fase 3 | `module1/campaigns` y `module1/campaigns/[id]` con paginación real, filtros automáticos y KPIs dinámicos. |
| Fase 4 | `module1/clients/[id]` con campañas y ofertas paginadas, filtros y page size selector. |
| `lib/api.ts` | Agregados métodos `cargasApi.listarUsuariosResponsables`, `campaniasApi.resumenOfertas`, `clientesApi.listarCampanias`, `clientesApi.listarOfertas`. |

---

## 2. Cómo levantar el sistema para probar

### Backend (perfil local con H2)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend

```bash
cd frontend
pnpm run dev
```

Abrir en navegador: `http://localhost:3000`

---

## 3. Usuarios de prueba disponibles

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | ADMINISTRADOR |
| `analista` | `analista123` | ANALISTA |
| `especialista` | `especialista123` | ESPECIALISTA |
| `empleado` | `empleado123` | EMPLEADO |
| `auditor` | `auditor123` | AUDITOR |

---

## 4. Plan de pruebas

### 4.1 Login y navegación por rol

Iniciar sesión con cada usuario y verificar que el sidebar muestre solo las pestañas correspondientes:

| Rol | Pestañas esperadas |
|---|---|
| ADMINISTRADOR | Todas, incluyendo Administración. |
| ANALISTA | Dashboard, Campañas, Cliente 360, Reportes, Bandeja de Cargas, Resultados, Historial. |
| ESPECIALISTA | Dashboard, Campañas, Cliente 360, Reportes, todo el módulo Captura Digital. |
| EMPLEADO | Dashboard, Campañas, Cliente 360, Reportes. |
| AUDITOR | Dashboard, Campañas, Cliente 360, Auditoría, Bandeja/Resultados/Historial de Cargas. |

### 4.2 Fase 2 - Validación, Historial y Resultados de Cargas

#### `/module2/validation`

1. Ingresar como `admin` o `especialista`.
2. Verificar que solo se muestren cargas con estados `VALIDADA` o `CON_ERRORES`.
3. Aplicar filtro de tipo de carga; debe resetear a página 1.
4. Buscar por código o nombre de archivo; debe filtrar server-side.
5. Verificar paginación: cambiar de página, tamaño de página, *Ir a página*.

#### `/module2/history`

1. Ingresar a **Historial y Trazabilidad**.
2. Verificar que solo se muestren cargas con estados `PUBLICADA`, `RECHAZADA` o `CON_ERRORES`.
3. Aplicar filtros: tipo, estado, usuario responsable, fechas, búsqueda.
4. Verificar que el select de **Usuario Responsable** se carga correctamente.
5. Confirmar que la paginación responde a los filtros.

#### `/module2/results`

1. Ingresar a **Consulta de Resultados y Errores**.
2. Verificar que los 4 KPIs (Cargas Publicadas, Total Procesados, Registros Válidos, Errores Totales) cambien al aplicar filtros.
3. Aplicar filtro de estado y tipo; verificar paginación server-side.

#### Endpoints

```bash
# Listado con filtros de Fase 2
curl -X GET "http://localhost:8080/api/v1/cargas?estados=VALIDADA,CON_ERRORES&search=test&page=0&size=10" \
  -H "Authorization: Bearer <token>"

# Resumen con mismos filtros
curl -X GET "http://localhost:8080/api/v1/cargas/estadisticas/resumen?estados=VALIDADA,CON_ERRORES&search=test" \
  -H "Authorization: Bearer <token>"

# Usuarios responsables
curl -X GET "http://localhost:8080/api/v1/cargas/usuarios-responsables" \
  -H "Authorization: Bearer <token>"
```

### 4.3 Fase 3 - Campañas

#### `/module1/campaigns`

1. Ingresar a **Campañas Comerciales**.
2. Verificar que los filtros (nombre, período, producto, estado) se aplican automáticamente (debounce 300ms en nombre).
3. Confirmar paginación y selector de filas.
4. Verificar que KPIs (`Total de Campañas`, `Campañas Activas`) cambien con los filtros.

#### `/module1/campaigns/[id]`

1. Entrar al detalle de una campaña.
2. Verificar que las ofertas se paginan en BD (no carga todo).
3. Buscar oferta por nombre de cliente o número de documento; verificar filtro server-side.
4. Confirmar que KPIs (`Clientes Alcanzados`, `Total de Ofertas`, `Monto Total Ofertado`, `Ticket Promedio`) reflejan el filtro de búsqueda.

#### Endpoints

```bash
# Ofertas por campaña con búsqueda
curl -X GET "http://localhost:8080/api/v1/campanias/1/ofertas?search=Juan&page=0&size=10" \
  -H "Authorization: Bearer <token>"

# Resumen de ofertas filtrado
curl -X GET "http://localhost:8080/api/v1/campanias/1/ofertas/resumen?search=Juan" \
  -H "Authorization: Bearer <token>"
```

### 4.4 Fase 4 - Cliente 360

#### `/module1/clients/[id]`

1. Entrar al detalle de un cliente.
2. Verificar que **Historial de Campañas** solo muestra campañas donde el cliente tiene ofertas (corrección del bug anterior).
3. Aplicar filtros en campañas: estado, período, producto.
4. Verificar paginación en campañas.
5. En **Historial de Ofertas**, aplicar filtros: estado, monto desde/hasta.
6. Verificar paginación en ofertas.

#### Endpoints

```bash
# Campañas del cliente
curl -X GET "http://localhost:8080/api/v1/clientes/1/campanias?estado=ACTIVA&page=0&size=5" \
  -H "Authorization: Bearer <token>"

# Ofertas del cliente
curl -X GET "http://localhost:8080/api/v1/clientes/1/ofertas?estado=ACEPTADA&montoDesde=1000&montoHasta=5000&page=0&size=5" \
  -H "Authorization: Bearer <token>"
```

### 4.5 Fase 5 - Índices y migraciones

1. Verificar que el backend levanta sin errores de Flyway.
2. Conectarse a PostgreSQL y confirmar que existen los índices:
   ```sql
   SELECT indexname, tablename FROM pg_indexes
   WHERE schemaname = 'public'
     AND indexname IN (
       'idx_proceso_carga_codigo',
       'idx_cliente_numero_documento',
       'idx_cliente_primer_nombre',
       'idx_cliente_apellido_paterno',
       'idx_oferta_campania_id',
       'idx_oferta_cliente_id',
       'idx_oferta_campania_cliente',
       'idx_archivo_carga_proceso_carga_id'
     );
   ```
3. Revisar `flyway_schema_history` para confirmar que `V12` se aplicó.

### 4.6 Dashboard

1. Ingresar a **Dashboard**.
2. Verificar que los KPIs se cargan rápidamente.
3. Confirmar que el gráfico **Campañas por Producto** agrupa correctamente (no repite labels).
4. Confirmar que **Evolución de Monto Ofertado** muestra los últimos 12 meses.
5. Confirmar que **Ticket Promedio por Segmento** muestra datos reales.

#### Endpoint

```bash
curl -X GET "http://localhost:8080/api/v1/dashboard/resumen" \
  -H "Authorization: Bearer <token>"
```

### 4.7 Paginación y resúmenes dinámicos (regresión)

Revisar que pantallas previas siguen funcionando:

- `/module1/clients`
- `/module2/inbox`
- `/admin/usuarios`
- `/admin/auditoria`

Para cada una: cambiar página, tamaño de página, aplicar filtros y verificar que KPIs (si aplica) cambian.

---

## 5. Casos a revisar con atención

- El modal de crear/editar usuario debe cerrarse al guardar correctamente.
- El select de rol debe cargarse correctamente al abrir el modal de editar.
- El botón **Nuevo Usuario** solo debe aparecer para usuarios con permiso `USUARIOS_CREAR`.
- Las acciones de editar/desactivar/cambiar contraseña solo deben aparecer para usuarios con `USUARIOS_EDITAR`.
- El módulo **Administración** no debe ser visible para roles sin `USUARIOS_VER` ni `AUDITORIA_VER`.
- El botón **Nueva Carga** solo debe mostrarse para roles con `CARGAS_CREAR`.
- Los botones **Revalidar Archivo**, **Ir a Publicación** y **Publicar Carga** deben respetar los permisos `CARGAS_VALIDAR` y `CARGAS_PUBLICAR`.
- En el detalle de cliente 360, una campaña no debe aparecer si el cliente no tiene ofertas en ella.
- El dashboard debe mostrar meses con valor 0 cuando no haya ofertas en ese período.

---

## 6. Comandos útiles

### Backend

```bash
./mvnw clean compile -DskipTests
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend

```bash
pnpm install
pnpm run build
pnpm run dev
```

---

## 7. Pendientes relacionados

- Optimizar `ReporteService` para evitar `findAll()` de campañas, ofertas y clientes.
- Implementar middleware de Next.js para protección de rutas en SSR.
- Tests de integración para los nuevos endpoints de paginación y resumen.
- Exportar logs de auditoría a CSV/Excel.
