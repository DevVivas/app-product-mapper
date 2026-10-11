# ProductMapper

Sistema de conversión y búsqueda de productos entre proveedores externos y el sistema local.

## Stack

- **Backend**: Express + TypeScript + Prisma + PostgreSQL + Zod
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Infra**: Docker Compose (dev + prod)
- **Prod**: imágenes multi-stage sin root, Nginx sirviendo el frontend y haciendo proxy al API

## Estructura

```
├── backend/          # API REST
│   ├── config/       # Env + Prisma client
│   ├── middleware/    # Error handler + async handler
│   ├── repositories/ # Queries Prisma (paginación + filtros)
│   ├── routes/       # Endpoints REST
│   ├── services/     # Lógica de negocio
│   ├── validators/   # Schemas Zod (paginación + límites)
│   ├── prisma/       # Schema + seed + migrations (índices pg_trgm)
│   └── Dockerfile.prod  # Multi-stage, no-root
├── frontend/         # SPA React
│   └── src/
│       ├── components/ # UI + paginación
│       ├── hooks/     # useProviders / useLocalProducts / useEquivalences / useSearch
│       ├── views/     # Vistas de la app
│       ├── services/  # Cliente HTTP → API
│       └── types.ts
├── docker-compose.yml      # Dev (hot reload)
├── docker-compose.prod.yml # Prod (Nginx + no-root)
└── frontend/nginx.conf     # Front prod + proxy /api
```

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/providers` | Listar proveedores |
| POST | `/api/providers` | Crear proveedor |
| GET | `/api/providers/:id` | Obtener proveedor |
| PUT | `/api/providers/:id` | Actualizar proveedor |
| DELETE | `/api/providers/:id` | Eliminar proveedor (borra sus equivalencias) |
| GET | `/api/products` | Listar productos locales |
| POST | `/api/products` | Crear producto local |
| GET | `/api/products/:id` | Obtener producto local |
| PUT | `/api/products/:id` | Actualizar producto local |
| DELETE | `/api/products/:id` | Eliminar producto local (borra sus equivalencias) |
| GET | `/api/equivalences` | Listar equivalencias |
| POST | `/api/equivalences` | Crear equivalencia |
| GET | `/api/equivalences/:id` | Obtener equivalencia |
| PUT | `/api/equivalences/:id` | Actualizar equivalencia |
| DELETE | `/api/equivalences/:id` | Eliminar equivalencia |
| GET | `/api/search?q=...` | Búsqueda universal (código o nombre) |

> La validación de inputs se hace con Zod en el backend: campos requeridos,
> sin espacios extremos (`trim`), `id` enteros positivos, y el update exige al
> menos un campo. Respuestas de error: `400` (validación), `404` (no existe),
> `409` (duplicado).

### Listados y paginación

Los endpoints de listado (`/api/providers`, `/api/products`, `/api/equivalences`)
y `/api/search` están paginados (**server-side**). Parámetros de query:

| Parámetro | Descripción | Default | Máx. |
|-----------|-------------|---------|------|
| `q` | Filtro de texto (código/nombre, con índices `pg_trgm`) | — | 120 |
| `page` | Número de página | 1 | 200 |
| `limit` | Filas por página | 100 (`50` en search) | 200 |
| `providerId` | Filtro por proveedor (`/equivalences` y `/search`) | — | — |

Respuesta de listados:

```jsonc
{ "data": [...], "meta": { "page": 1, "limit": 100, "total": 123, "pageCount": 2 } }
```

Respuesta de `/api/search`:

```jsonc
{ "results": [...], "meta": { "page": 1, "limit": 50, "total": 7, "pageCount": 1 } }
```

### Seguridad y performance

- CORS restringido a orígenes de `CORS_ORIGINS` (coma-separados, default `http://localhost:5173`).
- Helmet, `express-rate-limit` (global 600/15min, search 60/1min) y `express.json({ limit: "1mb" })`.
- `compression` gzip y `trust proxy`.
- Índices GiN `pg_trgm` para búsqueda por `ILIKE %…%` en `proveedores`, `productos_locales` y `equivalencias`.
- Paginación real con `count + findMany` en transacción (no se trae toda la tabla).
- AbortController en el buscador (cancela fetch en vuelo al escribir).

## Desarrollo local (Docker)

```bash
cp env.example .env   # ajusta contraseñas si es necesario
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- PostgreSQL (Docker): localhost:5433 — user `postgres` / pass `postgres`, base de datos **`product_mapper`**
  (tablas: `proveedores`, `productos_locales`, `equivalencias`). Conecta desde pgAdmin con esos datos.
  > Nota: si tienes un PostgreSQL nativo instalado en Windows, dejará el puerto 5432 para sí mismo;
  > el contenedor usa el 5433 para no chocar.

### Producción (Docker)

Configura `.env` antes del despliegue: define `POSTGRES_USER`, `POSTGRES_PASSWORD`
y `POSTGRES_DB` con valores propios y no reutilices las credenciales de desarrollo.
Si la contraseña contiene caracteres reservados de URL, codifícala para que
`DATABASE_URL` sea válida. `CORS_ORIGINS` debe contener los orígenes permitidos,
separados por comas.

```bash
docker compose -f docker-compose.prod.yml -p productmapper-prod up -d --build
```

- Frontend: http://localhost:8080 (Nginx sirve el bundle y hace proxy `/api` al backend).
- Banco de datos separado (`postgres_data_prod`), sin seed.
- Imágenes multi-stage: backend no-root (`node`), frontend no-root (`nginx` unprivileged).
- Los servicios de producción incluyen health checks; Docker ignora archivos locales `node_modules`, builds y `.env` al construir imágenes.
- No se publican los puertos de PostgreSQL ni del backend al host.

## Desarrollo local (sin Docker)

Requiere PostgreSQL corriendo y accesible.

```bash
# Backend
cd backend
cp ../env.example .env   # ajusta DATABASE_URL a tu PG local
npm install
npx prisma generate
npx prisma migrate dev   # aplica migraciones
npx prisma db seed       # datos iniciales (opcional)
npm run dev

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

## Base de datos

### Migraciones

Las migraciones viven en `backend/prisma/migrations/` y se aplican automáticamente
al arrancar el contenedor (`npx prisma migrate deploy`). Tablas:

- `proveedores`
- `productos_locales`
- `equivalencias`

Con:
- PK/FK correctas
- `UNIQUE` en `productos_locales.codigo`
- `UNIQUE` compuesto en `equivalencias (proveedor_id, codigo_proveedor)` (evita duplicados)
- Índices GIN `pg_trgm` para búsqueda tolerante por nombre y FKs indizadas
  (`20260905000000_search_indexes`)

### Seed

```bash
cd backend
npx prisma db seed
```