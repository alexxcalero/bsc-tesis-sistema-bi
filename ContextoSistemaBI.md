# Contexto para OpenCode Go – Sistema BI (Frontend base + propuesta de Backend Spring Boot)

## 1) Objetivo de este documento
Este archivo resume el proyecto base generado con v0 y define una propuesta de backend en **Java + Spring Boot** alineada con el diagrama de clases UML del sistema. Está pensado para que OpenCode Go tenga contexto suficiente para continuar la implementación real del sistema.

---

## 2) Resumen ejecutivo
El archivo `Modulo1y2-SistemaBI.zip` contiene **solo el frontend/prototipo funcional** del sistema BI. El proyecto está implementado con **Next.js + React + TypeScript + Tailwind + componentes Radix/shadcn** y actualmente consume **datos mock** desde `lib/mock-data.ts`. No se encontraron llamadas reales a API (`fetch`, `axios` o `/api/*`), por lo que el backend aún no existe y debe construirse desde cero.

El frontend cubre dos módulos:

- **Módulo 1 – Visualización e Integración**
  - Dashboard
  - Campañas Comerciales
  - Cliente 360
  - Reportes y Exportación
- **Módulo 2 – Captura Digital**
  - Bandeja de Cargas
  - Registro de Proceso de Carga
  - Validación de Archivo de Carga
  - Publicación de Carga Validada
  - Consulta de Resultados y Errores
  - Historial y Trazabilidad de Cargas

El backend debe proveer:
1. autenticación/autorización por roles,
2. catálogos maestros,
3. entidades comerciales (cliente, campaña, oferta, producto, etc.),
4. módulo operativo de cargas (registro, validación, publicación, trazabilidad),
5. endpoints analíticos para el módulo de visualización.

---

## 3) Stack detectado en el proyecto base
- **Framework:** Next.js 16
- **UI:** React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4
- **Componentes:** Radix UI + shadcn/ui
- **Gráficos:** Recharts
- **Forms / validación:** react-hook-form + zod
- **Datos actuales:** `lib/mock-data.ts`

---

## 4) Estructura resumida del ZIP

### 4.1. Estructura principal
```text
app/
  module1/
    dashboard/
    campaigns/
    clients/
    reports/
  module2/
    inbox/
    registro/
    validation/
    publication/
    results/
    history/
    detalle/
components/
  app-sidebar.tsx
  main-layout.tsx
  topbar.tsx
  breadcrumbs.tsx
  bi/
  ui/
lib/
  mock-data.ts
  utils.ts
styles/
public/
package.json
```

### 4.2. Rutas detectadas en `app/`
```text
app/module1/campaigns/[id]/page.tsx
app/module1/campaigns/page.tsx
app/module1/clients/[id]/page.tsx
app/module1/clients/page.tsx
app/module1/dashboard/page.tsx
app/module1/page.tsx
app/module1/reports/page.tsx
app/module2/detalle/[id]/page.tsx
app/module2/history/page.tsx
app/module2/inbox/page.tsx
app/module2/page.tsx
app/module2/publication/[id]/page.tsx
app/module2/registro/page.tsx
app/module2/results/page.tsx
app/module2/validation/[id]/page.tsx
app/module2/validation/page.tsx
app/page.tsx
```

### 4.3. Componentes reutilizables
- Componentes de layout: `app-sidebar.tsx`, `main-layout.tsx`, `topbar.tsx`, `breadcrumbs.tsx`
- Componentes BI: `kpi-card.tsx, stat-card.tsx, status-badge.tsx`
- Componentes UI base: 57 componentes en `components/ui/`

### 4.4. Hallazgos importantes
- El menú lateral ya define la navegación final del sistema.
- El frontend está organizado por módulos funcionales.
- `lib/mock-data.ts` concentra las interfaces TypeScript y los datos de prueba que deben servir como referencia para DTOs de lectura/escritura.
- No existe backend implementado en el ZIP.

---

## 5) Qué debe conservarse del frontend
OpenCode Go debe **mantener el frontend actual** como base de referencia para los contratos del backend.

Se debe preservar:
- La estructura de rutas del módulo 1 y módulo 2.
- La navegación del sidebar.
- El diseño de tablas, KPIs, badges, filtros y vistas de detalle.
- Los nombres funcionales de pantallas y módulos.

Se debe reemplazar progresivamente:
- `lib/mock-data.ts` → llamadas a backend real.
- lógica local de filtros → parámetros de consulta REST.
- resultados simulados → respuestas del backend.

---

## 6) Modelo de dominio sugerido para el backend (Spring Boot)

