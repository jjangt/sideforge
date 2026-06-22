import '../global.css';
import '../src/i18n';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastRenderer, ModalRenderer, Header } from '../src/components/ui';
import { useAuthStore } from '../src/stores/useAuthStore';
import { navigate } from '../src/lib';

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);
  const adminVerified = useAuthStore((s) => s.adminVerified);
  const pathname = usePathname();

  /**
   * 관리자 2FA 가드
   * admin 계정이 2FA 미완료 상태면 admin-verify 외 모든 페이지 차단
   */
  useEffect(() => {
    if (user?.plan === 'admin' && !adminVerified && pathname !== '/admin-verify' && pathname !== '/auth') {
      navigate('/admin-verify', { replace: true });
    }
  }, [user, adminVerified, pathname]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0A1F' }}>
      <StatusBar style="light" />
      <Header />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F0A1F' },
          animation: 'slide_from_right',
        }}
      />
      <ToastRenderer />
      <ModalRenderer />
    </View>
  );
}
