export interface BrandRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  matchScore: number;
  estimatedRevenue: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToFirstRevenue: string;
  whyFit: string;
}

export interface Brand {
  id: string;
  userId: string;
  name: string;
  tagline: string;
  slogan: string;
  story: string;
  targetCustomer: string;
  toneAndManner: string;
  colorPalette: ColorPalette;
  logoConcept: string;
  snsProfile: SNSProfile;
  firstContentIdeas: ContentIdea[];
  revenueModel: RevenueModel;
  actionPlan30: ActionPlanDay[];
  status: 'draft' | 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface SNSProfile {
  bio: string;
  platforms: PlatformProfile[];
}

export interface PlatformProfile {
  platform: 'instagram' | 'blog' | 'youtube' | 'twitter' | 'tiktok';
  username: string;
  bio: string;
}

export interface ContentIdea {
  title: string;
  platform: string;
  format: string;
  hook: string;
  description: string;
}

export interface RevenueModel {
  primary: string;
  secondary: string;
  timeline: string;
  estimatedMonthly: string;
  steps: string[];
  risks: string[];
}

export interface ActionPlanDay {
  day: number;
  title: string;
  description: string;
  category: 'setup' | 'content' | 'growth' | 'revenue';
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
}
