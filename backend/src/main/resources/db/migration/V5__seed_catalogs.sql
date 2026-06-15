-- Tipos de cliente
INSERT INTO tipos_cliente (codigo, nombre, descripcion) VALUES
('NATURAL', 'Persona Natural', 'Cliente persona natural'),
('JURIDICA', 'Persona Jurídica', 'Cliente empresa u organización');

-- Tipos de documento
INSERT INTO tipos_documento (codigo, nombre, descripcion) VALUES
('DNI', 'DNI', 'Documento Nacional de Identidad'),
('CE', 'Carnet de Extranjería', 'Carnet de extranjería'),
('RUC', 'RUC', 'Registro Único de Contribuyente'),
('PASAPORTE', 'Pasaporte', 'Pasaporte');

-- Segmentos
INSERT INTO segmentos (codigo, nombre, descripcion) VALUES
('MASS', 'Mass', 'Segmento masivo'),
('TOP_OF_MASS', 'Top of Mass', 'Segmento top of mass'),
('REGULAR', 'Regular', 'Segmento regular'),
('PREMIUM', 'Premium', 'Segmento premium'),
('BEYOND', 'Beyond', 'Segmento beyond');

-- Zonas
INSERT INTO zonas (codigo, nombre, descripcion) VALUES
('NORTE', 'Zona Norte', 'Zona norte del país'),
('SUR', 'Zona Sur', 'Zona sur del país'),
('ESTE', 'Zona Este', 'Zona este del país'),
('OESTE', 'Zona Oeste', 'Zona oeste del país'),
('LIMA', 'Lima Metropolitana', 'Lima y Callao');

-- Agencias
INSERT INTO agencias (codigo, nombre, descripcion, zona_id) VALUES
('AGC-LIMA-001', 'Agencia Lima Centro', 'Agencia principal Lima', (SELECT id FROM zonas WHERE codigo = 'LIMA')),
('AGC-LIMA-002', 'Agencia Lima Norte', 'Agencia Lima Norte', (SELECT id FROM zonas WHERE codigo = 'LIMA')),
('AGC-NORTE-001', 'Agencia Trujillo', 'Agencia Trujillo', (SELECT id FROM zonas WHERE codigo = 'NORTE')),
('AGC-SUR-001', 'Agencia Arequipa', 'Agencia Arequipa', (SELECT id FROM zonas WHERE codigo = 'SUR'));

-- Canales
INSERT INTO canales (codigo, nombre, descripcion) VALUES
('SUCURSAL', 'Sucursal', 'Atención en agencia'),
('DIGITAL', 'Digital', 'Canales digitales'),
('TELEFONICO', 'Telefónico', 'Call center'),
('EJECUTIVO', 'Ejecutivo de Cuenta', 'Ejecutivo de cuenta');

-- Productos
INSERT INTO productos (codigo, nombre, descripcion) VALUES
('CRED_PERSONAL', 'Crédito Personal', 'Créditos personales para diversos propósitos'),
('DEPOSITOS', 'Depósitos', 'Productos de ahorro y depósitos'),
('CRED_AUTO', 'Crédito Automotriz', 'Financiamiento para compra de vehículos'),
('CRED_HIPOTECARIO', 'Crédito Hipotecario', 'Financiamiento inmobiliario');

-- Subproductos
INSERT INTO subproductos (codigo, nombre, descripcion, producto_id) VALUES
('CP_ESTANDAR', 'Crédito Personal Estándar', 'Crédito personal estándar', (SELECT id FROM productos WHERE codigo = 'CRED_PERSONAL')),
('CP_RAPIDO', 'Crédito Personal Rápido', 'Crédito personal rápido', (SELECT id FROM productos WHERE codigo = 'CRED_PERSONAL')),
('CP_PREMIUM', 'Crédito Personal Premium', 'Crédito personal premium', (SELECT id FROM productos WHERE codigo = 'CRED_PERSONAL')),
('AHORROS', 'Cuenta de Ahorros', 'Cuenta de ahorros', (SELECT id FROM productos WHERE codigo = 'DEPOSITOS')),
('DPF', 'Depósito a Plazo', 'Depósito a plazo fijo', (SELECT id FROM productos WHERE codigo = 'DEPOSITOS')),
('CTA_CORRIENTE', 'Cuenta Corriente', 'Cuenta corriente', (SELECT id FROM productos WHERE codigo = 'DEPOSITOS')),
('AUTO_NUEVO', 'Crédito Auto Nuevo', 'Financiamiento auto nuevo', (SELECT id FROM productos WHERE codigo = 'CRED_AUTO')),
('AUTO_USADO', 'Crédito Auto Usado', 'Financiamiento auto usado', (SELECT id FROM productos WHERE codigo = 'CRED_AUTO')),
('HIP_TASA_FIJA', 'Hipoteca Tasa Fija', 'Hipoteca tasa fija', (SELECT id FROM productos WHERE codigo = 'CRED_HIPOTECARIO')),
('HIP_TASA_VAR', 'Hipoteca Tasa Variable', 'Hipoteca tasa variable', (SELECT id FROM productos WHERE codigo = 'CRED_HIPOTECARIO'));

-- Filtros de oferta
INSERT INTO filtros_oferta (codigo, nombre, descripcion) VALUES
('SIN_DEUDA', 'Sin deuda', 'Clientes sin deuda actual'),
('BUEN_HISTORIAL', 'Buen historial crediticio', 'Clientes con buen historial'),
('ALTO_POTENCIAL', 'Alto poder adquisitivo', 'Clientes con alto poder adquisitivo'),
('REACTIVACION', 'Reactivación', 'Clientes para reactivación');

-- Períodos
INSERT INTO periodos (codigo, nombre, descripcion) VALUES
('2024-11', 'Noviembre 2024', 'Noviembre 2024'),
('2024-12', 'Diciembre 2024', 'Diciembre 2024'),
('2025-01', 'Enero 2025', 'Enero 2025'),
('2025-02', 'Febrero 2025', 'Febrero 2025'),
('2025-03', 'Marzo 2025', 'Marzo 2025');

-- Tipos de carga
INSERT INTO tipos_carga (codigo, nombre, descripcion) VALUES
('CAMPANIAS', 'Campañas', 'Carga de campañas comerciales'),
('CLIENTES', 'Clientes', 'Carga de clientes'),
('OFERTAS', 'Ofertas', 'Carga de ofertas');

-- Estados de carga
INSERT INTO estados_carga (codigo, nombre, descripcion) VALUES
('PENDIENTE', 'Pendiente', 'Carga registrada, pendiente de procesamiento'),
('EN_VALIDACION', 'En Validación', 'Carga en proceso de validación'),
('VALIDADA', 'Validada', 'Carga validada correctamente'),
('CON_ERRORES', 'Con Errores', 'Carga con errores de validación'),
('PUBLICADA', 'Publicada', 'Carga publicada en base de datos'),
('RECHAZADA', 'Rechazada', 'Carga rechazada');
