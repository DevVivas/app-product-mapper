-- Supabase expone el esquema public por su Data API (PostgREST).
-- Se activa RLS en la tabla interna de Prisma para que no sea accesible con la anon key.
-- Prisma conecta como dueño de la tabla (rol postgres), que no se ve afectado por RLS.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
