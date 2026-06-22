import '../global.css';
import '../src/i18n';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastRenderer, ModalRenderer, Header } from '../src/components/ui';

export default function RootLayout() {
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
