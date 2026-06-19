# 공용 라이브러리 (src/lib)

## Navigation (`src/lib/navigation.ts`)

### ROUTES

모든 앱 경로를 상수로 관리. 하드코딩된 문자열 대신 항상 이것을 사용.

```tsx
import { ROUTES, navigate } from '@/lib';

// 정적 라우트
navigate(ROUTES.landing);
navigate(ROUTES.onboarding);
navigate(ROUTES.recommendations);
navigate(ROUTES.brandGenerate);
navigate(ROUTES.dashboard);
navigate(ROUTES.coach);

// 동적 라우트 (파라미터 포함)
navigate(ROUTES.brandDetail('brand-id-123'));
navigate(ROUTES.brandPreview('brand-id-123'));
```

### navigate(path, options?)

| Param | Type | 설명 |
|-------|------|------|
| path | string | 이동할 경로 |
| options.replace | boolean | true면 히스토리 대체 (기본: false) |

```tsx
navigate(ROUTES.dashboard);                    // push
navigate(ROUTES.onboarding, { replace: true }); // replace
```

### goBack()

뒤로가기. 히스토리가 없으면 랜딩으로 이동.

### useRouteParams<T>()

URL 파라미터를 타입 안전하게 추출. 새로고침 시에도 유지됨.

```tsx
const { id } = useRouteParams<{ id: string }>();
```

## Feedback (`src/lib/feedback.ts`)

Alert, Confirm, Toast를 한 곳에서 관리. 어디서든 import해서 호출.

### toast(options)

```tsx
import { toast } from '@/lib';

toast({ message: '저장되었습니다', type: 'success' });
toast({ message: '오류 발생', type: 'error', duration: 5000 });
```

| Option | Type | 기본값 | 설명 |
|--------|------|--------|------|
| message | string | 필수 | 메시지 |
| type | 'success' \| 'error' \| 'warning' \| 'info' | 'info' | 색상 |
| duration | number | 3000 | 표시 시간(ms) |

### alert(options)

```tsx
import { alert } from '@/lib';

alert({
  title: '알림',
  message: '작업이 완료되었습니다',
  confirmText: '확인',
  onConfirm: () => console.log('confirmed'),
});
```

### confirm(options)

```tsx
import { confirm } from '@/lib';

confirm({
  title: '삭제 확인',
  message: '정말 삭제하시겠습니까?',
  type: 'warning',
  confirmText: '삭제',
  cancelText: '취소',
  onConfirm: () => deleteBrand(),
  onCancel: () => console.log('cancelled'),
});
```

## 렌더러

`ToastRenderer`와 `ModalRenderer`는 `app/_layout.tsx`에서 한 번만 마운트.
각 페이지에서는 `toast()`, `alert()`, `confirm()`만 호출하면 됨.

## 커스텀 모달이 필요한 경우

`<Modal>` 컴포넌트를 직접 사용:

```tsx
import { Modal, Button } from '@/components/ui';

<Modal visible={open} onClose={() => setOpen(false)} title="커스텀 제목">
  <Text>내용</Text>
  <Button title="확인" onPress={() => setOpen(false)} />
</Modal>
```
