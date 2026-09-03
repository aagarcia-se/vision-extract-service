import { geminiClient } from '@infrastructure/config/gemini-client';
import { anthropicClient } from '@infrastructure/config/anthropic-client';
import { GeminiVisionProvider } from '@infrastructure/ocr-providers/GeminiVisionProvider';
import { ClaudeVisionProvider } from '@infrastructure/ocr-providers/ClaudeVisionProvider';
import { FallbackOcrProvider } from '@infrastructure/ocr-providers/FallbackOcrProvider';
import { ExtractBakerySalesUseCase } from '@application/use-cases/ExtractBakerySalesUseCase';

// Orden del fallback: Gemini primero, Claude como respaldo — igual que en
// tu implementacion original.
const geminiProvider = new GeminiVisionProvider(geminiClient);
const claudeProvider = new ClaudeVisionProvider(anthropicClient);
const ocrProvider = new FallbackOcrProvider([geminiProvider, claudeProvider]);

export const extractBakerySalesUseCase = new ExtractBakerySalesUseCase(ocrProvider);
