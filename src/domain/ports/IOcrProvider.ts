/**
 * Datos de entrada para pedirle a un proveedor de vision que extraiga
 * contenido de una imagen.
 */
export interface OcrExtractionInput {
  /** Bytes crudos de la imagen (la foto de la hoja). */
  imageBuffer: Buffer;

  /** Tipo MIME de la imagen, ej. "image/jpeg" o "image/png". */
  mimeType: string;

  /**
   * Instrucciones para el modelo generativo (ej. que describa la hoja
   * de "Control de Sobrantes" y devuelva el JSON con el formato esperado).
   * La define quien llama al puerto (la capa application, segun el
   * template del cliente) — el puerto NO conoce el contenido del prompt.
   */
  prompt: string;
}

/**
 * Resultado de una extraccion exitosa. Incluye "providerName" para que
 * quien llama sepa CUAL proveedor concreto respondio (util para
 * auditoria/estadisticas — ej. saber si fue Gemini o Claude el que
 * proceso una imagen en particular).
 */
export interface OcrExtractionResult {
  /** Texto crudo devuelto por el modelo (sin parsear ni validar). */
  rawText: string;

  /** Nombre del proveedor que efectivamente respondio (ej. "gemini"). */
  providerName: string;
}

/**
 * Puerto que debe implementar cualquier proveedor de vision/OCR
 * generativo (Gemini, GPT-4 Vision, Claude, etc.).
 *
 * El dominio y la aplicacion dependen UNICAMENTE de esta interfaz, nunca
 * de un SDK concreto — eso permite cambiar de proveedor sin tocar el
 * resto del sistema, y probar el caso de uso con un mock de este puerto
 * sin llamar a ningun servicio real.
 */
export interface IOcrProvider {
  /** Identificador corto del proveedor, ej. "gemini", "claude". */
  readonly name: string;

  /**
   * Envia la imagen + el prompt al modelo, y devuelve su respuesta cruda
   * como texto. Quien llama esta funcion es responsable de parsear y
   * validar ese texto (normalmente contra un schema de Zod del template
   * correspondiente) — el puerto no hace ninguna suposicion sobre el
   * formato de lo que el modelo responda.
   *
   * @throws {OcrExtractionError} si el proveedor falla (red, limite de
   *   uso, imagen invalida, etc.)
   */
  extract(input: OcrExtractionInput): Promise<OcrExtractionResult>;
}
