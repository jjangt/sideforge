# Backend Architecture

## 개요

Cloudflare Workers 기반 서버리스 백엔드. Gemini 2.5 Flash API로 AI 분석 수행.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 런타임 | Cloudflare Workers |
| 언어 | TypeScript |
| DB | Cloudflare D1 (SQLite) |
| AI | Gemini 2.5 Flash (Google AI API) |
| 인증 | JWT + Google OAuth |
| 데이터 수집 | YouTube Data API v3 |

## 파일 구조

```
api/
├── src/
│   ├── index.ts            # 메인 라우터 + 핵심 로직
│   ├── auth.ts             # 인증 (signup/login/google/JWT 검증)
│   ├── admin-auth.ts       # 관리자 TOTP 2FA
│   └── prompts/
│       └── youtube.ts      # AI 프롬프트 (preAnalyze + buildYouTubePrompt)
├── .dev.vars               # 로컬 시크릿 (gitignore)
├── schema.sql              # D1 스키마
├── wrangler.toml           # Workers 설정 (prod + dev 환경)
└── package.json
```

## API 엔드포인트

모든 경로 prefix: `/api/`

### 인증
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 이메일+비밀번호 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| POST | `/api/auth/google` | Google OAuth (idToken 검증) |
| GET | `/api/auth/me` | 현재 유저 정보 |

### 분석
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/analyze/youtube` | 채널 분석 요청 → 리포트 생성 |
| GET | `/api/report/:id` | 리포트 조회 (플랜별 필터링) |
| GET | `/api/reports` | 내 리포트 목록 (최근 50개) |

### 관리자
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/admin/verify-totp` | TOTP 2FA 인증 |
| GET | `/api/admin/stats` | 전체 통계 |
| GET | `/api/admin/users` | 유저 목록 |

## 분석 플로우

```
POST /api/analyze/youtube { url: "@채널명" }
    │
    ├── 1. extractChannelId(url) — URL/handle 파싱
    ├── 2. fetchChannelData() — YouTube API로 채널 정보
    ├── 3. fetchRecentVideos() — 최근 20개 영상 + 상위 3개 댓글
    ├── 4. fetchTrendingInCategory() — 동일 카테고리 인기 채널 (벤치마킹)
    ├── 5. analyzeWithAI() — Gemini 2.5 Flash 호출
    │       ├── preAnalyze() — 코드 레벨 패턴 분석
    │       ├── buildYouTubePrompt() — 프롬프트 구성
    │       └── JSON 파싱 + 검증
    ├── 6. DB 저장 (reports 테이블)
    └── 7. filterByPlan() → 플랜별 응답 반환
```

## 플랜별 데이터 필터링 (filterByPlan)

백엔드에서 응답을 잘라서 보냄. 프론트는 받은 그대로 렌더링.

| 플랜 | 동작 |
|------|------|
| admin / pro | 전체 데이터 반환 |
| plus | videos 10개, benchmarks 잠금 |
| free | 최소 데이터만 (score/summary/1개씩 미리보기) |

관리자는 `X-Simulate-Plan` 헤더로 다른 플랜 시뮬레이션 가능.

## 일일 제한

- 전체 서버: 280회/일 (무료 티어 보호)
- 유저별: `checkAnalysisLimit()` — 플랜별 상이

## AI 프롬프트 구조 (api/src/prompts/youtube.ts)

1. **preAnalyze()**: 코드에서 패턴 계산
   - 영상 길이별 평균 조회수
   - 업로드 요일별 성과
   - 상위/하위 영상 비교 (제목 길이, 영상 길이)
   - 제목 빈출 키워드
   - 채널 상태 팩트/이슈 자동 판별

2. **buildYouTubePrompt()**: 위 데이터를 AI에게 전달
   - AI는 "전략 문장"만 작성 (분석은 코드가 이미 함)
   - 출력: JSON (score, viralFormula, strengths, weaknesses, actions, contentIdeas, benchmarks 등)

3. **후처리 검증**:
   - 벤치마킹: trending 데이터에 실제 존재하는 채널만 유지
   - 댓글 요약: 실제 댓글이 있는 영상만 유지

## D1 스키마 (주요 테이블)

- `users`: id, email, name, plan, analysis_count, totp_secret, provider, created_at
- `reports`: id, user_id, channel_id, channel_name, platform, data(JSON), created_at
- `admin_sessions`: id, user_id, token, expires_at, created_at

## 환경별 설정 (wrangler.toml)

```toml
# 운영 (기본)
name = "sideforge-api"
[[d1_databases]]
database_name = "sideforge-db"

# 개발
[env.development]
name = "sideforge-api-dev"
[[env.development.d1_databases]]
database_name = "sideforge-db-dev"
```

## 시크릿 관리

로컬: `api/.dev.vars` 파일
배포: `wrangler secret put {KEY}` (환경별 `--env development` 추가)

필요한 시크릿:
- `YOUTUBE_API_KEY`
- `JWT_SECRET`
- `PASSWORD_SALT`
- `GOOGLE_CLIENT_ID`
- `GEMINI_API_KEY`
- `ADMIN_EMAILS`

## 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2025-06-19 | 초기 작성 (Supabase 계획) |
| 2025-07-12 | 전면 재작성 — 실제 Cloudflare Workers + Gemini 구현 반영 |
