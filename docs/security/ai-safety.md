# AI Safety & Guardrails

## 개요

SideForge는 수익화를 지원하므로, AI가 위험한 방향을 제안하지 않도록 Guardrails를 적용합니다.

## 허용 카테고리

| 카테고리 | 설명 |
|----------|------|
| content_creation | 콘텐츠 제작 (블로그, 영상, SNS) |
| digital_products | 디지털 상품 (템플릿, 전자책, 강의) |
| template_sales | 노션/피그마 템플릿 판매 |
| education | 강의, 교육, 멘토링 |
| brand_operation | 브랜드 운영, 커뮤니티 |
| affiliate_marketing | 합법적 제휴 마케팅 |
| consulting | 컨설팅, 코칭 |
| community | 커뮤니티 운영, 멤버십 |
| subscription_service | 구독 서비스 |
| freelancing | 프리랜싱, 외주 |

## 비허용 카테고리

| 카테고리 | 설명 |
|----------|------|
| gambling | 도박, 사행성 |
| illegal_activity | 불법 행위 |
| pyramid_scheme | 다단계, 폰지 스킴 |
| false_advertising | 허위 광고 |
| financial_advice | 금융 투자 권유 |
| pii_trading | 개인정보 판매 |
| regulated_substances | 규제 물질 |
| adult_content | 성인 콘텐츠 |

## Guardrails 레이어 구조

```
사용자 입력 → [Input Guard] → AI Provider → [Output Guard] → 사용자 출력
```

## Input Guard

1. 길이 검증 (max 2000자)
2. Prompt Injection 패턴 탐지
3. PII 감지 (이메일, 전화번호 등)
4. 비허용 키워드 필터

## Output Guard

1. 비허용 카테고리 키워드 탐지
2. 금융/투자 권유 표현 감지
3. 과장된 수익 약속 감지 ("확실히 벌 수 있다" 등)
4. 개인정보 노출 검사

## 위반 시 처리

- warning: 사용자에게 주의 메시지 표시, 결과는 전달
- block: 결과 차단, 안전한 대체 응답 제공

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
