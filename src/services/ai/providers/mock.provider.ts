import { AIProvider } from '../types';
import { UserProfile } from '../../../types/profile';
import { Brand, BrandRecommendation, ActionPlanDay } from '../../../types/brand';
import { BrandDashboard, TodayAction, ContentRecommendation, WeeklyReview } from '../../../types/dashboard';
import { CoachContext, CoachMessage } from '../../../types/coach';
import { scenarioA, scenarioB, scenarioC } from '../mock-data/recommendations';
import { brandScenarioA } from '../mock-data/brands';
import { mockDashboard } from '../mock-data/dashboard';
import { coachResponses, defaultCoachResponse, suggestedQuestions } from '../mock-data/coach';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function detectScenario(profile: UserProfile): 'A' | 'B' | 'C' {
  const all = [...profile.interests, ...profile.likes, ...profile.skills].join(' ').toLowerCase();

  if (/디저트|음식|요리|베이킹|카페|맛집|푸드/.test(all)) return 'A';
  if (/테크|생산성|ai|개발|코딩|노션|자동화/.test(all)) return 'B';
  if (/여행|라이프스타일|사진|감성|자유/.test(all)) return 'C';
  return 'A';
}

export class MockProvider implements AIProvider {
  readonly name = 'mock';
  readonly version = '1.0.0';

  async generateRecommendations(profile: UserProfile): Promise<BrandRecommendation[]> {
    await delay(2000);
    const scenario = detectScenario(profile);
    switch (scenario) {
      case 'A': return scenarioA;
      case 'B': return scenarioB;
      case 'C': return scenarioC;
    }
  }

  async generateBrand(profile: UserProfile, recommendation: BrandRecommendation): Promise<Brand> {
    await delay(3000);
    const now = new Date().toISOString();
    return {
      ...brandScenarioA,
      id: generateId(),
      userId: profile.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getDashboard(brand: Brand): Promise<BrandDashboard> {
    await delay(1000);
    return { ...mockDashboard, brandId: brand.id };
  }

  async getCoachResponse(context: CoachContext, message: string): Promise<CoachMessage> {
    await delay(1500);
    const response = coachResponses[message] || defaultCoachResponse;
    return {
      id: generateId(),
      role: 'coach',
      content: response,
      timestamp: new Date().toISOString(),
    };
  }

  async getTodayAction(brand: Brand, dayNumber: number): Promise<TodayAction> {
    await delay(800);
    return mockDashboard.todayAction;
  }

  async getContentRecommendations(brand: Brand, count = 3): Promise<ContentRecommendation[]> {
    await delay(1000);
    return mockDashboard.contentRecommendations.slice(0, count);
  }

  async getWeeklyReview(brand: Brand, completedActions: ActionPlanDay[]): Promise<WeeklyReview> {
    await delay(1200);
    return mockDashboard.weeklyReview;
  }
}
