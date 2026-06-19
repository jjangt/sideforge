import { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBrandStore } from '../src/stores/useBrandStore';
import { useDashboardStore } from '../src/stores/useDashboardStore';
import { useAI } from '../src/hooks/useAI';
import { Container, Button, Card, Section, ProgressBar, Loading } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';

export default function DashboardScreen() {
  const { t } = useTranslation();
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
    return <Loading message={t('dashboard.loading')} />;
  }

  const { scores, todayAction, planProgress, nextMilestone, contentRecommendations, improvements } = dashboard;

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        {/* Header */}
        <Text className="text-brand-text text-2xl font-bold mb-1">{brand?.name || 'Brand'}</Text>
        <Text className="text-brand-muted text-sm mb-8">{t('dashboard.subtitle')}</Text>

        {/* Scores */}
        <View className="flex-row gap-3 mb-6">
          <ScoreCard label={t('dashboard.brand')} score={scores.brand} />
          <ScoreCard label={t('dashboard.growth')} score={scores.growth} />
          <ScoreCard label={t('dashboard.revenue')} score={scores.revenueReadiness} />
        </View>

        <View className="gap-4">
          {/* Today Action */}
          <Card variant="highlight">
            <Text className="text-brand-primary text-xs font-bold uppercase mb-2">🎯 {t('dashboard.todayAction')}</Text>
            <Text className="text-brand-text text-base font-bold">{todayAction.title}</Text>
            <Text className="text-brand-muted text-sm mt-2 leading-5">{todayAction.description}</Text>
            <View className="flex-row items-center mt-3 gap-4">
              <Text className="text-brand-muted text-xs">⏱️ {todayAction.estimatedMinutes}min</Text>
              <Text className="text-brand-muted text-xs">📌 {todayAction.reason}</Text>
            </View>
          </Card>

          {/* Plan Progress */}
          <Section title={t('dashboard.planProgress')} icon="📅">
            <ProgressBar value={(planProgress.completedDays / planProgress.totalDays) * 100} height="lg" className="mb-2" />
            <View className="flex-row justify-between">
              <Text className="text-brand-muted text-xs">{planProgress.completedDays}/{planProgress.totalDays} {t('dashboard.daysComplete')}</Text>
              <Text className="text-brand-muted text-xs">🔥 {planProgress.streak}{t('dashboard.streak')}</Text>
            </View>
            <Text className="text-brand-primary-light text-xs mt-2">{planProgress.currentPhase} → {planProgress.nextPhase}</Text>
          </Section>

          {/* Next Milestone */}
          <Section title={t('dashboard.nextMilestone')} icon="🏆">
            <Text className="text-brand-muted text-sm">{nextMilestone.title}</Text>
            <Text className="text-brand-muted text-xs mt-1">{nextMilestone.description}</Text>
            <ProgressBar value={nextMilestone.progress} height="md" color="bg-brand-success" className="mt-3" />
          </Section>

          {/* Content */}
          <Section title={t('dashboard.content')} icon="📝">
            <View className="gap-3">
              {contentRecommendations.map((c) => (
                <Card key={c.id} variant="glass" className="p-3">
                  <Text className="text-brand-text text-sm font-bold">{c.title}</Text>
                  <Text className="text-brand-muted text-xs mt-1">{c.platform} · {c.format}</Text>
                </Card>
              ))}
            </View>
          </Section>

          {/* Improvements */}
          <Section title={t('dashboard.improvements')} icon="💡">
            <View className="gap-2">
              {improvements.map((imp, i) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Text className="text-brand-accent text-xs">•</Text>
                  <Text className="text-brand-muted text-sm flex-1">{imp.suggestion}</Text>
                </View>
              ))}
            </View>
          </Section>
        </View>

        {/* Navigation */}
        <View className="gap-3 mt-10">
          <Button title={`🤖 ${t('dashboard.coachBtn')}`} onPress={() => navigate(ROUTES.coach)} />
          <Button
            title={`🌐 ${t('dashboard.brandPageBtn')}`}
            variant="outline"
            onPress={() => brand && navigate(ROUTES.brandPreview(brand.id))}
          />
        </View>
      </Container>
    </ScrollView>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? 'text-brand-success' : score >= 40 ? 'text-brand-warning' : 'text-brand-error';
  return (
    <Card className="flex-1 items-center p-4">
      <Text className={`text-2xl font-bold ${color}`}>{score}</Text>
      <Text className="text-brand-muted text-xs mt-1">{label}</Text>
    </Card>
  );
}
