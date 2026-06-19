import { getAIProvider } from '../services/ai';
import { validateInput } from '../services/guardrails/input-guard';
import { validateOutput } from '../services/guardrails/output-guard';

export function useAI() {
  const provider = getAIProvider();

  async function safeCall<T>(fn: () => Promise<T>, input?: string): Promise<{ result?: T; error?: string }> {
    if (input) {
      const inputCheck = validateInput(input);
      if (!inputCheck.passed) {
        return { error: inputCheck.violations[0].message };
      }
    }

    const result = await fn();

    if (typeof result === 'string') {
      const outputCheck = validateOutput(result);
      if (!outputCheck.passed) {
        return { error: outputCheck.violations[0].message };
      }
    }

    return { result };
  }

  return { provider, safeCall };
}
