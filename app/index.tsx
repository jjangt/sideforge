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
        <Badge label={t('landing.badge')} variant="primary" className="mb-8" />

        <Text className="text-5xl font-bold text-brand-text text-center mb-5">
          {t('landing.title')}
        </Text>

        <Text className="text-lg text-brand-muted text-center leading-8 mb-12">
          {t('landing.subtitle')}
        </Text>

        <Button
          title={`${t('landing.cta')} →`}
          size="lg"
          onPress={() => navigate(ROUTES.onboarding)}
          className="w-full"
        />

        <Text className="text-brand-muted text-sm mt-4">{t('common.free')}</Text>
      </Container>

      {/* Features */}
      <Container className="pb-12">
        <View className="gap-4">
          <FeatureCard icon="🎯" title={t('landing.feature1Title')} desc={t('landing.feature1Desc')} />
          <FeatureCard icon="🚀" title={t('landing.feature2Title')} desc={t('landing.feature2Desc')} />
          <FeatureCard icon="🤖" title={t('landing.feature3Title')} desc={t('landing.feature3Desc')} />
        </View>
      </Container>

      {/* Social Proof */}
      <Container className="pb-24 items-center">
        <Card className="w-full items-center p-8">
          <Text className="text-3xl mb-3">🏆</Text>
          <Text className="text-brand-text text-base font-bold text-center">
            {t('landing.socialProof')}
          </Text>
          <View className="flex-row mt-4 gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Text key={i} className="text-brand-warning text-lg">★</Text>
            ))}
          </View>
        </Card>
      </Container>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <Card className="flex-row items-start gap-4">
      <View className="w-12 h-12 rounded-xl items-center justify-center bg-brand-primary/10">
        <Text className="text-2xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-brand-text font-bold text-base mb-1">{title}</Text>
        <Text className="text-brand-muted text-sm leading-6">{desc}</Text>
      </View>
    </Card>
  );
}
