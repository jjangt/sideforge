// TODO: 향후 브랜드 성장 추적 시 구현
// 주간/월간 성장률 계산

export interface GrowthScore {
  brandId: string;
  weeklyGrowth: number;
  monthlyGrowth: number;
  trend: 'up' | 'stable' | 'down';
}

export async function calculateGrowthScore(_brandId: string): Promise<GrowthScore | null> {
  // placeholder - 향후 실제 데이터 기반 계산
  return null;
}
