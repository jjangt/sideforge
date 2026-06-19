// TODO: 향후 수익 데이터 연동 시 구현
// 수익화 준비도 및 실제 수익 추적

export interface RevenueScore {
  brandId: string;
  readiness: number; // 0~100
  estimatedMonthly: number;
  actualMonthly: number;
  sources: { name: string; amount: number }[];
}

export async function calculateRevenueScore(_brandId: string): Promise<RevenueScore | null> {
  // placeholder - 향후 실제 수익 데이터 기반 계산
  return null;
}
