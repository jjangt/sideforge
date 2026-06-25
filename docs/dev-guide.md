# 개발 가이드 (로컬 환경 + 운영 정보)

> AI 어시스턴트가 새 세션에서도 바로 작업을 이어갈 수 있도록 정리한 문서.

## 프로젝트 현재 상태 (2025-07 기준)

- **서비스**: YouTube 채널 분석 플랫폼 (Phase 1 진행 중)
- **로컬 경로**: `D:\sideline\sideforge`
- **GitHub**: https://github.com/jjangt/sideforge
- **현재 브랜치**: `feature/channel-analysis-platform`
- **AI 모델**: Gemini 2.5 Flash (Cloudflare Workers AI → Gemini API로 전환 완료)
- **인프라**: Cloudflare Pages + Workers + D1

## 환경별 URL 매핑

| 환경 | 프론트엔드 | API | DB |
|------|-----------|-----|-----|
| 로컬 | `http://localhost:5847` | `http://localhost:8787` | `sideforge-db-dev` (원격, dev와 공유) |
| 개발(dev) | `develop.sideforge.pages.dev` | `sideforge-api-dev.tjang0608.workers.dev` | `sideforge-db-dev` |
| 운영(prod) | `sideforge.pages.dev` | `sideforge-api.tjang0608.workers.dev` | `sideforge-db` |

API URL 분기는 `src/services/api.ts`의 `getApiUrl()` 함수에서 호스트네임 기반으로 자동 처리됨.
`.env`에 `EXPO_PUBLIC_API_URL`을 명시하면 오버라이드 가능.

## 로컬 개발 실행 방법

**터미널 2개 필요:**

```bash
# 터미널 1 — 프론트엔드 (Expo Web, 포트 5847)
cd D:\sideline\sideforge
npx expo start --web --port 5847 --clear

# 터미널 2 — API (Wrangler, 포트 8787, 원격 dev DB 연결)
cd D:\sideline\sideforge\api
npx wrangler dev --remote --env development
```

- 프론트: `http://localhost:5847`
- API: `http://localhost:8787`
- 프론트에서 API 호출 시 자동으로 `localhost:8787` 사용

⚠️ **주의**: wrangler를 5847에서 실행하면 안 됨. 프론트와 충돌.
⚠️ **주의**: `wrangler` 글로벌 설치 안 되어 있으므로 반드시 `npx wrangler` 사용.

## 브랜치 전략

```
main (운영) ← develop (개발) ← feature/* (로컬 작업)
```

### 작업 흐름
1. `develop`에서 최신 pull
2. `feature/{작업명}` 브랜치 생성 후 작업
3. 완료되면 `develop`에 머지 → 개발환경 자동 배포
4. 검증 후 `main`에 머지 → 운영환경 자동 배포

### 배포 명령어 (package.json 스크립트)

| 명령어 | 설명 |
|--------|------|
| `npm run deploy:dev` | develop push + API dev 배포 |
| `npm run deploy:prod` | develop→main 머지 + push + API prod 배포 |
| `npm run deploy:all` | feature→develop→main 전체 + API 모두 배포 |
| `npm run deploy:api` | API 운영만 배포 |
| `npm run deploy:api:dev` | API 개발만 배포 |

## CI/CD 파이프라인 (.github/workflows/deploy.yml)

- `develop` push → Cloudflare Pages(preview) + Workers(dev) 자동 배포
- `main` push → Cloudflare Pages(prod) + Workers(prod) 자동 배포

프론트엔드: GitHub Actions에서 `expo export --platform web` → Pages 배포
백엔드: GitHub Actions에서 `wrangler deploy` (환경별)

## 프로젝트 구조 핵심

```
sideforge/
├── app/                    # 페이지 (Expo Router, 파일 기반 라우팅)
│   ├── report/[id].tsx     # 분석 리포트 상세
│   ├── analyze.tsx         # 채널 URL 입력 → 분석 요청
│   └── ...
├── src/
│   ├── services/api.ts     # API 호출 (환경별 자동 분기)
│   ├── stores/             # Zustand 상태
│   └── components/ui/      # 공용 UI
├── api/                    # Cloudflare Workers 백엔드
│   ├── src/index.ts        # 라우팅 + 핵심 로직
│   ├── src/prompts/youtube.ts  # AI 프롬프트 (v2 바이럴 공식)
│   ├── src/auth.ts         # 인증 (JWT + Google OAuth)
│   ├── .dev.vars           # 로컬 시크릿 (gitignore)
│   └── wrangler.toml       # Workers 설정 (환경별)
└── docs/                   # 이 문서들
```

