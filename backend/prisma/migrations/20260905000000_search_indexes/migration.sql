-- Índices para búsqueda por texto parcial (ILIKE '%term%') y FKs
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_proveedores_nombre_trgm
  ON proveedores USING gin (nombre gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_productos_codigo_trgm
  ON productos_locales USING gin (codigo gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_productos_nombre_trgm
  ON productos_locales USING gin (nombre gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_equivalencias_nombre_proveedor_trgm
  ON equivalencias USING gin (nombre_proveedor gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_equivalencias_proveedor_id
  ON equivalencias (proveedor_id);

CREATE INDEX IF NOT EXISTS idx_equivalencias_producto_local_id
  ON equivalencias (producto_local_id);