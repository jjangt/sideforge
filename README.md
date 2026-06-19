# SideForge

> AI와 함께 만드는 나만의 브랜드와 두 번째 수입

## Overview

SideForge는 사용자의 관심사, 경험, 성향, 목표를 분석하여 수익화 가능한 브랜드를 발굴하고, 브랜드를 생성하며, 성장 방향을 제안하는 AI 공동창업자 플랫폼입니다.

## Quick Start

```bash
# 프로젝트 폴더로 이동
cd D:\sideline\sideforge

# 의존성 설치
npm install

# 웹 개발 서버 (포트 5847)
npx expo start --web --port 5847 --clear

# 또는 스크립트 사용
npm run web
```

## 사용자 플로우

```
랜딩 → 온보딩(8단계) → AI 추천(3개) → 브랜드 생성 → 브랜드 상세/미리보기 → 대시보드 → AI 코치
```

1. **랜딩**: "내 브랜드 만들기 시작" 클릭
2. **온보딩**: 관심사, 강점, 목표 등 8가지 질문 답변
3. **추천**: AI가 분석한 3개 브랜드 방향 중 선택
4. **브랜드 생성**: 자동으로 브랜드 전체 설계 (이름, 스토리, 컬러, 수익 모델 등)
5. **대시보드**: 30일 플랜, 오늘의 액션, 점수, 콘텐츠 추천
6. **AI 코치**: 챗봇으로 브랜드 성장 상담

## Tech Stack

| 분류 | 기술 |
|------|------|
| Framework | Expo SDK 56 + Expo Router |
| Language | TypeScript (strict) |
| Styling | NativeWind v4 (Tailwind CSS) |
| State | Zustand (persist) |
| AI | Provider Factory Pattern (Mock → OpenAI/Claude) |
| i18n | i18next + expo-localization (ko/en/ja/zh) |
| CI/CD | GitHub Actions + Cloudflare Pages |

## 프로젝트 구조

```
sideforge/
├── app/                    # 페이지 (Expo Router)
│   ├── _layout.tsx         # Root Layout
│   ├── index.tsx           # 랜딩
│   ├── onboarding.tsx      # 온보딩
│   ├── recommendations.tsx # 추천
│   ├── dashboard.tsx       # 대시보드
│   ├── coach.tsx           # AI 코치
│   └── brand/              # 브랜드 관련
├── src/
│   ├── components/ui/      # 공용 UI 컴포넌트
│   ├── i18n/               # 다국어 (ko/en/ja/zh)
│   ├── lib/                # 핵심 유틸리티 (navigation, feedback)
│   ├── services/ai/        # AI Provider (핵심)
│   ├── stores/             # Zustand 상태 관리
│   ├── types/              # TypeScript 타입
│   ├── hooks/              # 커스텀 훅
│   └── constants/          # 상수 (테마 등)
├── docs/                   # 문서
└── .github/workflows/      # CI/CD
```

## Documentation

### 개발 가이드
- [AI Provider 연동 가이드](docs/api/ai-provider.md) ← **새 AI 추가 시 필독**
- [UI 컴포넌트 API](docs/api/components.md)
- [공용 라이브러리 (Navigation/Feedback)](docs/api/lib.md)
- [Mock Response 구조](docs/api/mock-response.md)

### 디자인 & i18n
- [디자인 시스템](docs/design/design-system.md)
- [다국어(i18n) 가이드](docs/features/i18n.md)

### 아키텍처
- [System Design](docs/architecture/system-design.md)
- [Frontend](docs/architecture/frontend.md)
- [Backend](docs/architecture/backend.md)
- [AI Architecture](docs/architecture/ai-architecture.md)

### 기능 명세
- [Onboarding](docs/features/onboarding.md)
- [Recommendations](docs/features/recommendations.md)
- [Brand Generation](docs/features/brand-generation.md)
- [Brand Preview](docs/features/brand-preview.md)
- [Dashboard](docs/features/dashboard.md)
- [Coach](docs/features/coach.md)

### 프로젝트
- [Vision](docs/project/vision.md)
- [Roadmap](docs/project/roadmap.md)
- [Requirements](docs/project/requirements.md)
- [Changelog](docs/project/changelog.md)

### 보안
- [Security Principles](docs/security/security-principles.md)
- [AI Safety](docs/security/ai-safety.md)
- [Privacy](docs/security/privacy.md)

### 비즈니스
- [Business Model](docs/business/business-model.md)
- [Pricing](docs/business/pricing.md)
- [Competitors](docs/business/competitors.md)
- [Target Users](docs/business/target-users.md)
- [Monetization](docs/business/monetization.md)

## 브랜치 전략

```
main (운영/PR) → develop (개발/PR) → feature/* (로컬 작업)
```

## License

MIT
