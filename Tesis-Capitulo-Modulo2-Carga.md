# 6.2.3. Implementación del módulo de captura digital de datos y automatización de registros

## Introducción

El presente apartado describe la implementación del módulo de captura digital de datos y automatización de registros, correspondiente al segundo módulo funcional del Sistema BI Bancario. Este módulo permite a los usuarios registrar archivos de carga masiva, validar su contenido de forma asíncrona, publicar los registros válidos y consultar el historial, errores y estadísticas asociadas a cada proceso de carga.

La captura digital se realiza mediante la carga de archivos en formato CSV, los cuales son almacenados en disco y procesados por un componente asíncrono que valida cada fila y genera los registros de detalle y error correspondientes. La automatización de registros se evidencia en el cambio automático de estados del proceso de carga y en el recálculo de métricas de campañas cuando un proceso es publicado exitosamente.

## Requerimientos funcionales

El módulo de captura digital y automatización de registros satisface los siguientes requerimientos funcionales:

- Registro de procesos de carga con archivo adjunto.
- Validación asíncrona del contenido de los archivos.
- Publicación de cargas validadas o con errores.
- Listado paginado y filtrado de procesos de carga.
- Consulta de resumen estadístico de cargas.
- Visualización de detalles, errores y registros procesados de una carga.
- Consulta de usuarios responsables de cargas.
- Recálculo de métricas de campañas tras la publicación de una carga.
- Control de acceso basado en permisos.

## Diseño del módulo

El diseño del módulo se fundamenta en una arquitectura desacoplada que separa el registro síncrono del archivo del procesamiento asíncrono de su contenido. Esta separación permite que el usuario reciba una respuesta inmediata tras subir un archivo, mientras el sistema realiza la validación en segundo plano sin bloquear la interfaz.

El frontend organiza las funcionalidades en varias pantallas especializadas: bandeja de cargas, registro de nueva carga, validación de archivos, publicación de cargas, consulta de resultados, historial y seguimiento de procesos. Cada pantalla accede a los endpoints REST del backend según los permisos del usuario.

El backend se estructura en subsistemas especializados para cada concepto del dominio: procesos de carga, archivos de carga, detalles de carga, errores de carga y resultados de carga. Cada subsistema cuenta con su propia entidad, repositorio, objeto de transferencia y, en algunos casos, servicio específico.

## Tecnologías utilizadas

El módulo comparte el stack tecnológico general del sistema. En el frontend se utiliza Next.js con TypeScript, Tailwind CSS y shadcn/ui. En el backend se utiliza Java 21 con Spring Boot, Spring Data JPA, Spring Security con JWT, PostgreSQL para producción y H2 para pruebas.

Para el procesamiento asíncrono se utilizan eventos de Spring y la anotación de ejecución asíncrona, lo cual permite desacoplar el registro del archivo de su validación. El almacenamiento de archivos se implementó mediante un servicio de almacenamiento local basado en el sistema de archivos, configurable a través de propiedades de la aplicación.

## Implementación del backend

### Proceso de carga

El proceso de carga es la entidad principal del módulo. Cada vez que un usuario registra una carga, el sistema genera un código único con formato `CARGA-XXXXXXXX`, asigna el estado inicial `PENDIENTE`, almacena el archivo físico y persiste la información del archivo cargado. El código se genera a partir de un identificador único universal para evitar colisiones.

El servicio de procesos de carga implementa las operaciones de registro, consulta, validación, publicación y resumen estadístico. La consulta de listado soporta filtros por tipo de carga, estados, usuario responsable, rango de fechas y texto de búsqueda. La búsqueda abarca el código del proceso, el nombre de usuario responsable, el nombre del archivo y los datos personales del usuario.

### Validación asíncrona

La validación del archivo se realiza de forma asíncrona mediante un procesador que escucha eventos de carga registrada. Una vez que el proceso se persiste en estado `PENDIENTE`, se publica un evento que es capturado por un listener transaccional. Este listener delega la ejecución en un método asíncrono que realiza la validación línea por línea.

