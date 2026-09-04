import type { NextFunction, Request, Response } from 'express';
import type { ExtractFacturaUseCase } from '@application/use-cases/ExtractFacturaUseCase';

export function createExtractFacturaController(useCase: ExtractFacturaUseCase) {
  return async function extractFacturaController(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: 'No se recibio ningun archivo de imagen.' } });
        return;
      }

      const result = await useCase.execute({
        imageBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
