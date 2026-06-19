# Contributing to SideForge

## 개발 원칙

1. MVP를 빠르게 구현한다.
2. 이후 실제 서비스 확장을 고려한다.
3. 코드보다 설계와 문서를 우선한다.
4. 구조 변경 시 관련 문서를 함께 업데이트한다.

## 문서 업데이트 규칙

- 기능 추가 시 → `docs/features/` 업데이트
- 구조 변경 시 → `docs/architecture/` 업데이트
- 주요 의사결정 시 → `docs/meeting/decisions.md` 업데이트
- 로드맵 변경 시 → `docs/project/roadmap.md` 업데이트

## 브랜치 전략

- `main` : 안정 버전
- `develop` : 개발 통합
- `feature/*` : 기능 개발

## 커밋 메시지

```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 변경
refactor: 리팩토링
style: 스타일 변경
```
