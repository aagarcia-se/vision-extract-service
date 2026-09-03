import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL no esta definida. Verifica que tu archivo .env exista en la raiz del ' +
      'proyecto, contenga la linea DATABASE_URL="file:./prisma/dev.db", y que este guardado ' +
      'como UTF-8 (no UTF-16).',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Esta URL solo la usa la CLI de Prisma (generate / migrate).
    // El runtime de la app NO pasa por aqui: usa el driver adapter de Turso
    // definido en src/infrastructure/database/prisma-client.ts
    url: databaseUrl,
  },
});
