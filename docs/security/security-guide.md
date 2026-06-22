# 보안 가이드

## 인증 & 세션

### 일반 사용자

| 항목 | 방식 |
|------|------|
| 인증 | JWT (HS256, 7일 만료) |
| 비밀번호 | SHA-256 + salt 단방향 해싱 |
| 비밀번호 비교 | Timing-safe comparison |
| 세션 저장 | AsyncStorage (로컬) |
| 로그아웃 | 토큰 삭제 + 상태 초기화 |

### 관리자 (2차 인증)

| 항목 | 방식 |
|------|------|
| 1차 인증 | 이메일 + 비밀번호 (일반과 동일) |
| 2차 인증 | TOTP (Google Authenticator 호환) |
| 관리자 세션 | 1시간 유효 토큰 (DB 저장) |
| 세션 갱신 | 만료 시 TOTP 재입력 필요 |

### TOTP 흐름

```
1. 관리자 로그인 (이메일+비밀번호) → JWT 발급
2. /admin 접근 시 → TOTP 코드 입력 화면
3. 6자리 코드 입력 → 서버에서 검증
4. 성공 시 → admin_session 토큰 발급 (1시간)
5. 이후 관리자 API 호출 시 X-Admin-Session 헤더로 전달
6. 1시간 후 만료 → 재인증 필요
```

### 최초 TOTP 설정

```
1. 관리자 계정으로 최초 /admin 접근
2. 서버가 TOTP 시크릿 생성 → QR코드 또는 시크릿 문자열 표시
3. Google Authenticator에 등록
4. 이후부터 6자리 코드로 인증
```

## URL 조작 방지

| 공격 | 방어 |
|------|------|
| /admin URL 직접 접근 | 프론트: plan !== 'admin' → 리다이렉트 |
| API 직접 호출 | 백엔드: JWT + plan 체크 + 403 반환 |
| 토큰 위조 | HMAC-SHA256 서명 검증 |
| 다른 유저 리포트 접근 | user_id 기반 소유권 검증 (향후 구현) |
| 로그아웃 후 뒤로가기 | 토큰 삭제 + API 401 → 로그인 리다이렉트 |

## 데이터 접근 제어

### 리포트 접근

| 상태 | 접근 |
|------|------|
| 로그인 중 | 본인 리포트만 조회 가능 |
| 로그아웃 | 모든 리포트 접근 불가 (401) |
| 토큰 만료 | 401 → 재로그인 필요 |
| Free 7일 경과 | 열람 불가 (향후 구현) |

### 관리자 API

| API | 보호 |
|------|------|
| /api/admin/stats | JWT + admin plan |
| /api/admin/users | JWT + admin plan |
| /api/admin/verify-totp | JWT + admin plan |

## 환경변수 보안

| 변수 | 저장 위치 | 코드 노출 |
|------|----------|----------|
| JWT_SECRET | Cloudflare Workers Secret | ❌ |
| PASSWORD_SALT | Cloudflare Workers Secret | ❌ |
| YOUTUBE_API_KEY | Cloudflare Workers Secret | ❌ |
| ADMIN_EMAILS | Cloudflare Workers Secret | ❌ |
| TOTP Secret (유저별) | D1 DB (users.totp_secret) | ❌ |

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2026-06-22 | Team | 초기 작성 — 관리자 2FA, 세션, URL 방지 |
