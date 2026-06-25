# SideForge

> YouTube 채널 AI 분석 플랫폼 — 데이터 기반 바이럴 공식 추출

## Overview

YouTube 채널 URL을 입력하면 AI(Gemini 2.5 Flash)가 채널 데이터를 분석하여 바이럴 공식, 개선 액션, 추천 콘텐츠, 벤치마킹 채널을 제공합니다.

**핵심 가치**: "다음에 뭘 올려야 터지는지"를 데이터로 알려주는 서비스

## Quick Start (로컬 개발)

```bash
# 의존성 설치
cd D:\sideline\sideforge
npm install
cd api && npm install && cd ..

# 터미널 1 — 프론트엔드 (포트 5847)
npx expo start --web --port 5847 --clear

# 터미널 2 — API (포트 8787)
cd api && npx wrangler dev --remote --env development
```

- 프론트: http://localhost:5847
- API: http://localhost:8787
- API URL 분기는 자동 (`src/services/api.ts`의 `getApiUrl()`)

> 상세 개발 환경 정보: [docs/dev-guide.md](docs/dev-guide.md)

## 사용자 플로우

```
랜딩(/) → 로그인(/auth) → 분석(/analyze) → 리포트(/report/:id)
```

1. 채널 URL 또는 @handle 입력
2. AI 분석 (15~30초)
3. 리포트: 점수 → 영상 성과 → 바이럴 공식 → 강점/단점 → 개선 액션 → 추천 콘텐츠 → 벤치마킹

## Tech Stack

| 분류 | 기술 |
|------|------|
| Framework | Expo SDK 56 + Expo Router |
| Language | TypeScript |
| Styling | NativeWind v4 (Tailwind CSS) |
| State | Zustand |
| AI | Gemini 2.5 Flash (Google AI API) |
| Backend | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |
| i18n | i18next (ko/en/ja/zh) |

## 프로젝트 구조

```
sideforge/
├── app/                        # 페이지 (Expo Router)
│   ├── report/[id].tsx         # 분석 리포트
│   ├── analyze.tsx             # 채널 분석 입력
│   ├── auth.tsx                # 로그인/회원가입
│   ├── admin.tsx               # 관리자
│   └── ...
├── src/
│   ├── services/api.ts         # API 호출 (환경별 자동 분기)
│   ├── components/ui/          # 공용 UI
│   ├── stores/                 # Zustand 상태
│   ├── i18n/                   # 다국어
│   └── types/                  # TypeScript 타입
├── api/                        # Cloudflare Workers 백엔드
│   ├── src/index.ts            # 라우팅 + 핵심 로직
│   ├── src/prompts/youtube.ts  # AI 프롬프트 (바이럴 공식 v2)
│   ├── src/auth.ts             # JWT 인증 + Google OAuth
│   └── wrangler.toml           # Workers 설정
├── docs/                       # 문서
│   ├── dev-guide.md            # ⭐ 개발 가이드 (필독)
│   ├── architecture/           # 인프라, 배포, 설계
│   ├── features/               # 기능 명세
│   ├── project/                # 로드맵, 변경 이력
│   ├── business/               # 비즈니스 모델
│   └── security/               # 보안
└── .github/workflows/          # CI/CD
```

## Documentation

### ⭐ 필독 (새 세션에서 작업 시작 시)
- **[개발 가이드](docs/dev-guide.md)** — 로컬 실행, 환경 분기, API 구조, 현재 진행 상태 전부 포함

### 아키텍처 & 인프라
- [인프라 구성](docs/architecture/infrastructure.md) — Cloudflare 서비스별 상세
- [배포 파이프라인](docs/architecture/deployment.md) — CI/CD, 도메인, 환경별 연결
- [백엔드 아키텍처](docs/architecture/backend.md)
- [시스템 설계](docs/architecture/system-design.md)
- [AI 아키텍처](docs/architecture/ai-architecture.md)

### 기능 명세
- [YouTube 분석](docs/features/youtube-analysis.md) — Phase 1 핵심
- [YouTube 분석 v2](docs/features/youtube-analysis-v2.md) — 바이럴 공식 킬링 포인트
- [대시보드](docs/features/dashboard.md)
- [AI 코치](docs/features/coach.md)

### 개발 가이드
- [AI Prompt 가이드](docs/api/ai-prompt-guide.md)
- [UI 컴포넌트 API](docs/api/components.md)
- [공용 라이브러리](docs/api/lib.md)

### 프로젝트
- [Roadmap](docs/project/roadmap.md)
- [Changelog](docs/project/changelog.md)
- [UX 품질 가이드](docs/project/ux-quality-guide.md)

### 비즈니스 & 보안
- [Pricing](docs/business/pricing.md)
- [Security](docs/security/security-guide.md)

## 환경별 배포

| 환경 | 트리거 | 프론트 | API |
|------|--------|--------|-----|
| 로컬 | 수동 실행 | localhost:5847 | localhost:8787 |
| 개발 | `develop` push | develop.sideforge.pages.dev | sideforge-api-dev.workers.dev |
| 운영 | `main` push | sideforge.pages.dev | sideforge-api.workers.dev |

## 브랜치 전략

```
main (운영) ← develop (개발) ← feature/* (로컬 작업)
```

```bash
# 작업 시작
git checkout develop && git pull
git checkout -b feature/작업명

# 작업 완료 후
npm run deploy:dev      # develop 배포
npm run deploy:prod     # 운영 배포
npm run deploy:all      # 전체 배포 (feature→develop→main)
```

## Troubleshooting

| 문제 | 해결 |
|------|------|
| 404 on `/report/:id` | 프론트(expo 5847)와 API(wrangler 8787) 별도 실행 필요 |
| 스타일 안 먹힘 | `npx expo start --web --port 5847 --clear` |
| API 연결 안 됨 | `npx wrangler dev --remote --env development` 실행 확인 (8787) |
| 빌드 에러 | `npm install` 재실행 |
| TypeScript 에러 | `npx tsc --noEmit` |

## License

MIT