Durante el procesamiento, el sistema cambia el estado del proceso a `EN_VALIDACION`. Luego, para cada fila del archivo, verifica que cumpla con las reglas de validación definidas. Las filas válidas se registran como detalles de carga marcados como válidos, mientras que las filas inválidas generan registros de error y detalles marcados como inválidos. Al finalizar, el proceso pasa a estado `VALIDADA` si todas las filas son válidas, o a `CON_ERRORES` si existe al menos una fila inválida. Si ocurre una excepción irrecuperable durante el procesamiento, el proceso pasa a estado `RECHAZADA`.

### Reglas de validación

Las reglas de validación implementadas en la primera versión del módulo son generales y se aplican a cualquier tipo de carga. Cada fila del archivo debe contener al menos dos columnas y ninguna de las columnas puede estar vacía. Si una fila no cumple con estas condiciones, se registra un error de tipo `VALIDACION` asociado al campo general de la fila.

Esta validación genérica permite poner en funcionamiento el flujo completo de registro, validación y publicación, dejando pendiente la implementación de validaciones específicas por tipo de carga en futuras iteraciones del sistema.

### Publicación de cargas

La publicación es la operación que finaliza el ciclo de vida de un proceso de carga. Únicamente se permite publicar procesos que se encuentren en estado `VALIDADA` o `CON_ERRORES`. Al publicar, el sistema cambia el estado a `PUBLICADA`, actualiza el resultado de carga con la cantidad de registros procesados y recalcula las métricas de la campaña asociada.

El recálculo de métricas se realiza invocando un servicio del módulo de campañas, el cual busca la campaña vinculada al proceso de carga y recalcula sus indicadores a partir de las ofertas asociadas. Esta comunicación entre módulos se realiza de manera desacoplada, respetando la responsabilidad de cada dominio.

### Resumen estadístico

El resumen estadístico de cargas calcula los totales de registros, registros válidos y registros inválidos aplicando los mismos filtros disponibles en el listado. Para evitar problemas de inferencia de tipos con parámetros nulos en PostgreSQL, el cálculo se implementó mediante Criteria API, construyendo la consulta dinámicamente según los filtros presentes.

## Implementación del frontend

El frontend del módulo se organiza en varias pantallas accesibles desde el menú principal. Cada pantalla corresponde a una etapa del ciclo de vida del proceso de carga.

### Pantallas principales

La bandeja de cargas permite visualizar todos los procesos registrados, aplicar filtros y acceder al detalle de cada uno. La pantalla de registro permite crear una nueva carga seleccionando el tipo, ingresando observaciones y adjuntando el archivo CSV. La pantalla de validación muestra los procesos que requieren revisión y permite iniciar la validación. La pantalla de publicación permite confirmar la publicación de una carga validada. Las pantallas de resultados, historial y seguimiento permiten consultar el estado final, los errores y la trazabilidad de cada proceso.

### Componentes reutilizables

Se reutilizan los componentes de paginación, tarjetas de indicadores y tablas desarrollados para el primer módulo, garantizando la consistencia visual del sistema. Además, se implementaron componentes específicos para la carga de archivos, la visualización de estados con badges de color y la presentación de errores de validación.

### Gestión de estados asíncronos

Dado que la validación de archivos es asíncrona, el frontend debe reflejar los cambios de estado del proceso. Las pantallas de bandeja y seguimiento consultan periódicamente el estado del proceso para actualizar la interfaz cuando el procesamiento finaliza. Esto permite al usuario observar la transición desde `PENDIENTE` hasta `VALIDADA`, `CON_ERRORES` o `RECHAZADA`.

## Flujos principales

### Flujo de registro de carga

