import { View, Pressable } from 'react-native';
import type { ReactNode } from 'react';

type Variant = 'default' | 'highlight' | 'glass';

interface CardProps {
  children: ReactNode;
  variant?: Variant;
  onPress?: () => void;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-brand-surface border border-brand-border',
  highlight: 'bg-brand-surface border border-brand-primary/30',
  glass: 'bg-brand-surface/80 border border-brand-primary/15',
};

export function Card({ children, variant = 'default', onPress, className = '' }: CardProps) {
  const base = `rounded-2xl p-5 ${variantStyles[variant]} ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${base} active:opacity-90`}>
        {children}
      </Pressable>
    );
  }

  return <View className={base}>{children}</View>;
}
