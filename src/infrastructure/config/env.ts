import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  TURSO_DATABASE_URL: z.string().min(1, 'TURSO_DATABASE_URL es requerido'),
  TURSO_AUTH_TOKEN: z.string().min(1, 'TURSO_AUTH_TOKEN es requerido'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY es requerido'),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY es requerido'),
  SERVICE_API_KEY: z.string().min(1, 'SERVICE_API_KEY es requerido'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno invalidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
