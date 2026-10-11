BEGIN;

ALTER TABLE "proveedores" DROP COLUMN "activo";
ALTER TABLE "productos_locales" DROP COLUMN "activo";
ALTER TABLE "equivalencias" DROP COLUMN "activo";

COMMIT;