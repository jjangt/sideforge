import { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useBrandStore } from '../src/stores/useBrandStore';
import { useDashboardStore } from '../src/stores/useDashboardStore';
import { useAI } from '../src/hooks/useAI';

export default function DashboardScreen() {
  const brand = useBrandStore((s) => s.brand);
  const { dashboard, isLoading, setDashboard, setLoading } = useDashboardStore();
  const { provider } = useAI();

  useEffect(() => {
    if (brand && !dashboard) loadDashboard();
  }, [brand]);

  async function loadDashboard() {
    if (!brand) return;
    setLoading(true);
    const data = await provider.getDashboard(brand);
    setDashboard(data);
    setLoading(false);
  }

  if (isLoading || !dashboard) {
    return (
      <View className="flex-1 bg-brand-background items-center justify-center">
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text className="text-brand-muted mt-4">대시보드 로딩 중...</Text>
      </View>
    );
  }

  const { scores, todayAction, planProgress, nextMilestone, contentRecommendations, improvements } = dashboard;

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <View className="px-6 py-12">
        {/* Header */}
        <Text className="text-brand-text text-2xl font-bold mb-1">{brand?.name || '내 브랜드'}</Text>
        <Text className="text-brand-muted text-sm mb-8">AI 공동창업자 대시보드</Text>

        {/* Scores */}
        <View className="flex-row gap-3 mb-6">
          <ScoreCard label="브랜드" score={scores.brand} />
          <ScoreCard label="성장" score={scores.growth} />
          <ScoreCard label="수익화" score={scores.revenueReadiness} />
        </View>

        {/* Today Action */}
        <View className="bg-brand-primary/10 border border-brand-primary/30 p-5 rounded-xl mb-6">
          <Text className="text-brand-primary text-xs font-bold uppercase mb-2">🎯 오늘의 추천 액션</Text>
          <Text className="text-brand-text text-base font-bold">{todayAction.title}</Text>
          <Text className="text-brand-muted text-sm mt-2 leading-5">{todayAction.description}</Text>
          <View className="flex-row items-center mt-3 gap-4">
            <Text className="text-brand-muted text-xs">⏱️ {todayAction.estimatedMinutes}분</Text>
            <Text className="text-brand-muted text-xs">📌 {todayAction.reason}</Text>
          </View>
        </View>

        {/* Plan Progress */}
        <View className="bg-brand-surface p-5 rounded-xl mb-6">
          <Text className="text-brand-text font-bold mb-3">30일 플랜 진행률</Text>
          <View className="h-3 bg-brand-background rounded-full overflow-hidden mb-2">
            <View className="h-full bg-brand-primary rounded-full" style={{ width: `${(planProgress.completedDays / planProgress.totalDays) * 100}%` }} />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-brand-muted text-xs">{planProgress.completedDays}/{planProgress.totalDays}일 완료</Text>
            <Text className="text-brand-muted text-xs">🔥 {planProgress.streak}일 연속</Text>
          </View>
          <Text className="text-brand-primary text-xs mt-2">현재: {planProgress.currentPhase} → 다음: {planProgress.nextPhase}</Text>
        </View>

        {/* Next Milestone */}
        <View className="bg-brand-surface p-5 rounded-xl mb-6">
          <Text className="text-brand-text font-bold mb-2">🏆 다음 마일스톤</Text>
          <Text className="text-brand-muted text-sm">{nextMilestone.title}</Text>
          <Text className="text-brand-muted text-xs mt-1">{nextMilestone.description}</Text>
          <View className="h-2 bg-brand-background rounded-full overflow-hidden mt-3">
            <View className="h-full bg-green-500 rounded-full" style={{ width: `${nextMilestone.progress}%` }} />
          </View>
        </View>

        {/* Content Recommendations */}
        <View className="bg-brand-surface p-5 rounded-xl mb-6">
          <Text className="text-brand-text font-bold mb-3">📝 추천 콘텐츠</Text>
          <View className="gap-3">
            {contentRecommendations.map((c) => (
              <View key={c.id} className="bg-brand-background p-3 rounded-lg">
                <Text className="text-brand-text text-sm font-bold">{c.title}</Text>
                <Text className="text-brand-muted text-xs mt-1">{c.platform} · {c.format}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Improvements */}
        <View className="bg-brand-surface p-5 rounded-xl mb-6">
          <Text className="text-brand-text font-bold mb-3">💡 개선 포인트</Text>
          <View className="gap-2">
            {improvements.map((imp, i) => (
              <View key={i} className="flex-row items-start gap-2">
                <Text className="text-brand-accent text-xs">•</Text>
                <Text className="text-brand-muted text-sm flex-1">{imp.suggestion}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Navigation */}
        <View className="gap-3">
          <Pressable onPress={() => router.push('/coach')} className="bg-brand-primary px-6 py-4 rounded-xl active:opacity-80">
            <Text className="text-white text-center font-bold">🤖 AI 코치와 상담하기</Text>
          </Pressable>
          <Pressable onPress={() => router.push(`/brand/${brand?.id}/preview`)} className="border border-brand-primary px-6 py-4 rounded-xl active:opacity-80">
            <Text className="text-brand-primary text-center font-bold">🌐 브랜드 페이지 보기</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400';
  return (
    <View className="flex-1 bg-brand-surface p-4 rounded-xl items-center">
      <Text className={`text-2xl font-bold ${color}`}>{score}</Text>
      <Text className="text-brand-muted text-xs mt-1">{label}</Text>
    </View>
  );
}
