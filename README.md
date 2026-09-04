# vision-extract-service

Servicio backend que utiliza modelos generativos de vision (Gemini, con fallback a Claude)
para leer fotos de documentos y devolver JSON estructurado, con arquitectura pensada para
escalar a mas templates/clientes en el futuro.

## Arquitectura

Clean Architecture por capas:

- `src/domain` — puertos (`IOcrProvider`), errores de dominio
- `src/application` — casos de uso, mappers, templates (schema + prompt) por tipo de documento
- `src/infrastructure` — proveedores de vision concretos (Gemini, Claude), acceso a base de
  datos (SQL directo, sin ORM), config, logger
- `src/interfaces/http` — controllers, routes, middlewares
- `src/container.ts` — composition root (aqui se conectan las piezas concretas)

Base de datos: **Turso (libSQL)**, con `@libsql/client` directo — sin ORM. Las consultas SQL
estan explicitas en `src/infrastructure/database/`.

### Templates disponibles

| Template | Endpoint | Que extrae |
|---|---|---|
| `bakery` | `POST /extract/bakery` | Hoja de "Control de Sobrantes" → `detalleVenta` |
| `factura` | `POST /extract/factura` | Factura de compra → datos fiscales + productos |

Cada template tiene su propio prompt y su propio schema de validacion (Zod), pero ambos
comparten el mismo `FallbackOcrProvider` (Gemini con respaldo a Claude) — lo que cambia entre
templates es QUE se le pide al modelo, no COMO se le habla.

### Decisiones deliberadas de alcance

- No hay ORM — SQL escrito a mano (se evito Prisma por friccion de compatibilidad con Turso).
- No hay `TemplateRegistry` — cada template tiene su propia ruta fija. Se justificaria un
  selector dinamico si algun dia hace falta un unico endpoint generico que elija el template
  segun el cliente; hoy no hace falta.
- Las imagenes de factura se guardan como base64 en la base de datos (tabla
  `facturas_imagenes`), tal como se pidio. Si esto crece mucho en produccion, la alternativa
  estandar es mover las imagenes a un storage de objetos (S3, R2, etc.) y guardar solo la URL.

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

No hay migraciones automaticas. Las tablas se crean a mano, una sola vez:

1. Abre `db/schema.sql`
2. Copia su contenido
3. Pegalo y ejecutalo en el editor SQL de Turso (o con `turso db shell`), contra la base que
   apunta tu `TURSO_DATABASE_URL`

## Levantar el servidor

```bash
npm run dev
```

Health-check: `GET http://localhost:3000/health`

## Endpoints

### `POST /extract/bakery`

```
Headers:
  x-api-key: <tu SERVICE_API_KEY>
Body: multipart/form-data
  image: <archivo de imagen>
```

```bash
curl -X POST http://localhost:3000/extract/bakery \
  -H "x-api-key: tu-service-api-key" \
  -F "image=@/ruta/a/tu/hoja-control-sobrantes.jpg"
```

Respuesta (200):
```json
{
  "detalleVenta": [
    { "idProducto": 101, "nombreProducto": "Pan frances", "Sobrantes": 4 }
  ]
}
```

### `POST /extract/factura`

```
Headers:
  x-api-key: <tu SERVICE_API_KEY>
Body: multipart/form-data
  image: <archivo de imagen>
```

```bash
curl -X POST http://localhost:3000/extract/factura \
  -H "x-api-key: tu-service-api-key" \
  -F "image=@/ruta/a/tu/factura.jpg"
```

Respuesta (200):
```json
{
  "nit": "1234567-8",
  "nombreEmisor": "Panaderia El Trigo",
  "nitReceptor": "CF",
  "nombreReceptor": "CONSUMIDOR FINAL",
  "numeroFactura": "FAC-00123",
  "fecha": "01/09/2026",
  "hora": "14:32",
  "productos": [
    { "descripcion": "Pan dulce surtido", "cantidad": 12, "precioUnitario": 2.5, "subtotal": 30 }
  ],
  "total": 30
}
```

El `provider` (gemini/claude) y el base64 de la imagen se guardan en la base de datos
(`facturas` y `facturas_imagenes`), pero NO se incluyen en esta respuesta HTTP.

### Respuestas de error (ambos endpoints)

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
