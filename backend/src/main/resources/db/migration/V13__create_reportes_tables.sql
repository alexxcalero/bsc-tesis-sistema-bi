CREATE TABLE IF NOT EXISTS reportes (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    formato VARCHAR(20) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    icono VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reporte_filtros (
    id BIGSERIAL PRIMARY KEY,
    reporte_id BIGINT NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    catalogo_endpoint VARCHAR(100),
    orden INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_reporte_filtro_reporte FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE,
    CONSTRAINT uq_reporte_filtro_codigo UNIQUE (reporte_id, codigo)
);

CREATE INDEX idx_reportes_activo ON reportes(activo);
CREATE INDEX idx_reporte_filtros_reporte ON reporte_filtros(reporte_id);
