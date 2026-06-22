import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../src/stores/useAuthStore';
import { api } from '../src/services/api';
import { Container, Card, Section, Badge, Button, Loading } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';
import { toKSTDisplay } from '../src/utils/time';

export default function AdminScreen() {
  const user = useAuthStore((s) => s.user);
  const setSimulatePlan = useAuthStore((s) => s.setSimulatePlan);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatePlan, setLocalPlan] = useState<string>('admin');

  useEffect(() => {
    if (user && user.plan !== 'admin') {
      navigate(ROUTES.landing, { replace: true });
      return;
    }
    if (user?.plan === 'admin') {
      checkAdminSession();
    }
  }, [user]);

  /**
   * 관리자 2FA 세션 확인
   * AsyncStorage에 세션이 있으면 바로 통과 (새로고침 대응)
   */
  async function checkAdminSession() {
    const session = await AsyncStorage.getItem('admin_session');
    if (!session) {
      navigate('/admin-verify', { replace: true });
      return;
    }
    // 세션 있으면 adminVerified 복원
    const { useAuthStore } = await import('../src/stores/useAuthStore');
    useAuthStore.getState().setAdminVerified(true);
    loadAdminData();
  }

  async function loadAdminData() {
    try {
      const [statsData, usersData] = await Promise.all([
        api.adminStats(),
        api.adminUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading message="관리자 데이터 로딩..." />;
  if (user?.plan !== 'admin') return null;

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        <Text className="text-brand-text text-2xl font-bold mb-2">관리자 대시보드</Text>
        <Text className="text-brand-muted text-sm mb-8">서비스 현황을 한눈에 확인하세요.</Text>

        {/* 플랜 시뮬레이션 */}
        <Section title="플랜 시뮬레이션" icon="🔍" className="mb-6">
          <Text className="text-brand-muted text-xs mb-3">
            라이선스별 사용자 화면을 테스트할 수 있습니다. 선택 후 분석하면 해당 플랜으로 결과가 보입니다.
          </Text>
          <View className="flex-row gap-2">
            {['admin', 'free', 'plus', 'pro'].map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  setLocalPlan(p);
                  setSimulatePlan(p === 'admin' ? null : p);
                }}
                className={`flex-1 py-2 rounded-xl items-center border ${simulatePlan === p ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border'}`}
              >
                <Text className={`text-xs font-bold ${simulatePlan === p ? 'text-brand-primary' : 'text-brand-muted'}`}>
                  {p.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
          {simulatePlan !== 'admin' && (
            <View className="mt-3 bg-brand-warning/10 p-3 rounded-xl">
              <Text className="text-brand-warning text-xs">
                ⚠️ 현재 "{simulatePlan.toUpperCase()}" 모드로 시뮬레이션 중. 분석 시 해당 플랜의 제한된 결과가 보입니다.
              </Text>
            </View>
          )}
        </Section>

        {/* 통계 카드 */}
        {stats && (
          <View className="flex-row gap-3 mb-6">
            <StatCard label="오늘 분석" value={`${stats.todayReports}건`} />
            <StatCard label="전체 사용자" value={`${stats.totalUsers}명`} />
            <StatCard label="전체 리포트" value={`${stats.totalReports}건`} />
          </View>
        )}

        {/* AI 사용량 */}
        {stats && (
          <Section title="AI 사용량 (일일)" icon="🤖" className="mb-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-brand-muted text-sm">오늘 사용</Text>
              <Text className="text-brand-text text-sm font-bold">{stats.todayReports} / 280 건</Text>
            </View>
            <View className="h-2 bg-brand-surface-light rounded-full mt-2 overflow-hidden">
              <View className="h-full bg-brand-primary rounded-full" style={{ width: `${Math.min(100, (stats.todayReports / 280) * 100)}%` }} />
            </View>
            <Text className="text-brand-muted text-xs mt-1">무료 티어 한도: 일일 280건</Text>
          </Section>
        )}

        {/* 사용자 목록 */}
        <Section title="사용자 목록" icon="👥" className="mb-4">
          {users.length === 0 ? (
            <Text className="text-brand-muted text-sm">사용자 없음</Text>
          ) : (
            <View className="gap-2">
              {users.map((u: any) => (
                <View key={u.id} className="flex-row items-center justify-between py-2 border-b border-brand-border/30">
                  <View className="flex-1">
                    <Text className="text-brand-text text-sm">{u.email}</Text>
                    <Text className="text-brand-muted text-xs">{u.name || '-'} · 분석 {u.analysis_count}회</Text>
                  </View>
                  <Badge label={u.plan.toUpperCase()} variant={u.plan === 'admin' ? 'primary' : u.plan === 'free' ? 'muted' : 'success'} />
                </View>
              ))}
            </View>
          )}
        </Section>
      </Container>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex-1 items-center p-4">
      <Text className="text-brand-text text-lg font-bold">{value}</Text>
      <Text className="text-brand-muted text-xs mt-1">{label}</Text>
    </Card>
  );
}
