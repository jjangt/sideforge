import { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '../src/stores/useProfileStore';
import { useBrandStore } from '../src/stores/useBrandStore';
import { useAI } from '../src/hooks/useAI';
import { BrandRecommendation } from '../src/types/brand';
import { Container, Card, Badge, Loading } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';

export default function RecommendationsScreen() {
  const { t } = useTranslation();
  const profile = useProfileStore((s) => s.profile);
  const { recommendations, isLoading, setRecommendations, selectRecommendation, setLoading } = useBrandStore();
  const { provider } = useAI();

  useEffect(() => {
    if (profile && recommendations.length === 0) loadRecommendations();
  }, []);

  async function loadRecommendations() {
    if (!profile) return;
    setLoading(true);
    const recs = await provider.generateRecommendations(profile);
    setRecommendations(recs);
    setLoading(false);
  }

  function handleSelect(rec: BrandRecommendation) {
    selectRecommendation(rec);
    navigate(ROUTES.brandGenerate);
  }

  if (isLoading) {
    return <Loading message={t('recommendations.analyzing')} submessage={t('recommendations.analyzingDesc')} />;
  }

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        <Text className="text-brand-text text-2xl font-bold mb-2">{t('recommendations.title')}</Text>
        <Text className="text-brand-muted text-sm mb-8">{t('recommendations.subtitle')}</Text>

        <View className="gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} onSelect={() => handleSelect(rec)} />
          ))}
        </View>
      </Container>
    </ScrollView>
  );
}

function RecommendationCard({ rec, onSelect }: { rec: BrandRecommendation; onSelect: () => void }) {
  const { t } = useTranslation();
  const difficultyVariant = { easy: 'success', medium: 'warning', hard: 'error' } as const;

  return (
    <Card onPress={onSelect} variant="default">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-brand-text text-lg font-bold">{rec.title}</Text>
          <Text className="text-brand-muted text-xs mt-1">{rec.category}</Text>
        </View>
        <Badge label={`${rec.matchScore}%`} variant="primary" />
      </View>

      <Text className="text-brand-muted text-sm leading-6 mb-4">{rec.description}</Text>

      <View className="flex-row justify-between">
        <Stat label={t('recommendations.revenue')} value={rec.estimatedRevenue} />
        <Stat label={t('recommendations.difficulty')} value={t(`recommendations.${rec.difficulty}`)} />
        <Stat label={t('recommendations.timeToRevenue')} value={rec.timeToFirstRevenue} />
      </View>

      <Text className="text-brand-primary-light text-xs mt-4">💡 {rec.whyFit}</Text>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-brand-muted text-xs">{label}</Text>
      <Text className="text-brand-text text-sm font-bold">{value}</Text>
    </View>
  );
}
