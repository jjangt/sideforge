# 디자인 시스템

## 컬러 팔레트

| Token | Hex | 용도 |
|-------|-----|------|
| `brand-primary` | `#7C3AED` | 주요 CTA, 강조 |
| `brand-primary-light` | `#A78BFA` | 보조 강조, 링크 |
| `brand-secondary` | `#1E1B4B` | 깊은 배경 |
| `brand-accent` | `#F472B6` | 포인트 색상 |
| `brand-background` | `#0F0A1F` | 페이지 배경 |
| `brand-surface` | `#1A1333` | 카드/컴포넌트 배경 |
| `brand-surface-light` | `#251E3E` | 호버/선택 상태 |
| `brand-text` | `#F8FAFC` | 본문 텍스트 |
| `brand-muted` | `#94A3B8` | 보조 텍스트 |
| `brand-border` | `#2D2654` | 테두리 |
| `brand-success` | `#34D399` | 성공 |
| `brand-warning` | `#FBBF24` | 경고 |
| `brand-error` | `#F87171` | 에러 |

## 타이포그래피

- 폰트: `Inter`, `system-ui`, `sans-serif`
- 크기: Tailwind 기본 (`text-xs` ~ `text-5xl`)
- 제목: `font-bold`, 본문: 기본 weight

## 레이아웃

### Container

모든 페이지 콘텐츠는 `<Container>` 로 감싸서 중앙 정렬 + max-width 보장.

```tsx
import { Container } from '@/components/ui';

<Container size="md">  {/* sm | md | lg | full */}
  {children}
</Container>
```

- `sm`: max-w-md (448px)
- `md`: max-w-2xl (672px) — 기본값
- `lg`: max-w-4xl (896px)
- `full`: 제한 없음

## 컴포넌트

모든 컴포넌트는 `src/components/ui/index.ts`에서 import.

### Button

```tsx
<Button
  title="클릭"
  onPress={() => {}}
  variant="primary"   // primary | outline | ghost | danger
  size="md"           // sm | md | lg
  loading={false}
  disabled={false}
  icon={<Icon />}     // 선택
/>
```

### Card

```tsx
<Card
  variant="default"  // default | highlight | glass
  onPress={() => {}} // 선택 — 있으면 Pressable
>
  {children}
</Card>
```

### Input

```tsx
<Input
  label="이름"
  placeholder="입력..."
  error="필수 항목입니다"
  hint="도움말"
  multiline
/>
```

### Badge

```tsx
<Badge label="NEW" variant="primary" />
// variant: primary | success | warning | error | muted
```

### ProgressBar

```tsx
<ProgressBar value={75} showLabel height="lg" color="bg-brand-success" />
```

### Select

```tsx
<Select
  label="언어"
  options={[{ label: '한국어', value: 'ko' }]}
  value="ko"
  onChange={(v) => setLang(v)}
/>
```

### Modal

```tsx
<Modal visible={open} onClose={() => setOpen(false)} title="제목">
  {children}
</Modal>
```

### Section

```tsx
<Section title="브랜드 스토리" icon="📖">
  {children}
</Section>
```

### Loading

```tsx
<Loading message="로딩 중..." submessage="잠시만 기다려주세요" />
```

## CSS 유틸리티 (global.css)

| Class | 설명 |
|-------|------|
| `.gradient-text` | 보라→핑크 그라디언트 텍스트 |
| `.gradient-bg` | 보라 그라디언트 배경 |
| `.gradient-border` | 그라디언트 테두리 |
| `.glass` | 글래스모피즘 (blur + 반투명) |

## 애니메이션 (Tailwind)

| Class | 설명 |
|-------|------|
| `animate-fade-in` | 페이드인 |
| `animate-slide-up` | 아래→위 슬라이드 |
| `animate-pulse-slow` | 느린 펄스 |
| `animate-float` | 떠다니는 효과 |
