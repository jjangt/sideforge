# AI Provider 연동 가이드

## 개요

SideForge는 **Provider Factory Pattern**을 사용하여 어떤 AI든 동일한 인터페이스로 연동할 수 있습니다.

```
src/services/ai/
├── types.ts              # AIProvider 인터페이스 (계약)
├── provider-factory.ts   # 팩토리 (타입에 따라 provider 생성)
├── providers/
│   └── mock.provider.ts  # Mock 구현 (현재 사용 중)
└── mock-data/            # Mock 응답 데이터
```

## 현재 상태

| Provider | 상태 | 설명 |
|----------|------|------|
| `mock` | ✅ 완료 | 미리 정의된 데이터 반환 (개발/테스트용) |
| `openai` | ❌ 미구현 | GPT-4o 등 연동 예정 |
| `claude` | ❌ 미구현 | Anthropic Claude 연동 예정 |

## AIProvider 인터페이스

모든 AI Provider는 이 인터페이스를 구현해야 합니다:

```typescript
// src/services/ai/types.ts

export interface AIProvider {
  readonly name: string;
  readonly version: string;

  // 프로필 → 브랜드 3개 추천
  generateRecommendations(profile: UserProfile): Promise<BrandRecommendation[]>;

  // 추천 선택 → 풀 브랜드 생성
  generateBrand(profile: UserProfile, recommendation: BrandRecommendation): Promise<Brand>;

  // 대시보드 데이터
  getDashboard(brand: Brand): Promise<BrandDashboard>;

  // AI 코치 채팅 응답
  getCoachResponse(context: CoachContext, message: string): Promise<CoachMessage>;

  // 오늘의 액션
  getTodayAction(brand: Brand, dayNumber: number): Promise<TodayAction>;

  // 콘텐츠 추천
  getContentRecommendations(brand: Brand, count?: number): Promise<ContentRecommendation[]>;

  // 주간 리뷰
  getWeeklyReview(brand: Brand, completedActions: ActionPlanDay[]): Promise<WeeklyReview>;
}
```

## 새 AI Provider 추가 방법 (Step by Step)

### Step 1: Provider 파일 생성

`src/services/ai/providers/{name}.provider.ts` 생성:

```typescript
// 예: src/services/ai/providers/openai.provider.ts

import { AIProvider } from '../types';
import { UserProfile } from '../../../types/profile';
import { Brand, BrandRecommendation, ActionPlanDay } from '../../../types/brand';
import { BrandDashboard, TodayAction, ContentRecommendation, WeeklyReview } from '../../../types/dashboard';
import { CoachContext, CoachMessage } from '../../../types/coach';

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  readonly version = '1.0.0';

  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateRecommendations(profile: UserProfile): Promise<BrandRecommendation[]> {
    const prompt = this.buildRecommendationPrompt(profile);
    const response = await this.callAPI(prompt);
    return this.parseRecommendations(response);
  }

  async generateBrand(profile: UserProfile, recommendation: BrandRecommendation): Promise<Brand> {
    const prompt = this.buildBrandPrompt(profile, recommendation);
    const response = await this.callAPI(prompt);
    return this.parseBrand(response);
  }

  async getDashboard(brand: Brand): Promise<BrandDashboard> {
    // 구현
  }

  async getCoachResponse(context: CoachContext, message: string): Promise<CoachMessage> {
    // 구현
  }

  async getTodayAction(brand: Brand, dayNumber: number): Promise<TodayAction> {
    // 구현
  }

  async getContentRecommendations(brand: Brand, count = 3): Promise<ContentRecommendation[]> {
    // 구현
  }

  async getWeeklyReview(brand: Brand, completedActions: ActionPlanDay[]): Promise<WeeklyReview> {
    // 구현
  }

  // ─── Private ───────────────────────────────────────

  private async callAPI(prompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }

  private buildRecommendationPrompt(profile: UserProfile): string {
    return `사용자 프로필을 분석하여 수익화 가능한 브랜드 3개를 추천하세요.
    
관심사: ${profile.interests.join(', ')}
좋아하는 것: ${profile.likes.join(', ')}
강점: ${profile.skills.join(', ')}
성격: ${profile.personality}
목표: ${profile.goals}
원하는 분위기: ${profile.preferredMood}
목표 수익: ${profile.targetRevenue}
주당 가용시간: ${profile.weeklyHours}시간

