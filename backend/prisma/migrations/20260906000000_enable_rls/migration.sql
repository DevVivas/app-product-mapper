ALTER TABLE proveedores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_locales  ENABLE ROW LEVEL SECURITY;
ALTER TABLE equivalencias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
-- Sin políticas: la Data API pública queda bloqueada.
-- Prisma conecta como dueño de las tablas (rol postgres) y no se ve afectado.
