import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Container, Button, Card, Badge } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';

export default function LandingScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1 bg-brand-background">
      {/* Hero */}
      <Container className="pt-24 pb-16 items-center">
        <Badge label="✨ AI 채널 분석 플랫폼" variant="primary" className="mb-8" />

        <Text className="text-5xl font-bold text-brand-text text-center mb-5">
          SideForge
        </Text>

        <Text className="text-lg text-brand-muted text-center leading-8 mb-12">
          YouTube URL만 입력하면{'\n'}AI가 성장 전략을 분석해드립니다
        </Text>

        <Button
          title="무료로 분석 시작 →"
          size="lg"
          onPress={() => navigate(ROUTES.analyze)}
          className="w-full"
        />

        <Text className="text-brand-muted text-sm mt-4">가입 후 3회 무료 분석</Text>
      </Container>

      {/* How it works */}
      <Container className="pb-12">
        <Text className="text-brand-text text-xl font-bold text-center mb-8">어떻게 동작하나요?</Text>
        <View className="gap-4">
          <StepCard step="1" title="URL 입력" desc="분석할 YouTube 채널 URL을 붙여넣기" />
          <StepCard step="2" title="AI 분석" desc="AI가 채널 데이터를 수집하고 패턴을 분석" />
          <StepCard step="3" title="액션 제안" desc="구체적인 개선 방법과 콘텐츠 아이디어 제공" />
        </View>
      </Container>

      {/* Differentiator */}
      <Container className="pb-12">
        <Text className="text-brand-text text-xl font-bold text-center mb-8">기존 도구와 뭐가 다른가요?</Text>
        <View className="gap-4">
          <FeatureCard icon="📊" title="숫자가 아닌 액션" desc="조회수만 보여주는 게 아니라, '왜'와 '어떻게'를 알려드립니다" />
          <FeatureCard icon="🤖" title="AI 기반 피드백" desc="잘 되는 채널과 비교 분석하여 구체적 개선점 제안" />
          <FeatureCard icon="⚡" title="30초면 끝" desc="URL 입력 하나로 즉시 분석, 복잡한 설정 불필요" />
        </View>
      </Container>

      {/* Pricing Preview */}
      <Container className="pb-24 items-center">
        <Card className="w-full items-center p-8">
          <Text className="text-3xl mb-3">🏷️</Text>
          <Text className="text-brand-text text-base font-bold text-center">
            무료로 시작, 필요할 때 업그레이드
          </Text>
          <Text className="text-brand-muted text-sm mt-2 text-center">
            Free 3회 · Plus ₩9,900/월 · Pro ₩29,900/월
          </Text>
        </Card>
      </Container>
    </ScrollView>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <Card className="flex-row items-center gap-4">
      <View className="w-10 h-10 bg-brand-primary rounded-full items-center justify-center">
        <Text className="text-white font-bold">{step}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-brand-text font-bold text-base">{title}</Text>
        <Text className="text-brand-muted text-sm">{desc}</Text>
      </View>
    </Card>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <Card className="flex-row items-start gap-4">
      <View className="w-12 h-12 bg-brand-primary/10 rounded-xl items-center justify-center">
        <Text className="text-2xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-brand-text font-bold text-base mb-1">{title}</Text>
        <Text className="text-brand-muted text-sm leading-6">{desc}</Text>
      </View>
    </Card>
  );
}
