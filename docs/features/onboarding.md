# Onboarding

## 개요
사용자 프로필을 다단계 폼으로 수집하여 AI 분석의 기반 데이터를 구성합니다.

## 입력 필드
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| interests | string[] | ✅ | 관심사 |
| likes | string[] | ✅ | 좋아하는 것 |
| skills | string[] | ✅ | 잘하는 것 |
| personality | string | ✅ | 성격 |
| goals | string | ✅ | 목표 |
| preferredMood | string | ✅ | 원하는 분위기 |
| targetRevenue | string | ✅ | 목표 수익 |
| weeklyHours | number | ✅ | 주당 투입 시간 |

## UX 플로우
1. 단계별 진행 (한 화면에 2~3개 필드)
2. 진행률 표시
3. 이전 단계 수정 가능
4. 완료 시 AI 분석 시작

## 변경 이력
| 날짜 | 작성자 | 변경 내용 |
|------|--------|-----------|
| 2025-06-19 | Team | 초기 작성 |
