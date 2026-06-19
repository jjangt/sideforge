import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBrandStore } from '../../src/stores/useBrandStore';
import { Container, Button, Card, Section, Loading } from '../../src/components/ui';
import { navigate, ROUTES } from '../../src/lib';

export default function BrandDetailScreen() {
  const { t } = useTranslation();
  const brand = useBrandStore((s) => s.brand);

  if (!brand) {
    return <Loading message={t('brandDetail.noBrand')} />;
  }

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: brand.colorPalette.primary }}>
            <Text className="text-3xl">🏷️</Text>
          </View>
          <Text className="text-brand-text text-3xl font-bold">{brand.name}</Text>
          <Text className="text-brand-muted text-base mt-2">{brand.tagline}</Text>
          <Text className="text-brand-primary-light text-sm mt-1 italic">"{brand.slogan}"</Text>
        </View>

        <View className="gap-4">
          <Section title={t('brandDetail.story')} icon="📖">
            <Text className="text-brand-muted text-sm leading-6">{brand.story}</Text>
          </Section>

          <Section title={t('brandDetail.target')} icon="👥">
            <Text className="text-brand-muted text-sm leading-6">{brand.targetCustomer}</Text>
          </Section>

          <Section title={t('brandDetail.tone')} icon="🎨">
            <Text className="text-brand-muted text-sm leading-6">{brand.toneAndManner}</Text>
          </Section>

          <Section title={t('brandDetail.colors')} icon="🎨">
            <View className="flex-row gap-3">
              {Object.entries(brand.colorPalette).map(([key, color]) => (
                <View key={key} className="items-center">
                  <View className="w-12 h-12 rounded-full border border-brand-border" style={{ backgroundColor: color }} />
                  <Text className="text-brand-muted text-xs mt-1">{key}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title={t('brandDetail.revenueModel')} icon="💰">
            <View className="gap-2">
              <Text className="text-brand-text text-sm font-bold">{t('brandDetail.primaryRevenue')}: {brand.revenueModel.primary}</Text>
              <Text className="text-brand-muted text-sm">{t('brandDetail.secondaryRevenue')}: {brand.revenueModel.secondary}</Text>
              <Text className="text-brand-primary-light text-sm mt-1">💰 {t('brandDetail.estimatedMonthly')}: {brand.revenueModel.estimatedMonthly}</Text>
              <Text className="text-brand-muted text-xs">⏱️ {brand.revenueModel.timeline}</Text>
            </View>
          </Section>

          <Section title={t('brandDetail.contentIdeas')} icon="📝">
            <View className="gap-3">
              {brand.firstContentIdeas.map((idea, i) => (
                <Card key={i} variant="glass" className="p-3">
                  <Text className="text-brand-text text-sm font-bold">{idea.title}</Text>
                  <Text className="text-brand-muted text-xs mt-1">{idea.platform} · {idea.format}</Text>
                  <Text className="text-brand-primary-light text-xs mt-1 italic">"{idea.hook}"</Text>
                </Card>
              ))}
            </View>
          </Section>
        </View>

        {/* Actions */}
        <View className="gap-3 mt-10">
          <Button
            title={`🌐 ${t('brandDetail.preview')}`}
            onPress={() => navigate(ROUTES.brandPreview(brand.id))}
          />
          <Button
            title={`📊 ${t('brandDetail.toDashboard')}`}
            variant="outline"
            onPress={() => navigate(ROUTES.dashboard)}
          />
        </View>
      </Container>
    </ScrollView>
  );
}
