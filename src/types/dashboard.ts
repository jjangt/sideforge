import { ActionPlanDay } from './brand';

export interface BrandDashboard {
  brandId: string;
  scores: BrandScores;
  todayAction: TodayAction;
  contentRecommendations: ContentRecommendation[];
  improvements: Improvement[];
  nextMilestone: Milestone;
  planProgress: PlanProgress;
  weeklyReview: WeeklyReview;
}

export interface BrandScores {
  brand: number;
  growth: number;
  revenueReadiness: number;
  consistency: number;
  overall: number;
}

export interface TodayAction {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface ContentRecommendation {
  id: string;
  title: string;
  platform: string;
  format: string;
  hook: string;
  estimatedEngagement: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Improvement {
  area: string;
  current: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

export interface Milestone {
  title: string;
  description: string;
  daysRemaining: number;
  progress: number;
}

export interface PlanProgress {
  totalDays: number;
  completedDays: number;
  currentPhase: string;
  streak: number;
  nextPhase: string;
}

export interface WeeklyReview {
  summary: string;
  achievements: string[];
  missedItems: string[];
  nextWeekFocus: string;
}
