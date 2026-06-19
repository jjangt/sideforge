import { GuardResult } from './types';
import { BLOCKED_KEYWORDS } from './allowed-categories';

const UNSAFE_OUTPUT_PATTERNS = [
  /확실히\s+벌\s+수\s+있/,
  /원금\s*보장/,
  /수익\s*보장/,
  /투자\s*권유/,
];

export function validateOutput(output: string): GuardResult {
  const violations: GuardResult['violations'] = [];

  for (const keyword of BLOCKED_KEYWORDS) {
    if (output.includes(keyword)) {
      violations.push({ type: 'blocked_category', severity: 'block', message: `AI 응답에 허용되지 않는 내용이 포함되었습니다.` });
      break;
    }
  }

  for (const pattern of UNSAFE_OUTPUT_PATTERNS) {
    if (pattern.test(output)) {
      violations.push({ type: 'unsafe_content', severity: 'warning', message: 'AI 응답에 과장된 수익 표현이 포함될 수 있습니다.' });
      break;
    }
  }

  return { passed: violations.filter(v => v.severity === 'block').length === 0, violations };
}