El usuario accede a la pantalla de registro, selecciona el tipo de carga, ingresa observaciones opcionales y selecciona un archivo CSV. Al enviar el formulario, el frontend construye una solicitud multipart que incluye los datos del proceso y el archivo. El backend recibe la solicitud, persiste el proceso en estado `PENDIENTE`, almacena el archivo físico y publica el evento de carga registrada.

### Flujo de validación asíncrona

Tras el registro, el listener de eventos desencadena el procesamiento asíncronamente. El sistema lee el archivo línea por línea, valida cada fila y genera los registros de detalle y error correspondientes. Al finalizar, actualiza el estado del proceso y el resultado de carga. El usuario puede consultar el avance refrescando la pantalla de seguimiento.

### Flujo de publicación

Cuando el proceso se encuentra en estado `VALIDADA` o `CON_ERRORES`, el usuario con permisos de publicación accede a la pantalla de publicación. El sistema muestra un resumen de registros válidos e inválidos. Al confirmar, el backend cambia el estado a `PUBLICADA`, actualiza el resultado de carga y recalcula las métricas de la campaña asociada.

### Flujo de consulta de errores

El usuario accede al detalle de un proceso en estado `CON_ERRORES` y selecciona la pestaña de errores. El sistema lista los errores de validación con el número de fila, el campo afectado y el mensaje descriptivo. Esto permite al usuario corregir el archivo y volver a registrarlo.

## Decisiones de diseño y soluciones técnicas

### Procesamiento asíncrono desacoplado

Se decidió utilizar eventos de Spring para separar el registro síncrono del procesamiento asíncrono. Esta decisión mejora la experiencia del usuario al proporcionar una respuesta inmediata tras la carga del archivo, y permite escalar el procesamiento de validaciones de forma independiente.

### Almacenamiento local de archivos

El almacenamiento de archivos se implementó mediante un servicio local basado en el sistema de archivos. El servicio genera un nombre único para cada archivo y lo guarda en un directorio configurable. Esta solución es suficiente para el alcance actual del sistema y puede extenderse a almacenamiento en la nube sin modificar la lógica de negocio.

### Parseo manual de CSV

El parseo del archivo CSV se implementó de manera manual utilizando lectura de líneas y separación por comas. Esta solución es adecuada para archivos simples sin comillas ni caracteres especiales en los delimitadores. Se prefirió esta aproximación para mantener el sistema libre de dependencias adicionales en la primera versión.

### Especificaciones JPA para filtros dinámicos

El listado de cargas requiere filtros dinámicos que combinan múltiples campos y entidades. Para ello se implementó una especificación JPA que construye predicados condicionalmente según los parámetros recibidos. Esto evita la creación de múltiples consultas estáticas y facilita el mantenimiento.

### Criteria API para resumen estadístico

El resumen estadístico se implementó con Criteria API para evitar problemas con parámetros nulos en el motor de base de datos. Esta técnica permite construir la consulta de agregación agregando únicamente los predicados correspondientes a filtros con valores, garantizando la correcta ejecución en PostgreSQL.

## Problemas encontrados y soluciones

Durante la implementación se presentaron diversos desafíos técnicos. Uno de ellos fue la correcta gestión de parámetros nulos en las consultas de resumen estadístico, lo cual generaba errores de inferencia de tipos en PostgreSQL. La solución consistió en migrar el cálculo del resumen a Criteria API, donde los predicados se agregan dinámicamente.

Otro desafío fue la presentación de estados asíncronos en el frontend. Se resolvió implementando consultas periódicas al endpoint de detalle del proceso, permitiendo que la interfaz se actualice automáticamente cuando el estado cambia.

Finalmente, se ajustó la comunicación entre el módulo de carga y el módulo de campañas para que la publicación de una carga recalcule correctamente las métricas de la campaña vinculada, manteniendo la consistencia entre ambos módulos.

---

# 6.2.4. Pruebas del módulo de captura digital de datos y automatización de registros

## Estrategia de pruebas

