import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useBrandStore } from '../../src/stores/useBrandStore';

export default function BrandDetailScreen() {
  const brand = useBrandStore((s) => s.brand);

  if (!brand) {
    return (
      <View className="flex-1 bg-brand-background items-center justify-center">
        <Text className="text-brand-muted">브랜드를 먼저 생성해주세요</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <View className="px-6 py-12">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: brand.colorPalette.primary }}>
            <Text className="text-3xl">🏷️</Text>
          </View>
          <Text className="text-brand-text text-3xl font-bold">{brand.name}</Text>
          <Text className="text-brand-muted text-base mt-2">{brand.tagline}</Text>
          <Text className="text-brand-primary text-sm mt-1 italic">"{brand.slogan}"</Text>
        </View>

        {/* Brand Story */}
        <Section title="브랜드 스토리">
          <Text className="text-brand-muted text-sm leading-6">{brand.story}</Text>
        </Section>

        {/* Target Customer */}
        <Section title="타겟 고객">
          <Text className="text-brand-muted text-sm leading-6">{brand.targetCustomer}</Text>
        </Section>

        {/* Tone & Manner */}
        <Section title="톤 & 매너">
          <Text className="text-brand-muted text-sm leading-6">{brand.toneAndManner}</Text>
        </Section>

        {/* Color Palette */}
        <Section title="컬러 팔레트">
          <View className="flex-row gap-3">
            {Object.entries(brand.colorPalette).map(([key, color]) => (
              <View key={key} className="items-center">
                <View className="w-12 h-12 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                <Text className="text-brand-muted text-xs mt-1">{key}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Revenue Model */}
        <Section title="수익화 모델">
          <View className="gap-2">
            <Text className="text-brand-text text-sm font-bold">주 수익: {brand.revenueModel.primary}</Text>
            <Text className="text-brand-muted text-sm">보조 수익: {brand.revenueModel.secondary}</Text>
            <Text className="text-brand-primary text-sm mt-1">💰 예상 월 수익: {brand.revenueModel.estimatedMonthly}</Text>
            <Text className="text-brand-muted text-xs">⏱️ {brand.revenueModel.timeline}</Text>
          </View>
        </Section>

        {/* First Content Ideas */}
        <Section title="첫 콘텐츠 아이디어">
          <View className="gap-3">
            {brand.firstContentIdeas.map((idea, i) => (
              <View key={i} className="bg-brand-background p-3 rounded-lg">
                <Text className="text-brand-text text-sm font-bold">{idea.title}</Text>
                <Text className="text-brand-muted text-xs mt-1">{idea.platform} · {idea.format}</Text>
                <Text className="text-brand-primary text-xs mt-1 italic">"{idea.hook}"</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Actions */}
        <View className="gap-3 mt-8">
          <Pressable
            onPress={() => router.push(`/brand/${brand.id}/preview`)}
            className="bg-brand-primary px-6 py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-white text-center font-bold">🌐 브랜드 페이지 미리보기</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/dashboard')}
            className="border border-brand-primary px-6 py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-brand-primary text-center font-bold">📊 대시보드로 이동</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-brand-surface p-5 rounded-xl mb-4">
      <Text className="text-brand-text text-base font-bold mb-3">{title}</Text>
      {children}
    </View>
  );
}