### 6.1. Convención recomendada
Usar nombres de clases **sin tildes ni ñ** en Java:
- `Campania` en vez de `Campaña`
- `Anho` o `anio` en vez de `año`
- `contrasenha` o `passwordHash` en vez de `contraseña`

Se recomienda mantener el dominio en español para que coincida con la tesis y el frontend, pero con identificadores válidos para Java.

### 6.2. Entidades base del dominio

#### Catálogos / maestros
- `TipoCliente`
- `TipoDocumento`
- `Segmento`
- `Zona`
- `Agencia`
- `Canal`
- `Producto`
- `Subproducto`
- `FiltroOferta`
- `Periodo`
- `TipoCarga`
- `EstadoCarga`
- `Permiso`
- `Rol`

#### Operación comercial / analítica
- `Cliente`
- `Campania`
- `Oferta`
- `Reporte`
- `Auditoria`
- `Usuario`

#### Módulo 2 – captura digital
- `ProcesoCarga`
- `ArchivoCarga`
- `DetalleCarga`
- `ErrorCarga`
- `ResultadoCarga`

---

## 7) Relaciones sugeridas según el UML y el frontend

### 7.1. Relaciones comerciales
- `Agencia` **many-to-one** `Zona`
- `Cliente` **many-to-one** `Agencia`
- `Cliente` **many-to-one** `Segmento`
- `Cliente` **many-to-one** `TipoCliente`
- `Cliente` **many-to-one** `TipoDocumento`
- `Cliente` **many-to-one** `ProcesoCarga` (trazabilidad del origen de carga)
- `Subproducto` **many-to-one** `Producto`
- `Campania` **many-to-one** `Periodo`
- `Campania` **many-to-one** `Producto`
- `Campania` **many-to-one** `ProcesoCarga` (carga que originó/actualizó la campaña)
- `Oferta` **many-to-one** `Cliente`
- `Oferta` **many-to-one** `Campania`
- `Oferta` **many-to-one** `Canal`
- `Oferta` **many-to-one** `FiltroOferta`
- `Oferta` **many-to-one** `Subproducto`
- `Oferta` **many-to-one** `ProcesoCarga` (carga que originó/actualizó la oferta)

### 7.2. Seguridad y auditoría
- `Usuario` **many-to-one** `Rol`
- `Rol` **many-to-many** `Permiso`
- `Auditoria` **many-to-one** `Usuario`
- `Reporte` **many-to-one** `Usuario`

### 7.3. Módulo de cargas
- `ProcesoCarga` **many-to-one** `TipoCarga`
- `ProcesoCarga` **many-to-one** `EstadoCarga`
- `ProcesoCarga` **many-to-one** `Usuario`
- `ProcesoCarga` **one-to-many** `ArchivoCarga`
- `ProcesoCarga` **one-to-many** `DetalleCarga`
- `ProcesoCarga` **one-to-one** `ResultadoCarga`
- `DetalleCarga` **one-to-many** `ErrorCarga`

> Nota: el UML muestra la capa de trazabilidad entre el proceso de carga y las entidades de negocio. Si alguna relación no estuviera finalmente en la base de datos física, se puede mantener como referencia lógica y decidir si queda modelada como FK real o como metadato de auditoría.

---

## 8) Campos sugeridos por entidad (backend)

### 8.1. Catálogos
Todos los catálogos deberían tener como mínimo:
- `id: Long`
- `codigo: String` (cuando aplique)
- `nombre: String`
- `descripcion: String` (cuando aplique)
- `estado: Boolean` o `activo: Boolean` (si aplica)

### 8.2. Entidades principales

#### `Cliente`
- id
- primerNombre
- segundoNombre
- apellidoPaterno
- apellidoMaterno
- razonSocial
- numeroDocumento
- correo
- telefono
- tipoCliente
- tipoDocumento
- segmento
- agencia
- procesoCarga
- createdAt / updatedAt

#### `Campania`
- id
- codigo
- nombre
- descripcion
- fechaInicio
- fechaFin
- estado
- periodo
- producto
- procesoCarga
- createdAt / updatedAt

#### `Oferta`
- id
- monto
- tasa
- fechaOferta
- estado
- observacion
- cliente
- campania
- canal
- filtroOferta
- subproducto
- procesoCarga
- createdAt / updatedAt

#### `Usuario`
- id
- username
- passwordHash
- primerNombre
- segundoNombre
- apellidoPaterno
- apellidoMaterno
- correo
- estado
- rol

#### `ProcesoCarga`
- id
- codigo
- fechaInicio
- fechaFin
- observacion
- totalRegistros
- totalRegValidos
- totalRegInvalidos
- tipoCarga
- estadoCarga
- usuario

