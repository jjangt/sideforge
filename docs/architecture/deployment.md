# 배포 아키텍처 & 파이프라인

## 서비스 구성

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [프론트엔드 - Cloudflare Pages]                                 │
│  ├── 운영: sideforge.pages.dev            ← main 브랜치         │
│  └── 개발: develop.sideforge.pages.dev    ← develop 브랜치       │
│                                                                 │
│  [백엔드 API - Cloudflare Workers]                               │
│  ├── 운영: sideforge-api.tjang0608.workers.dev                  │
│  └── 개발: sideforge-api-dev.tjang0608.workers.dev              │
│                                                                 │
│  [데이터베이스 - Cloudflare D1]                                   │
│  ├── 운영: sideforge-db                                         │
│  └── 개발: sideforge-db-dev                                     │
│                                                                 │
│  [AI - Cloudflare Workers AI]                                   │
│  └── Llama 4 Scout 17B (공용, 무료 티어)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 역할 정리

| 서비스 | 유형 | 역할 | 도메인 |
|--------|------|------|--------|
| sideforge (Pages) | 프론트엔드 | 사용자가 보는 웹사이트 | `sideforge.pages.dev` |
| sideforge-api (Workers) | 백엔드 (운영) | 인증, 분석, DB 처리 | `sideforge-api.tjang0608.workers.dev` |
| sideforge-api-dev (Workers) | 백엔드 (개발) | 개발/테스트용 API | `sideforge-api-dev.tjang0608.workers.dev` |
| sideforge-db (D1) | DB (운영) | 운영 사용자/리포트 데이터 | - |
| sideforge-db-dev (D1) | DB (개발) | 개발 테스트 데이터 | - |

## 환경별 연결

| 환경 | 프론트엔드 | → API | → DB |
|------|-----------|-------|------|
| 로컬 (`localhost:5847`) | Expo Dev Server | `localhost:8787` (`--remote --env development`) | `sideforge-db-dev` (원격) |
| 개발 (`develop.sideforge.pages.dev`) | Cloudflare Pages (Preview) | `sideforge-api-dev` | `sideforge-db-dev` |
| 운영 (`sideforge.pages.dev`) | Cloudflare Pages (Production) | `sideforge-api` | `sideforge-db` |

## 배포 파이프라인

### 프론트엔드 (자동)

```
코드 수정 → git push → Cloudflare Pages 자동 빌드 & 배포

  develop 브랜치 push → develop.sideforge.pages.dev (자동)
  main 브랜치 push    → sideforge.pages.dev (자동)
```

GitHub에 push만 하면 Cloudflare가 자동으로 `npm run build:web` 실행 → `dist/` 배포.

### 백엔드 (GitHub Actions 자동 + 수동 가능)

```
develop push → GitHub Actions → wrangler deploy --env development (자동)
main push    → GitHub Actions → wrangler deploy (자동)

# 수동 배포도 가능:
cd api && npx wrangler deploy                    → sideforge-api (운영)
cd api && npx wrangler deploy --env development  → sideforge-api-dev (개발)
```

### 전체 흐름도

```
[로컬 개발]
    │
    ├── 프론트 수정 → git push origin develop → 자동 배포 (dev 프론트)
    │
    ├── 백엔드 수정 → cd api && npx wrangler deploy --env development → 배포 (dev API)
    │
    └── 둘 다 수정 → npm run deploy:dev (원커맨드)

[운영 배포]
    │
    ├── git push origin main → 자동 배포 (prod 프론트)
    │
    ├── cd api && npx wrangler deploy → 배포 (prod API)
    │
    └── 둘 다 → npm run deploy:prod (원커맨드)
```

## 원커맨드 배포

### 전체 배포 (feature → develop → main + 백엔드 모두)
```bash
npm run deploy:all
```
→ feature 브랜치에서 작업 후, develop + main 머지 + 프론트/백엔드 전부 배포

### 개발 환경만 배포
```bash
npm run deploy:dev
```
→ develop push + 백엔드 dev 배포

### 운영 환경만 배포
```bash
npm run deploy:prod
```
→ develop → main 머지 + push + 백엔드 prod 배포

### 백엔드만 배포
```bash
npm run deploy:api          # 운영
npm run deploy:api:dev      # 개발
```

## 주의사항

- 프론트엔드 환경변수(`EXPO_PUBLIC_API_URL`)는 **Cloudflare Pages 대시보드**에서 설정됨
  - Production: `https://sideforge-api.tjang0608.workers.dev`
  - Preview: `https://sideforge-api-dev.tjang0608.workers.dev`
- 백엔드 시크릿은 `wrangler secret put` 으로 설정 (코드에 노출 안 됨)
- `.env` 파일은 로컬 전용 (git에 안 올라감)

## 트러블슈팅

| 문제 | 해결 |
|------|------|
| 프론트 배포 안 됨 | Cloudflare Pages Deployments 탭 확인, `git commit --allow-empty` 트리거 |
| 백엔드 배포 안 됨 | `cd api && npx wrangler deploy` 직접 실행 |
| dev와 prod 데이터 섞임 | 각각 별도 DB (sideforge-db vs sideforge-db-dev) |
| 환경변수 안 먹힘 | Cloudflare Pages Settings → Environment variables 확인 |

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2026-06-22 | Team | 초기 작성 |
