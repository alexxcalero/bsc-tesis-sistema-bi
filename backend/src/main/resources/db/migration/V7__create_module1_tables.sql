CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    primer_nombre VARCHAR(100) NOT NULL,
    segundo_nombre VARCHAR(100),
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    tipo_documento_id BIGINT NOT NULL REFERENCES tipos_documento(id),
    numero_documento VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(150),
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    fecha_nacimiento DATE,
    segmento_id BIGINT REFERENCES segmentos(id),
    zona_id BIGINT REFERENCES zonas(id),
    agencia_id BIGINT REFERENCES agencias(id),
    canal_id BIGINT REFERENCES canales(id),
    tipo_cliente_id BIGINT REFERENCES tipos_cliente(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campanias (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50) NOT NULL,
    periodo_id BIGINT REFERENCES periodos(id),
    producto_id BIGINT REFERENCES productos(id),
    proceso_carga_id BIGINT REFERENCES procesos_carga(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ofertas (
    id BIGSERIAL PRIMARY KEY,
    monto NUMERIC(18,2) NOT NULL,
    tasa NUMERIC(5,2),
    fecha_oferta DATE NOT NULL,
    estado VARCHAR(50) NOT NULL,
    observacion VARCHAR(500),
    campania_id BIGINT NOT NULL REFERENCES campanias(id),
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
