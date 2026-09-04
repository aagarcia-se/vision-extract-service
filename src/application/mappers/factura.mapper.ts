import {
  FacturaExtractionSchema,
  type FacturaExtraction,
} from '@application/templates/factura/factura.schema';
import { TemplateValidationError } from '@domain/errors/TemplateValidationError';
import { stripMarkdownCodeFence } from '@shared/utils/json-extraction';
import { logger } from '@infrastructure/logger/logger';

/**
 * Chequeo de respaldo: si, aun cuando el modelo dijo esFactura=true, no
 * hay NADA util (ni datos de compra ni del receptor), se trata como
 * no-factura de todas formas. No confiamos ciegamente en la
 * autoevaluacion del modelo.
 *
 * OJO: esto NO rechaza facturas parciales/cortadas que si tengan
 * productos o receptor identificados, aunque falten datos del emisor —
 * ese caso es valido a proposito (ver factura.prompt.ts).
 */
function isEffectivelyEmpty(data: FacturaExtraction): boolean {
  return (
    data.nitReceptor === '' &&
    data.nombreReceptor === '' &&
    data.productos.length === 0 &&
    data.total === -1
  );
}

/**
 * Convierte el texto crudo devuelto por un IOcrProvider en un
 * FacturaExtraction validado. Lanza TemplateValidationError si el texto
 * no es JSON valido, no cumple el contrato, o el modelo determino que la
 * imagen no es una factura (o efectivamente no extrajo nada util).
 */
export function mapRawTextToFacturaExtraction(rawText: string): FacturaExtraction {
  const cleanedText = stripMarkdownCodeFence(rawText);

  if (cleanedText !== rawText.trim()) {
    logger.debug(
      { rawText },
      'El proveedor envolvio la respuesta en markdown; se limpio antes de parsear',
    );
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(cleanedText);
  } catch (error) {
    throw new TemplateValidationError(
      'La respuesta del proveedor de vision no es un JSON valido.',
      { cause: error, context: { rawText, cleanedText } },
    );
  }

  const result = FacturaExtractionSchema.safeParse(parsedJson);

  if (!result.success) {
    throw new TemplateValidationError(
      'La respuesta no cumple el contrato esperado para el template "factura".',
      { cause: result.error, context: { rawText, parsedJson } },
    );
  }

  if (!result.data.esFactura || isEffectivelyEmpty(result.data)) {
    throw new TemplateValidationError(
      'La imagen no parece corresponder a una factura de compra.',
      { context: { rawText } },
    );
  }

  return result.data;
}