Las pruebas del módulo de captura digital y automatización de registros tienen como objetivo verificar el correcto funcionamiento del ciclo completo de vida de un proceso de carga, desde el registro del archivo hasta la publicación y recálculo de métricas. La estrategia contempla pruebas unitarias en el backend, pruebas de integración de endpoints y pruebas end-to-end que simulan la interacción del usuario con el sistema.

Las pruebas unitarias se centran en los servicios y controladores, utilizando JUnit 5, Mockito y Spring Security Test. Las pruebas de integración verifican el comportamiento de los endpoints REST y el procesamiento asíncrono con la base de datos H2. Las pruebas end-to-end se ejecutan con Playwright, simulando el flujo completo de carga, validación y publicación.

## Ambiente de pruebas

El ambiente de pruebas utiliza el perfil `test` del backend con una base de datos H2 en memoria. Los archivos de prueba se almacenan en un directorio temporal durante la ejecución de los tests. El frontend se ejecuta localmente en `http://localhost:3000` para las pruebas end-to-end.

## Usuarios y datos de prueba

Para las pruebas se utilizan usuarios con diferentes roles que representan los permisos necesarios para operar el módulo.

| Usuario | Rol | Permisos relevantes |
|---|---|---|
| admin | Administrador | Todos los permisos de carga |
| especialista | Especialista | Crear, validar y publicar cargas |
| analista | Analista | Visualizar cargas únicamente |

Además, se definen archivos de prueba con contenido controlado para cubrir los distintos escenarios del módulo.

| Archivo | Contenido | Propósito |
|---|---|---|
| campanias_validas.csv | Tres filas completas | Flujo feliz de validación y publicación |
| campanias_con_errores.csv | Una fila con celda vacía | Validación con errores |
| vacio.csv | Archivo sin contenido | Caso negativo |
| una_columna.csv | Solo encabezado | Caso de borde |
| formato_invalido.txt | Contenido de texto plano | Caso negativo de tipo de archivo |

## Pruebas unitarias

### Prueba de registro de carga

Se verifica que el registro de una carga genere un código único, almacene el archivo y deje el proceso en estado `PENDIENTE`. También se comprueba que se persista la información del archivo cargado.

### Prueba de validación asíncrona exitosa

Se prueba que el procesador asíncrono valide correctamente un archivo CSV válido y deje el proceso en estado `VALIDADA`. Se verifica que los totales de registros válidos e inválidos sean correctos y que no existan errores registrados.

### Prueba de validación asíncrona con errores

Se prueba que el procesador detecte filas con campos vacíos y deje el proceso en estado `CON_ERRORES`. Se verifica que se registren errores de tipo `VALIDACION` y que el conteo de registros inválidos sea mayor a cero.

### Prueba de publicación de carga válida

Se verifica que una carga en estado `VALIDADA` pueda publicarse correctamente, pasando a estado `PUBLICADA`, actualizando el resultado de carga y recalculando las métricas de la campaña asociada.

### Prueba de publicación desde estado inválido

Se prueba que no sea posible publicar una carga que se encuentre en estado `PENDIENTE`. El sistema debe lanzar una excepción de negocio y mantener el estado original del proceso.

### Prueba de resumen estadístico con filtros

Se verifica que el resumen estadístico calcule correctamente los totales de registros, válidos e inválidos, tanto sin filtros como aplicando filtros por estado y tipo de carga.

### Prueba de control de acceso

Se verifica que un usuario con solo permiso de visualización reciba un código de estado 403 al intentar publicar una carga.

## Pruebas end-to-end

### Flujo completo de carga, validación y publicación

El usuario inicia sesión como especialista, registra una nueva carga con el archivo `campanias_validas.csv`, espera la validación y publica el proceso. Se verifica que el estado final sea `PUBLICADA` y que las métricas de la campaña asociada se hayan actualizado.

### Visualización del resumen estadístico

El usuario accede a la pantalla de resultados y verifica que las tarjetas de totales muestren los valores correctos de registros procesados, válidos e inválidos.