## API 엔드포인트 (api/src/index.ts)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/me` | 내 정보 |
| POST | `/api/analyze/youtube` | 채널 분석 요청 |
| GET | `/api/report/:id` | 리포트 조회 (플랜별 필터링) |
| GET | `/api/reports` | 내 리포트 목록 |
| POST | `/api/admin/verify-totp` | 관리자 2FA |
| GET | `/api/admin/stats` | 관리자 통계 |
| GET | `/api/admin/users` | 관리자 유저 목록 |

⚠️ 모든 API 경로는 `/api/` prefix 필수. 프론트에서 호출 시 `api.ts`가 자동 처리.

## 플랜별 기능 분기

| 기능 | Free | Plus | Pro | Admin |
|------|------|------|-----|-------|
| 점수/요약 | ✅ | ✅ | ✅ | ✅ |
| 강점/단점 | 1개씩 | 전체 | 전체 | 전체 |
| 최근 영상 성과 | ❌ | ✅(10개) | ✅(20개) | 전체 |
| 댓글 분석 | ❌ | ✅ | ✅ | ✅ |
| 바이럴 공식 | ❌ | ✅ | ✅ | ✅ |
| 개선 액션 | 1개 미리보기 | ✅ | ✅ | ✅ |
| 추천 콘텐츠 | 1개 미리보기 | ✅ | ✅ | ✅ |
| 벤치마킹 | 🔒 | 🔒 | ✅ | ✅ |

플랜별 필터링: `api/src/index.ts`의 `filterByPlan()` 함수.
관리자는 `X-Simulate-Plan` 헤더로 다른 플랜 시뮬레이션 가능.

## AI 분석 흐름

```
1. 프론트: POST /api/analyze/youtube { url }
2. API: YouTube Data API로 채널+영상+댓글 수집
3. API: fetchTrendingInCategory() — 동일 카테고리 인기 채널 검색 (벤치마킹용)
4. API: preAnalyze() — 코드 레벨 패턴 분석 (바이럴 공식)
5. API: buildYouTubePrompt() — 데이터 + 분석 결과를 프롬프트로 구성
6. API: Gemini 2.5 Flash API 호출
7. API: JSON 파싱 + 벤치마킹/댓글 검증 + DB 저장
8. 프론트: reportId로 리포트 조회 → 렌더링
```

## Gemini API 설정

- 모델: `gemini-2.5-flash`
- 엔드포인트: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- API 키: Cloudflare Secret (`GEMINI_API_KEY`) — `wrangler secret put GEMINI_API_KEY`
- 로컬: `api/.dev.vars`에 설정

## 환경변수

### 프론트엔드 (.env, 로컬 전용)
```
# 자동 분기되므로 보통 설정 불필요
# 수동 오버라이드 시:
# EXPO_PUBLIC_API_URL=http://localhost:8787
```

### 백엔드 (api/.dev.vars, 로컬 전용)
```
YOUTUBE_API_KEY=...
JWT_SECRET=...
PASSWORD_SALT=...
GOOGLE_CLIENT_ID=...
GEMINI_API_KEY=...
ADMIN_EMAILS=...
```

### 백엔드 (Cloudflare Secrets, 배포 환경)
```bash
cd api
wrangler secret put YOUTUBE_API_KEY
wrangler secret put JWT_SECRET
wrangler secret put PASSWORD_SALT
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GEMINI_API_KEY
wrangler secret put ADMIN_EMAILS

# dev 환경:
wrangler secret put GEMINI_API_KEY --env development
# ... 동일하게
```

## 자주 발생하는 문제

| 문제 | 원인 | 해결 |
|------|------|------|
| `GET /report/:id 404` on wrangler | 프론트 서버가 아닌 API 서버에 접근 | 프론트(expo)와 API(wrangler) 별도 포트로 실행 |
| API 호출 시 CORS 에러 | 프론트 포트와 API 포트 불일치 | API에 CORS 헤더 이미 설정됨 (`*`). 포트 확인 |
| Gemini 응답 파싱 실패 | JSON 앞뒤에 마크다운 ` ``` ` | `text.match(/\{[\s\S]*\}/)` 로 추출 중 |
| 분석 결과 빈 배열 | preAnalyze에 영상 데이터 부족 | 최소 2~3개 영상 필요 |
| `wrangler dev` 포트 충돌 | 5847 사용 시 expo와 겹침 | wrangler는 기본 8787 사용 |

## 다음 할 일 (진행 중)

1. ~~Gemini 2.5 Flash 전환~~ ✅ (코드 + CI/CD 완료)
2. Cloudflare secret 업데이트 (개인 키로)
3. @hadam_official 채널 분석 테스트
4. Gemini 2.5 Flash 분석 품질 검증
5. 벤치마킹 채널 기능 품질 테스트
6. 바이럴 공식 + 추천 콘텐츠 품질 점검

## 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2025-07-12 | 초기 작성 — 로컬 개발 가이드 + 환경 분기 + 현재 상태 통합 |
