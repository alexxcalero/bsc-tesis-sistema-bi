INSERT INTO usuarios (username, password_hash, primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, correo, estado, rol_id)
VALUES
('admin', '$2b$10$IpwZ.ic9./mn7Jf2pL.XKuwmcY5VdOMDZ9mJCvzeYUwuxke66iVSm', 'Admin', NULL, 'Sistema', 'BI', 'admin@banco.pe', TRUE, (SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR')),
('analista', '$2b$10$C5rczomINh7GwvUnGZ41MOEN1Fc.gSlCq7pvKMDiBgWIhc4jKNDRq', 'Ana', 'Lucía', 'García', 'López', 'analista@banco.pe', TRUE, (SELECT id FROM roles WHERE codigo = 'ANALISTA')),
('especialista', '$2b$10$6ztyxwcqV8Iyg5h/kE6UZuZUKqV5h9HYbkp5dyPRxvqnqq0O6KRDe', 'Carlos', 'Andrés', 'Mendoza', 'Ruiz', 'especialista@banco.pe', TRUE, (SELECT id FROM roles WHERE codigo = 'ESPECIALISTA')),
('empleado', '$2b$10$mKYP3RbAQpNhundcuff.YeJql4cXrmEw/aH0XS71tY5mMqlGZJ06e', 'Luis', 'Alberto', 'Pérez', 'Torres', 'empleado@banco.pe', TRUE, (SELECT id FROM roles WHERE codigo = 'EMPLEADO')),
('auditor', '$2b$10$6ks13CYsbSlKkZldo.sVBOIpoUFh062Q1LpUFC3N5tCcZet0UrK8S', 'María', 'Elena', 'Rodríguez', 'Sánchez', 'auditor@banco.pe', TRUE, (SELECT id FROM roles WHERE codigo = 'AUDITOR'));
