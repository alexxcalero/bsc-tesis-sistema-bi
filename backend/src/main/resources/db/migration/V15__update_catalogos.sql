-- ============================================================
-- V15: Actualización de catálogos según data real del negocio
-- ============================================================

-- -----------------------------------------------------------------
-- 1. CANALES
-- -----------------------------------------------------------------

-- Migrar clientes de canales antiguos a valores por defecto nuevos
UPDATE clientes
SET canal_id = (SELECT id FROM canales WHERE codigo = 'TELEMARKETING')
WHERE canal_id IN (SELECT id FROM canales WHERE codigo IN ('SUCURSAL', 'TELEFONICO'));

UPDATE clientes
SET canal_id = (SELECT id FROM canales WHERE codigo = 'RED')
WHERE canal_id IN (SELECT id FROM canales WHERE codigo IN ('DIGITAL', 'EJECUTIVO'));

-- Eliminar canales antiguos
DELETE FROM canales WHERE codigo IN ('SUCURSAL', 'DIGITAL', 'TELEFONICO', 'EJECUTIVO');

-- Insertar canales nuevos
INSERT INTO canales (codigo, nombre, descripcion) VALUES
('TELEMARKETING', 'Telemarketing', 'Canal telemarketing'),
('RED', 'Red', 'Canal red'),
('TGESTIONA', 'TGestiona', 'Canal TGestiona'),
('TCONTAKTO', 'TContakto', 'Canal TContakto'),
('SALESLAND', 'Salesland', 'Canal Salesland'),
('BURO', 'Buro', 'Canal Buro'),
('MF', 'MF', 'Canal MF'),
('SEF', 'SEF', 'Canal SEF'),
('O2O', 'O2O', 'Canal O2O'),
('REACTIVO', 'Reactivo', 'Canal Reactivo');

-- -----------------------------------------------------------------
-- 2. PRODUCTOS Y SUBPRODUCTOS
-- -----------------------------------------------------------------

-- Insertar nuevos productos
INSERT INTO productos (codigo, nombre, descripcion) VALUES
('TARJETA_CREDITO', 'Tarjeta de Crédito', 'Tarjetas de crédito'),
('PRESTAMO_PERSONAL', 'Préstamo Personal', 'Préstamos personales'),
('COMPRA_DEUDA_PP', 'Compra de Deuda de Préstamo Personal', 'Compra de deuda de préstamo personal'),
('ADELANTO_SUELDO', 'Adelanto de Sueldo', 'Adelanto de sueldo'),
('DEPOSITO_PLAZO', 'Depósito a Plazo', 'Depósitos a plazo'),
('EXTRALINEA', 'ExtraLínea', 'Línea de crédito adicional'),
('CREDITO', 'Crédito', 'Créditos vehicular e hipotecario');

-- Insertar nuevos subproductos
INSERT INTO subproductos (codigo, nombre, descripcion, producto_id) VALUES
('PTC_PRIMERA', 'Primera Tarjeta de Crédito', 'Primera tarjeta de crédito', (SELECT id FROM productos WHERE codigo = 'TARJETA_CREDITO')),
('PTC_SEGUNDA', 'Segunda Tarjeta de Crédito', 'Segunda tarjeta de crédito', (SELECT id FROM productos WHERE codigo = 'TARJETA_CREDITO')),
('PTC_INCREMENTO', 'Incremento de Línea', 'Incremento de línea de tarjeta', (SELECT id FROM productos WHERE codigo = 'TARJETA_CREDITO')),
('PP_PRESTABONO', 'Prestabono', 'Préstamo prestabono', (SELECT id FROM productos WHERE codigo = 'PRESTAMO_PERSONAL')),
('PP_LIBRE_DISP', 'Préstamo Libre Disponibilidad', 'Préstamo libre disponibilidad', (SELECT id FROM productos WHERE codigo = 'PRESTAMO_PERSONAL')),
('PP_REENGANCHE_LD', 'Reenganche de Préstamo Libre Disponibilidad', 'Reenganche de préstamo libre disponibilidad', (SELECT id FROM productos WHERE codigo = 'PRESTAMO_PERSONAL')),
('PP_REENGANCHE_PRESTABONO', 'Reenganche Prestabono', 'Reenganche prestabono', (SELECT id FROM productos WHERE codigo = 'PRESTAMO_PERSONAL')),
('CD_PP_PRESTABONO', 'Compra de Deuda de Prestabono', 'Compra de deuda de prestabono', (SELECT id FROM productos WHERE codigo = 'COMPRA_DEUDA_PP')),
('CD_PP_LIBRE_DISP', 'Compra de Deuda de Préstamo Libre Disponibilidad', 'Compra de deuda de préstamo libre disponibilidad', (SELECT id FROM productos WHERE codigo = 'COMPRA_DEUDA_PP')),
('AS_ADELANTO', 'Adelanto de Sueldo', 'Adelanto de sueldo', (SELECT id FROM productos WHERE codigo = 'ADELANTO_SUELDO')),
('DPF_DEPOSITO', 'Depósito a Plazo Fijo', 'Depósito a plazo fijo', (SELECT id FROM productos WHERE codigo = 'DEPOSITO_PLAZO')),
('XL_NUEVA', 'Extra Linea Nueva', 'Extra línea nueva', (SELECT id FROM productos WHERE codigo = 'EXTRALINEA')),
('XL_REENGANCHE', 'Reenganche Extra Linea', 'Reenganche extra línea', (SELECT id FROM productos WHERE codigo = 'EXTRALINEA')),
('XL_CD', 'Compra de Deuda de Extra Linea', 'Compra de deuda de extra línea', (SELECT id FROM productos WHERE codigo = 'EXTRALINEA')),
('CREDITO_VEHICULAR', 'Crédito Vehicular', 'Crédito vehicular', (SELECT id FROM productos WHERE codigo = 'CREDITO')),
('CREDITO_HIPOTECARIO', 'Crédito Hipotecario', 'Crédito hipotecario', (SELECT id FROM productos WHERE codigo = 'CREDITO'));

