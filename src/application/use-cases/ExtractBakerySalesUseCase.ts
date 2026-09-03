import type { IOcrProvider } from '@domain/ports/IOcrProvider';
import { optimizeImage } from '@shared/utils/image-optimizer';
import { BAKERY_CONTROL_SOBRANTES_PROMPT } from '@application/templates/bakery/bakery.prompt';
import { mapRawTextToBakeryExtraction } from '@application/mappers/bakery.mapper';
import type { BakeryExtraction } from '@application/templates/bakery/bakery.schema';
import {
  createExtraction,
  markExtractionCompleted,
  markExtractionFailed,
} from '@infrastructure/database/extractions.repository';

// Con un solo cliente todavia no necesitamos que esto venga de la request
// (auth, ruta, etc.) — cuando exista un segundo cliente, este valor
// empieza a variar y ahi lo parametrizamos de verdad.
const BAKERY_CLIENT_ID = 'bakery';
const BAKERY_TEMPLATE_NAME = 'bakery';

export interface ExtractBakerySalesInput {
  imageBuffer: Buffer;
  mimeType: string;
}

export class ExtractBakerySalesUseCase {
  constructor(private readonly ocrProvider: IOcrProvider) {}

  async execute({ imageBuffer, mimeType }: ExtractBakerySalesInput): Promise<BakeryExtraction> {
    const optimizedImage = await optimizeImage(imageBuffer);

    const extractionId = await createExtraction(BAKERY_CLIENT_ID, BAKERY_TEMPLATE_NAME);

    try {
      const { rawText, providerName } = await this.ocrProvider.extract({
        imageBuffer: optimizedImage,
        mimeType,
        prompt: BAKERY_CONTROL_SOBRANTES_PROMPT,
      });

      const mappedResult = mapRawTextToBakeryExtraction(rawText);

      await markExtractionCompleted(extractionId, providerName, rawText, mappedResult);

      return mappedResult;
    } catch (error) {
      await markExtractionFailed(
        extractionId,
        error instanceof Error ? error.message : 'Error desconocido',
      );
      throw error;
    }
  }
}
