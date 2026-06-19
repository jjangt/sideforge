import { View } from 'react-native';
import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const maxWidths = {
  sm: 448,
  md: 672,
  lg: 896,
  full: undefined,
};

export function Container({ children, className = '', size = 'md' }: ContainerProps) {
  return (
    <View
      className={`w-full px-6 ${className}`}
      style={{ maxWidth: maxWidths[size], alignSelf: 'center' }}
    >
      {children}
    </View>
  );
}
