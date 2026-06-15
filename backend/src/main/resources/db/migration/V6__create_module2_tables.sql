CREATE TABLE IF NOT EXISTS procesos_carga (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    observacion TEXT,
    total_registros INTEGER NOT NULL DEFAULT 0,
    total_reg_validos INTEGER NOT NULL DEFAULT 0,
    total_reg_invalidos INTEGER NOT NULL DEFAULT 0,
    tipo_carga_id BIGINT NOT NULL REFERENCES tipos_carga(id),
    estado_carga_id BIGINT NOT NULL REFERENCES estados_carga(id),
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS archivos_carga (
    id BIGSERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamano_archivo BIGINT NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    proceso_carga_id BIGINT NOT NULL REFERENCES procesos_carga(id)
);

CREATE TABLE IF NOT EXISTS detalles_carga (
    id BIGSERIAL PRIMARY KEY,
    numero_fila INTEGER NOT NULL,
    datos_fila TEXT NOT NULL,
    es_valido BOOLEAN NOT NULL DEFAULT FALSE,
    observaciones VARCHAR(500),
    proceso_carga_id BIGINT NOT NULL REFERENCES procesos_carga(id)
);

CREATE TABLE IF NOT EXISTS errores_carga (
    id BIGSERIAL PRIMARY KEY,
    numero_fila INTEGER NOT NULL,
    campo VARCHAR(100),
    mensaje_error VARCHAR(500) NOT NULL,
    tipo_error VARCHAR(50) NOT NULL,
    proceso_carga_id BIGINT NOT NULL REFERENCES procesos_carga(id)
);

CREATE TABLE IF NOT EXISTS resultados_carga (
    id BIGSERIAL PRIMARY KEY,
    total_registros INTEGER NOT NULL DEFAULT 0,
    total_registros_validos INTEGER NOT NULL DEFAULT 0,
    total_registros_invalidos INTEGER NOT NULL DEFAULT 0,
    total_registros_procesados INTEGER NOT NULL DEFAULT 0,
    proceso_carga_id BIGINT NOT NULL UNIQUE REFERENCES procesos_carga(id)
);
