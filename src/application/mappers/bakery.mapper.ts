import {
  BakeryExtractionSchema,
  type BakeryExtraction,
} from '@application/templates/bakery/bakery.schema';
import { TemplateValidationError } from '@domain/errors/TemplateValidationError';

/**
 * Convierte el texto crudo devuelto por un IOcrProvider en un
 * BakeryExtraction validado. Lanza TemplateValidationError si el texto
 * no es JSON valido o no cumple el contrato.
 */
export function mapRawTextToBakeryExtraction(rawText: string): BakeryExtraction {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawText);
  } catch (error) {
    throw new TemplateValidationError(
      'La respuesta del proveedor de vision no es un JSON valido.',
      { cause: { parseError: error, rawText } },
    );
  }

  const result = BakeryExtractionSchema.safeParse(parsedJson);

  if (!result.success) {
    throw new TemplateValidationError(
      'La respuesta no cumple el contrato esperado para el template "bakery".',
      { cause: result.error },
    );
  }

  return result.data;
}