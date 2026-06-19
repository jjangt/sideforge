# AI Provider API

## 개요
AI Provider 인터페이스 및 사용법 문서입니다.

## Provider Types
- `mock` : Mock 데이터 반환 (MVP)
- `claude` : Claude API 연동 (3순위)
- `openai` : OpenAI API 연동 (3순위)

## 사용법
```typescript
import { createAIProvider } from '@services/ai/provider-factory';

const provider = createAIProvider({ type: 'mock' });
const recommendations = await provider.generateRecommendations(profile);
```

## 변경 이력
| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
