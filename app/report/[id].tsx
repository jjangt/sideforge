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
          {analysis.category && (
            <Badge label={typeof analysis.category === 'string' ? analysis.category : ''} variant="muted" className="mt-2" />
          )}
          <Text className="text-brand-muted text-sm mt-3 text-center leading-6">{typeof analysis.summary === 'string' ? analysis.summary : ''}</Text>
        </Card>

        {/* 영상별 조회수 그래프 (Plus 이상) */}
        {data.videos?.length > 0 && (
          <Section title="최근 영상 성과" icon="📊" className="mb-4">
            <View className="gap-3">
              {data.videos.slice(0, 3).map((v: any, i: number) => (
                <Card key={i} variant="glass" className="p-4">
                  <Text
                    className="text-brand-primary-light text-sm font-bold mb-2"
                    onPress={() => (window as any).open?.(`https://youtube.com/watch?v=${v.id}`, '_blank')}
                  >
                    {v.title} ↗
                  </Text>
                  <View className="flex-row gap-4">
                    <View>
                      <Text className="text-brand-muted text-xs">조회수</Text>
                      <Text className="text-brand-text text-sm font-bold">{v.views?.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text className="text-brand-muted text-xs">좋아요</Text>
                      <Text className="text-brand-text text-sm font-bold">{v.likes?.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text className="text-brand-muted text-xs">댓글</Text>
                      <Text className="text-brand-text text-sm font-bold">{v.comments?.toLocaleString()}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </Section>
        )}

        {/* 강점 */}
        <Section title="강점" icon="💪" className="mb-4">
          {analysis.strengths?.length > 0 ? (
            <View className="gap-3">
              {analysis.strengths.map((s: any, i: number) => (
                <View key={i} className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-brand-success/20 rounded-full items-center justify-center mt-0.5">
                    <Text className="text-brand-success text-xs">✓</Text>
                  </View>
                  <Text className="text-brand-text text-sm flex-1 leading-6">{typeof s === 'string' ? s : JSON.stringify(s)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-brand-muted text-sm">데이터 없음</Text>
          )}
        </Section>

        {/* 단점 */}
        <Section title="단점" icon="⚠️" className="mb-4">
          {analysis.weaknesses?.length > 0 ? (
            <View className="gap-3">
              {analysis.weaknesses.map((w: any, i: number) => (
                <View key={i} className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-brand-warning/20 rounded-full items-center justify-center mt-0.5">
                    <Text className="text-brand-warning text-xs">!</Text>
                  </View>
                  <Text className="text-brand-text text-sm flex-1 leading-6">{typeof w === 'string' ? w : JSON.stringify(w)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-brand-muted text-sm">데이터 없음</Text>
          )}
        </Section>

        {/* 개선 액션 — Free는 1개 미리보기 + 모자이크 */}
        {analysis.actions === 'LOCKED' ? (
          <LockedSection title="개선 액션" icon="🎯" description="구체적인 개선 방법을 확인하세요" plan="Plus" />
        ) : (
          <Section title="개선 액션" icon="🎯" className="mb-4"
            {...(analysis.actionsLocked ? { badge: 'Plus 플랜 이상' } : {})}
          >
            <View className="gap-3">
              {analysis.actions?.filter((a: any) => typeof a === 'string' && !a.includes('[') && a.trim()).map((a: any, i: number) => (
                <Card key={i} variant="glass" className="p-4">
                  <View className="flex-row items-start gap-3">
                    <View className="w-7 h-7 bg-brand-primary rounded-lg items-center justify-center">
                      <Text className="text-white text-xs font-bold">{i + 1}</Text>
                    </View>
                    <Text className="text-brand-text text-sm flex-1 leading-6">{typeof a === 'string' ? a : JSON.stringify(a)}</Text>
                  </View>
                </Card>
              ))}
              {analysis.actionsLocked && (
                <View className="rounded-xl overflow-hidden">
                  <View className="bg-brand-surface-light p-4 rounded-xl" style={{ opacity: 0.4 }}>
                    <View className="flex-row items-start gap-3">
                      <View className="w-7 h-7 bg-brand-muted/30 rounded-lg" />
                      <View className="flex-1 gap-2">
                        <View className="h-3 bg-brand-muted/20 rounded w-full" />
                        <View className="h-3 bg-brand-muted/20 rounded w-3/4" />
                      </View>
                    </View>
                  </View>
                  <View className="items-center py-3">
                    <Button title="전체 확인하기" size="sm" onPress={() => navigate(ROUTES.pricing)} />
                  </View>
                </View>
              )}
            </View>
          </Section>
        )}

        {/* 추천 콘텐츠 — Free는 1개 미리보기 + 모자이크 */}
        {analysis.contentIdeas === 'LOCKED' ? (
          <LockedSection title="추천 콘텐츠" icon="💡" description="AI가 추천하는 콘텐츠 주제를 확인하세요" plan="Plus" />
        ) : (
          <Section title="추천 콘텐츠" icon="💡" className="mb-4"
            {...(analysis.contentIdeasLocked ? { badge: 'Plus 플랜 이상' } : {})}
          >
            <View className="gap-3">
              {analysis.contentIdeas?.filter((c: any) => typeof c === 'string' && !c.includes('[') && c.trim()).map((c: any, i: number) => (
                <View key={i} className="flex-row items-start gap-3">
                  <Text className="text-brand-primary-light text-sm">→</Text>
                  <Text className="text-brand-text text-sm flex-1 leading-6">{typeof c === 'string' ? c : JSON.stringify(c)}</Text>
                </View>
              ))}
              {analysis.contentIdeasLocked && (
                <View className="rounded-xl overflow-hidden">
                  <View className="bg-brand-surface-light p-4 rounded-xl" style={{ opacity: 0.4 }}>
                    <View className="gap-2">
                      <View className="h-3 bg-brand-muted/20 rounded w-full" />
                      <View className="h-3 bg-brand-muted/20 rounded w-4/5" />
                    </View>
                  </View>
                  <View className="items-center py-3">
                    <Button title="전체 확인하기" size="sm" onPress={() => navigate(ROUTES.pricing)} />
                  </View>
                </View>
              )}
            </View>
          </Section>
        )}

        {/* 벤치마킹 — Free/Plus 잠금 */}
        {analysis.benchmarks === 'LOCKED' ? (
          <Section title="벤치마킹 채널" icon="📊" badge="Pro 플랜" className="mb-4">
            <View className="rounded-xl overflow-hidden">
              <View className="bg-brand-surface-light p-4 rounded-xl" style={{ opacity: 0.4 }}>
                <View className="gap-3">
                  <View className="h-4 bg-brand-muted/20 rounded w-2/3" />
                  <View className="h-3 bg-brand-muted/20 rounded w-full" />
                  <View className="h-3 bg-brand-muted/20 rounded w-4/5" />
                </View>
              </View>
              <View className="items-center py-3">
                <Text className="text-brand-muted text-xs mb-2">경쟁 채널 비교 분석을 확인하세요</Text>
                <Button title="Pro 플랜 알아보기" size="sm" onPress={() => navigate(ROUTES.pricing)} />
              </View>
            </View>
          </Section>
        ) : analysis.benchmarks?.length > 0 && analysis.benchmarks.some((b: any) => b?.name) ? (
          <Section title="벤치마킹 채널" icon="📊" className="mb-4">
            <View className="gap-3">
              {analysis.benchmarks.filter((b: any) => b?.name).map((b: any, i: number) => (
                <Card key={i} variant="glass" className="p-4">
                  <Text
                    className="text-brand-primary-light font-bold text-sm mb-2"
                    onPress={() => b.url && (window as any).open?.(`https://${b.url}`, '_blank')}
                  >
                    {typeof b === 'string' ? b : (b.name || 'Channel')} ↗
                  </Text>
                  {b.reason && <Text className="text-brand-muted text-sm leading-6">{typeof b.reason === 'string' ? b.reason : JSON.stringify(b.reason)}</Text>}
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
