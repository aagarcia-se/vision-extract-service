import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { env } from '@infrastructure/config/env';

const adapter = new PrismaLibSql({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

export const prisma = new PrismaClient({ adapter });