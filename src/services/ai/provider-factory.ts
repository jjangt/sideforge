import { AIProvider, ProviderConfig } from './types';
import { MockProvider } from './providers/mock.provider';

export function createAIProvider(config: ProviderConfig): AIProvider {
  switch (config.type) {
    case 'mock':
      return new MockProvider();
    case 'claude':
      // TODO: 3순위 구현
      throw new Error('Claude provider not yet implemented. Use mock provider.');
    case 'openai':
      // TODO: 3순위 구현
      throw new Error('OpenAI provider not yet implemented. Use mock provider.');
    default:
      throw new Error(`Unknown provider type: ${config.type}`);
  }
}

// 기본 Provider (환경변수 기반)
let defaultProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!defaultProvider) {
    defaultProvider = createAIProvider({ type: 'mock' });
  }
  return defaultProvider;
}
