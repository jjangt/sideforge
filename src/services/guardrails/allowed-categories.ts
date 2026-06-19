export const ALLOWED_CATEGORIES = [
  'content_creation',
  'digital_products',
  'template_sales',
  'education',
  'brand_operation',
  'affiliate_marketing',
  'consulting',
  'community',
  'subscription_service',
  'freelancing',
] as const;

export const BLOCKED_CATEGORIES = [
  'gambling',
  'illegal_activity',
  'pyramid_scheme',
  'false_advertising',
  'financial_advice',
  'pii_trading',
  'regulated_substances',
  'adult_content',
] as const;

export const BLOCKED_KEYWORDS = [
  '도박', '카지노', '불법', '다단계', '폰지',
  '투자 수익 보장', '원금 보장', '확정 수익',
  '개인정보 판매', '주민등록번호',
];
