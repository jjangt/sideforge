# Frontend Architecture

## 개요

Expo Router 기반 file-based routing으로 Web/iOS/Android 단일 코드베이스 운영.

## 라우팅 구조

| 경로 | 화면 |
|------|------|
| `/` | 랜딩 |
| `/onboarding` | 프로필 입력 |
| `/recommendations` | 브랜드 추천 |
| `/brand/[id]` | 브랜드 상세 |
| `/brand/[id]/preview` | 공개 미리보기 |
| `/dashboard` | 대시보드 |
| `/coach` | AI 코치 |

## 상태 관리

Zustand stores with AsyncStorage persist:
- useProfileStore
- useBrandStore
- useDashboardStore
- useCoachStore

## 스타일링

Nativewind (Tailwind CSS for React Native)
- 브랜드 컬러 시스템 정의 (tailwind.config.js)
- 반응형: 모바일 우선, 웹에서 확장

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
