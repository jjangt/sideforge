import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAuthStore } from '../src/stores/useAuthStore';
import { api } from '../src/services/api';
import { Container, Card, Badge, Button, Section } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';
import { toKSTDisplay } from '../src/utils/time';

export default function MyPageScreen() {
  const { user, logout } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);

  /**
   * 로그인 상태 확인 — 렌더링 중 navigate 호출 방지를 위해 useEffect 사용
   */
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.auth, { replace: true });
    }
  }, [user]);

  useEffect(() => {
    if (user) loadReports();
  }, [user]);

  async function loadReports() {
    try {
      const data = await api.getMyReports();
      setReports(data.reports || []);
    } catch {}
  }

  if (!user) return null;

  const remaining = user.plan === 'pro' || user.plan === 'admin'
    ? '무제한'
    : `${Math.max(0, (user.plan === 'plus' ? 30 : 3) - user.analysisCount)}회`;

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        {/* 프로필 */}
        <Section title="내 정보" icon="👤" className="mb-4">
          <View className="gap-3">
            <InfoRow label="이메일" value={user.email} />
            <InfoRow label="이름" value={user.name || '-'} />
            <InfoRow label="플랜" value={user.plan.toUpperCase()} />
            <InfoRow label="남은 분석 횟수" value={remaining} />
            <InfoRow label="사용한 분석" value={`${user.analysisCount}회`} />
          </View>
        </Section>

        {/* 플랜 업그레이드 */}
        {user.plan === 'free' && (
          <Card variant="highlight" className="mb-4 p-5 items-center">
            <Text className="text-brand-text font-bold text-sm mb-2">더 많은 분석이 필요하신가요?</Text>
            <Text className="text-brand-muted text-xs mb-3">Plus 플랜으로 월 30회 + 상세 리포트</Text>
            <Button title="업그레이드" size="sm" onPress={() => navigate(ROUTES.pricing)} />
          </Card>
        )}

        {/* 분석 히스토리 */}
        <Section title="분석 히스토리" icon="📋" className="mb-4">
          {reports.length === 0 ? (
            <View className="items-center py-6">
              <Text className="text-brand-muted text-sm">아직 분석 내역이 없습니다</Text>
              <Button title="첫 분석 시작하기" size="sm" variant="outline" onPress={() => navigate(ROUTES.analyze)} className="mt-3" />
            </View>
          ) : (
            <View className="gap-2">
              {reports.map((r) => (
                <Pressable key={r.id} onPress={() => navigate(ROUTES.report(r.id))} className="flex-row items-center justify-between py-3 border-b border-brand-border/30">
                  <View className="flex-1">
                    <Text className="text-brand-text text-sm font-bold">{r.channel_name}</Text>
                    <Text className="text-brand-muted text-xs mt-0.5">{r.platform} · {toKSTDisplay(r.created_at)}</Text>
                  </View>
                  <Text className="text-brand-primary-light text-xs">보기 →</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Section>

        {/* 문의하기 */}
        <Section title="문의하기" icon="💬" className="mb-4">
          <Text className="text-brand-muted text-sm mb-3">결제, 분석 오류, 기능 제안 등 무엇이든 문의해주세요.</Text>
          <Button title="문의 작성하기" size="sm" variant="outline" onPress={() => navigate('/contact')} />
        </Section>

        {/* 로그아웃 */}
        <Button
          title="로그아웃"
          variant="ghost"
          onPress={async () => { await logout(); navigate(ROUTES.landing, { replace: true }); }}
          className="mt-6"
        />
      </Container>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-brand-border/30">
      <Text className="text-brand-muted text-sm">{label}</Text>
      <Text className="text-brand-text text-sm font-bold">{value}</Text>
    </View>
  );
}
