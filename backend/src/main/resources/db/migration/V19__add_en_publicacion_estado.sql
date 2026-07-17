-- ============================================================
-- V19: Agregar estado EN_PUBLICACION para publicaciones async
-- ============================================================
INSERT INTO estados_carga (codigo, nombre, descripcion) VALUES
('EN_PUBLICACION', 'En Publicación', 'Publicación en proceso (asíncrona)');
