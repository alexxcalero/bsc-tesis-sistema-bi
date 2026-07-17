-- ============================================================
-- Reset de datos demo después de pruebas CSV
-- Conserva datos existentes en tablas del Módulo 2
-- Borra solo registros de pruebas (ID > valor actual)
-- Re-siembra tablas de negocio desde V16
-- Vuelve a aplicar V17 y V18
-- ============================================================

-- -----------------------------------------------------------------
-- 1. LIMPIAR DATOS DE PRUEBAS DEL MÓDULO 2 (solo IDs nuevos)
-- Valores actuales al momento de crear este script:
--   procesos_carga:  max id = 10
--   archivos_carga:  max id = 10
--   detalles_carga:  max id = 38
--   errores_carga:   max id = 18
--   resultados_carga: max id = 8
-- -----------------------------------------------------------------
DELETE FROM errores_carga WHERE id > 18;
DELETE FROM detalles_carga WHERE id > 38;
DELETE FROM archivos_carga WHERE id > 10;
DELETE FROM resultados_carga WHERE id > 8;
DELETE FROM procesos_carga WHERE id > 10;

-- -----------------------------------------------------------------
-- 2. LIMPIAR TABLAS DE NEGOCIO (se re-siembran a continuación)
-- -----------------------------------------------------------------
DELETE FROM ofertas;
DELETE FROM campanias;
DELETE FROM clientes;

