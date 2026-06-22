import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../src/stores/useAuthStore';
import { api } from '../src/services/api';
import { Container, Button, Input, Card, Loading, AdBanner } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';
import { toast } from '../src/lib';

export default function AnalyzeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!url.trim()) {
      toast({ message: 'YouTube URL을 입력하세요', type: 'warning' });
      return;
    }

    if (!user) {
      navigate(ROUTES.auth);
      return;
    }

    setLoading(true);
    try {
      const result = await api.analyzeYouTube(url.trim());
      navigate(ROUTES.report(result.reportId));
    } catch (e: any) {
      toast({ message: e.message || '분석 중 오류가 발생했습니다', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading message="AI가 채널을 분석 중입니다..." submessage="최대 30초 소요될 수 있어요" />;
  }

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-16 items-center">
        <Text className="text-brand-text text-3xl font-bold text-center mb-3">채널 분석하기</Text>
        <Text className="text-brand-muted text-sm text-center mb-10">
          YouTube 채널 URL을 입력하면{'\n'}AI가 성장 전략을 분석해드립니다
        </Text>

        <Input
          placeholder="https://youtube.com/@채널명"
          value={url}
          onChangeText={setUrl}
          className="w-full mb-6"
        />

        <Button title="분석 시작 🔍" onPress={handleAnalyze} size="lg" className="w-full mb-6" />

        {user && (
          <Card variant="glass" className="w-full">
            <View className="flex-row justify-between">
              <Text className="text-brand-muted text-sm">남은 분석 횟수</Text>
              <Text className="text-brand-text text-sm font-bold">
                {user.plan === 'pro' ? '무제한' : `${Math.max(0, (user.plan === 'plus' ? 30 : 3) - user.analysisCount)}회`}
              </Text>
            </View>
          </Card>
        )}

        {/* 지원 플랫폼 안내 */}
        <View className="mt-10 w-full">
          <Text className="text-brand-muted text-xs text-center mb-4">지원 URL 형식</Text>
          <View className="gap-2">
            <Text className="text-brand-muted text-xs">• https://youtube.com/@채널이름</Text>
            <Text className="text-brand-muted text-xs">• https://youtube.com/channel/UCxxxxxx</Text>
          </View>
        </View>

        {/* 광고 */}
        <AdBanner slot="analyze-bottom" className="mt-10" />
      </Container>
    </ScrollView>
  );
}
