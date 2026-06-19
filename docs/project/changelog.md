# Changelog

## [0.2.0] - 2025-06-19

### Added
- 랜딩 페이지 (`/`)
- 온보딩 다단계 폼 (`/onboarding`)
- 브랜드 추천 화면 (`/recommendations`)
- 브랜드 생성 로딩 (`/brand/generate`)
- 브랜드 상세 결과 (`/brand/[id]`)
- 브랜드 공개 미리보기 (`/brand/[id]/preview`)
- 대시보드 (`/dashboard`)
- AI 코치 채팅 (`/coach`)
- Mock Provider (3개 시나리오: 디저트/생산성/여행)
- Zustand 스토어 4개 (Profile, Brand, Dashboard, Coach)
- Guardrails (Input/Output Guard)
- Analytics placeholder (brand-metrics, growth-score, revenue-score)
- GitHub Actions (CI + Cloudflare Pages 배포)
- Git 브랜치 전략: main(운영) / develop(개발) / feature/*

## [0.1.0] - 2025-06-19

### Added
- 프로젝트 초기화 (Expo SDK 56 + TypeScript)
- Expo Router 설정
- Nativewind (Tailwind CSS) 설정
- Zustand 상태 관리 설정
- 문서 구조 생성 (docs/)
- 타입 정의 (profile, brand, dashboard, coach)
- AI Provider 인터페이스 + Provider Factory
