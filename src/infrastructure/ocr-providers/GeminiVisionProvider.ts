import type { GoogleGenAI } from '@google/genai';
import { OcrExtractionError } from '@domain/errors/OcrExtractionError';
import type {
  IOcrProvider,
  OcrExtractionInput,
  OcrExtractionResult,
} from '@domain/ports/IOcrProvider';

// Recuerda: si te da error 404 o 503, cambia esto a 'gemini-1.5-flash'
const GEMINI_MODEL = 'gemini-2.5-flash'; 

export class GeminiVisionProvider implements IOcrProvider {
  readonly name = 'gemini';

  constructor(private readonly client: GoogleGenAI) {}

  async extract({ imageBuffer, mimeType, prompt }: OcrExtractionInput): Promise<OcrExtractionResult> {
    try {
      const response = await this.client.models.generateContent({
        model: GEMINI_MODEL,
        // temperature 0: esta es una tarea de lectura literal, no de
        // generacion creativa. Con la temperatura default, el mismo
        // modelo puede leer el mismo documento con distinto nivel de
        // detalle entre una llamada y otra (ej. truncar un nombre largo).
        // En 0 se reduce esa variacion al minimo.
        config: { 
          // temperature 0: reduce la variación al mínimo para tareas de lectura literal.
          temperature: 0,
          // Evita los backticks (```json) y fuerza una respuesta limpia
          responseMimeType: 'application/json',
          // Pasamos el prompt como regla del sistema para mayor obediencia
          systemInstruction: prompt
        },
        contents: [
          {
            // Solo enviamos la imagen en el contenido
            inlineData: {
              mimeType,
              data: imageBuffer.toString('base64'),
            },
          },
        ],
      });

      const text = response.text;

      if (!text) {
        throw new Error('Gemini no devolvio contenido de texto en la respuesta.');
      }

      // Ordenamos el JSON con saltos de línea e indentación
      const parsedData = JSON.parse(text);
      const formattedText = JSON.stringify(parsedData, null, 2);

      return { rawText: formattedText, providerName: this.name };
    } catch (error) {
      throw new OcrExtractionError(`Fallo la extraccion con ${this.name}`, { cause: error });
    }
  }
}