import { logger } from '@infrastructure/logger/logger';
import { OcrExtractionError } from '@domain/errors/OcrExtractionError';
import type {
  IOcrProvider,
  OcrExtractionInput,
  OcrExtractionResult,
} from '@domain/ports/IOcrProvider';

interface FailedAttempt {
  provider: string;
  error: unknown;
}

/**
 * Compone una lista ordenada de proveedores de vision: intenta el primero,
 * y si falla, prueba con el siguiente, y asi sucesivamente hasta que uno
 * funcione o se agoten todos.
 *
 * Cada fallo individual se registra en el logger AUNQUE un proveedor
 * posterior termine funcionando — de lo contrario, si Gemini falla pero
 * Claude lo resuelve, nadie se enteraria nunca de que Gemini tuvo un
 * problema (el cliente HTTP recibe una respuesta 200 exitosa normal).
 */
export class FallbackOcrProvider implements IOcrProvider {
  readonly name = 'fallback';

  constructor(private readonly providers: readonly IOcrProvider[]) {
    if (providers.length === 0) {
      throw new Error('FallbackOcrProvider necesita al menos un proveedor.');
    }
  }

  async extract(input: OcrExtractionInput): Promise<OcrExtractionResult> {
    const failedAttempts: FailedAttempt[] = [];

    for (const provider of this.providers) {
      try {
        const result = await provider.extract(input);

        if (failedAttempts.length > 0) {
          logger.warn(
            {
              failedProviders: failedAttempts.map((attempt) => attempt.provider),
              succeededWith: provider.name,
            },
            `Extraccion recuperada por fallback — funciono con "${provider.name}"`,
          );
        }

        return result;
      } catch (error) {
        logger.error(
          { provider: provider.name, err: error },
          `El proveedor "${provider.name}" fallo al procesar la imagen`,
        );
        failedAttempts.push({ provider: provider.name, error });
      }
    }

    throw new OcrExtractionError('Todos los proveedores de vision fallaron.', {
      cause: failedAttempts,
    });
  }
}
