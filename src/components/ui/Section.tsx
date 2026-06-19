import { View, Text } from 'react-native';
import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, icon, children, className = '' }: SectionProps) {
  return (
    <View className={`bg-brand-surface border border-brand-border p-5 rounded-2xl ${className}`}>
      <Text className="text-brand-text text-base font-bold mb-3">
        {icon ? `${icon} ${title}` : title}
      </Text>
      {children}
    </View>
  );
}
