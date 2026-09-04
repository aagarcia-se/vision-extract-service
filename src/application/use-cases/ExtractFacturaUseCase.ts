import type { IOcrProvider } from '@domain/ports/IOcrProvider';
import { optimizeImage } from '@shared/utils/image-optimizer';
import { FACTURA_EXTRACTION_PROMPT } from '@application/templates/factura/factura.prompt';
import { mapRawTextToFacturaExtraction } from '@application/mappers/factura.mapper';
import type { FacturaExtraction } from '@application/templates/factura/factura.schema';
import {
  createFactura,
  markFacturaCompleted,
  markFacturaFailed,
  saveFacturaImage,
} from '@infrastructure/database/facturas.repository';

// Placeholder hasta que este endpoint se ate a un cliente real —
// mismo criterio que se uso en bakery.
const FACTURA_CLIENT_ID = 'general';

export interface ExtractFacturaInput {
  imageBuffer: Buffer;
  mimeType: string;
}

export class ExtractFacturaUseCase {
  constructor(private readonly ocrProvider: IOcrProvider) {}

  async execute({ imageBuffer, mimeType }: ExtractFacturaInput): Promise<FacturaExtraction> {
    const optimizedImage = await optimizeImage(imageBuffer);

    const facturaId = await createFactura(FACTURA_CLIENT_ID);

    // Se guarda la imagen ORIGINAL (no la optimizada) como evidencia fiel
    // de lo que se subio, independientemente de si la extraccion falla.
    await saveFacturaImage(facturaId, imageBuffer.toString('base64'), mimeType);

    try {
      const { rawText, providerName } = await this.ocrProvider.extract({
        imageBuffer: optimizedImage,
        mimeType,
        prompt: FACTURA_EXTRACTION_PROMPT,
      });

      const mappedResult = mapRawTextToFacturaExtraction(rawText);

      await markFacturaCompleted(facturaId, providerName, rawText, mappedResult);

      return mappedResult;
    } catch (error) {
      await markFacturaFailed(
        facturaId,
        error instanceof Error ? error.message : 'Error desconocido',
      );

      throw error;
    }
  }
}
