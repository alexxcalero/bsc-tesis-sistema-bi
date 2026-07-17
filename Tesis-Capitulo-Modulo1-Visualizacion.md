# 5.2.3. Implementación del módulo de integración y visualización de datos de clientes y campañas comerciales

## Introducción

El presente apartado describe la implementación del módulo de integración y visualización de datos de clientes y campañas comerciales, correspondiente al primer módulo funcional del Sistema BI Bancario. Este módulo tiene como propósito central consolidar la información de clientes, campañas comerciales, ofertas y reportes, presentándola al usuario final de manera estructurada, filtrable y gráfica a través de una interfaz web moderna.

La integración de datos se realiza principalmente desde la base de datos transaccional del sistema, donde residen las entidades de negocio. A partir de ellas, el módulo construye vistas analíticas que permiten a los usuarios de negocio tomar decisiones fundamentadas. La visualización se implementó mediante tablas paginadas, tarjetas de indicadores clave y gráficos interactivos que resumen el comportamiento de las campañas y la cartera de clientes.

## Requerimientos funcionales

El módulo de integración y visualización satisface los siguientes requerimientos funcionales:

- Visualización de un dashboard general con indicadores clave de negocio.
- Consulta paginada y filtrada de campañas comerciales.
- Visualización del detalle de una campaña, incluyendo sus ofertas asociadas.
- Consulta paginada y filtrada de clientes.
- Visualización de la ficha completa de un cliente, conocida como vista 360, incluyendo campañas y ofertas históricas.
- Generación y descarga de reportes en formato CSV.
- Control de acceso basado en roles y permisos.

## Diseño del módulo

El diseño del módulo sigue una arquitectura por capas, separando claramente la presentación, la lógica de negocio y el acceso a datos. Esta separación permite mantener el código organizado, facilitar las pruebas y escalar las funcionalidades de manera controlada.

En el frontend, la navegación se organiza en rutas independientes agrupadas bajo el módulo uno. Cada ruta representa una pantalla concreta: dashboard, campañas, clientes y reportes. El frontend consume los servicios REST del backend de forma asíncrona, gestionando el estado de autenticación y los permisos del usuario en sesión.

En el backend, cada funcionalidad del módulo se implementa mediante un conjunto de componentes especializados: controladores REST que exponen los endpoints, servicios que contienen la lógica de negocio, repositorios que acceden a la base de datos, entidades que representan las tablas, y objetos de transferencia de datos que se utilizan para la comunicación entre capas.

## Tecnologías utilizadas

La implementación del módulo se apoya en un stack tecnológico dividido en frontend y backend.

En el frontend se utilizó Next.js como framework de aplicaciones React, junto con TypeScript para tipado estático. La interfaz de usuario se construyó con Tailwind CSS y componentes de shadcn/ui, que proporcionan una base sólida de componentes accesibles y personalizables. Para la renderización de gráficos se empleó Recharts, una biblioteca especializada en visualizaciones basadas en React. La gestión de formularios y la validación se realizaron con react-hook-form y Zod respectivamente.

En el backend se utilizó Java 21 con Spring Boot 3.5.0. La seguridad se implementó con Spring Security y autenticación mediante tokens JWT. La persistencia se gestiona con Spring Data JPA sobre PostgreSQL en ambiente productivo y H2 en ambiente local y de pruebas. Las migraciones de base de datos se controlan con Flyway. El mapeo entre entidades y objetos de transferencia se realiza con MapStruct, y se aprovechó Lombok para reducir la verbosidad del código.

## Implementación del backend

El backend del módulo se organiza en paquetes funcionales independientes: dashboard, campañas, clientes, ofertas y reportes. Cada paquete contiene su propio controlador, servicio, repositorio, entidades y objetos de transferencia.

### Dashboard

El dashboard constituye el punto de entrada analítico del sistema. El servicio correspondiente consulta la base de datos mediante operaciones agregadas para obtener indicadores clave. Entre ellos se encuentran el número total de campañas activas, el monto total ofertado, el ticket promedio, la distribución de campañas por producto, la evolución del monto ofertado en los últimos doce meses y el ticket promedio por segmento de cliente.

Para la evolución mensual, el servicio genera una serie completa de los últimos doce meses, rellenando con valor cero aquellos períodos en los que no existan ofertas registradas. Esto garantiza que los gráficos muestren una línea temporal continua y uniforme, independientemente de la disponibilidad de datos en cada mes.

### Campañas comerciales

La gestión de campañas se implementó con un listado paginado del lado del servidor. El controlador expone endpoints para obtener el listado de campañas, obtener un resumen dinámico de indicadores, consultar el detalle de una campaña específica, recalcular sus métricas y listar las ofertas asociadas.

