CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS proveedores (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    activo      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos_locales (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(100) NOT NULL UNIQUE,
    nombre      VARCHAR(255) NOT NULL,
    activo      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equivalencias (
    id                  SERIAL PRIMARY KEY,
    proveedor_id        INTEGER NOT NULL REFERENCES proveedores(id),
    codigo_proveedor    VARCHAR(100) NOT NULL,
    nombre_proveedor    VARCHAR(255) NOT NULL,
    producto_local_id   INTEGER NOT NULL REFERENCES productos_locales(id),
    activo              BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_proveedor_codigo UNIQUE (proveedor_id, codigo_proveedor)
);

CREATE INDEX IF NOT EXISTS idx_equivalencias_codigo_proveedor ON equivalencias (codigo_proveedor);
CREATE INDEX IF NOT EXISTS idx_equivalencias_nombre_proveedor ON equivalencias (nombre_proveedor);
CREATE INDEX IF NOT EXISTS idx_productos_locales_codigo ON productos_locales (codigo);
CREATE INDEX IF NOT EXISTS idx_productos_locales_nombre ON productos_locales (nombre);
CREATE INDEX IF NOT EXISTS idx_equivalencias_proveedor_id ON equivalencias (proveedor_id);
CREATE INDEX IF NOT EXISTS idx_equivalencias_producto_local_id ON equivalencias (producto_local_id);
CREATE INDEX IF NOT EXISTS idx_equivalencias_nombre_proveedor_trgm ON equivalencias USING gin (nombre_proveedor gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_productos_locales_nombre_trgm ON productos_locales USING gin (nombre gin_trgm_ops);
