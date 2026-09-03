import { OcrExtractionError } from '@domain/errors/OcrExtractionError';
import type {
  IOcrProvider,
  OcrExtractionInput,
  OcrExtractionResult,
} from '@domain/ports/IOcrProvider';

/**
 * Compone una lista ordenada de proveedores de vision: intenta el primero,
 * y si falla, prueba con el siguiente, y asi sucesivamente hasta que uno
 * funcione o se agoten todos.
 *
 * Implementa el mismo puerto (IOcrProvider) que los proveedores individuales,
 * asi que el resto del sistema (el caso de uso) no sabe ni le importa que
 * por debajo hay una estrategia de fallback entre varios proveedores. El
 * "providerName" que devuelve extract() es el del proveedor que
 * efectivamente respondio, no un valor generico de "fallback".
 */
export class FallbackOcrProvider implements IOcrProvider {
  readonly name = 'fallback';

  constructor(private readonly providers: readonly IOcrProvider[]) {
    if (providers.length === 0) {
      throw new Error('FallbackOcrProvider necesita al menos un proveedor.');
    }
  }

  async extract(input: OcrExtractionInput): Promise<OcrExtractionResult> {
    const errors: unknown[] = [];

    for (const provider of this.providers) {
      try {
        return await provider.extract(input);
      } catch (error) {
        errors.push(error);
      }
    }

    throw new OcrExtractionError('Todos los proveedores de vision fallaron.', {
      cause: errors,
    });
  }
}
