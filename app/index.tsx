import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function LandingScreen() {
  return (
    <ScrollView className="flex-1 bg-brand-background">
      <View className="flex-1 items-center justify-center px-6 py-20">
        {/* Hero */}
        <View className="items-center mb-12">
          <Text className="text-5xl font-bold text-brand-primary mb-4">SideForge</Text>
          <Text className="text-lg text-brand-text text-center leading-7">
            AI와 함께 만드는{'\n'}나만의 브랜드와 두 번째 수입
          </Text>
        </View>

        {/* Value Props */}
        <View className="w-full max-w-md mb-12 gap-4">
          <ValueCard emoji="🎯" title="맞춤 브랜드 발굴" description="당신의 관심사와 강점으로 수익화 가능한 브랜드를 찾아드립니다" />
          <ValueCard emoji="🚀" title="30일 런칭 플랜" description="매일 할 일을 알려주는 실행 계획으로 바로 시작하세요" />
          <ValueCard emoji="🤖" title="AI 공동창업자" description="브랜드 성장을 함께 고민하는 나만의 AI 파트너" />
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => router.push('/onboarding')}
          className="bg-brand-primary px-8 py-4 rounded-2xl w-full max-w-md active:opacity-80"
        >
          <Text className="text-white text-center text-lg font-bold">
            내 브랜드 만들기 시작 →
          </Text>
        </Pressable>

        <Text className="text-brand-muted text-sm mt-4">무료로 시작 · 3분이면 충분</Text>
      </View>
    </ScrollView>
  );
}

function ValueCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <View className="bg-brand-surface p-5 rounded-xl flex-row items-start gap-3">
      <Text className="text-2xl">{emoji}</Text>
      <View className="flex-1">
        <Text className="text-brand-text font-bold text-base mb-1">{title}</Text>
        <Text className="text-brand-muted text-sm leading-5">{description}</Text>
      </View>
    </View>
  );
}
