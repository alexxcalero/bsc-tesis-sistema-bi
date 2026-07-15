INSERT INTO reportes (codigo, nombre, descripcion, formato, activo, icono)
VALUES
    ('campanias', 'Reporte de Campañas', 'Listado de campañas con agregaciones de clientes y montos', 'csv,pdf', TRUE, 'BarChart3'),
    ('ofertas', 'Reporte de Ofertas', 'Listado de ofertas con montos, tasas y agregaciones', 'csv,pdf', TRUE, 'TrendingUp'),
    ('clientes', 'Reporte de Clientes', 'Listado de clientes con ofertas y montos asociados', 'csv,pdf', TRUE, 'FileText'),
    ('dashboard', 'Resumen Ejecutivo', 'Resumen ejecutivo de KPIs y métricas del dashboard', 'pdf', TRUE, 'PieChart');

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'periodoId', 'Período', 'select', '/catalogos/periodos', 1
FROM reportes r WHERE r.codigo = 'campanias';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'productoId', 'Producto', 'select', '/catalogos/productos', 2
FROM reportes r WHERE r.codigo = 'campanias';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'estado', 'Estado', 'select', NULL, 3
FROM reportes r WHERE r.codigo = 'campanias';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'campaniaId', 'Campaña', 'select', '/campanias', 1
FROM reportes r WHERE r.codigo = 'ofertas';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'clienteId', 'Cliente', 'select', '/clientes', 2
FROM reportes r WHERE r.codigo = 'ofertas';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'estado', 'Estado', 'select', NULL, 3
FROM reportes r WHERE r.codigo = 'ofertas';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'fechaDesde', 'Fecha desde', 'date', NULL, 4
FROM reportes r WHERE r.codigo = 'ofertas';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'fechaHasta', 'Fecha hasta', 'date', NULL, 5
FROM reportes r WHERE r.codigo = 'ofertas';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'segmentoId', 'Segmento', 'select', '/catalogos/segmentos', 1
FROM reportes r WHERE r.codigo = 'clientes';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'zonaId', 'Zona', 'select', '/catalogos/zonas', 2
FROM reportes r WHERE r.codigo = 'clientes';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'agenciaId', 'Agencia', 'select', '/catalogos/agencias', 3
FROM reportes r WHERE r.codigo = 'clientes';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'periodoId', 'Período', 'select', '/catalogos/periodos', 4
FROM reportes r WHERE r.codigo = 'clientes';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'fechaDesde', 'Fecha desde', 'date', NULL, 1
FROM reportes r WHERE r.codigo = 'dashboard';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'fechaHasta', 'Fecha hasta', 'date', NULL, 2
FROM reportes r WHERE r.codigo = 'dashboard';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'estadoCampania', 'Estado campaña', 'select', NULL, 3
FROM reportes r WHERE r.codigo = 'dashboard';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'productoId', 'Producto', 'select', '/catalogos/productos', 4
FROM reportes r WHERE r.codigo = 'dashboard';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'periodoId', 'Período', 'select', '/catalogos/periodos', 5
FROM reportes r WHERE r.codigo = 'dashboard';

INSERT INTO reporte_filtros (reporte_id, codigo, nombre, tipo, catalogo_endpoint, orden)
SELECT r.id, 'segmentoId', 'Segmento cliente', 'select', '/catalogos/segmentos', 6
FROM reportes r WHERE r.codigo = 'dashboard';
