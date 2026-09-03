import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { logger } from '@infrastructure/logger/logger';
import { OcrExtractionError } from '@domain/errors/OcrExtractionError';
import { TemplateValidationError } from '@domain/errors/TemplateValidationError';
import { InvalidFileError } from '@interfaces/http/middlewares/uploadImage.middleware';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err, path: req.path }, 'Unhandled error');

  if (err instanceof InvalidFileError || err instanceof multer.MulterError) {
    res.status(400).json({ error: { message: err.message } });
    return;
  }

  if (err instanceof TemplateValidationError) {
    res.status(422).json({ error: { message: err.message } });
    return;
  }

  if (err instanceof OcrExtractionError) {
    res.status(502).json({
      error: { message: 'El proveedor de vision no pudo procesar la imagen.' },
    });
    return;
  }

  res.status(500).json({
    error: { message: 'Internal server error' },
  });
}
