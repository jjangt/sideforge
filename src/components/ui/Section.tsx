import { View, Text } from 'react-native';
import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  icon?: string;
  /** 타이틀 우측에 표시할 뱃지 (예: 'Plus 플랜 이상') */
  badge?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, icon, badge, children, className = '' }: SectionProps) {
  return (
    <View className={`bg-brand-surface border border-brand-border p-5 rounded-2xl ${className}`}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-brand-text text-base font-bold">
          {icon ? `${icon} ${title}` : title}
        </Text>
        {badge && (
          <View className="bg-brand-primary/20 px-2 py-1 rounded-full">
            <Text className="text-brand-primary-light text-xs">{badge}</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}
