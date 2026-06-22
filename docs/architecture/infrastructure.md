# 인프라 구성 (Cloudflare)

## 개요

SideForge는 Cloudflare 무료 티어를 활용하여 서버 비용 0원으로 운영합니다.

## 아키텍처

```
[사용자 브라우저]
      ↓
[Cloudflare Pages]        ← 프론트엔드 (정적 호스팅, 무료)
      ↓ API 호출
[Cloudflare Workers]      ← 백엔드 (서버리스 함수, 무료)
      ├── YouTube Data API   ← 데이터 수집
      ├── 네이버 검색 API     ← 블로그 데이터
      ├── Workers AI          ← AI 분석 (Llama 3.1)
      └── D1 Database         ← 데이터 저장
```

## Cloudflare 서비스별 상세

### Cloudflare Pages (프론트엔드)

| 항목 | 무료 티어 |
|------|-----------|
| 빌드 | 500회/월 |
| 대역폭 | 무제한 |
| 사이트 수 | 무제한 |
| 커스텀 도메인 | ✅ |
| SSL | ✅ 자동 |

### Cloudflare Workers (백엔드)

| 항목 | 무료 티어 |
|------|-----------|
| 요청 수 | 100,000/일 |
| CPU 시간 | 10ms/요청 |
| 스크립트 수 | 100개 |
| KV 스토리지 | 100,000 읽기/일, 1,000 쓰기/일 |

### Cloudflare D1 (데이터베이스)

| 항목 | 무료 티어 |
|------|-----------|
| 스토리지 | 5GB |
| 읽기 | 5,000,000/일 |
| 쓰기 | 100,000/일 |
| DB 수 | 50개 |

### Cloudflare Workers AI

| 항목 | 무료 티어 |
|------|-----------|
| 뉴런 | 10,000/일 (약 300~500회 요청) |
| 모델 | Llama 3.1 8B, Mistral 7B, Gemma 등 |
| 지원 기능 | 텍스트 생성, 요약, 분석, 감성 분석 |
| 추가 비용 | $0.011/1,000 뉴런 (초과 시) |

## 모델 선택

| 용도 | 모델 | 이유 |
|------|------|------|
| 콘텐츠 분석/피드백 | @cf/meta/llama-3.1-8b-instruct | 범용, 한국어 지원 |
| 댓글 감성 분석 | @cf/meta/llama-3.1-8b-instruct | 분류 작업에 적합 |
| 요약 | @cf/meta/llama-3.1-8b-instruct | 긴 텍스트 처리 |

## Workers AI 호출 예시

```javascript
// Cloudflare Worker 내에서
export default {
  async fetch(request, env) {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: '당신은 YouTube 채널 분석 전문가입니다.' },
        { role: 'user', content: '다음 채널 데이터를 분석해주세요: ...' }
      ],
      max_tokens: 1024,
    });

    return new Response(JSON.stringify(result));
  }
};
```

## 무료 티어 한계 & 대응

| 상황 | 한계 | 대응 |
|------|------|------|
| 일일 사용자 50명 | ✅ 여유 | - |
| 일일 사용자 500명 | ⚠️ AI 뉴런 부족 | 캐싱 + 분석 큐 |
| 일일 사용자 5,000명 | ❌ 유료 전환 필요 | Workers Paid ($5/월) |

## 환경변수 (Workers)

```
YOUTUBE_API_KEY=AIzaSy...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
JWT_SECRET=...
```

## 배포 흐름

```
git push → GitHub Actions → Cloudflare Pages (프론트)
                          → Cloudflare Workers (백엔드, wrangler deploy)
```

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