El recálculo de métricas es una operación relevante del módulo. Cuando se consulta una campaña cuyas métricas se encuentran en cero, el sistema recalcula automáticamente los valores de clientes alcanzados, monto ofertado y ticket promedio a partir de sus ofertas asociadas. Además, existe un endpoint específico que permite al usuario solicitar el recálculo manual de estas métricas.

La búsqueda de ofertas dentro de una campaña permite filtrar por nombre, apellido o número de documento del cliente. Esta búsqueda se implementó en el repositorio mediante una consulta que evalúa múltiples campos del cliente y del archivo cargado.

### Clientes

El módulo de clientes permite consultar el listado general de clientes y acceder a su ficha detallada. El listado soporta filtros por número de documento, nombre, tipo de cliente y segmento. La ficha de cliente incluye una vista 360 que consolida sus datos personales, las campañas en las que ha participado y el historial de ofertas recibidas.

Inicialmente, la vista 360 mostraba todas las campañas del sistema, lo cual generaba inconsistencias. Posteriormente se ajustó para que únicamente se muestren aquellas campañas en las que el cliente tiene al menos una oferta asociada, garantizando así la coherencia de la información presentada.

### Reportes

El subsistema de reportes permite generar archivos en formato CSV a partir de filtros definidos por el usuario. Los reportes disponibles corresponden a campañas, ofertas y clientes. Cada tipo de reporte admite filtros propios, como período, producto, estado, segmento, zona o agencia. El servicio genera el contenido del archivo y el controlador lo devuelve como respuesta descargable.

## Implementación del frontend

El frontend del módulo se desarrolló como una aplicación de páginas independientes bajo la ruta base del módulo uno. Cada pantalla está construida como un componente React que consume datos del backend mediante un cliente HTTP centralizado, el cual gestiona automáticamente la inclusión del token de autenticación en cada solicitud.

### Pantallas principales

La pantalla de dashboard presenta tarjetas de indicadores clave y gráficos que resumen la situación comercial. Las pantallas de campañas y clientes implementan tablas paginadas con filtros dinámicos en la parte superior. La pantalla de detalle de campaña muestra la información general, los indicadores de ofertas y una tabla paginada con búsqueda integrada. La pantalla de detalle de cliente presenta la ficha personal, el historial de campañas y el historial de ofertas en secciones diferenciadas.

La pantalla de reportes permite seleccionar el tipo de reporte, configurar los filtros correspondientes y solicitar la generación del archivo. Tras la generación, el navegador inicia la descarga del archivo CSV.

### Componentes reutilizables

Se desarrollaron componentes compartidos para garantizar la consistencia visual y funcional del módulo. El componente de paginación permite navegar entre páginas, seleccionar el tamaño de página e ir a una página específica. Las tarjetas de indicadores muestran valores resumidos con formato numérico. Los filtros se implementaron como controles independientes que actualizan los parámetros de consulta enviados al backend.

El sidebar y el guardián de rutas implementan el control de acceso en el frontend. El sidebar muestra únicamente las opciones de menú asociadas a los permisos del usuario, mientras que el guardián de rutas impide el acceso directo a pantallas no autorizadas.

## Flujos principales

### Flujo de consulta de campañas

El usuario accede a la pantalla de campañas y aplica los filtros deseados. El frontend construye una solicitud con los parámetros de paginación y filtro, y la envía al endpoint correspondiente. El backend construye una especificación dinámica que traduce los filtros en predicados de base de datos. El repositorio ejecuta una consulta paginada y devuelve únicamente los registros solicitados. Finalmente, el frontend actualiza la tabla y el paginador con la respuesta recibida.

### Flujo de recálculo de métricas

Cuando el usuario ingresa al detalle de una campaña, el servicio evalúa si las métricas deben recalcularse. En caso afirmativo, obtiene las ofertas de la campaña, calcula el número de clientes distintos, la suma de montos y el ticket promedio, y persiste los valores actualizados en la campaña. Si el usuario solicita el recálculo manual, se repite el mismo procedimiento de forma explícita.

### Flujo de generación de reportes

El usuario selecciona el tipo de reporte y configura los filtros. El frontend envía la solicitud al backend, que valida los permisos, ejecuta la consulta correspondiente y genera el contenido CSV. El controlador responde con el archivo adjunto, que el navegador descarga automáticamente.

## Decisiones de diseño y soluciones técnicas

### Paginación y filtros del lado del servidor

Una decisión clave fue implementar la paginación y el filtrado en el servidor en lugar de cargar todos los registros en memoria. Esta decisión mejora significativamente el rendimiento cuando los volúmenes de datos crecen, ya que solo se transfieren al frontend los registros efectivamente visualizados.

### Seguridad basada en permisos

