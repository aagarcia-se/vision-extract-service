import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { healthRouter } from '@interfaces/http/routes/health.routes';
import { errorHandler } from '@interfaces/http/middlewares/errorHandler';

export function createServer(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use(healthRouter);

  // Middleware de errores: siempre al final
  app.use(errorHandler);

  return app;
}
