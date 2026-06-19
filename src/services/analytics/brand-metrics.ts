// TODO: 향후 SNS/블로그/도메인 연동 시 구현
// 브랜드 성과 지표 수집 및 분석

export interface BrandMetrics {
  brandId: string;
  followers: number;
  engagement: number;
  reach: number;
  revenue: number;
  updatedAt: string;
}

export async function fetchBrandMetrics(_brandId: string): Promise<BrandMetrics | null> {
  // placeholder - 향후 실제 SNS API 연동
  return null;
}
