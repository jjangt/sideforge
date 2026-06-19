import { View, Text, Pressable } from 'react-native';
import { useFeedbackStore } from '../../lib/feedback';

const typeColors = {
  success: 'bg-brand-success/90 border-brand-success',
  error: 'bg-brand-error/90 border-brand-error',
  warning: 'bg-brand-warning/90 border-brand-warning',
  info: 'bg-brand-primary/90 border-brand-primary',
};

export function ToastRenderer() {
  const toasts = useFeedbackStore((s) => s.toasts);
  const hideToast = useFeedbackStore((s) => s.hideToast);

  if (toasts.length === 0) return null;

  return (
    <View className="absolute top-14 left-0 right-0 items-center z-50 px-6 gap-2">
      {toasts.map((t) => (
        <Pressable
          key={t.id}
          onPress={() => hideToast(t.id)}
          className={`w-full max-w-sm px-4 py-3 rounded-xl border ${typeColors[t.type || 'info']}`}
        >
          <Text className="text-white text-sm font-medium">{t.message}</Text>
        </Pressable>
      ))}
    </View>
  );
}
