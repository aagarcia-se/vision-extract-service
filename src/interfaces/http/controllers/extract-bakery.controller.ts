import type { NextFunction, Request, Response } from 'express';
import type { ExtractBakerySalesUseCase } from '@application/use-cases/ExtractBakerySalesUseCase';

export function createExtractBakeryController(useCase: ExtractBakerySalesUseCase) {
  return async function extractBakeryController(
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
