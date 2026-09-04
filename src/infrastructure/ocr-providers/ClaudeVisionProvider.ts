import type Anthropic from '@anthropic-ai/sdk';
import { OcrExtractionError } from '@domain/errors/OcrExtractionError';
import type {
  IOcrProvider,
  OcrExtractionInput,
  OcrExtractionResult,
} from '@domain/ports/IOcrProvider';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

// 1024 alcanzaba para bakery (dos columnas simples), pero una factura con
// muchos productos + los campos nuevos (receptor, fecha/hora normalizadas)
// puede generar un JSON mas largo. Si se corta a mitad de la respuesta,
// el JSON queda invalido y falla el parseo aunque la imagen se haya leido
// bien — subir el limite evita ese falso negativo.
const MAX_OUTPUT_TOKENS = 4096;

const SUPPORTED_IMAGE_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

type SupportedImageMediaType = (typeof SUPPORTED_IMAGE_MEDIA_TYPES)[number];

/**
 * El SDK de Anthropic solo acepta un conjunto cerrado de mime types para
 * imagenes. Esta funcion valida el mimeType real de la imagen contra ese
 * conjunto ANTES de mandarlo al SDK, en vez de forzar el tipo con "as"
 * a ciegas.
 */
function assertSupportedMediaType(
  mimeType: string,
): asserts mimeType is SupportedImageMediaType {
  if (!(SUPPORTED_IMAGE_MEDIA_TYPES as readonly string[]).includes(mimeType)) {
    throw new Error(`Tipo de imagen no soportado por Claude: ${mimeType}`);
  }
}

export class ClaudeVisionProvider implements IOcrProvider {
  readonly name = 'claude';

  constructor(private readonly client: Anthropic) {}

  async extract({ imageBuffer, mimeType, prompt }: OcrExtractionInput): Promise<OcrExtractionResult> {
    try {
      assertSupportedMediaType(mimeType);

      const response = await this.client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        // temperature 0: misma razon que en Gemini — lectura literal de
        // un documento, no generacion creativa. Reduce la variacion de
        // una llamada a otra sobre la misma imagen.
        temperature: 0,
        // El prompt de instrucciones es identico en todas las llamadas
        // (solo cambia la imagen), asi que va en `system` con cache_control
        // en vez de mezclado en el content del user. Esto permite que la
        // API cachee este bloque: en llamadas siguientes dentro del TTL
        // (5 min por defecto) se factura al 10% del precio normal de
        // input tokens. Requiere ~1024 tokens minimo en el bloque para
        // que el cache se active (si el prompt es mas corto, simplemente
        // no cachea, sin error ni penalizacion).
        system: [
          {
            type: 'text',
            text: prompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBuffer.toString('base64'),
                },
              },
            ],
          },
        ],
      });

      const firstBlock = response.content[0];

      if (!firstBlock || firstBlock.type !== 'text') {
        throw new Error('Claude no devolvio un bloque de texto en la respuesta.');
      }

      // Utiles para confirmar en logs/metricas que el cache realmente esta
      // pegando. cache_read_input_tokens > 0 en una llamada = hit.
      // cache_creation_input_tokens > 0 = fue la llamada que escribio el cache.
      // Ambos vienen en response.usage.

      return { rawText: firstBlock.text, providerName: this.name };
    } catch (error) {
      throw new OcrExtractionError(`Fallo la extraccion con ${this.name}`, { cause: error });
    }
  }
}