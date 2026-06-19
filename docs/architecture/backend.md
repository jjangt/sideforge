# Backend Architecture

## 개요

MVP에서는 로컬 상태 우선. 3순위로 Supabase 연동.

## Supabase 구성 (향후)

- Auth: 이메일/소셜 로그인
- Database: PostgreSQL (브랜드 저장, 히스토리)
- Storage: 브랜드 에셋 저장
- Row Level Security: 사용자별 데이터 격리

## 데이터 흐름

```
MVP: Zustand → AsyncStorage (로컬)
확장: Zustand → Supabase Sync → PostgreSQL
```

## API Routes (향후)

Expo Router API Routes를 활용하여 AI API Key를 서버 사이드에서 처리.

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
