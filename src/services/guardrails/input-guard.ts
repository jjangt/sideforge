import { GuardResult, GuardrailConfig, defaultGuardrailConfig } from './types';
import { BLOCKED_KEYWORDS } from './allowed-categories';

const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+(instructions|prompts)/i,
  /you\s+are\s+now/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<<SYS>>/i,
];

const PII_PATTERNS = [
  /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/, // email
  /\b\d{2,3}-\d{3,4}-\d{4}\b/,   // phone
  /\b\d{6}-[1-4]\d{6}\b/,         // 주민등록번호
];

export function validateInput(input: string, config: GuardrailConfig = defaultGuardrailConfig): GuardResult {
  const violations: GuardResult['violations'] = [];

  if (input.length > config.maxInputLength) {
    violations.push({ type: 'unsafe_content', severity: 'block', message: `입력이 너무 깁니다. (최대 ${config.maxInputLength}자)` });
  }

  if (config.enableInjectionDetection) {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        violations.push({ type: 'prompt_injection', severity: 'block', message: '허용되지 않는 입력 패턴이 감지되었습니다.' });
        break;
      }
    }
  }

  if (config.enablePIIDetection) {
    for (const pattern of PII_PATTERNS) {
      if (pattern.test(input)) {
        violations.push({ type: 'pii_detected', severity: 'warning', message: '개인정보가 포함된 것으로 보입니다. 개인정보는 입력하지 마세요.' });
        break;
      }
    }
  }

  for (const keyword of BLOCKED_KEYWORDS) {
    if (input.includes(keyword)) {
      violations.push({ type: 'blocked_category', severity: 'block', message: `허용되지 않는 내용이 포함되어 있습니다: ${keyword}` });
      break;
    }
  }

  return { passed: violations.filter(v => v.severity === 'block').length === 0, violations };
}
