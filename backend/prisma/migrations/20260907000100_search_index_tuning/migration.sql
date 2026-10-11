-- Índice duplicado: idx_productos_locales_nombre_trgm (init) e idx_productos_nombre_trgm
-- (search_indexes) son idénticos. Se conserva este último.
DROP INDEX IF EXISTS idx_productos_locales_nombre_trgm;

-- La búsqueda usa ILIKE '%texto%' también sobre codigo_proveedor; el índice btree
-- existente no sirve para ese patrón, un índice trigram sí.
CREATE INDEX IF NOT EXISTS idx_equivalencias_codigo_proveedor_trgm
  ON equivalencias USING gin (codigo_proveedor gin_trgm_ops);