-- Migrar campañas de subproductos antiguos a nuevos
UPDATE campanias
SET subproducto_id = (SELECT id FROM subproductos WHERE codigo = 'PP_PRESTABONO')
WHERE subproducto_id = (SELECT id FROM subproductos WHERE codigo = 'CP_ESTANDAR');

UPDATE campanias
SET subproducto_id = (SELECT id FROM subproductos WHERE codigo = 'PP_LIBRE_DISP')
WHERE subproducto_id = (SELECT id FROM subproductos WHERE codigo = 'CP_RAPIDO');

UPDATE campanias
SET subproducto_id = (SELECT id FROM subproductos WHERE codigo = 'PP_REENGANCHE_LD')
WHERE subproducto_id = (SELECT id FROM subproductos WHERE codigo = 'CP_PREMIUM');

UPDATE campanias
SET subproducto_id = (SELECT id FROM subproductos WHERE codigo = 'DPF_DEPOSITO')
WHERE subproducto_id IN (SELECT id FROM subproductos WHERE codigo IN ('AHORROS', 'DPF', 'CTA_CORRIENTE'));

UPDATE campanias
SET subproducto_id = (SELECT id FROM subproductos WHERE codigo = 'CREDITO_VEHICULAR')
WHERE subproducto_id IN (SELECT id FROM subproductos WHERE codigo IN ('AUTO_NUEVO', 'AUTO_USADO'));

UPDATE campanias
SET subproducto_id = (SELECT id FROM subproductos WHERE codigo = 'CREDITO_HIPOTECARIO')
WHERE subproducto_id IN (SELECT id FROM subproductos WHERE codigo IN ('HIP_TASA_FIJA', 'HIP_TASA_VAR'));

-- Migrar campañas de productos antiguos a nuevos
UPDATE campanias
SET producto_id = (SELECT id FROM productos WHERE codigo = 'PRESTAMO_PERSONAL')
WHERE producto_id = (SELECT id FROM productos WHERE codigo = 'CRED_PERSONAL');

UPDATE campanias
SET producto_id = (SELECT id FROM productos WHERE codigo = 'DEPOSITO_PLAZO')
WHERE producto_id = (SELECT id FROM productos WHERE codigo = 'DEPOSITOS');

UPDATE campanias
SET producto_id = (SELECT id FROM productos WHERE codigo = 'CREDITO')
WHERE producto_id IN (SELECT id FROM productos WHERE codigo IN ('CRED_AUTO', 'CRED_HIPOTECARIO'));

-- Eliminar subproductos antiguos
DELETE FROM subproductos WHERE codigo IN ('CP_ESTANDAR', 'CP_RAPIDO', 'CP_PREMIUM', 'AHORROS', 'DPF', 'CTA_CORRIENTE', 'AUTO_NUEVO', 'AUTO_USADO', 'HIP_TASA_FIJA', 'HIP_TASA_VAR');

-- Eliminar productos antiguos
DELETE FROM productos WHERE codigo IN ('CRED_PERSONAL', 'DEPOSITOS', 'CRED_AUTO', 'CRED_HIPOTECARIO');

-- -----------------------------------------------------------------
-- 3. AGENCIAS
-- -----------------------------------------------------------------

INSERT INTO agencias (codigo, nombre, descripcion, zona_id) VALUES
('AGC-LIMA-SURCO', 'Agencia Surco', 'Agencia Surco', (SELECT id FROM zonas WHERE codigo = 'LIMA')),
('AGC-LIMA-MOLINA', 'Agencia La Molina', 'Agencia La Molina', (SELECT id FROM zonas WHERE codigo = 'LIMA'));
