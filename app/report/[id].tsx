import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { Container, Card, Section, Badge, Button, Loading } from '../../src/components/ui';
import { goBack } from '../../src/lib';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadReport(id);
  }, [id]);

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

  const { data } = report;
  const { channel, analysis } = data;

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-brand-text text-2xl font-bold">{channel.title}</Text>
          <Text className="text-brand-muted text-sm mt-1">
            구독자 {channel.subscribers.toLocaleString()}명 · 영상 {channel.videoCount}개
          </Text>
          <View className="mt-4">
            <ScoreBadge score={analysis.score} />
          </View>
        </View>

        {/* Summary */}
        <Card variant="highlight" className="mb-4">
          <Text className="text-brand-text text-sm leading-6">{analysis.summary}</Text>
        </Card>

        <View className="gap-4">
          {/* Strengths */}
          <Section title="강점" icon="💪">
            <View className="gap-2">
              {analysis.strengths.map((s: string, i: number) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Text className="text-brand-success">•</Text>
                  <Text className="text-brand-text text-sm flex-1">{s}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Weaknesses */}
          <Section title="개선 필요" icon="⚠️">
            <View className="gap-2">
              {analysis.weaknesses.map((w: string, i: number) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Text className="text-brand-warning">•</Text>
                  <Text className="text-brand-text text-sm flex-1">{w}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Actions */}
          <Section title="지금 바로 할 수 있는 것" icon="🎯">
            <View className="gap-3">
              {analysis.actions.map((a: string, i: number) => (
                <Card key={i} variant="glass" className="p-3">
                  <Text className="text-brand-text text-sm">{i + 1}. {a}</Text>
                </Card>
              ))}
            </View>
          </Section>

          {/* Content Ideas */}
          <Section title="추천 콘텐츠" icon="💡">
            <View className="gap-2">
              {analysis.contentIdeas.map((c: string, i: number) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Text className="text-brand-primary-light">→</Text>
                  <Text className="text-brand-text text-sm flex-1">{c}</Text>
                </View>
              ))}
            </View>
          </Section>
        </View>

        {/* Back */}
        <Button title="← 다시 분석하기" variant="outline" onPress={goBack} className="mt-10" />
      </Container>
    </ScrollView>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 70 ? 'success' : score >= 40 ? 'warning' : 'error';
  const label = score >= 70 ? '우수' : score >= 40 ? '보통' : '개선 필요';
  return (
    <View className="items-center">
      <Text className={`text-4xl font-bold ${score >= 70 ? 'text-brand-success' : score >= 40 ? 'text-brand-warning' : 'text-brand-error'}`}>
        {score}
      </Text>
      <Badge label={label} variant={variant} className="mt-1" />
    </View>
  );
}
