import { Brand } from './brand';
import { BrandDashboard } from './dashboard';

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach';
  content: string;
  timestamp: string;
  actionItems?: ActionItem[];
}

export interface ActionItem {
  title: string;
  description: string;
  deadline?: string;
}

export interface CoachContext {
  brand: Brand;
  dashboard: BrandDashboard;
  recentMessages: CoachMessage[];
  currentDay: number;
}

export interface CoachSession {
  brandId: string;
  messages: CoachMessage[];
  suggestedQuestions: string[];
  lastUpdated: string;
}
