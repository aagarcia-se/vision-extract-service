import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { healthRouter } from '@interfaces/http/routes/health.routes';
import { createExtractBakeryRouter } from '@interfaces/http/routes/extract-bakery.routes';
import { errorHandler } from '@interfaces/http/middlewares/errorHandler';
import { extractBakerySalesUseCase } from './container';

export function createServer(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use(healthRouter);
  app.use(createExtractBakeryRouter(extractBakerySalesUseCase));

  // Middleware de errores: siempre al final
  app.use(errorHandler);

  return app;
}
