# vision-extract-service

Servicio backend que utiliza servicios cloud de OCR/vision para leer una foto de una hoja
y devolver un JSON estructurado, con arquitectura multi-cliente (un "template" por cliente).

## Arquitectura

Clean Architecture por capas:

- `src/domain` — entidades, value objects, puertos (interfaces), errores de dominio
- `src/application` — casos de uso, DTOs, mappers, templates por cliente (strategy pattern)
- `src/infrastructure` — implementaciones concretas (proveedores OCR, base de datos, config, logger)
- `src/interfaces/http` — capa HTTP (controllers, routes, middlewares, validators)
- `src/shared` — utilidades y constantes compartidas

Base de datos: **Turso (libSQL)**, vía Prisma con driver adapters.

## Requisitos

- Node.js `>= 22.13.0`
- Una base de datos creada en Turso, con su `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`

## Instalación

```bash
npm install
cp .env.example .env
```

Completa `.env` con:
- Tus credenciales reales de Turso (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`)
- El resto de variables según corresponda

`npm install` corre automáticamente `prisma generate` (script `postinstall`).

### `prisma.config.ts`

Desde Prisma ORM 7, la URL de conexión que usa la CLI (`generate` / `migrate`) ya no se declara
en `schema.prisma`, sino en `prisma.config.ts` (en la raíz del proyecto). Ese archivo solo lo usa
la CLI — el runtime de la app sigue conectándose a Turso a través del driver adapter en
`src/infrastructure/database/prisma-client.ts`, sin pasar por `prisma.config.ts`.

## Migraciones

Prisma no puede aplicar migraciones directamente contra Turso (libSQL usa HTTP, no una conexión
local). El flujo es:

```bash
npm run db:migrate -- --name init
```

Esto genera el SQL en `prisma/migrations/<timestamp>_init/migration.sql` usando el
`DATABASE_URL` local (`file:./prisma/dev.db`). Ese archivo SQL es el que debes aplicar a tu
base real de Turso desde el gestor o sitio de Turso que uses normalmente.

## Scripts disponibles

```bash
npm run dev         # Levanta el servidor en modo desarrollo (con recarga automática)
npm run build        # Compila TypeScript a dist/
npm run start         # Corre la build compilada (requiere haber hecho build antes)
npm run lint          # Corre ESLint
npm run test          # Corre los tests con Vitest
npm run db:migrate    # Genera una nueva migracion de Prisma (local, ver seccion Migraciones)
```

## Estado actual

Skeleton base: TypeScript, ESLint (flat config), Prettier, servidor Express con `/health`,
y el modelo `Extraction` de Prisma listo para conectar contra Turso. La lógica de dominio
(OCR providers, templates por cliente, casos de uso) se irá agregando de forma incremental.
