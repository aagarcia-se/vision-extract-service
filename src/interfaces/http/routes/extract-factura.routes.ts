import { Router } from 'express';
import { uploadImage } from '@interfaces/http/middlewares/uploadImage.middleware';
import { apiKeyAuth } from '@interfaces/http/middlewares/apiKeyAuth.middleware';
import { createExtractFacturaController } from '@interfaces/http/controllers/extract-factura.controller';
import type { ExtractFacturaUseCase } from '@application/use-cases/ExtractFacturaUseCase';

export function createExtractFacturaRouter(useCase: ExtractFacturaUseCase): Router {
  const router = Router();
  const controller = createExtractFacturaController(useCase);

  router.post('/extract/factura', apiKeyAuth, uploadImage, controller);

  return router;
}
