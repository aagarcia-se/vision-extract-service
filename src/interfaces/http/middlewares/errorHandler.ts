import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { logger } from '@infrastructure/logger/logger';
import { OcrExtractionError } from '@domain/errors/OcrExtractionError';
import { TemplateValidationError } from '@domain/errors/TemplateValidationError';
import { InvalidFileError } from '@interfaces/http/middlewares/uploadImage.middleware';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof InvalidFileError || err instanceof multer.MulterError) {
    logger.warn({ err, path: req.path }, 'Archivo invalido recibido');
    res.status(400).json({ error: { message: err.message } });
    return;
  }

  if (err instanceof TemplateValidationError) {
    // "context" (rawText, parsedJson) se loguea como propiedad de primer
    // nivel a proposito — el serializador de errores de pino no navega
    // objetos anidados dentro de "cause", asi que ponerlo aparte
    // garantiza que se vea en consola.
    logger.warn(
      { err, context: err.context, path: req.path },
      'La respuesta del modelo no cumplio el contrato esperado',
    );
    res.status(422).json({ error: { message: err.message } });
    return;
  }

  if (err instanceof OcrExtractionError) {
    // El detalle de CUAL proveedor fallo y por que ya quedo en consola
    // (FallbackOcrProvider lo registra por cada intento). Al cliente HTTP
    // solo se le da un mensaje generico a proposito: no tiene por que
    // conocer los proveedores concretos que usa este servicio por dentro.
    logger.error({ err, path: req.path }, 'Todos los proveedores de vision fallaron');
    res.status(502).json({
      error: { message: 'El proveedor de vision no pudo procesar la imagen.' },
    });
    return;
  }

  logger.error({ err, path: req.path }, 'Error interno no controlado');
  res.status(500).json({
    error: { message: 'Internal server error' },
  });
}