JSON 형식으로 반환:
{
  "recommendations": [
    {
      "id": "string",
      "title": "브랜드 방향 이름",
      "description": "설명",
      "category": "카테고리",
      "matchScore": 85,
      "estimatedRevenue": "월 100만원",
      "difficulty": "easy|medium|hard",
      "timeToFirstRevenue": "2주",
      "whyFit": "적합한 이유"
    }
  ]
}`;
  }

  private buildBrandPrompt(profile: UserProfile, rec: BrandRecommendation): string {
    // 프롬프트 작성 (Brand 타입에 맞게 JSON 반환 요청)
    return '...';
  }

  private parseRecommendations(response: string): BrandRecommendation[] {
    const parsed = JSON.parse(response);
    return parsed.recommendations;
  }

  private parseBrand(response: string): Brand {
    return JSON.parse(response);
  }
}
```

### Step 2: provider-factory.ts에 등록

```typescript
// src/services/ai/provider-factory.ts

import { OpenAIProvider } from './providers/openai.provider';

export function createAIProvider(config: ProviderConfig): AIProvider {
  switch (config.type) {
    case 'mock':
      return new MockProvider();
    case 'openai':
      return new OpenAIProvider(config.apiKey!, config.model);
    case 'claude':
      return new ClaudeProvider(config.apiKey!, config.model);
    default:
      throw new Error(`Unknown provider type: ${config.type}`);
  }
}
```

### Step 3: 환경변수 설정

`.env` 파일:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4o
```

### Step 4: getAIProvider() 수정

```typescript
export function getAIProvider(): AIProvider {
  if (!defaultProvider) {
    const type = process.env.AI_PROVIDER || 'mock';
    const config: ProviderConfig = {
      type: type as ProviderType,
      apiKey: process.env.OPENAI_API_KEY || process.env.CLAUDE_API_KEY,
      model: process.env.OPENAI_MODEL || process.env.CLAUDE_MODEL,
    };
    defaultProvider = createAIProvider(config);
  }
  return defaultProvider;
}
```

### Step 5: ProviderType에 새 타입 추가 (필요시)

```typescript
// src/services/ai/types.ts
export type ProviderType = 'mock' | 'claude' | 'openai' | 'gemini'; // 새 타입 추가
```

## 각 메서드별 입출력 타입 상세

### generateRecommendations

```
Input:  UserProfile { interests, likes, skills, personality, goals, ... }
Output: BrandRecommendation[] (3개)
        { id, title, description, category, matchScore, estimatedRevenue, difficulty, timeToFirstRevenue, whyFit }
```

### generateBrand

```
Input:  UserProfile + BrandRecommendation
Output: Brand
        { id, name, tagline, slogan, story, targetCustomer, toneAndManner, colorPalette, 
          logoConcept, snsProfile, firstContentIdeas, revenueModel, actionPlan30, status }
```

### getDashboard

```
Input:  Brand
Output: BrandDashboard
        { scores, todayAction, contentRecommendations, improvements, nextMilestone, planProgress, weeklyReview }
```

### getCoachResponse

```
Input:  CoachContext { brand, dashboard, recentMessages, currentDay } + message(string)
Output: CoachMessage { id, role:'coach', content, timestamp, actionItems? }
```

### getTodayAction

```
Input:  Brand + dayNumber(number)
Output: TodayAction { id, title, description, estimatedMinutes, category, priority, reason }
```

### getContentRecommendations

```
Input:  Brand + count(number, default 3)
Output: ContentRecommendation[] { id, title, platform, format, hook, estimatedEngagement, difficulty }
```

### getWeeklyReview

```
Input:  Brand + completedActions(ActionPlanDay[])
Output: WeeklyReview { summary, achievements, missedItems, nextWeekFocus }
```

## Guardrails (안전장치)

AI 응답은 자동으로 검증됩니다:

```typescript
// src/hooks/useAI.ts의 safeCall 메서드
const { result, error } = await safeCall(
  () => provider.generateRecommendations(profile),
  userInput // 입력 검증
);
```

- **Input Guard**: 부적절한 입력 차단 (`src/services/guardrails/input-guard.ts`)
- **Output Guard**: AI 응답 검증 (`src/services/guardrails/output-guard.ts`)
- **Allowed Categories**: 허용 카테고리 제한 (`src/services/guardrails/allowed-categories.ts`)

## 팁

- Mock Provider로 UI 개발을 먼저 완료한 뒤, 실제 AI를 연동하세요
- 프롬프트는 Provider 클래스 내 private 메서드로 관리하세요
- API 응답은 반드시 타입에 맞게 파싱해야 합니다 (JSON Schema 사용 권장)
- 에러 처리: API 실패 시 fallback으로 Mock 데이터 반환하는 것도 좋은 패턴입니다

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
| 2025-06-19 | Team | 연동 가이드 상세화, Step by Step 추가 |
