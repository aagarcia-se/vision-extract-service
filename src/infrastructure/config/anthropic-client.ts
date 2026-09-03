import Anthropic from '@anthropic-ai/sdk';
import { env } from '@infrastructure/config/env';

export const anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
