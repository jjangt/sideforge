# Changelog

## [1.0.0-beta] - 2025-07 (Phase 1: YouTube 분석 플랫폼)

### 인프라
- Cloudflare Workers 백엔드 구축 (api/)
- Cloudflare D1 데이터베이스 (운영/개발 분리)
- GitHub Actions CI/CD — develop/main 브랜치별 자동 배포
- Gemini 2.5 Flash API 연동 (Workers AI → Gemini 전환)
- 환경별 API URL 자동 분기 (getApiUrl)

### 인증
- 이메일 + 비밀번호 회원가입/로그인 (JWT)
- Google OAuth 로그인
- 관리자 TOTP 2FA (Google Authenticator)
- 플랜별 기능 접근 제어

### 핵심 기능 — YouTube 분석
- 채널 URL / @handle 입력 → 자동 인식
- YouTube Data API v3 — 채널 정보 + 최근 20개 영상 + 댓글 수집
- AI 분석 리포트 (점수, 강점, 단점, 개선 액션, 추천 콘텐츠)
- 바이럴 공식 분석 (v2) — 영상 길이/요일/제목 패턴 데이터 기반
- 시청자 댓글 감성 분석
- 벤치마킹 채널 (동일 카테고리 인기 채널 자동 검색 + 영상 분석)
- 플랜별 데이터 필터링 (Free: 미리보기, Plus: 상세, Pro: 벤치마킹)
- 분석 리포트 DB 저장 + 히스토리 조회

### 프론트엔드
- 랜딩 페이지 (플랜별 분기)
- 로그인/회원가입
- 채널 분석 입력 페이지
- 리포트 페이지 (점수, 영상성과, 바이럴공식, 강점/단점, 액션, 추천, 벤치마킹)
- Free 유저 잠금 UI (모자이크 + 업그레이드 CTA)
- 관리자 페이지 (통계, 유저 목록, 플랜 시뮬레이션)
- 마이페이지 (분석 히스토리)

### 품질 개선
- AI 프롬프트 v2 — 데이터 기반 바이럴 공식 추출
- 벤치마킹 검증 — 실존 채널만 유지
- 댓글 요약 검증 — 실제 댓글이 있는 영상만
- AI 응답 안전 처리 (객체/배열 방어)
- 일일 서버 제한 (280회) + 유저별 분석 횟수 제한

---

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
