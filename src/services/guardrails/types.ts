export interface GuardResult {
  passed: boolean;
  violations: Violation[];
  sanitizedContent?: string;
}

export interface Violation {
  type: 'blocked_category' | 'prompt_injection' | 'pii_detected' | 'unsafe_content';
  severity: 'warning' | 'block';
  message: string;
}

export interface GuardrailConfig {
  blockedCategories: string[];
  maxInputLength: number;
  enablePIIDetection: boolean;
  enableInjectionDetection: boolean;
}

export const defaultGuardrailConfig: GuardrailConfig = {
  blockedCategories: ['gambling', 'illegal_activity', 'pyramid_scheme', 'false_advertising', 'financial_advice', 'pii_trading', 'regulated_substances', 'adult_content'],
  maxInputLength: 2000,
  enablePIIDetection: true,
  enableInjectionDetection: true,
};
