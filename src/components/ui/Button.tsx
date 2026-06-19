import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-brand-primary', text: 'text-white' },
  outline: { container: 'border border-brand-primary bg-transparent', text: 'text-brand-primary' },
  ghost: { container: 'bg-transparent', text: 'text-brand-muted' },
  danger: { container: 'bg-brand-error', text: 'text-white' },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-4 py-2 rounded-xl', text: 'text-sm' },
  md: { container: 'px-6 py-4 rounded-2xl', text: 'text-base' },
  lg: { container: 'px-8 py-5 rounded-2xl', text: 'text-lg' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const opacity = disabled || loading ? 'opacity-50' : 'active:opacity-80';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center flex-row gap-2 ${v.container} ${s.container} ${opacity} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? '#fff' : '#7C3AED'} />
      ) : (
        <>
          {icon}
          <Text className={`font-bold ${v.text} ${s.text}`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
