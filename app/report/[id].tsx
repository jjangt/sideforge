import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { api } from '../../src/services/api';
import { Container, Card, Section, Badge, Button, Loading, ProgressBar, BarChart, StatRow } from '../../src/components/ui';
import { navigate, goBack, ROUTES } from '../../src/lib';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 인증 체크 — 로그아웃 상태에서 뒤로가기로 접근 방지
   */
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.auth, { replace: true });
    }
  }, [user]);

  useEffect(() => {
    if (id && user) loadReport(id);
  }, [id, user]);

  async function loadReport(reportId: string) {
    try {
      const data = await api.getReport(reportId);
      setReport(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading message="리포트 불러오는 중..." />;
  if (!report) return <Loading message="리포트를 찾을 수 없습니다" />;

  const { data, plan } = report;
  const { channel, analysis } = data;

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        {/* Header — 채널 정보 */}
        <View className="items-center mb-10">
          {channel.thumbnail && (
            <Image source={{ uri: channel.thumbnail }} style={{ width: 80, height: 80, borderRadius: 40 }} className="mb-4" />
          )}
          <Text className="text-brand-text text-2xl font-bold text-center">{channel.title}</Text>
          {channel.subscribers && (
            <Text className="text-brand-muted text-sm mt-1">
              구독자 {channel.subscribers.toLocaleString()}명 · 영상 {channel.videoCount}개
            </Text>
          )}
          <Badge label={report.platform?.toUpperCase() || 'YOUTUBE'} variant="primary" className="mt-3" />
        </View>

        {/* Score — 큰 원형 점수 */}
        <Card variant="highlight" className="items-center p-8 mb-6">
          <View className="w-24 h-24 rounded-full border-4 items-center justify-center mb-3" style={{ borderColor: scoreColor(analysis.score) }}>
            <Text style={{ color: scoreColor(analysis.score) }} className="text-4xl font-bold">{analysis.score}</Text>
          </View>
          <Badge label={scoreLabel(analysis.score)} variant={scoreVariant(analysis.score)} />
          <Text className="text-brand-muted text-sm mt-3 text-center leading-6">{analysis.summary}</Text>
        </Card>

        {/* 영상별 조회수 그래프 (Plus 이상) */}
        {data.videos?.length > 0 && (
          <Section title="영상별 조회수" icon="📊" className="mb-4">
            <BarChart
              data={data.videos.slice(0, 5).map((v: any) => ({ label: v.title, value: v.views }))}
              maxItems={5}
            />
          </Section>
        )}

        {/* 강점 */}
        <Section title="강점" icon="💪" className="mb-4">
          {analysis.strengths?.length > 0 ? (
            <View className="gap-3">
              {analysis.strengths.map((s: string, i: number) => (
                <View key={i} className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-brand-success/20 rounded-full items-center justify-center mt-0.5">
                    <Text className="text-brand-success text-xs">✓</Text>
                  </View>
                  <Text className="text-brand-text text-sm flex-1 leading-6">{s}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-brand-muted text-sm">데이터 없음</Text>
          )}
        </Section>

        {/* 약점 */}
        <Section title="개선 필요" icon="⚠️" className="mb-4">
          {analysis.weaknesses?.length > 0 ? (
            <View className="gap-3">
              {analysis.weaknesses.map((w: string, i: number) => (
                <View key={i} className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-brand-warning/20 rounded-full items-center justify-center mt-0.5">
                    <Text className="text-brand-warning text-xs">!</Text>
                  </View>
                  <Text className="text-brand-text text-sm flex-1 leading-6">{w}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-brand-muted text-sm">데이터 없음</Text>
          )}
        </Section>

        {/* 개선 액션 — Free는 잠금 */}
        {analysis.actions === 'LOCKED' ? (
          <LockedSection title="개선 액션" icon="🎯" description="지금 바로 실행할 수 있는 구체적인 개선 방법 3가지" plan="Plus" />
        ) : (
          <Section title="지금 바로 할 수 있는 것" icon="🎯" className="mb-4">
            <View className="gap-3">
              {analysis.actions?.map((a: string, i: number) => (
                <Card key={i} variant="glass" className="p-4">
                  <View className="flex-row items-start gap-3">
                    <View className="w-7 h-7 bg-brand-primary rounded-lg items-center justify-center">
                      <Text className="text-white text-xs font-bold">{i + 1}</Text>
                    </View>
                    <Text className="text-brand-text text-sm flex-1 leading-6">{a}</Text>
                  </View>
                </Card>
              ))}
            </View>
          </Section>
        )}

        {/* 추천 콘텐츠 — Free는 잠금 */}
        {analysis.contentIdeas === 'LOCKED' ? (
          <LockedSection title="추천 콘텐츠" icon="💡" description="AI가 추천하는 다음 콘텐츠 주제 3가지" plan="Plus" />
        ) : (
          <Section title="추천 콘텐츠" icon="💡" className="mb-4">
            <View className="gap-3">
              {analysis.contentIdeas?.map((c: string, i: number) => (
                <View key={i} className="flex-row items-start gap-3">
                  <Text className="text-brand-primary-light text-sm">→</Text>
                  <Text className="text-brand-text text-sm flex-1 leading-6">{c}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* 벤치마킹 — Free/Plus 잠금 */}
        {analysis.benchmarks === 'LOCKED' ? (
          <LockedSection title="벤치마킹 채널" icon="📊" description="같은 카테고리에서 잘 되고 있는 실제 채널과 비교 분석" plan="Pro" />
        ) : analysis.benchmarks?.length > 0 ? (
          <Section title="참고 채널" icon="📊" className="mb-4">
            <View className="gap-3">
              {analysis.benchmarks.map((b: any, i: number) => (
                <Card key={i} variant="glass" className="p-4">
                  <Text className="text-brand-text font-bold text-sm">{b.name || b}</Text>
                  {b.reason && <Text className="text-brand-muted text-xs mt-1">{b.reason}</Text>}
                </Card>
              ))}
            </View>
          </Section>
        ) : null}

        {/* 업그레이드 CTA (Free 유저) */}
        {plan === 'free' && (
          <Card variant="highlight" className="p-6 mb-6 items-center">
            <Text className="text-2xl mb-2">🔓</Text>
            <Text className="text-brand-text font-bold text-base text-center mb-2">
              더 상세한 분석이 필요하신가요?
            </Text>
            <Text className="text-brand-muted text-sm text-center mb-4 leading-6">
              Plus 플랜으로 업그레이드하면{'\n'}개선 액션, 추천 콘텐츠, PDF 다운로드까지 이용 가능합니다.
            </Text>
            <Button title="플랜 업그레이드 →" onPress={() => navigate(ROUTES.pricing)} className="w-full" />
          </Card>
        )}

        {/* 하단 버튼 */}
        <View className="gap-3 mt-4">
          <Button title="다시 분석하기" onPress={() => navigate(ROUTES.analyze)} />
          <Button title="← 돌아가기" variant="ghost" onPress={goBack} />
        </View>
      </Container>
    </ScrollView>
  );
}

// ─── 잠금 섹션 컴포넌트 ───────────────────────────────────────────────────────

function LockedSection({ title, icon, description, plan }: { title: string; icon: string; description: string; plan: string }) {
  return (
    <View className="mb-4">
      <Card className="p-5 items-center">
        <Text className="text-brand-text text-base font-bold mb-1">{icon} {title}</Text>
        <View className="w-full bg-brand-surface-light rounded-xl p-4 mt-3 items-center">
          <Text className="text-2xl mb-2">🔒</Text>
          <Text className="text-brand-muted text-sm text-center leading-6 mb-3">{description}</Text>
          <Badge label={`${plan} 플랜에서 확인 가능`} variant="primary" />
          <Button title="업그레이드" size="sm" onPress={() => navigate(ROUTES.pricing)} className="mt-3" />
        </View>
      </Card>
    </View>
  );
}

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return '#34D399';
  if (score >= 40) return '#FBBF24';
  return '#F87171';
}

function scoreLabel(score: number): string {
  if (score >= 80) return '우수';
  if (score >= 60) return '양호';
  if (score >= 40) return '보통';
  return '개선 필요';
}

function scoreVariant(score: number): 'success' | 'warning' | 'error' {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'error';
}
