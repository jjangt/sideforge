# UI 컴포넌트 API

모든 컴포넌트는 `src/components/ui/index.ts`에서 export.

```tsx
import { Button, Card, Input, ... } from '../src/components/ui';
```

## 원칙

1. **모든 UI 요소는 컴포넌트화** — 직접 `<Pressable>`, `<View>` 조합하지 않음
2. **variant로 스타일 분기** — 조건부 className 대신 variant prop
3. **커스터마이징은 className** — 추가 스타일은 className prop으로 확장
4. **onPress가 있으면 인터랙션** — Card에 onPress 넘기면 자동으로 Pressable

## 컴포넌트 목록

| 컴포넌트 | 파일 | 용도 |
|----------|------|------|
| Container | Container.tsx | 반응형 중앙정렬 래퍼 |
| Button | Button.tsx | 모든 버튼 |
| Card | Card.tsx | 카드 UI |
| Input | Input.tsx | 텍스트 입력 |
| Badge | Badge.tsx | 라벨/태그 |
| ProgressBar | ProgressBar.tsx | 진행률 바 |
| Modal | Modal.tsx | 커스텀 모달 |
| Select | Select.tsx | 드롭다운 선택 |
| Loading | Loading.tsx | 로딩 상태 |
| Section | Section.tsx | 섹션 래퍼 (제목+내용) |
| ToastRenderer | ToastRenderer.tsx | 토스트 출력 (layout에서만) |
| ModalRenderer | ModalRenderer.tsx | 모달 출력 (layout에서만) |

## Props 상세

### Button

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| title | string | 필수 | 버튼 텍스트 |
| onPress | () => void | 필수 | 클릭 핸들러 |
| variant | 'primary' \| 'outline' \| 'ghost' \| 'danger' | 'primary' | 스타일 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 크기 |
| disabled | boolean | false | 비활성화 |
| loading | boolean | false | 로딩 스피너 표시 |
| icon | ReactNode | - | 좌측 아이콘 |
| className | string | '' | 추가 스타일 |

### Card

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| children | ReactNode | 필수 | 내용 |
| variant | 'default' \| 'highlight' \| 'glass' | 'default' | 스타일 |
| onPress | () => void | - | 있으면 Pressable |
| className | string | '' | 추가 스타일 |

### Input

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| label | string | - | 상단 라벨 |
| error | string | - | 에러 메시지 |
| hint | string | - | 도움말 |
| className | string | '' | 추가 스타일 |
| ...rest | TextInputProps | - | RN TextInput props 모두 지원 |

### Badge

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| label | string | 필수 | 텍스트 |
| variant | 'primary' \| 'success' \| 'warning' \| 'error' \| 'muted' | 'primary' | 색상 |

### ProgressBar

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| value | number | 필수 | 0~100 |
| showLabel | boolean | false | 퍼센트 표시 |
| height | 'sm' \| 'md' \| 'lg' | 'md' | 높이 |
| color | string | 'bg-brand-primary' | 바 색상 클래스 |

### Select

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| options | { label, value }[] | 필수 | 선택지 |
| value | string | - | 선택된 값 |
| placeholder | string | '선택하세요' | 미선택 텍스트 |
| label | string | - | 상단 라벨 |
| onChange | (value) => void | 필수 | 선택 핸들러 |

### Container

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| children | ReactNode | 필수 | 내용 |
| size | 'sm' \| 'md' \| 'lg' \| 'full' | 'md' | max-width |
| className | string | '' | 추가 스타일 |

### Section

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| title | string | 필수 | 섹션 제목 |
| icon | string | - | 이모지 아이콘 |
| children | ReactNode | 필수 | 내용 |

### Loading

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| message | string | - | 메인 텍스트 |
| submessage | string | - | 보조 텍스트 |

### Modal

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| visible | boolean | 필수 | 표시 여부 |
| onClose | () => void | 필수 | 닫기 핸들러 |
| title | string | - | 모달 제목 |
| children | ReactNode | 필수 | 내용 |

## 컴포넌트 확장 예시

특정 페이지에서 기존 Button을 확장해야 할 때:

```tsx
// 방법 1: className으로 스타일 오버라이드
<Button title="특별 버튼" onPress={fn} className="bg-green-500 rounded-full" />

// 방법 2: 래퍼 컴포넌트 생성
function SpecialButton(props: { title: string; onPress: () => void }) {
  return <Button {...props} variant="primary" size="lg" icon={<Text>🌟</Text>} />;
}
```
