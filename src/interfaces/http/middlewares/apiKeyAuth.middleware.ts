import type { NextFunction, Request, Response } from 'express';
import { env } from '@infrastructure/config/env';

/**
 * Autenticacion minima servicio-a-servicio: exige un header "x-api-key"
 * que coincida con SERVICE_API_KEY.
 *
 * Es un punto de partida, no un sistema de auth completo. Si tu monolito
 * ya tiene su propio mecanismo (JWT, etc.), reemplaza esta funcion por el
 * equivalente que valide contra ese mismo sistema.
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const providedKey = req.header('x-api-key');

  if (!providedKey || providedKey !== env.SERVICE_API_KEY) {
    res.status(401).json({ error: { message: 'API key invalida o ausente.' } });
    return;
  }

  next();
}
