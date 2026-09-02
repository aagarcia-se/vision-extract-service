import type { NextFunction, Request, Response } from 'express';
import { logger } from '@infrastructure/logger/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err, path: req.path }, 'Unhandled error');

  res.status(500).json({
    error: {
      message: 'Internal server error',
    },
  });
}
