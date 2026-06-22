import '../global.css';
import '../src/i18n';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastRenderer, ModalRenderer, Header, GlobalLoadingBar } from '../src/components/ui';
import { useAuthStore } from '../src/stores/useAuthStore';
import { navigate } from '../src/lib';

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);
  const adminVerified = useAuthStore((s) => s.adminVerified);
  const setAdminVerified = useAuthStore((s) => s.setAdminVerified);
  const [sessionChecked, setSessionChecked] = useState(false);
  const pathname = usePathname();

  /**
   * 앱 로드 시 admin_session 복원
   * AsyncStorage 확인 완료 후에만 가드 동작
   */
  useEffect(() => {
    if (user?.plan === 'admin') {
      AsyncStorage.getItem('admin_session').then((session) => {
        if (session) setAdminVerified(true);
        setSessionChecked(true);
      });
    } else {
      setSessionChecked(true);
    }
  }, [user]);

  /**
   * 관리자 2FA 가드
   * sessionChecked가 true인 후에만 동작 (비동기 복원 대기)
   */
  useEffect(() => {
    if (!sessionChecked) return;
    if (user?.plan === 'admin' && !adminVerified && pathname !== '/admin-verify' && pathname !== '/auth') {
      navigate('/admin-verify', { replace: true });
    }
  }, [user, adminVerified, pathname, sessionChecked]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0A1F' }}>
      <StatusBar style="light" />
      <Header />
      <GlobalLoadingBar />
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
