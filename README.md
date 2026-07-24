# Sistema de Business Intelligence para un Banco

> Proyecto de Fin de Carrera — Ingeniería Informática, Pontificia Universidad Católica del Perú

Sistema BI que centraliza la gestión de campañas comerciales, clientes y ofertas de un banco. Proporciona visualización de indicadores clave (dashboard, cliente 360, reportes) y captura digital de datos mediante carga masiva de archivos CSV con validación y publicación.

---

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Módulos](#módulos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Patrones de Diseño](#patrones-de-diseño)
- [Reglas de Negocio](#reglas-de-negocio)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Endpoints Principales](#endpoints-principales)
- [Base de Datos](#base-de-datos)
- [Datos de Demo](#datos-de-demo)

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui (Radix UI) |
| **Backend** | Spring Boot 3, Java 21, Spring Data JPA, Hibernate |
| **Base de datos** | PostgreSQL + Flyway (migraciones versionadas) |
| **Build** | Maven (backend), pnpm (frontend) |
| **PDF** | jsPDF + jspdf-autotable |
| **Almacenamiento** | Local (`uploads/`) con soporte para S3 |

---

## Arquitectura

```
┌─────────────────┐       ┌─────────────────────────────────────┐
│   Next.js App   │       │        Spring Boot Backend          │
│                 │ REST   │ ┌─────────┐ ┌──────────┐ ┌──────┐ │
│  Page/Component │◄──────►│ │Controller│ │ Service  │ │Repo  │ │
│  (use client)   │        │ │   (REST) │ │ (Business│ │(JPA) │ │
│  + Server       │        │ │          │ │  Logic)  │ │      │ │
│  Components     │        │ └─────────┘ └──────────┘ └──────┘ │
└─────────────────┘        │         ┌──────────────┐          │
                           │         │  Event Bus   │          │
                           │         │ (Async Pub)  │          │
                           │         └──────────────┘          │
                           └───────────────┬─────────────────────┘
                                           │
                                   ┌───────▼───────┐
                                   │   PostgreSQL   │
                                   │  + Flyway      │
                                   └───────────────┘
```

- **Layered Architecture**: Controller → Service → Repository (separación de responsabilidades)
- **Event-Driven**: `ApplicationEventPublisher` + `@EventListener` para publicación asíncrona de cargas
- **REST API**: comunicación síncrona entre frontend y backend; polling para procesos asíncronos
- **Flyway**: migraciones de base de datos versionadas (V1, V2, ..., V19)

---

## Módulos

### Módulo 1 — Visualización Comercial

Rutas bajo `/module1/*`.

| Ruta | Descripción |
|---|---|
| `/module1/dashboard` | Dashboard con KPIs y dos sub-tabs: *Resumen Ejecutivo* (gráficos pie/bar/line) y *Detalle Analítico* (barras agrupadas multi-período) |
| `/module1/clients/[id]` | Cliente 360: información general, historial de campañas e historial de ofertas con opción de reposición |
| `/module1/campaigns/[id]` | Detalle de campaña: KPIs, ofertas asociadas con búsqueda, exportación PDF y reposición |
| `/module1/reposicion` | Bandeja de ofertas seleccionadas para reposición |

### Módulo 2 — Captura Digital

Rutas bajo `/module2/*`.

| Ruta | Descripción |
|---|---|
| `/module2/upload` | Subida de archivos CSV para clientes, campañas y ofertas |
| `/module2/validation/[id]` | Resultado de validación asíncrona: errores por fila, corrección y revalidación |
| `/module2/publication/[id]` | Publicación de datos validados a la base de datos |
| `/module2/inbox` | Bandeja de entrada con estado y polling de publicaciones en progreso |

---

## Estructura del Proyecto

```
├── backend/
│   └── src/main/java/pe/com/banco/bi/
│       ├── config/
│       ├── security/
│       ├── catalog/            # Catálogos (periodos, productos, segmentos, etc.)
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   ├── mapper/
│       │   ├── dto/
│       │   └── entity/
│       ├── module1/            # Visualización Comercial
│       │   ├── campania/       # Campañas comerciales
│       │   ├── cliente/        # Clientes y Cliente 360
│       │   ├── dashboard/      # Dashboard e indicadores
│       │   ├── oferta/         # Ofertas
│       │   └── reporte/
│       └── module2/            # Captura digital
│           ├── archivocarga/   # Archivo a cargar
│           ├── detallecarga/   # Descripción de la carga realizada
│           ├── errorcarga/     # Log de error en la carga realizada
│           ├── procesocarga/   # Subida de archivos
│           ├── validacion/     # Validación CSV
│           └── publicacion/    # Publicación asíncrona
├── frontend/
│   ├── app/
│   │   ├── module1/          # Visualización Comercial
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── campaigns/
│   │   │   └── reposicion/
│   │   └── module2/          # Captura Digital
│   │       ├── upload/
│   │       ├── validation/
│   │       ├── publication/
│   │       └── inbox/
│   └── components/
│       ├── bi/               # Componentes de negocio (tablas, gráficos, filtros)
│       └── ui/               # Componentes base (Shadcn/ui)
└── test-data/                # Scripts SQL y CSVs de prueba
```

---

## Patrones de Diseño

| Patrón | Uso en el proyecto |
|---|---|
| **Layered Architecture** | Separación en Controller → Service → Repository para desacoplamiento y testabilidad |
| **Builder** | Entidades JPA y DTOs construidos con Lombok `@Builder` |
| **Repository** | Spring Data JPA `JpaRepository<T, ID>` para abstraer el acceso a datos |
| **DTO (Data Transfer Object)** | Objetos de respuesta que desacoplan la representación interna de la API REST |
| **Observer / Event-Driven** | `ApplicationEventPublisher` + `@EventListener` para el flujo de publicación asíncrona (`CargaPublicadaEvent` → `PublicacionAsyncProcessor`) |
| **Strategy** | Procesadores de validación de CSV seleccionados según el tipo de carga |
| **Polling** | Frontend consulta periódicamente el estado de publicación (`setInterval` + `estadoPublicacion()`) |

---

## Reglas de Negocio

1. **Estados de oferta**: Solo se permiten `ACTIVA`, `ACEPTADA` y `VENCIDA`. No se usan `RECHAZADA` ni `PENDIENTE`.
2. **Expiración por campaña**: Cuando una campaña pasa a estado `INACTIVA`, todas sus ofertas en estado `ACTIVA` se actualizan automáticamente a `VENCIDA`.
3. **Reposición**: El botón "Reponer" solo está disponible para ofertas con `estado === 'ACTIVA'` y cuya campaña asociada esté en `ACTIVA`.
4. **Dashboard**: Los períodos disponibles en el filtro son solo aquellos que tienen al menos una campaña registrada (endpoint `GET /catalogos/periodos/con-campanias`).
5. **Publicación asíncrona**: La publicación de datos validados se ejecuta en segundo plano. El frontend muestra una notificación toast cuando el proceso finaliza.
6. **Validación CSV**: Todos los campos son obligatorios excepto `segundoNombre` en clientes.

---

## Instalación y Ejecución

### Requisitos

- Java 21+
- Node.js 18+
- pnpm
- PostgreSQL 15+

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run    # Puerto 8080
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev               # Puerto 3000
```

### Base de datos

1. Crear base de datos: `createdb bi_banco`
2. Las migraciones Flyway se ejecutan automáticamente al iniciar el backend
3. Para cargar datos demo: ejecutar `test-data/reset_demo_data.sql`

---

## Endpoints Principales

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/catalogos/periodos/con-campanias` | Períodos con campañas registradas |
| `GET` | `/api/dashboard/resumen` | Datos del dashboard (KPIs y gráficos) |
| `GET` | `/api/clientes/{id}/360` | Cliente 360 con campañas y ofertas |
| `GET` | `/api/campanias/{id}/ofertas` | Ofertas paginadas de una campaña |
| `GET` | `/api/campanias/{id}/resumen-ofertas` | Resumen de KPIs de una campaña |
| `POST` | `/api/module2/cargas` | Subir archivo CSV |
| `GET` | `/api/module2/cargas/{id}` | Estado y resultado de validación |
| `POST` | `/api/module2/cargas/{id}/validar` | Revalidar archivo corregido |
| `POST` | `/api/module2/cargas/{id}/publicar` | Iniciar publicación asíncrona |
| `GET` | `/api/module2/cargas/{id}/estado-publicacion` | Polling de estado de publicación |

---

## Base de Datos

Migraciones Flyway en `backend/src/main/resources/db/migration/` (V1 a V19).

Modelo relacional con las siguientes tablas principales:

**Catálogos:**
- `periodos` — períodos (ej. 2026-07)
- `productos`, `subproductos` — productos financieros
- `segmentos`, `zonas`, `agencias`, `canales` — segmentación de clientes
- `tipos_documento`, `tipos_cliente`

**Negocio:**
- `campanias` — campañas comerciales (FK a `periodos`, `productos`, `subproductos`)
- `clientes` — clientes del banco (FK a `segmentos`, `zonas`, `agencias`, `canales`)
- `ofertas` — ofertas asociadas a campaña y cliente (FK a `campanias`, `clientes`)
- `reposiciones` — registro de reposiciones realizadas

**Módulo 2 (Captura Digital):**
- `procesos_carga` — cabecera de cada archivo CSV subido
- `detalles_carga` — datos parseados del CSV
- `resultados_carga` — resultados de validación por fila
- `errores_carga` — errores de validación detallados

---

## Datos de Demo

El directorio `test-data/` contiene:

- `reset_demo_data.sql` — script que limpia datos de negocio y recarga desde V16, preservando datos existentes del Módulo 2
- `clientes_ejemplo.csv` — datos de prueba para carga de clientes
- `campanias_ejemplo.csv` — datos de prueba para carga de campañas
- `ofertas_ejemplo.csv` — datos de prueba para carga de ofertas
- `ofertas_grande.csv` — set grande de ofertas para pruebas de rendimiento
