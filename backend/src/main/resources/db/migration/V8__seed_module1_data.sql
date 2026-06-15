-- Clientes de prueba
INSERT INTO clientes (primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento, correo, telefono, direccion, fecha_nacimiento, segmento_id, zona_id, agencia_id, canal_id, tipo_cliente_id)
VALUES
('Juan', 'Carlos', 'Pérez', 'García', (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '12345678', 'juan.perez@mail.com', '987654321', 'Av. Siempre Viva 123', '1985-03-15', (SELECT id FROM segmentos WHERE codigo = 'PREMIUM'), (SELECT id FROM zonas WHERE codigo = 'LIMA'), (SELECT id FROM agencias WHERE codigo = 'AGC-LIMA-001'), (SELECT id FROM canales WHERE codigo = 'DIGITAL'), (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),
('María', 'Elena', 'López', 'Torres', (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '87654321', 'maria.lopez@mail.com', '912345678', 'Jr. Comercio 456', '1990-07-22', (SELECT id FROM segmentos WHERE codigo = 'TOP_OF_MASS'), (SELECT id FROM zonas WHERE codigo = 'NORTE'), (SELECT id FROM agencias WHERE codigo = 'AGC-NORTE-001'), (SELECT id FROM canales WHERE codigo = 'SUCURSAL'), (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),
('Luis', 'Alberto', 'Mendoza', 'Ruiz', (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '45678912', 'luis.mendoza@mail.com', '956789123', 'Calle Real 789', '1978-11-05', (SELECT id FROM segmentos WHERE codigo = 'MASS'), (SELECT id FROM zonas WHERE codigo = 'SUR'), (SELECT id FROM agencias WHERE codigo = 'AGC-SUR-001'), (SELECT id FROM canales WHERE codigo = 'TELEFONICO'), (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL')),
('Carla', NULL, 'Sánchez', 'Díaz', (SELECT id FROM tipos_documento WHERE codigo = 'DNI'), '78912345', 'carla.sanchez@mail.com', '934567890', 'Av. Primavera 321', '1995-01-30', (SELECT id FROM segmentos WHERE codigo = 'REGULAR'), (SELECT id FROM zonas WHERE codigo = 'LIMA'), (SELECT id FROM agencias WHERE codigo = 'AGC-LIMA-002'), (SELECT id FROM canales WHERE codigo = 'DIGITAL'), (SELECT id FROM tipos_cliente WHERE codigo = 'NATURAL'));

-- Campañas de prueba
INSERT INTO campanias (codigo, nombre, descripcion, fecha_inicio, fecha_fin, estado, periodo_id, producto_id)
VALUES
('CAMP-2025-01', 'Campaña Crédito Personal Q1', 'Campaña de crédito personal primer trimestre', '2025-01-01', '2025-03-31', 'ACTIVA', (SELECT id FROM periodos WHERE codigo = '2025-01'), (SELECT id FROM productos WHERE codigo = 'CRED_PERSONAL')),
('CAMP-2025-02', 'Campaña Depósitos Plazo Fijo', 'Captación de depósitos a plazo fijo', '2025-01-15', '2025-02-28', 'ACTIVA', (SELECT id FROM periodos WHERE codigo = '2025-01'), (SELECT id FROM productos WHERE codigo = 'DEPOSITOS')),
('CAMP-2025-03', 'Campaña Crédito Hipotecario', 'Financiamiento inmobiliario', '2025-02-01', '2025-04-30', 'ACTIVA', (SELECT id FROM periodos WHERE codigo = '2025-02'), (SELECT id FROM productos WHERE codigo = 'CRED_HIPOTECARIO'));

-- Ofertas de prueba
INSERT INTO ofertas (monto, tasa, fecha_oferta, estado, observacion, campania_id, cliente_id)
VALUES
(15000.00, 12.50, '2025-01-10', 'ACEPTADA', 'Oferta aceptada por el cliente', (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-01'), (SELECT id FROM clientes WHERE numero_documento = '12345678')),
(25000.00, 11.00, '2025-01-12', 'PENDIENTE', 'En evaluación', (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-01'), (SELECT id FROM clientes WHERE numero_documento = '87654321')),
(50000.00, 8.75, '2025-01-20', 'ACEPTADA', 'Depósito a plazo fijo renovado', (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-02'), (SELECT id FROM clientes WHERE numero_documento = '45678912')),
(180000.00, 9.25, '2025-02-05', 'PENDIENTE', 'Oferta preaprobada', (SELECT id FROM campanias WHERE codigo = 'CAMP-2025-03'), (SELECT id FROM clientes WHERE numero_documento = '78912345'));
