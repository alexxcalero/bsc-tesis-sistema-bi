-- Permisos
INSERT INTO permisos (codigo, nombre, descripcion) VALUES
('USUARIOS_VER', 'Ver usuarios', 'Permite visualizar usuarios'),
('USUARIOS_CREAR', 'Crear usuarios', 'Permite crear usuarios'),
('USUARIOS_EDITAR', 'Editar usuarios', 'Permite editar usuarios'),
('USUARIOS_ELIMINAR', 'Eliminar usuarios', 'Permite eliminar usuarios'),
('CATALOGOS_VER', 'Ver catálogos', 'Permite visualizar catálogos'),
('CARGAS_VER', 'Ver cargas', 'Permite visualizar procesos de carga'),
('CARGAS_CREAR', 'Crear cargas', 'Permite registrar nuevas cargas'),
('CARGAS_VALIDAR', 'Validar cargas', 'Permite ejecutar validación de cargas'),
('CARGAS_PUBLICAR', 'Publicar cargas', 'Permite publicar cargas validadas'),
('CAMPANIAS_VER', 'Ver campañas', 'Permite visualizar campañas'),
('CLIENTES_VER', 'Ver clientes', 'Permite visualizar clientes'),
('REPORTES_VER', 'Ver reportes', 'Permite visualizar reportes'),
('REPORTES_CREAR', 'Crear reportes', 'Permite crear reportes'),
('AUDITORIA_VER', 'Ver auditoría', 'Permite visualizar auditoría');

-- Roles
INSERT INTO roles (codigo, nombre, descripcion) VALUES
('ADMINISTRADOR', 'Administrador', 'Acceso total al sistema'),
('ANALISTA', 'Analista de Inteligencia Comercial', 'Visualiza dashboards, campañas y clientes'),
('ESPECIALISTA', 'Especialista de Inteligencia Comercial', 'Gestiona cargas, validaciones y publicaciones'),
('EMPLEADO', 'Empleado Interno', 'Acceso limitado de consulta'),
('AUDITOR', 'Auditor', 'Consulta auditoría y trazabilidad');

-- Asignación de permisos a roles
-- ADMINISTRADOR: todos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p WHERE r.codigo = 'ADMINISTRADOR';

-- ANALISTA
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.codigo = 'ANALISTA'
  AND p.codigo IN ('CATALOGOS_VER', 'CAMPANIAS_VER', 'CLIENTES_VER', 'REPORTES_VER', 'REPORTES_CREAR', 'CARGAS_VER');

-- ESPECIALISTA
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.codigo = 'ESPECIALISTA'
  AND p.codigo IN ('CATALOGOS_VER', 'CARGAS_VER', 'CARGAS_CREAR', 'CARGAS_VALIDAR', 'CARGAS_PUBLICAR',
                   'CAMPANIAS_VER', 'CLIENTES_VER', 'REPORTES_VER', 'REPORTES_CREAR');

-- EMPLEADO
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.codigo = 'EMPLEADO'
  AND p.codigo IN ('CATALOGOS_VER', 'CAMPANIAS_VER', 'CLIENTES_VER', 'REPORTES_VER');

-- AUDITOR
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.codigo = 'AUDITOR'
  AND p.codigo IN ('AUDITORIA_VER', 'CARGAS_VER', 'CAMPANIAS_VER', 'CLIENTES_VER');
