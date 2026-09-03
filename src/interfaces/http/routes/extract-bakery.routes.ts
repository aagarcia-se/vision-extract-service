import { Router } from 'express';
import { uploadImage } from '@interfaces/http/middlewares/uploadImage.middleware';
import { apiKeyAuth } from '@interfaces/http/middlewares/apiKeyAuth.middleware';
import { createExtractBakeryController } from '@interfaces/http/controllers/extract-bakery.controller';
import type { ExtractBakerySalesUseCase } from '@application/use-cases/ExtractBakerySalesUseCase';

export function createExtractBakeryRouter(useCase: ExtractBakerySalesUseCase): Router {
  const router = Router();
  const controller = createExtractBakeryController(useCase);

  router.post('/extract/bakery', apiKeyAuth, uploadImage, controller);

  return router;
}
