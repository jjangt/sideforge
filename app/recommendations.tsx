import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useProfileStore } from '../src/stores/useProfileStore';
import { useBrandStore } from '../src/stores/useBrandStore';
import { useAI } from '../src/hooks/useAI';
import { BrandRecommendation } from '../src/types/brand';

export default function RecommendationsScreen() {
  const profile = useProfileStore((s) => s.profile);
  const { recommendations, isLoading, setRecommendations, selectRecommendation, setLoading } = useBrandStore();
  const { provider } = useAI();

  useEffect(() => {
    if (profile && recommendations.length === 0) {
      loadRecommendations();
    }
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
    router.push('/brand/generate');
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-background items-center justify-center px-6">
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text className="text-brand-text text-lg mt-6 font-bold">AI가 분석 중입니다...</Text>
        <Text className="text-brand-muted text-sm mt-2 text-center">당신의 관심사와 강점을 바탕으로{'\n'}최적의 브랜드 방향을 찾고 있어요</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <View className="px-6 py-12">
        <Text className="text-brand-text text-2xl font-bold mb-2">추천 브랜드 방향</Text>
        <Text className="text-brand-muted text-sm mb-8">AI가 분석한 당신에게 가장 적합한 브랜드 3가지입니다</Text>

        <View className="gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} onSelect={() => handleSelect(rec)} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function RecommendationCard({ rec, onSelect }: { rec: BrandRecommendation; onSelect: () => void }) {
  const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' };
  const difficultyColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' };

  return (
    <Pressable onPress={onSelect} className="bg-brand-surface p-5 rounded-2xl active:opacity-90">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-brand-text text-lg font-bold">{rec.title}</Text>
          <Text className="text-brand-muted text-xs mt-1">{rec.category}</Text>
        </View>
        <View className="bg-brand-primary/20 px-3 py-1 rounded-full">
          <Text className="text-brand-primary text-sm font-bold">{rec.matchScore}%</Text>
        </View>
      </View>

      <Text className="text-brand-muted text-sm leading-5 mb-4">{rec.description}</Text>

      <View className="flex-row justify-between">
        <View>
          <Text className="text-brand-muted text-xs">예상 수익</Text>
          <Text className="text-brand-text text-sm font-bold">{rec.estimatedRevenue}</Text>
        </View>
        <View>
          <Text className="text-brand-muted text-xs">난이도</Text>
          <Text className={`text-sm font-bold ${difficultyColor[rec.difficulty]}`}>{difficultyLabel[rec.difficulty]}</Text>
        </View>
        <View>
          <Text className="text-brand-muted text-xs">첫 수익</Text>
          <Text className="text-brand-text text-sm font-bold">{rec.timeToFirstRevenue}</Text>
        </View>
      </View>

      <Text className="text-brand-primary text-xs mt-4 italic">💡 {rec.whyFit}</Text>
    </Pressable>
  );
}
