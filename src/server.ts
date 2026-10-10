import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { healthRouter } from '@interfaces/http/routes/health.routes';
import { createExtractBakeryRouter } from '@interfaces/http/routes/extract-bakery.routes';
import { createExtractFacturaRouter } from '@interfaces/http/routes/extract-factura.routes';
import { errorHandler } from '@interfaces/http/middlewares/errorHandler';
import { extractBakerySalesUseCase, extractFacturaUseCase } from './container';

export function createServer(): Application {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use(healthRouter);
  app.use(createExtractBakeryRouter(extractBakerySalesUseCase));
  app.use(createExtractFacturaRouter(extractFacturaUseCase));

  app.use(errorHandler);

  return app;
}
