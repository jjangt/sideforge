import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useProfileStore } from '../../src/stores/useProfileStore';
import { useBrandStore } from '../../src/stores/useBrandStore';
import { useAI } from '../../src/hooks/useAI';

export default function BrandGenerateScreen() {
  const profile = useProfileStore((s) => s.profile);
  const { selectedRecommendation, setBrand, setLoading } = useBrandStore();
  const { provider } = useAI();

  useEffect(() => {
    generate();
  }, []);

  async function generate() {
    if (!profile || !selectedRecommendation) {
      router.replace('/onboarding');
      return;
    }
    setLoading(true);
    const brand = await provider.generateBrand(profile, selectedRecommendation);
    setBrand(brand);
    setLoading(false);
    router.replace(`/brand/${brand.id}`);
  }

  return (
    <View className="flex-1 bg-brand-background items-center justify-center px-6">
      <ActivityIndicator size="large" color="#6C63FF" />
      <Text className="text-brand-text text-xl font-bold mt-6">브랜드를 만들고 있어요...</Text>
      <Text className="text-brand-muted text-sm mt-3 text-center">
        AI가 당신만의 브랜드를 설계하고 있습니다{'\n'}잠시만 기다려주세요 ✨
      </Text>
    </View>
  );
}