El acceso a cada endpoint se controla mediante anotaciones de seguridad que verifican la presencia de permisos específicos en el token JWT. Esto garantiza que un usuario solo pueda ejecutar las operaciones autorizadas para su rol. En el frontend, los permisos se utilizan para mostrar u ocultar opciones de menú, botones y rutas.

### Uso de objetos de transferencia

Se decidió utilizar objetos de transferencia para exponer la información hacia el frontend, en lugar de devolver directamente las entidades de persistencia. Esta práctica evita la exposición de datos internos, reduce el tamaño de las respuestas y permite adaptar la estructura de los datos a las necesidades de la interfaz de usuario.

### Optimización de consultas agregadas

El dashboard realiza consultas agregadas directamente en la base de datos, utilizando funciones de suma, promedio y agrupación. Esto evita cargar grandes volúmenes de entidades en memoria para luego calcular los indicadores, mejorando el tiempo de respuesta y el consumo de recursos.

## Problemas encontrados y soluciones

Durante la implementación se identificaron varios problemas que fueron corregidos progresivamente. Uno de ellos fue la correcta visualización de la evolución mensual del monto ofertado, ya que los meses sin datos generaban series discontinuas. La solución consistió en completar la serie de doce meses con valores cero para los períodos faltantes.

Otro problema fue la carga inicial del listado de ofertas por campaña, que traía todos los registros sin paginar. Se corrigió implementando una consulta paginada del lado del servidor que también soporta búsqueda por cliente.

Finalmente, se ajustó la vista 360 del cliente para que solo muestre campañas con ofertas asociadas al cliente consultado, corrigiendo así una inconsistencia en la información presentada.

---

# 5.2.4. Pruebas del módulo de integración y visualización de datos de clientes y campañas comerciales

## Estrategia de pruebas

Las pruebas del módulo de integración y visualización se diseñaron para garantizar el correcto funcionamiento de las funcionalidades implementadas, tanto desde el punto de vista de la lógica de negocio como desde la experiencia del usuario final. La estrategia contempla pruebas unitarias en el backend, pruebas de integración de endpoints y pruebas end-to-end en el frontend.

Las pruebas unitarias se enfocan en los servicios y controladores, utilizando JUnit 5, Mockito y Spring Security Test. Las pruebas de integración verifican el comportamiento de los endpoints REST con la base de datos H2 en perfil de pruebas. Las pruebas end-to-end se ejecutan con Playwright, simulando el comportamiento de un usuario real en el navegador.

## Ambiente de pruebas

El ambiente de pruebas utiliza el perfil `test` del backend, configurado con una base de datos H2 en memoria y Flyway deshabilitado. Los datos de prueba se cargan mediante scripts SQL o se crean directamente en los tests. El frontend se ejecuta localmente en la dirección `http://localhost:3000` durante las pruebas end-to-end.

## Usuarios y datos de prueba

Para las pruebas se utilizan los usuarios definidos en la semilla del sistema. Cada usuario representa un rol diferente, lo cual permite validar el control de acceso por permisos.

| Usuario | Rol | Permisos relevantes |
|---|---|---|
| admin | Administrador | Todos los permisos |
| analista | Analista | Visualización de campañas, clientes y reportes |
| empleado | Empleado | Visualización de clientes únicamente |
| auditor | Auditor | Visualización de campañas y clientes |

Además, se definen entidades de prueba como campañas, clientes y ofertas con valores conocidos. Por ejemplo, una campaña con código `CAMP-001` y dos ofertas asociadas de quince mil y veinticinco mil soles, respectivamente, permite verificar los cálculos de métricas de manera predecible.

## Pruebas unitarias

### Prueba de indicadores del dashboard

Se verifica que el servicio de dashboard retorne los indicadores principales y las series de evolución correctamente. Con dos ofertas de quince mil y veinticinco mil soles, el monto total ofertado debe ser cuarenta mil soles y el ticket promedio veinte mil soles.

### Prueba de listado y filtros de campañas

Se prueba que el servicio de campañas aplique correctamente los filtros por estado, código, producto y período. El resultado debe contener únicamente los registros que cumplan con los criterios especificados.

### Prueba de recálculo de métricas de campaña

Se verifica que el recálculo de métricas actualice correctamente los campos de clientes alcanzados, monto ofertado y ticket promedio a partir de las ofertas asociadas.

### Prueba de resumen de ofertas por campaña

Se evalúa que el servicio de resumen de ofertas calcule correctamente los totales y que la búsqueda por nombre o documento del cliente filtre los resultados esperados.

### Prueba de vista 360 del cliente

Se comprueba que el servicio de cliente 360 retorne los datos personales del cliente, las campañas en las que tiene ofertas y el historial de ofertas.

### Prueba de generación de reportes

