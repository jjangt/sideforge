import { View, Text } from 'react-native';

interface ProgressBarProps {
  /** 0~100 */
  value: number;
  /** 라벨 표시 여부 */
  showLabel?: boolean;
  /** 높이 (기본: h-1.5) */
  height?: 'sm' | 'md' | 'lg';
  /** 색상 override */
  color?: string;
  className?: string;
}

const heightMap = { sm: 'h-1', md: 'h-1.5', lg: 'h-3' };

export function ProgressBar({ value, showLabel, height = 'md', color, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const barColor = color || 'bg-brand-primary';

  return (
    <View className={className}>
      {showLabel && (
        <Text className="text-brand-primary text-xs font-bold mb-1 text-right">{Math.round(clamped)}%</Text>
      )}
      <View className={`${heightMap[height]} bg-brand-surface-light rounded-full overflow-hidden`}>
        <View className={`h-full ${barColor} rounded-full`} style={{ width: `${clamped}%` }} />
      </View>
    </View>
  );
}
