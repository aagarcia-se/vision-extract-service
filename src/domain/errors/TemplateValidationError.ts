/**
 * Error de dominio lanzado cuando la respuesta cruda de un IOcrProvider
 * no es JSON valido, o no cumple el schema del template esperado
 * (ej. BakeryExtractionSchema).
 *
 * "context" es una propiedad EXPLICITA (no solo "cause") a proposito:
 * el serializador de errores de pino no navega objetos anidados dentro
 * de "cause" cuando no son a su vez un Error — poniendolo como propiedad
 * de primer nivel garantiza que se pueda loguear (ver errorHandler.ts).
 */
export class TemplateValidationError extends Error {
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'TemplateValidationError';
    this.context = options?.context;
  }
}
