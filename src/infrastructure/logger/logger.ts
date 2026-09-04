import pino from 'pino';
import pretty from 'pino-pretty';
import { env } from '@infrastructure/config/env';

// En produccion: JSON plano (para que un agregador de logs lo procese).
//
// Fuera de produccion: salida coloreada y legible en la terminal, via
// pino-pretty. IMPORTANTE: se pasa como stream directo (pretty(...)),
// NO como `transport: { target: 'pino-pretty' }`. La forma "transport"
// hace que pino resuelva el paquete en un worker thread separado
// inspeccionando el call stack — eso falla bajo tsx (y otras herramientas
// que transpilan al vuelo, como Next.js/Vite) porque el stack no apunta
// a una ruta que Node pueda resolver. Pasarlo como stream evita ese
// mecanismo por completo.
const isProduction = env.NODE_ENV === 'production';

export const logger = isProduction
  ? pino({ level: 'info' })
  : pino(
      { level: 'debug' },
      pretty({
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      }),
    );
