import {
  FacturaExtractionSchema,
  type FacturaExtraction,
} from '@application/templates/factura/factura.schema';
import { TemplateValidationError } from '@domain/errors/TemplateValidationError';

/**
 * Chequeo de respaldo: si, aun cuando el modelo dijo esFactura=true, los
 * campos clave estan todos vacios/en su valor "no legible", se trata
 * como no-factura de todas formas. No confiamos ciegamente en la
 * autoevaluacion del modelo.
 */
function isEffectivelyEmpty(data: FacturaExtraction): boolean {
  return (
    data.nit === '' &&
    data.numeroFactura === '' &&
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
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawText);
  } catch (error) {
    throw new TemplateValidationError(
      'La respuesta del proveedor de vision no es un JSON valido.',
      { cause: { parseError: error, rawText } },
    );
  }

  const result = FacturaExtractionSchema.safeParse(parsedJson);

  if (!result.success) {
    throw new TemplateValidationError(
      'La respuesta no cumple el contrato esperado para el template "factura".',
      { cause: result.error },
    );
  }

  if (!result.data.esFactura || isEffectivelyEmpty(result.data)) {
    throw new TemplateValidationError(
      'La imagen no parece corresponder a una factura de compra.',
    );
  }

  return result.data;
}