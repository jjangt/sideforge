# Security Principles

## 개요

SideForge 보안 설계 원칙입니다. MVP 단계부터 적용합니다.

## 입력값 검증 전략

- Zod 스키마로 모든 사용자 입력 검증
- 최대 길이 제한 (프로필 필드별 500자)
- 특수문자 정제 (XSS 방지)
- 타입 검증 (숫자, 배열 등)

## Prompt Injection 대응 전략

- System prompt과 User input 분리
- 입력 내 명령어 패턴 탐지 (ignore, system, role 등)
- 의심 패턴 발견 시 요청 차단 + 로깅

## AI 출력 검증 전략

- 비허용 카테고리 키워드 탐지
- 금융 투자 권유 표현 필터
- 개인정보 노출 검사
- 출력 길이 제한

## 환경변수(.env) 사용 정책

- 모든 시크릿은 .env 파일에서 관리
- .env는 .gitignore에 포함
- .env.example은 키 이름만 포함 (값 없음)
- 배포 시 platform secrets 사용

## API Key 관리 정책

- 클라이언트 코드에 API Key 직접 포함 금지
- 서버/Edge Function을 통한 프록시 사용
- API Key는 최소 권한 원칙 적용

## 개인정보 최소 수집 원칙

- 브랜드 생성에 필요한 최소 정보만 수집
- 실명, 이메일, 전화번호 불필요 (MVP)
- 로컬 저장 우선, 서버 전송 시 사용자 동의

## 로깅 및 감사(Audit) 전략

- AI 요청/응답 로깅 (PII 마스킹)
- Guardrail 위반 로깅
- 비정상 패턴 (과도한 요청 등) 감지

## 인증(Auth) 적용 시 고려사항

- Supabase Auth 사용 (3순위)
- JWT 기반, refresh token rotation
- Row Level Security로 사용자별 데이터 격리
- 세션 만료 시 자동 로그아웃

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