-- -----------------------------------------------------------------
-- 3. INSERTAR CLIENTES DEMO (8)
-- -----------------------------------------------------------------
INSERT INTO clientes (primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento, correo, telefono, fecha_nacimiento, segmento_id, zona_id, agencia_id, canal_id, tipo_cliente_id)
VALUES
('Carlos',   'Alberto', 'Mendoza', 'García',
 (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '20202021',
 'carlos.mendoza@email.com', '987654321', '1985-03-15',
 (SELECT id FROM segmentos WHERE codigo = 'MASS'),
 (SELECT id FROM zonas WHERE codigo = 'LIMA'),
 (SELECT id FROM agencias WHERE codigo = 'AGC-LIMA-001'),
 (SELECT id FROM canales WHERE codigo = 'RED'),
 (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),

('Ana',     'María',   'Torres',  'López',
 (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '20202022',
 'ana.torres@email.com', '987654322', '1990-07-22',
 (SELECT id FROM segmentos WHERE codigo = 'PREMIUM'),
 (SELECT id FROM zonas WHERE codigo = 'NORTE'),
 (SELECT id FROM agencias WHERE codigo = 'AGC-NORTE-001'),
 (SELECT id FROM canales WHERE codigo = 'TELEMARKETING'),
 (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),

('Luis',    'Enrique', 'Sánchez', 'Díaz',
 (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '20202023',
 'luis.sanchez@email.com', '987654323', '1978-11-05',
 (SELECT id FROM segmentos WHERE codigo = 'REGULAR'),
 (SELECT id FROM zonas WHERE codigo = 'SUR'),
 (SELECT id FROM agencias WHERE codigo = 'AGC-SUR-001'),
 (SELECT id FROM canales WHERE codigo = 'TGESTIONA'),
 (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),

('Rosa',    'Patricia','Vega',    'Castro',
 (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '20202024',
 'rosa.vega@email.com', '987654324', '1995-01-30',
 (SELECT id FROM segmentos WHERE codigo = 'TOP_OF_MASS'),
 (SELECT id FROM zonas WHERE codigo = 'ESTE'),
 (SELECT id FROM agencias WHERE codigo = 'AGC-LIMA-SURCO'),
 (SELECT id FROM canales WHERE codigo = 'TCONTAKTO'),
 (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),

('Miguel',  'Ángel',  'Ramírez', 'Flores',
 (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '20202025',
 'miguel.ramirez@email.com', '987654325', '1982-09-12',
 (SELECT id FROM segmentos WHERE codigo = 'BEYOND'),
 (SELECT id FROM zonas WHERE codigo = 'OESTE'),
 (SELECT id FROM agencias WHERE codigo = 'AGC-LIMA-002'),
 (SELECT id FROM canales WHERE codigo = 'SALESLAND'),
 (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),

('Elena',   'Sofía',  'Castillo','Morales',
 (SELECT id FROM tipos_documento WHERE codigo = 'CE'), 'CE100001',
 'elena.castillo@email.com', '987654326', '1993-04-18',
 (SELECT id FROM segmentos WHERE codigo = 'PREMIUM'),
 (SELECT id FROM zonas WHERE codigo = 'LIMA'),
 (SELECT id FROM agencias WHERE codigo = 'AGC-LIMA-MOLINA'),
 (SELECT id FROM canales WHERE codigo = 'BURO'),
 (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),

('Diego',   'Fernando','Herrera', 'Rivas',
 (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '20202027',
 'diego.herrera@email.com', '987654327', '1988-06-25',
 (SELECT id FROM segmentos WHERE codigo = 'REGULAR'),
 (SELECT id FROM zonas WHERE codigo = 'LIMA'),
 (SELECT id FROM agencias WHERE codigo = 'AGC-LIMA-001'),
 (SELECT id FROM canales WHERE codigo = 'MF'),
 (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),

('Servicios Generales del Perú', NULL, 'SAC', NULL,
 (SELECT id FROM tipos_documento WHERE codigo = 'RUC'), '20123456789',
 'contacto@sgpsac.pe', '987654328', '2000-01-01',
 (SELECT id FROM segmentos WHERE codigo = 'REGULAR'),
 (SELECT id FROM zonas WHERE codigo = 'LIMA'),
 (SELECT id FROM agencias WHERE codigo = 'AGC-LIMA-002'),
 (SELECT id FROM canales WHERE codigo = 'RED'),
 (SELECT id FROM tipos_cliente WHERE codigo = 'JURIDICA'));

-- -----------------------------------------------------------------
-- 4. INSERTAR CAMPAÑAS DEMO (8)
-- -----------------------------------------------------------------
INSERT INTO campanias (codigo, nombre, descripcion, fecha_inicio, fecha_fin, estado, periodo_id, producto_id, subproducto_id, clientes_alcanzados, monto_ofertado, ticket_promedio)
VALUES
('CAMP-2025-04-TARJETA_CREDITO', 'Campaña Tarjeta de Crédito Abril 2025',
 'Campaña de tarjeta de crédito para abril 2025',
 '2025-04-01', '2025-04-30', 'INACTIVA',
 (SELECT id FROM periodos WHERE codigo = '2025-04'),
 (SELECT id FROM productos WHERE codigo = 'TARJETA_CREDITO'),
 (SELECT id FROM subproductos WHERE codigo = 'PTC_PRIMERA'), 0, 0, 0),

('CAMP-2025-04-PRESTAMO_PERSONAL', 'Campaña Préstamo Personal Abril 2025',
 'Campaña de préstamo personal para abril 2025',
 '2025-04-01', '2025-04-30', 'INACTIVA',
 (SELECT id FROM periodos WHERE codigo = '2025-04'),
 (SELECT id FROM productos WHERE codigo = 'PRESTAMO_PERSONAL'),
 (SELECT id FROM subproductos WHERE codigo = 'PP_PRESTABONO'), 0, 0, 0),

('CAMP-2025-05-DEPOSITO_PLAZO', 'Campaña Depósito a Plazo Mayo 2025',
 'Campaña de depósito a plazo para mayo 2025',
 '2025-05-01', '2025-05-31', 'INACTIVA',
 (SELECT id FROM periodos WHERE codigo = '2025-05'),
 (SELECT id FROM productos WHERE codigo = 'DEPOSITO_PLAZO'),
 (SELECT id FROM subproductos WHERE codigo = 'DPF_DEPOSITO'), 0, 0, 0),

('CAMP-2025-05-CREDITO', 'Campaña Crédito Vehicular Mayo 2025',
 'Campaña de crédito vehicular para mayo 2025',
 '2025-05-01', '2025-05-31', 'INACTIVA',
 (SELECT id FROM periodos WHERE codigo = '2025-05'),
 (SELECT id FROM productos WHERE codigo = 'CREDITO'),
 (SELECT id FROM subproductos WHERE codigo = 'CREDITO_VEHICULAR'), 0, 0, 0),

('CAMP-2025-06-EXTRALINEA', 'Campaña ExtraLínea Junio 2025',
 'Campaña de extra línea para junio 2025',
 '2025-06-01', '2025-06-30', 'INACTIVA',
 (SELECT id FROM periodos WHERE codigo = '2025-06'),
 (SELECT id FROM productos WHERE codigo = 'EXTRALINEA'),
 (SELECT id FROM subproductos WHERE codigo = 'XL_NUEVA'), 0, 0, 0),

('CAMP-2025-06-ADELANTO_SUELDO', 'Campaña Adelanto de Sueldo Junio 2025',
 'Campaña de adelanto de sueldo para junio 2025',
 '2025-06-01', '2025-06-30', 'INACTIVA',
 (SELECT id FROM periodos WHERE codigo = '2025-06'),
 (SELECT id FROM productos WHERE codigo = 'ADELANTO_SUELDO'),
 (SELECT id FROM subproductos WHERE codigo = 'AS_ADELANTO'), 0, 0, 0),

('CAMP-2025-07-COMPRA_DEUDA_PP', 'Campaña Compra de Deuda Julio 2025',
 'Campaña de compra de deuda para julio 2025',
 '2025-07-01', '2025-07-31', 'INACTIVA',
 (SELECT id FROM periodos WHERE codigo = '2025-07'),
 (SELECT id FROM productos WHERE codigo = 'COMPRA_DEUDA_PP'),
 (SELECT id FROM subproductos WHERE codigo = 'CD_PP_PRESTABONO'), 0, 0, 0),

('CAMP-2025-07-TARJETA_CREDITO', 'Campaña Tarjeta de Crédito Julio 2025',
 'Campaña de tarjeta de crédito para julio 2025',
 '2025-07-01', '2025-07-31', 'INACTIVA',
 (SELECT id FROM periodos WHERE codigo = '2025-07'),
 (SELECT id FROM productos WHERE codigo = 'TARJETA_CREDITO'),
 (SELECT id FROM subproductos WHERE codigo = 'PTC_SEGUNDA'), 0, 0, 0);

-- -----------------------------------------------------------------
-- 5. INSERTAR OFERTAS DEMO (40)
-- 5 ofertas por cada una de las 8 campañas
-- -----------------------------------------------------------------

-- Campaña: CAMP-2025-04-TARJETA_CREDITO
INSERT INTO ofertas (monto, tasa, fecha_oferta, estado, observacion, campania_id, cliente_id) VALUES
(8500.00, 24.50, '2025-04-05', 'ACEPTADA', 'Oferta aceptada por el cliente',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202021')),
(12000.00, 22.00, '2025-04-10', 'PENDIENTE', 'En evaluación',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202023')),
(5500.00, 28.00, '2025-04-15', 'RECHAZADA', 'Cliente no califica',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202025')),
(9500.00, 21.00, '2025-04-18', 'ACEPTADA', 'Oferta preaprobada',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202022')),
(7200.00, 25.00, '2025-04-22', 'PENDIENTE', 'Pendiente de firma',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = 'CE100001'));

-- Campaña: CAMP-2025-04-PRESTAMO_PERSONAL
INSERT INTO ofertas (monto, tasa, fecha_oferta, estado, observacion, campania_id, cliente_id) VALUES
(25000.00, 14.50, '2025-04-03', 'ACEPTADA', 'Préstamo desembolsado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-PRESTAMO_PERSONAL'),
 (SELECT id FROM clientes WHERE numero_documento = '20202022')),
(18000.00, 16.00, '2025-04-08', 'PENDIENTE', 'En estudio',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-PRESTAMO_PERSONAL'),
 (SELECT id FROM clientes WHERE numero_documento = '20202024')),
(35000.00, 12.00, '2025-04-12', 'RECHAZADA', 'Excede capacidad de pago',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-PRESTAMO_PERSONAL'),
 (SELECT id FROM clientes WHERE numero_documento = '20202021')),
(15000.00, 15.50, '2025-04-20', 'ACEPTADA', 'Aprobado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-PRESTAMO_PERSONAL'),
 (SELECT id FROM clientes WHERE numero_documento = '20202027')),
(22000.00, 13.00, '2025-04-25', 'PENDIENTE', 'En revisión final',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-04-PRESTAMO_PERSONAL'),
 (SELECT id FROM clientes WHERE numero_documento = '20123456789'));

-- Campaña: CAMP-2025-05-DEPOSITO_PLAZO
INSERT INTO ofertas (monto, tasa, fecha_oferta, estado, observacion, campania_id, cliente_id) VALUES
(45000.00, 5.50, '2025-05-02', 'ACEPTADA', 'Depósito constituido',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-DEPOSITO_PLAZO'),
 (SELECT id FROM clientes WHERE numero_documento = '20123456789')),
(25000.00, 5.00, '2025-05-07', 'ACEPTADA', 'Renovación automática',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-DEPOSITO_PLAZO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202021')),
(80000.00, 6.00, '2025-05-14', 'PENDIENTE', 'Pendiente de aprobación',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-DEPOSITO_PLAZO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202022')),
(12000.00, 4.50, '2025-05-19', 'RECHAZADA', 'Cliente prefirió otro producto',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-DEPOSITO_PLAZO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202024')),
(35000.00, 5.25, '2025-05-26', 'PENDIENTE', 'En proceso de firma',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-DEPOSITO_PLAZO'),
 (SELECT id FROM clientes WHERE numero_documento = 'CE100001'));

-- Campaña: CAMP-2025-05-CREDITO
INSERT INTO ofertas (monto, tasa, fecha_oferta, estado, observacion, campania_id, cliente_id) VALUES
(65000.00, 10.50, '2025-05-04', 'ACEPTADA', 'Crédito vehicular aprobado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202025')),
(45000.00, 11.00, '2025-05-09', 'PENDIENTE', 'En evaluación crediticia',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202022')),
(85000.00, 9.50, '2025-05-16', 'RECHAZADA', 'Documentación incompleta',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202021')),
(55000.00, 10.00, '2025-05-21', 'ACEPTADA', 'Desembolsado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202027')),
(72000.00, 9.00, '2025-05-28', 'PENDIENTE', 'Preaprobado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-05-CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202023'));

-- Campaña: CAMP-2025-06-EXTRALINEA
INSERT INTO ofertas (monto, tasa, fecha_oferta, estado, observacion, campania_id, cliente_id) VALUES
(12000.00, 18.00, '2025-06-03', 'ACEPTADA', 'Línea adicional activada',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-EXTRALINEA'),
 (SELECT id FROM clientes WHERE numero_documento = '20202023')),
(8500.00, 19.50, '2025-06-08', 'PENDIENTE', 'En proceso',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-EXTRALINEA'),
 (SELECT id FROM clientes WHERE numero_documento = '20202027')),
(22000.00, 16.00, '2025-06-15', 'RECHAZADA', 'Línea existente suficiente',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-EXTRALINEA'),
 (SELECT id FROM clientes WHERE numero_documento = '20202022')),
(15000.00, 17.00, '2025-06-20', 'ACEPTADA', 'Aprobado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-EXTRALINEA'),
 (SELECT id FROM clientes WHERE numero_documento = 'CE100001')),
(6500.00, 20.00, '2025-06-25', 'PENDIENTE', 'En evaluación',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-EXTRALINEA'),
 (SELECT id FROM clientes WHERE numero_documento = '20123456789'));

-- Campaña: CAMP-2025-06-ADELANTO_SUELDO
INSERT INTO ofertas (monto, tasa, fecha_oferta, estado, observacion, campania_id, cliente_id) VALUES
(3500.00, 8.00, '2025-06-04', 'ACEPTADA', 'Adelanto desembolsado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-ADELANTO_SUELDO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202024')),
(5000.00, 7.00, '2025-06-10', 'PENDIENTE', 'Pendiente de validación',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-ADELANTO_SUELDO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202021')),
(2500.00, 9.00, '2025-06-17', 'RECHAZADA', 'No cumple antigüedad',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-ADELANTO_SUELDO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202027')),
(4200.00, 7.50, '2025-06-22', 'ACEPTADA', 'Aprobado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-ADELANTO_SUELDO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202025')),
(6000.00, 6.50, '2025-06-28', 'PENDIENTE', 'En proceso de firma',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-06-ADELANTO_SUELDO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202022'));

-- Campaña: CAMP-2025-07-COMPRA_DEUDA_PP
INSERT INTO ofertas (monto, tasa, fecha_oferta, estado, observacion, campania_id, cliente_id) VALUES
(45000.00, 11.00, '2025-07-03', 'ACEPTADA', 'Compra de deuda realizada',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-COMPRA_DEUDA_PP'),
 (SELECT id FROM clientes WHERE numero_documento = '20202021')),
(32000.00, 12.50, '2025-07-09', 'PENDIENTE', 'En análisis',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-COMPRA_DEUDA_PP'),
 (SELECT id FROM clientes WHERE numero_documento = '20202024')),
(55000.00, 10.00, '2025-07-14', 'RECHAZADA', 'Deuda muy alta',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-COMPRA_DEUDA_PP'),
 (SELECT id FROM clientes WHERE numero_documento = '20202023')),
(28000.00, 12.00, '2025-07-21', 'ACEPTADA', 'Aprobado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-COMPRA_DEUDA_PP'),
 (SELECT id FROM clientes WHERE numero_documento = 'CE100001')),
(40000.00, 11.50, '2025-07-28', 'PENDIENTE', 'Enviado a firma',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-COMPRA_DEUDA_PP'),
 (SELECT id FROM clientes WHERE numero_documento = '20202027'));

-- Campaña: CAMP-2025-07-TARJETA_CREDITO
INSERT INTO ofertas (monto, tasa, fecha_oferta, estado, observacion, campania_id, cliente_id) VALUES
(6500.00, 26.00, '2025-07-02', 'ACEPTADA', 'Tarjeta emitida',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202027')),
(10000.00, 24.00, '2025-07-11', 'PENDIENTE', 'En evaluación',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202025')),
(4500.00, 29.00, '2025-07-16', 'RECHAZADA', 'Historial crediticio negativo',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20123456789')),
(8000.00, 22.00, '2025-07-23', 'ACEPTADA', 'Preaprobado',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202024')),
(11000.00, 23.00, '2025-07-29', 'PENDIENTE', 'Pendiente de documentación',
 (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-07-TARJETA_CREDITO'),
 (SELECT id FROM clientes WHERE numero_documento = '20202022'));

-- -----------------------------------------------------------------
-- 6. ACTUALIZAR AGRAGADOS DE CAMPAÑAS
-- -----------------------------------------------------------------
UPDATE campanias c SET
  clientes_alcanzados = COALESCE((SELECT COUNT(*) FROM ofertas o WHERE o.campania_id = c.id), 0),
  monto_ofertado = COALESCE((SELECT SUM(o.monto) FROM ofertas o WHERE o.campania_id = c.id), 0),
  ticket_promedio = CASE
    WHEN COALESCE((SELECT COUNT(*) FROM ofertas o WHERE o.campania_id = c.id), 0) > 0
    THEN COALESCE((SELECT SUM(o.monto) FROM ofertas o WHERE o.campania_id = c.id), 0) /
         (SELECT COUNT(*) FROM ofertas o WHERE o.campania_id = c.id)
    ELSE 0 END;

-- -----------------------------------------------------------------
-- 7. RE-APLICAR V17 Y V18 (actualización de estados de ofertas)
-- -----------------------------------------------------------------
UPDATE ofertas SET estado = 'VENCIDA' WHERE estado = 'RECHAZADA';
UPDATE ofertas SET estado = 'VENCIDA' WHERE estado = 'PENDIENTE';
