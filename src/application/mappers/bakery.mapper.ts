import {
  BakeryExtractionSchema,
  type BakeryExtraction,
} from '@application/templates/bakery/bakery.schema';
import { TemplateValidationError } from '@domain/errors/TemplateValidationError';
import { stripMarkdownCodeFence } from '@shared/utils/json-extraction';
import { logger } from '@infrastructure/logger/logger';

/**
 * Convierte el texto crudo devuelto por un IOcrProvider en un
 * BakeryExtraction validado. Lanza TemplateValidationError si el texto
 * no es JSON valido o no cumple el contrato.
 */
export function mapRawTextToBakeryExtraction(rawText: string): BakeryExtraction {
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

  const result = BakeryExtractionSchema.safeParse(parsedJson);

  if (!result.success) {
    throw new TemplateValidationError(
      'La respuesta no cumple el contrato esperado para el template "bakery".',
      { cause: result.error, context: { rawText, parsedJson } },
    );
  }

  return result.data;
}
