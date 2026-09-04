import { geminiClient } from '@infrastructure/config/gemini-client';
import { anthropicClient } from '@infrastructure/config/anthropic-client';
import { GeminiVisionProvider } from '@infrastructure/ocr-providers/GeminiVisionProvider';
import { ClaudeVisionProvider } from '@infrastructure/ocr-providers/ClaudeVisionProvider';
import { FallbackOcrProvider } from '@infrastructure/ocr-providers/FallbackOcrProvider';
import { ExtractBakerySalesUseCase } from '@application/use-cases/ExtractBakerySalesUseCase';
import { ExtractFacturaUseCase } from '@application/use-cases/ExtractFacturaUseCase';

// Orden del fallback: Gemini primero, Claude como respaldo. El mismo
// proveedor (con la misma estrategia de fallback) se reutiliza para
// todos los templates — lo que cambia entre ellos es el prompt y el
// schema de validacion, no el proveedor de vision.
const geminiProvider = new GeminiVisionProvider(geminiClient);
const claudeProvider = new ClaudeVisionProvider(anthropicClient);
const ocrProvider = new FallbackOcrProvider([geminiProvider, claudeProvider]);

export const extractBakerySalesUseCase = new ExtractBakerySalesUseCase(ocrProvider);
export const extractFacturaUseCase = new ExtractFacturaUseCase(ocrProvider);
