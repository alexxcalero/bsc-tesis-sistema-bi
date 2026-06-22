CREATE TABLE IF NOT EXISTS auditorias (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    username VARCHAR(50),
    rol VARCHAR(50),
    accion VARCHAR(50) NOT NULL,
    entidad VARCHAR(50),
    entidad_id VARCHAR(50),
    detalle TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_username ON auditorias(username);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditorias(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON auditorias(entidad);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha_hora ON auditorias(fecha_hora);