#### `ArchivoCarga`
- id
- nombre
- ruta
- formato
- tamanho
- fechaCarga
- procesoCarga

#### `DetalleCarga`
- id
- numeroFila
- estadoResultado
- mensajeValidacion
- fechaProcesamiento
- procesoCarga

#### `ErrorCarga`
- id
- campo
- tipoError
- descripcion
- severidad
- detalleCarga

#### `ResultadoCarga`
- id
- totalProcesados
- totalExitosos
- totalConError
- totalOmitidos
- fechaResultado
- procesoCarga

#### `Auditoria`
- id
- fechaHora
- accion
- modulo
- detalle
- ipOrigen
- resultado
- usuario

#### `Reporte`
- id
- tipo
- formato
- fechaCreacion
- filtrosAplicados
- estado
- usuario

---

## 9) Arquitectura sugerida para Spring Boot

### 9.1. Stack backend recomendado
- Java 21
- Spring Boot 3.x
- Spring Web
- Spring Data JPA
- Spring Security
- Validation (Jakarta Validation)
- PostgreSQL
- Flyway o Liquibase
- Lombok
- MapStruct (opcional, recomendado)
- springdoc-openapi (Swagger)
- Testcontainers (opcional)

### 9.2. Estructura de paquetes recomendada
```text
com.banco.bi
  config/
  security/
  common/
    exception/
    api/
    audit/
    mapper/
    util/
  module1/
    dashboard/
    campania/
    cliente/
    oferta/
    producto/
    reporte/
  module2/
    procesocarga/
    archivocarga/
    validacion/
    publicacion/
    resultado/
    historial/
  catalog/
    tipocliente/
    tipodocumento/
    segmento/
    zona/
    agencia/
    canal/
    periodo/
    filtrooferta/
    tipocarga/
    estadocarga/
  securitydomain/
    usuario/
    rol/
    permiso/
```

Dentro de cada paquete de dominio:
```text
entity/
repository/
service/
service/impl/
controller/
dto/
mapper/
specification/
```

---

## 10) Contratos API sugeridos

### 10.1. Autenticación y seguridad
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

### 10.2. Catálogos
- `GET /api/v1/catalogos/tipos-cliente`
- `GET /api/v1/catalogos/tipos-documento`
- `GET /api/v1/catalogos/segmentos`
- `GET /api/v1/catalogos/agencias`
- `GET /api/v1/catalogos/zonas`
- `GET /api/v1/catalogos/canales`
- `GET /api/v1/catalogos/productos`
- `GET /api/v1/catalogos/subproductos`
- `GET /api/v1/catalogos/periodos`
- `GET /api/v1/catalogos/tipos-carga`
- `GET /api/v1/catalogos/estados-carga`

### 10.3. Módulo 1 – Visualización e integración
- `GET /api/v1/dashboard/resumen`
- `GET /api/v1/dashboard/campanias-por-producto`
- `GET /api/v1/dashboard/evolucion-monto`
- `GET /api/v1/dashboard/ticket-promedio`

- `GET /api/v1/campanias`
  - filtros: `periodo`, `productoId`, `segmentoId`, `estado`
- `GET /api/v1/campanias/{id}`
- `GET /api/v1/campanias/{id}/ofertas`
- `GET /api/v1/campanias/{id}/clientes`

- `GET /api/v1/clientes`
  - filtros: `nombre`, `tipoCliente`, `segmento`, `campaniaId`
- `GET /api/v1/clientes/{id}/detalle-360`

- `POST /api/v1/reportes`
- `GET /api/v1/reportes`
- `GET /api/v1/reportes/{id}/descarga`

### 10.4. Módulo 2 – Captura digital
- `GET /api/v1/cargas`
  - filtros: `search`, `tipoCarga`, `estado`, `usuario`, `fechaDesde`, `fechaHasta`
- `POST /api/v1/cargas`
- `GET /api/v1/cargas/{id}`
- `GET /api/v1/cargas/{id}/historial`
- `POST /api/v1/cargas/{id}/validar`
- `GET /api/v1/cargas/{id}/validacion`
- `POST /api/v1/cargas/{id}/publicar`
- `GET /api/v1/cargas/{id}/resultado`
- `GET /api/v1/cargas/{id}/errores`
- `GET /api/v1/cargas/historial`
- `GET /api/v1/cargas/{id}/reporte`

---

## 11) DTOs mínimos esperados por el frontend

### 11.1. Dashboard
- `DashboardResumenResponse`
- `CampaniasPorProductoResponse`
- `EvolucionMontoResponse`
- `TicketPromedioResponse`

