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

## Requisitos

- Node.js `>= 22.13.0`

## Instalación

```bash
npm install
cp .env.example .env
```

Completa `.env` con tus credenciales reales antes de continuar.

## Scripts disponibles

```bash
npm run dev     # Levanta el servidor en modo desarrollo (con recarga automática)
npm run build   # Compila TypeScript a dist/
npm run start   # Corre la build compilada (requiere haber hecho build antes)
npm run lint    # Corre ESLint
npm run test    # Corre los tests con Vitest
```

## Estado actual

Este es el skeleton base del proyecto: configuración de TypeScript, ESLint (flat config),
Prettier, y un servidor Express mínimo con un endpoint `/health`. La lógica de dominio
(OCR providers, templates por cliente, casos de uso) se irá agregando de forma incremental.