### Carga con archivo vacío

El usuario intenta registrar un archivo vacío. El sistema debe mostrar un mensaje de error indicando que el archivo no puede estar vacío y no debe crear un proceso de carga.

### Filtrado de cargas por estado

El usuario accede a la bandeja de cargas, selecciona el filtro por estado `PUBLICADA` y verifica que la tabla muestre únicamente los procesos publicados.

### Consulta de errores de validación

El usuario accede al detalle de una carga en estado `CON_ERRORES`, selecciona la pestaña de errores y verifica que se listen los errores con número de fila, campo y mensaje descriptivo.

### Caso negativo de publicación sin permisos

El usuario inicia sesión como analista e intenta acceder a la opción de publicar una carga. El sistema no debe mostrar el botón de publicación, y cualquier intento directo debe ser rechazado con acceso denegado.

## Casos de prueba detallados

A continuación se presenta el detalle de los casos de prueba más representativos del módulo.

| ID | Tipo | Funcionalidad | Descripción | Pasos | Datos de prueba | Resultado esperado |
|---|---|---|---|---|---|---|
| M2-U-01 | Unitario | Registro de carga | Generar código único y estado inicial | Llamar registrarCarga | Archivo válido, tipo id 1, usuario id 1 | Código `CARGA-XXXXXXXX`, estado `PENDIENTE` |
| M2-U-02 | Unitario | Validación asíncrona | Procesar archivo válido | Publicar evento y esperar procesamiento | campanias_validas.csv | Estado `VALIDADA`, 3 registros válidos |
| M2-U-03 | Unitario | Validación con errores | Detectar fila con celda vacía | Procesar archivo con error | campanias_con_errores.csv | Estado `CON_ERRORES`, error registrado |
| M2-U-04 | Unitario | Publicación | Publicar carga validada | Llamar publicarCarga | Carga `VALIDADA` | Estado `PUBLICADA`, métricas recalculadas |
| M2-U-05 | Unitario | Publicación inválida | Impedir publicación desde PENDIENTE | Llamar publicarCarga | Carga `PENDIENTE` | Excepción, estado sin cambios |
| M2-U-06 | Unitario | Resumen estadístico | Calcular totales con filtros | Llamar resumenCargas | Sin filtros y filtro `PUBLICADA` | Totales acordes al filtro aplicado |
| M2-U-07 | Unitario | Seguridad | Publicación sin permiso | Llamar endpoint con token de analista | Token de analista | Respuesta 403 |
| M2-E2E-01 | E2E | Flujo completo | Carga, validación y publicación | Registrar, validar y publicar | especialista, campanias_validas.csv | Estado `PUBLICADA`, éxito |
| M2-E2E-02 | E2E | Resumen | Visualizar totales | Navegar a resultados | Cargas publicadas | Tarjetas con totales correctos |
| M2-E2E-03 | E2E | Caso negativo | Archivo vacío | Registrar vacio.csv | vacio.csv | Mensaje de error, sin proceso creado |
| M2-E2E-04 | E2E | Filtros | Filtrar por estado | Aplicar filtro `PUBLICADA` | Estado `PUBLICADA` | Solo cargas publicadas |
| M2-E2E-05 | E2E | Errores | Consultar errores de validación | Ingresar a pestaña de errores | Carga `CON_ERRORES` | Lista de errores visible |
| M2-E2E-06 | E2E | Seguridad | Publicación sin permisos | Ingresar como analista | analista / analista123 | Botón publicar no visible |

## Criterios de aceptación

El módulo de captura digital y automatización de registros se considera aprobado cuando todas las pruebas unitarias se ejecutan correctamente, los flujos end-to-end de registro, validación y publicación se completan sin errores, el procesamiento asíncrono actualiza correctamente los estados del proceso, los errores de validación se registran y pueden consultarse, los controles de seguridad impiden acciones no autorizadas, y las métricas de campañas se recalculan tras la publicación de una carga.
