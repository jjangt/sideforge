# AI Architecture

## 개요

Provider Factory 패턴으로 AI 서비스를 추상화. Mock → Claude → OpenAI 교체 가능.

## Provider Interface

```typescript
interface AIProvider {
  name: string;
  version: string;
  generateRecommendations(profile): Promise<BrandRecommendation[]>;
  generateBrand(profile, recommendation): Promise<Brand>;
  getDashboard(brand): Promise<BrandDashboard>;
  getCoachResponse(context, message): Promise<CoachMessage>;
  getTodayAction(brand, dayNumber): Promise<TodayAction>;
  getContentRecommendations(brand, count?): Promise<ContentRecommendation[]>;
  getWeeklyReview(brand, completedActions): Promise<WeeklyReview>;
}
```

## Provider Factory

```typescript
createAIProvider(config: ProviderConfig): AIProvider
```

## Guardrails 적용

모든 AI 호출은 Guardrails 레이어를 통과:
1. Input Guard: Prompt Injection 방어, PII 탐지
2. Output Guard: 비허용 카테고리 필터링

## 현재 상태

- [x] Mock Provider
- [ ] Claude Provider
- [ ] OpenAI Provider

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
