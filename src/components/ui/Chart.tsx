/**
 * BarChart 컴포넌트
 * 
 * 데이터 배열을 받아 수평 막대 그래프로 시각화합니다.
 * react-native-web 호환을 위해 View로 직접 구현.
 * 
 * @example
 * <BarChart data={[{ label: '영상1', value: 1000 }, { label: '영상2', value: 500 }]} />
 */

import { View, Text } from 'react-native';

export interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  /** 차트 데이터 */
  data: BarChartData[];
  /** 최대 표시 개수 (기본: 5) */
  maxItems?: number;
  /** 막대 색상 (기본: bg-brand-primary) */
  barColor?: string;
  /** 컨테이너 추가 스타일 */
  className?: string;
}

export function BarChart({ data, maxItems = 5, barColor = 'bg-brand-primary', className = '' }: BarChartProps) {
  const items = data.slice(0, maxItems);
  const maxValue = Math.max(...items.map(d => d.value), 1);

  return (
    <View className={`gap-3 ${className}`}>
      {items.map((item, i) => (
        <View key={i}>
          {/* 라벨 + 값 */}
          <View className="flex-row justify-between mb-1">
            <Text className="text-brand-text text-xs flex-1 mr-2" numberOfLines={1}>{item.label}</Text>
            <Text className="text-brand-muted text-xs">{item.value.toLocaleString()}</Text>
          </View>
          {/* 막대 */}
          <View className="h-2 bg-brand-surface-light rounded-full overflow-hidden">
            <View className={`h-full ${barColor} rounded-full`} style={{ width: `${(item.value / maxValue) * 100}%` }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * StatRow 컴포넌트
 * 
 * 라벨 + 값 + 프로그레스 바를 한 줄로 표시합니다.
 * 점수나 비율 등을 시각적으로 보여줄 때 사용.
 */
interface StatRowProps {
  label: string;
  value: string;
  /** 0~100 퍼센트 */
  percent: number;
  color?: string;
}

export function StatRow({ label, value, percent, color = 'bg-brand-primary' }: StatRowProps) {
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-brand-muted text-xs">{label}</Text>
        <Text className="text-brand-text text-xs font-bold">{value}</Text>
      </View>
      <View className="h-1.5 bg-brand-surface-light rounded-full overflow-hidden">
        <View className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, percent)}%` }} />
      </View>
    </View>
  );
}
