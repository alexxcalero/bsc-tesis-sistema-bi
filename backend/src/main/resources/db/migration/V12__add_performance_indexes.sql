CREATE INDEX IF NOT EXISTS idx_proceso_carga_codigo ON procesos_carga(codigo);

CREATE INDEX IF NOT EXISTS idx_cliente_numero_documento ON clientes(numero_documento);
CREATE INDEX IF NOT EXISTS idx_cliente_primer_nombre ON clientes(primer_nombre);
CREATE INDEX IF NOT EXISTS idx_cliente_apellido_paterno ON clientes(apellido_paterno);

CREATE INDEX IF NOT EXISTS idx_oferta_campania_id ON ofertas(campania_id);
CREATE INDEX IF NOT EXISTS idx_oferta_cliente_id ON ofertas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_oferta_campania_cliente ON ofertas(campania_id, cliente_id);

CREATE INDEX IF NOT EXISTS idx_archivo_carga_proceso_carga_id ON archivos_carga(proceso_carga_id);
