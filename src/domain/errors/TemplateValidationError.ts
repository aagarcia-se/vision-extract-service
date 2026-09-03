/**
 * Error de dominio lanzado cuando la respuesta cruda de un IOcrProvider
 * no es JSON valido, o no cumple el schema del template esperado
 * (ej. BakeryExtractionSchema).
 */
export class TemplateValidationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'TemplateValidationError';
  }
}