Se valida que el controlador de reportes genere una respuesta descargable en formato CSV con encabezados y al menos una fila de datos.

### Prueba de control de acceso

Se verifica que un usuario sin el permiso correspondiente reciba una respuesta de acceso denegado al intentar acceder a un endpoint protegido. Por ejemplo, un empleado que intenta listar campañas debe recibir un código de estado 403.

## Pruebas end-to-end

### Flujo de inicio de sesión y visualización del dashboard

El usuario inicia sesión con credenciales de analista, navega al dashboard y verifica que se muestren las tarjetas de indicadores y los gráficos sin errores.

### Flujo de filtrado de campañas

El usuario accede al listado de campañas, selecciona un filtro por estado y verifica que la tabla se actualice mostrando únicamente las campañas que cumplen el criterio.

### Flujo de detalle de campaña y recálculo de métricas

El usuario ingresa al detalle de una campaña, presiona el botón de recalcular métricas y observa que los valores de clientes alcanzados, monto ofertado y ticket promedio se actualizan correctamente.

### Flujo de búsqueda de ofertas por documento

El usuario accede a las ofertas de una campaña, ingresa el número de documento de un cliente y verifica que la tabla muestre únicamente las ofertas correspondientes a ese cliente.

### Flujo de generación y descarga de reportes

El usuario selecciona el reporte de campañas, aplica un filtro por período, genera el reporte y verifica que se descargue un archivo CSV con contenido válido.

### Caso negativo de acceso sin permiso

El usuario inicia sesión con un rol que no tiene permisos de reportes e intenta acceder directamente a la pantalla de reportes. El sistema debe redirigirlo o mostrar una página de acceso denegado.

## Casos de prueba detallados

A continuación se presenta el detalle de los casos de prueba más representativos del módulo.

| ID | Tipo | Funcionalidad | Descripción | Pasos | Datos de prueba | Resultado esperado |
|---|---|---|---|---|---|---|
| M1-U-01 | Unitario | Dashboard | Verificar KPIs principales | Invocar servicio de dashboard | Campaña con dos ofertas de 15000 y 25000 | Monto total = 40000, ticket promedio = 20000 |
| M1-U-02 | Unitario | Campañas | Filtrar campañas por estado | Aplicar filtro estado = ACTIVA | Campañas con estados ACTIVA e INACTIVA | Solo se retornan campañas ACTIVA |
| M1-U-03 | Unitario | Campañas | Recalcular métricas | Invocar recálculo para campaña con dos ofertas | Campaña con ofertas de 15000 y 25000 | Clientes = 2, monto = 40000, ticket = 20000 |
| M1-U-04 | Unitario | Ofertas | Resumen por campaña | Solicitar resumen con y sin búsqueda | Campaña con dos ofertas | Sin filtro: total = 2, monto = 40000. Con filtro: resultados acordes |
| M1-U-05 | Unitario | Clientes | Vista 360 | Consultar cliente con ofertas | Cliente con al menos una oferta | Retorna datos, campañas y ofertas del cliente |
| M1-U-06 | Unitario | Reportes | Generar CSV | Llamar endpoint de generación | Reporte CAMPANIAS, período 1 | Respuesta 200 con archivo CSV válido |
| M1-U-07 | Unitario | Seguridad | Acceso denegado | Llamar endpoint sin permiso | Token de empleado | Respuesta 403 |
| M1-E2E-01 | E2E | Dashboard | Login y visualización | Iniciar sesión como analista y navegar a dashboard | analista / analista123 | Dashboard visible con KPIs y gráficos |
| M1-E2E-02 | E2E | Campañas | Filtrado por estado | Aplicar filtro en listado de campañas | Estado ACTIVA | Tabla actualizada con campañas ACTIVA |
| M1-E2E-03 | E2E | Campañas | Recálculo de métricas | Ingresar a detalle y recalcular | Campaña CAMP-001 | Métricas actualizadas y mensaje de éxito |
| M1-E2E-04 | E2E | Ofertas | Búsqueda por documento | Buscar ofertas por DNI 12345678 | Documento 12345678 | Solo ofertas del cliente con ese DNI |
| M1-E2E-05 | E2E | Reportes | Descarga CSV | Generar reporte de campañas | Período 1 | Archivo CSV descargado con datos |
| M1-E2E-06 | E2E | Seguridad | Acceso sin permiso | Ingresar a reportes como empleado | empleado / empleado123 | Página 403 o redirección |

## Criterios de aceptación

El módulo de integración y visualización se considera aprobado cuando todas las pruebas unitarias de servicios y controladores se ejecutan correctamente, los flujos end-to-end críticos se completan sin errores, los casos negativos demuestran que los controles de seguridad funcionan, y los valores calculados en dashboard, campañas y ofertas coinciden con los datos esperados.
