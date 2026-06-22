# 배포 가이드

## 호스팅 구성

| 환경 | 도메인 | 브랜치 | 서비스 |
|------|--------|--------|--------|
| 운영 | `sideforge.pages.dev` | main | Cloudflare Pages |
| 개발 | `develop.sideforge.pages.dev` | develop | Cloudflare Pages |
| 프리뷰 | `{해시}.sideforge.pages.dev` | 개별 커밋 | Cloudflare Pages |

## 자동 배포 흐름

```
git push origin develop  →  develop.sideforge.pages.dev (자동)
git push origin main     →  sideforge.pages.dev (자동)
```

별도 CI/CD 설정 없이 GitHub push만 하면 Cloudflare가 자동 빌드 & 배포합니다.

## Cloudflare Pages 빌드 설정

| 항목 | 값 |
|------|-----|
| 프로젝트 이름 | sideforge |
| 프로덕션 브랜치 | main |
| 프레임워크 | 없음 (커스텀) |
| 빌드 명령 | `npm run build:web` |
| 빌드 출력 디렉터리 | `dist` |
| 루트 디렉터리 | `/` |
| Node.js 버전 | 22.x (Cloudflare 기본) |

## 의존성 충돌 해결

`.npmrc` 파일에 아래 설정 필요 (Expo SDK 56 peer dependency 충돌 방지):

```
legacy-peer-deps=true
```

## 커스텀 도메인 연결 (향후)

1. Cloudflare 또는 외부에서 도메인 구매
2. Cloudflare Pages → 설정 → Custom domains → 도메인 추가
3. DNS 자동 설정됨

## 개발 환경 접근 제한 (선택)

개발 도메인을 외부에 비공개하려면:
- Cloudflare 대시보드 → Pages → 설정 → Access Policy
- 이메일 인증 또는 비밀번호 설정 가능

현재 상태: 공개 (URL 모르면 접근 불가, 검색엔진 noindex)

## 백엔드 배포 (Phase 1에서 구축 예정)

| 환경 | 도메인 | 서비스 |
|------|--------|--------|
| 운영 | `sideforge-api.{계정}.workers.dev` | Cloudflare Workers |
| 개발 | `sideforge-api-dev.{계정}.workers.dev` | Cloudflare Workers |

배포 명령:
```bash
cd sideforge-api
wrangler deploy                    # 운영
wrangler deploy --env development  # 개발
```

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-22 | Team | 초기 작성, Cloudflare Pages 세팅 완료 |
