# System Design

## 개요

SideForge 전체 시스템 아키텍처입니다.

## 아키텍처

```
Client (Expo Router) → Application Layer → AI Provider → Persistence
                       ├── Guardrails
                       ├── Validation
                       └── Analytics (향후)
```

## 핵심 설계 원칙

| 원칙 | 설명 |
|------|------|
| Provider Pattern | AI 서비스 인터페이스 기반, 런타임 교체 가능 |
| Guardrails First | AI 입출력 모두 안전성 검증 레이어 통과 |
| Local First | 로컬 상태로 완전 동작, Backend는 선택적 추가 |
| Document Driven | 코드 변경 시 관련 문서 동시 업데이트 |

## 기술 스택

- Expo (최신 안정 SDK) + React Native
- Expo Router v4
- TypeScript
- Nativewind v4
- Zustand + persist
- Zod (입력값 검증)

## 배포

- Web: Expo EAS Hosting (1순위) / Vercel (대안)
- Native: EAS Build

## 관련 문서

- [Frontend](frontend.md)
- [Backend](backend.md)
- [AI Architecture](ai-architecture.md)

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
