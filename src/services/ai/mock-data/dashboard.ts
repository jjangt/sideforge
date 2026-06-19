import { BrandDashboard } from '../../../types/dashboard';

export const mockDashboard: Omit<BrandDashboard, 'brandId'> = {
  scores: {
    brand: 72,
    growth: 45,
    revenueReadiness: 38,
    consistency: 60,
    overall: 54,
  },
  todayAction: {
    id: 'action-today-1',
    title: '인스타그램 릴스 1개 업로드',
    description: '어제 촬영한 디저트 영상을 30초 릴스로 편집해서 업로드하세요. 트렌드 오디오를 활용하면 도달률이 3배 높아집니다.',
    estimatedMinutes: 25,
    category: 'content',
    priority: 'high',
    reason: '이번 주 콘텐츠 목표(3개) 중 아직 1개만 완료했습니다. 오늘 올리면 일정에 맞출 수 있어요.',
  },
  contentRecommendations: [
    {
      id: 'content-1',
      title: '"퇴근 후 5분 거리 디저트" 시리즈 3탄',
      platform: 'Instagram',
      format: '카드뉴스 (5장)',
      hook: '"오늘도 야근이었지만, 이 한 조각이면 괜찮아"',
      estimatedEngagement: '좋아요 150~300, 저장 50~100',
      difficulty: 'easy',
    },
    {
      id: 'content-2',
      title: '이번 주 서울 신상 디저트 TOP 3',
      platform: 'Blog',
      format: '리뷰 포스트 (2000자)',
      hook: '인스타에서 난리난 그 디저트, 직접 가봤습니다',
      estimatedEngagement: '방문자 500~1000',
      difficulty: 'medium',
    },
    {
      id: 'content-3',
      title: '3,000원으로 만드는 카페 디저트',
      platform: 'Instagram',
      format: '릴스 (30초)',
      hook: '카페 안 가도 됩니다',
      estimatedEngagement: '조회수 5000~15000',
      difficulty: 'easy',
    },
  ],
  improvements: [
    {
      area: '포스팅 빈도',
      current: '주 2회 포스팅 중',
      suggestion: '주 4회로 늘리면 알고리즘 노출이 2배 증가합니다',
      impact: 'high',
    },
    {
      area: '스토리 활용',
      current: '스토리 미사용',
      suggestion: '매일 1개 이상 스토리를 올리면 팔로워 유지율이 40% 향상됩니다',
      impact: 'high',
    },
    {
      area: '해시태그 전략',
      current: '일반 해시태그 10개 사용',
      suggestion: '니치 해시태그(팔로워 1만~10만)를 5개 추가하세요',
      impact: 'medium',
    },
  ],
  nextMilestone: {
    title: '팔로워 500명 달성',
    description: '500명이 되면 협찬 제안이 가능해집니다. 현재 속도라면 5일 후 달성 예상.',
    daysRemaining: 5,
    progress: 68,
  },
  planProgress: {
    totalDays: 30,
    completedDays: 7,
    currentPhase: '콘텐츠 기반 구축',
    streak: 4,
    nextPhase: '팔로워 성장',
  },
  weeklyReview: {
    summary: '첫 주를 잘 마무리했습니다! 계정 세팅과 첫 콘텐츠 3개를 업로드했고, 팔로워 340명을 확보했습니다.',
    achievements: [
      '인스타그램 계정 세팅 완료',
      '첫 포스트 3개 업로드',
      '팔로워 340명 달성',
      '블로그 개설 완료',
    ],
    missedItems: [
      '릴스 콘텐츠 1개 미촬영',
      '해시태그 전략 미수립',
    ],
    nextWeekFocus: '릴스 콘텐츠에 집중하여 도달률을 높이고, 팔로워 500명을 돌파하세요.',
  },
};
