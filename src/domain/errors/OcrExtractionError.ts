/**
 * Error de dominio lanzado cuando un IOcrProvider falla al extraer
 * contenido de una imagen, sin importar cual sea el proveedor concreto
 * (Gemini, GPT-4 Vision, Claude, etc.).
 *
 * El caso de uso captura este tipo de error de forma uniforme, sin
 * necesitar saber que libreria o API fallo por debajo.
 */
export class OcrExtractionError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'OcrExtractionError';
  }
}