### 11.2. Campañas
- `CampaniaListResponse`
- `CampaniaDetailResponse`
- `CampaniaClienteResponse`
- `CampaniaOfertaResponse`

### 11.3. Clientes
- `ClienteListResponse`
- `Cliente360Response`
  - datos generales
  - campañaOrigen
  - historialCampanias
  - historialOfertas
  - productosSubproductosOfertados
  - montosPorPeriodo
  - comparativoHistorico

### 11.4. Cargas
- `ProcesoCargaListResponse`
- `ProcesoCargaDetailResponse`
- `ProcesoCargaCreateRequest`
- `ProcesoCargaValidacionResponse`
- `ProcesoCargaPublicacionResponse`
- `ProcesoCargaResultadoResponse`
- `ErrorCargaResponse`

---

## 12) Reglas funcionales clave que el backend debe respetar

### 12.1. Para el módulo 1
- Solo deben mostrarse campañas/clientes/ofertas provenientes de datos válidos o publicados.
- Los filtros del dashboard y listas deben traducirse a parámetros REST/paginación.
- El detalle de campaña y el Cliente 360 deben construirse como vistas agregadas, no solo lecturas directas de una tabla.

### 12.2. Para el módulo 2
- Una carga inicia en estado `pendiente`.
- La validación debe revisar estructura, formato, duplicados y reglas de negocio.
- Una carga solo puede publicarse si supera la validación según las reglas definidas.
- La publicación debe actualizar/inserta entidades del dominio según el tipo de carga (`campanias`, `clientes`, `ofertas`).
- Todo el proceso debe dejar rastro en `Auditoria` y/o eventos de proceso.
- El historial debe ser consultable por fecha, usuario, tipo de carga y estado.

---

## 13) Orden recomendado de implementación del backend

### Fase 1 – Base técnica
1. Crear proyecto Spring Boot.
2. Configurar PostgreSQL.
3. Configurar Flyway/Liquibase.
4. Configurar seguridad básica (`Usuario`, `Rol`, `Permiso`).
5. Implementar catálogos base.

### Fase 2 – Módulo 2 primero
1. `ProcesoCarga`, `ArchivoCarga`, `DetalleCarga`, `ErrorCarga`, `ResultadoCarga`.
2. Endpoints de bandeja de cargas.
3. Endpoint de registro de nueva carga.
4. Servicio de validación.
5. Servicio de publicación.
6. Historial y consulta de resultados.

> Implementar primero el módulo 2 tiene sentido porque abastece de datos al módulo 1.

### Fase 3 – Módulo 1
1. `Producto`, `Subproducto`, `Periodo`, `Campania`, `Cliente`, `Oferta`, `Canal`, `FiltroOferta`, `Agencia`, `Zona`, `Segmento`, `TipoCliente`, `TipoDocumento`.
2. Endpoints analíticos del dashboard.
3. Lista y detalle de campañas.
4. Cliente 360.
5. Reportes y exportación.

### Fase 4 – Integración frontend-backend
1. Reemplazar mocks por clientes HTTP en Next.js.
2. Mapear filtros del frontend a query params.
3. Manejar estados de carga, errores y vacíos.
4. Conectar autenticación.

---

## 14) Recomendaciones técnicas para OpenCode Go

### 14.1. Lo que sí debe hacer
- Generar el backend como un proyecto Spring Boot nuevo.
- Mantener el frontend actual sin reestructurarlo.
- Crear contratos REST estables y versionados (`/api/v1`).
- Implementar primero el módulo de cargas y luego el módulo analítico.
- Modelar entidades JPA con relaciones explícitas.
- Preparar DTOs de respuesta para no exponer entidades directamente.
- Agregar paginación y filtros desde el inicio en listados.
- Usar migraciones SQL versionadas.

### 14.2. Lo que debe evitar
- No mezclar lógica de validación compleja dentro del controller.
- No usar entidades JPA como payloads directos del API.
- No acoplar el backend a los nombres de componentes React.
- No asumir que los mocks TypeScript son el modelo final; deben usarse como referencia, no como verdad absoluta.

---

## 15) Resultado esperado para la siguiente etapa
OpenCode Go debería usar este documento para producir:
1. un proyecto base Spring Boot,
2. el modelo de dominio inicial,
3. migraciones de base de datos,
4. controladores REST por módulo,
5. servicios de validación/publicación de cargas,
6. endpoints de consulta para dashboard, campañas, cliente 360 y reportes,
7. seguridad por roles,
8. integración posterior con el frontend existente.
