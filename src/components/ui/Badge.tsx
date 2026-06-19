import { View, Text } from 'react-native';

type Variant = 'primary' | 'success' | 'warning' | 'error' | 'muted';

interface BadgeProps {
  label: string;
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: 'bg-brand-primary/20', text: 'text-brand-primary-light' },
  success: { bg: 'bg-brand-success/20', text: 'text-brand-success' },
  warning: { bg: 'bg-brand-warning/20', text: 'text-brand-warning' },
  error: { bg: 'bg-brand-error/20', text: 'text-brand-error' },
  muted: { bg: 'bg-brand-surface-light', text: 'text-brand-muted' },
};

export function Badge({ label, variant = 'primary', className = '' }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <View className={`${v.bg} px-3 py-1 rounded-full self-start ${className}`}>
      <Text className={`${v.text} text-xs font-medium`}>{label}</Text>
    </View>
  );
}
