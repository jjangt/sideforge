import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAuthStore } from '../src/stores/useAuthStore';
import { api } from '../src/services/api';
import { Container, Button, Input, Card, Badge, Loading, AdBanner } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';
import { toast } from '../src/lib';

const PLATFORMS = [
  { id: 'youtube', icon: '▶️', name: 'YouTube', available: true, placeholder: 'https://youtube.com/@채널명', hint: 'youtube.com/@채널 또는 youtube.com/channel/UC...' },
  { id: 'blog', icon: '📝', name: 'Blog', available: false, placeholder: 'https://blog.naver.com/아이디', hint: '네이버, 티스토리, Medium, WordPress, Velog' },
  { id: 'instagram', icon: '📸', name: 'Instagram', available: false, placeholder: 'https://instagram.com/아이디', hint: 'instagram.com/아이디' },
];

export default function AnalyzeScreen() {
  const user = useAuthStore((s) => s.user);
  const [platform, setPlatform] = useState('youtube');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const selected = PLATFORMS.find(p => p.id === platform)!;

  /**
   * 플랫폼 탭 변경 시 URL 입력값 초기화
   * 이전 플랫폼 URL을 실수로 그대로 제출하는 것을 방지
   */
  function handlePlatformChange(newPlatform: string) {
    setPlatform(newPlatform);
    setUrl('');
  }

  async function handleAnalyze() {
    if (!url.trim()) {
      toast({ message: 'URL을 입력하세요', type: 'warning' });
      return;
    }
    if (!user) {
      navigate(ROUTES.auth);
      return;
    }
    if (!selected.available) {
      toast({ message: `${selected.name}은 준비 중입니다. 곧 출시됩니다!`, type: 'info' });
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
      <Container className="py-16">
        <Text className="text-brand-text text-3xl font-bold text-center mb-3">채널 분석하기</Text>
        <Text className="text-brand-muted text-sm text-center mb-10">
          분석할 플랫폼을 선택하고 URL을 입력하세요
        </Text>

        {/* 플랫폼 선택 */}
        <View className="flex-row gap-3 mb-8">
          {PLATFORMS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => handlePlatformChange(p.id)}
              className={`flex-1 p-4 rounded-2xl border items-center ${platform === p.id ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border bg-brand-surface'}`}
            >
              <Text className="text-2xl mb-2">{p.icon}</Text>
              <Text className={`text-xs font-bold ${platform === p.id ? 'text-brand-primary' : 'text-brand-muted'}`}>{p.name}</Text>
              {!p.available && <Badge label="Soon" variant="muted" className="mt-1" />}
            </Pressable>
          ))}
        </View>

        {/* URL 입력 */}
        <Input
          placeholder={selected.placeholder}
          value={url}
          onChangeText={setUrl}
          hint={selected.hint}
          className="mb-6"
          onSubmitEditing={handleAnalyze}
          returnKeyType="go"
        />

        <Button title="분석 시작 🔍" onPress={handleAnalyze} size="lg" className="w-full mb-6" />

        {/* 플랜 정보 */}
        {user && (
          <Card variant="glass" className="mb-6">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-brand-muted text-xs">현재 플랜</Text>
                <Text className="text-brand-text text-sm font-bold mt-0.5">{user.plan.toUpperCase()}</Text>
              </View>
              <View className="items-end">
                <Text className="text-brand-muted text-xs">남은 분석</Text>
                <Text className="text-brand-text text-sm font-bold mt-0.5">
                  {user.plan === 'pro' || user.plan === 'admin' ? '무제한' : `${Math.max(0, (user.plan === 'plus' ? 30 : 3) - user.analysisCount)}회`}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {!user && (
          <Card variant="highlight" className="items-center p-6 mb-6">
            <Text className="text-brand-text text-sm font-bold mb-2">로그인하고 무료 분석 시작</Text>
            <Text className="text-brand-muted text-xs mb-3">가입하면 월 3회 무료 분석 가능</Text>
            <Button title="로그인 / 회원가입" size="sm" onPress={() => navigate(ROUTES.auth)} />
          </Card>
        )}

        {/* 광고 */}
        <AdBanner slot="analyze-bottom" className="mt-4" />
      </Container>
    </ScrollView>
  );
}
