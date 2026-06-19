import { UserProfile } from '../../types/profile';
import { Brand, BrandRecommendation, ActionPlanDay } from '../../types/brand';
import { BrandDashboard, TodayAction, ContentRecommendation, WeeklyReview } from '../../types/dashboard';
import { CoachContext, CoachMessage } from '../../types/coach';

export interface AIProvider {
  readonly name: string;
  readonly version: string;

  generateRecommendations(profile: UserProfile): Promise<BrandRecommendation[]>;
  generateBrand(profile: UserProfile, recommendation: BrandRecommendation): Promise<Brand>;
  getDashboard(brand: Brand): Promise<BrandDashboard>;
  getCoachResponse(context: CoachContext, message: string): Promise<CoachMessage>;
  getTodayAction(brand: Brand, dayNumber: number): Promise<TodayAction>;
  getContentRecommendations(brand: Brand, count?: number): Promise<ContentRecommendation[]>;
  getWeeklyReview(brand: Brand, completedActions: ActionPlanDay[]): Promise<WeeklyReview>;
}

export type ProviderType = 'mock' | 'claude' | 'openai';

export interface ProviderConfig {
  type: ProviderType;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}
