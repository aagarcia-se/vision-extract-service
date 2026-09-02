import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Esta URL solo la usa la CLI de Prisma (generate / migrate).
    // El runtime de la app NO pasa por aqui: usa el driver adapter de Turso
    // definido en src/infrastructure/database/prisma-client.ts
    url: env('DATABASE_URL'),
  },
});
