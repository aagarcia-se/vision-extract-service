# vision-extract-service

Servicio backend que utiliza modelos generativos de vision (Gemini, con fallback a Claude)
para leer una foto de una hoja y devolver un JSON estructurado, con arquitectura pensada
para escalar a mas clientes ("templates") en el futuro.

## Arquitectura

Clean Architecture por capas:

- `src/domain` — puertos (`IOcrProvider`), errores de dominio
- `src/application` — casos de uso, mappers, templates por cliente (schema + prompt)
- `src/infrastructure` — proveedores de vision concretos (Gemini, Claude), acceso a base de
  datos (SQL directo, sin ORM), config, logger
- `src/interfaces/http` — controllers, routes, middlewares
- `src/container.ts` — composition root (aqui se conectan las piezas concretas)

Base de datos: **Turso (libSQL)**, con `@libsql/client` directo — sin ORM. Las consultas SQL
estan explicitas en `src/infrastructure/database/extractions.repository.ts`.

### Decisiones deliberadas de alcance

- No hay ORM — SQL escrito a mano. Se opto por esto para evitar la friccion de compatibilidad
  actual entre Prisma 7 (con sus driver adapters) y Turso remoto.
- No hay `TemplateRegistry` todavia — con un solo cliente (bakery) no hay nada que
  seleccionar. Se agrega cuando llegue el cliente #2.
- No hay DTOs genericos — el tipo inferido del schema de Zod (`BakeryExtraction`) es el DTO.

## Requisitos

- Node.js `>= 22.13.0`
- Una base de datos creada en Turso, con su `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`
- API keys de Gemini y de Anthropic

## Instalación

```bash
npm install
cp .env.example .env
```

Completa `.env` con tus credenciales reales (Turso, Gemini, Anthropic, y una `SERVICE_API_KEY`
propia — cualquier cadena larga y aleatoria sirve para desarrollo).

## Base de datos

Este proyecto NO usa migraciones automaticas. La tabla se crea a mano, una sola vez:

1. Abre `db/schema.sql`
2. Copia su contenido
3. Pegalo y ejecutalo en el editor SQL de Turso (o con `turso db shell`), contra la base que
   apunta tu `TURSO_DATABASE_URL`

## Levantar el servidor

```bash
npm run dev
```

Health-check: `GET http://localhost:3000/health`

## Endpoint de extraccion (bakery)

```
POST http://localhost:3000/extract/bakery
Headers:
  x-api-key: <tu SERVICE_API_KEY>
Body: multipart/form-data
  image: <archivo de imagen>
```

### Prueba con curl

```bash
curl -X POST http://localhost:3000/extract/bakery \
  -H "x-api-key: tu-service-api-key" \
  -F "image=@/ruta/a/tu/hoja-control-sobrantes.jpg"
```

### Respuesta esperada (200)

```json
{
  "detalleVenta": [
    { "idProducto": 101, "nombreProducto": "Pan frances", "Sobrantes": 4 },
    { "idProducto": 102, "nombreProducto": "Concha", "Sobrantes": 0 }
  ]
}
```

Nota: el campo `provider` (gemini/claude) se guarda en la base de datos para auditoria, pero
NO se incluye en esta respuesta — el contrato HTTP sigue siendo exactamente `detalleVenta`,
tal como se definio.

### Otras respuestas posibles

| Status | Cuando |
|---|---|
| 400 | No se envio archivo de imagen, o el archivo no es una imagen valida |
| 401 | `x-api-key` ausente o incorrecta |
| 422 | La respuesta del modelo no es JSON valido o no cumple el contrato |
| 502 | Fallaron TODOS los proveedores de vision (Gemini y Claude) |

## Scripts disponibles

```bash
npm run dev      # Modo desarrollo (recarga automatica)
npm run build    # Compila TypeScript a dist/
npm run start    # Corre la build compilada
npm run lint     # ESLint
npm run test     # Vitest
```
