import type Anthropic from '@anthropic-ai/sdk';
import { OcrExtractionError } from '@domain/errors/OcrExtractionError';
import type {
  IOcrProvider,
  OcrExtractionInput,
  OcrExtractionResult,
} from '@domain/ports/IOcrProvider';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

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
        max_tokens: 1024,
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
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      const firstBlock = response.content[0];

      if (!firstBlock || firstBlock.type !== 'text') {
        throw new Error('Claude no devolvio un bloque de texto en la respuesta.');
      }

      return { rawText: firstBlock.text, providerName: this.name };
    } catch (error) {
      throw new OcrExtractionError(`Fallo la extraccion con ${this.name}`, { cause: error });
    }
  }
}
