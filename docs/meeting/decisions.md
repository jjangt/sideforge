# Decisions

## 2025-06-19

### D001: 기술 스택 확정
- Expo (최신 SDK) + React Native + Expo Router
- Nativewind (Tailwind CSS)
- Zustand (상태 관리)
- Zod (입력 검증)

### D002: 배포 전략
- 1순위: Expo EAS Hosting (Web + Native 통합)
- 대안: Vercel (Web only)

### D003: AI Provider 구조
- Provider Factory 패턴 적용
- Mock → Claude → OpenAI 순서로 연동

### D004: MVP 우선순위
- 1순위: 전체 플로우 완성 (랜딩 ~ 대시보드)
- 2순위: AI 코치, 30일 플랜, 점수
- 3순위: Supabase, Auth, 실제 AI

### D005: Local First 전략
- MVP에서는 Supabase Auth 없이 로컬 상태로 전체 동작
- 시간 여유 시 Supabase 추가
