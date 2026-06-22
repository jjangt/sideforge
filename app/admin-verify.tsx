/**
 * 관리자 2차 인증 페이지
 * 
 * 흐름:
 * 1. 관리자 로그인 후 /admin 접근 시 이 페이지로 이동
 * 2. 최초: TOTP 시크릿 표시 → Authenticator에 등록
 * 3. 이후: 6자리 코드 입력 → 검증 → 관리자 페이지 접근
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useAuthStore } from '../src/stores/useAuthStore';
import { api } from '../src/services/api';
import { Container, Card, Button, Input, Badge, Loading } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';
import { toast } from '../src/lib';

export default function AdminVerifyScreen() {
  const user = useAuthStore((s) => s.user);
  const setAdminVerified = useAuthStore((s) => s.setAdminVerified);
  const [step, setStep] = useState<'loading' | 'setup' | 'verify'>('loading');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  /** 비관리자 접근 차단 */
  useEffect(() => {
    if (!user || user.plan !== 'admin') {
      navigate(ROUTES.landing, { replace: true });
      return;
    }
    checkTOTPStatus();
  }, [user]);

  /**
   * TOTP 상태 확인
   * - 시크릿 없으면 → setup (최초 등록)
   * - 시크릿 있으면 → verify (코드 입력)
   */
  async function checkTOTPStatus() {
    try {
      // 빈 코드로 호출 — 시크릿 없으면 needSetup 반환, 있으면 400 (code required)
      const result = await api.adminVerifyTOTP('');
      if (result.needSetup) {
        setSecret(result.secret || '');
        setStep('setup');
      } else {
        // 성공했다면 이미 인증됨
        setStep('verify');
      }
    } catch (e: any) {
      // 400 = code required (시크릿 이미 등록됨, 코드 입력 필요)
      setStep('verify');
    }
  }

  /**
   * TOTP 코드 검증 → 성공 시 관리자 페이지로 이동
   */
  async function handleVerify() {
    if (code.length !== 6) {
      toast({ message: '6자리 코드를 입력하세요', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const result = await api.adminVerifyTOTP(code);
      if (result.success) {
        await api.setAdminSession(result.adminSession || '');
        setAdminVerified(true);
        toast({ message: '관리자 인증 완료', type: 'success' });
        navigate(ROUTES.admin, { replace: true });
      }
    } catch (e: any) {
      toast({ message: e.message || '인증 실패', type: 'error' });
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  if (!user || user.plan !== 'admin') return null;
  if (step === 'loading') return <Loading message="인증 상태 확인 중..." />;

  /** 최초 설정 화면 — 시크릿을 Authenticator에 등록 */
  if (step === 'setup') {
    return (
      <ScrollView className="flex-1 bg-brand-background">
        <Container className="py-12 items-center">
          <Text className="text-3xl mb-4">🔐</Text>
          <Text className="text-brand-text text-xl font-bold text-center mb-2">관리자 2차 인증 설정</Text>
          <Text className="text-brand-muted text-sm text-center mb-8">
            Google Authenticator에 아래 키를 등록하세요
          </Text>

          {/* QR코드 + 시크릿 키 표시 */}
          <Card variant="highlight" className="w-full p-6 mb-6 items-center">
            <Text className="text-brand-muted text-xs mb-3">Authenticator 앱에서 QR 스캔</Text>
            <Image
              source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`otpauth://totp/SideForge:${user.email}?secret=${secret}&issuer=SideForge`)}` }}
              style={{ width: 200, height: 200 }}
              className="mb-4"
            />
            <Text className="text-brand-muted text-xs mb-1">또는 직접 입력:</Text>
            <Text className="text-brand-text text-sm font-bold text-center tracking-wider" selectable>
              {secret}
            </Text>
          </Card>

          {/* 등록 방법 안내 */}
          <Card className="w-full p-5 mb-8">
            <Text className="text-brand-text text-sm font-bold mb-3">등록 방법</Text>
            <View className="gap-2">
              <Text className="text-brand-muted text-sm">1. Google Authenticator 앱 열기</Text>
              <Text className="text-brand-muted text-sm">2. + 버튼 → "설정 키 입력"</Text>
              <Text className="text-brand-muted text-sm">3. 계정: SideForge Admin</Text>
              <Text className="text-brand-muted text-sm">4. 키: 위의 시크릿 키 붙여넣기</Text>
              <Text className="text-brand-muted text-sm">5. 시간 기반 선택 → 추가</Text>
            </View>
          </Card>

          {/* 등록 후 코드 입력 */}
          <Text className="text-brand-text text-sm font-bold mb-3">등록 후 생성된 6자리 코드 입력</Text>
          <Input
            placeholder="000000"
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            className="w-full mb-4"
            onSubmitEditing={handleVerify}
            returnKeyType="done"
          />
          <Button title="인증 완료" onPress={handleVerify} loading={loading} className="w-full" />
        </Container>
      </ScrollView>
    );
  }

  /** 코드 입력 화면 (이미 등록된 경우) */
  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12 items-center">
        <Text className="text-3xl mb-4">🔐</Text>
        <Text className="text-brand-text text-xl font-bold text-center mb-2">관리자 2차 인증</Text>
        <Text className="text-brand-muted text-sm text-center mb-8">
          Google Authenticator의 6자리 코드를 입력하세요
        </Text>

        <Input
          placeholder="000000"
          value={code}
          onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          className="w-full mb-6"
          onSubmitEditing={handleVerify}
          returnKeyType="done"
        />

        <Button title="인증" onPress={handleVerify} loading={loading} className="w-full" />

        <Text className="text-brand-muted text-xs mt-6 text-center">
          코드는 30초마다 갱신됩니다
        </Text>
      </Container>
    </ScrollView>
  );
}
