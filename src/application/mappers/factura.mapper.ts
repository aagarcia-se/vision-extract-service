import {
  FacturaExtractionSchema,
  type FacturaExtraction,
} from '@application/templates/factura/factura.schema';
import { TemplateValidationError } from '@domain/errors/TemplateValidationError';

/**
 * Convierte el texto crudo devuelto por un IOcrProvider en un
 * FacturaExtraction validado. Lanza TemplateValidationError si el texto
 * no es JSON valido o no cumple el contrato.
 */
export function mapRawTextToFacturaExtraction(rawText: string): FacturaExtraction {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawText);
  } catch (error) {
    throw new TemplateValidationError(
      'La respuesta del proveedor de vision no es un JSON valido.',
      { cause: error },
    );
  }

  const result = FacturaExtractionSchema.safeParse(parsedJson);

  if (!result.success) {
    throw new TemplateValidationError(
      'La respuesta no cumple el contrato esperado para el template "factura".',
      { cause: result.error },
    );
  }

  return result.data;
}
