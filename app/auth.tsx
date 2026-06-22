import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useAuthStore } from '../src/stores/useAuthStore';
import { Container, Button, Input, Card } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';
import { toast } from '../src/lib';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuthStore();

  async function handleSubmit() {
    if (!email || !password) {
      toast({ message: '이메일과 비밀번호를 입력하세요', type: 'warning' });
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      toast({ message: '비밀번호는 8자 이상이어야 합니다', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate(ROUTES.analyze, { replace: true });
    } catch (e: any) {
      toast({ message: e.message || '오류가 발생했습니다', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(ROUTES.analyze, { replace: true });
    } catch (e: any) {
      toast({ message: e.message || 'Google 로그인 실패', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-brand-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Container className="py-12">
          <Text className="text-brand-text text-3xl font-bold text-center mb-2">SideForge</Text>
          <Text className="text-brand-muted text-sm text-center mb-10">
            {mode === 'login' ? '로그인하고 분석 시작하기' : '계정 만들고 분석 시작하기'}
          </Text>

          {/* Google Login */}
          <Pressable
            onPress={handleGoogleLogin}
            className="bg-white flex-row items-center justify-center gap-3 px-6 py-4 rounded-2xl mb-6 active:opacity-80"
          >
            <Text className="text-lg">G</Text>
            <Text className="text-gray-800 font-bold text-base">Google로 계속하기</Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-brand-border" />
            <Text className="text-brand-muted text-xs mx-4">또는</Text>
            <View className="flex-1 h-px bg-brand-border" />
          </View>

          {/* Email Form */}
          {mode === 'signup' && (
            <Input label="이름" placeholder="홍길동" value={name} onChangeText={setName} className="mb-4" />
          )}

          <Input
            label="이메일"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="mb-4"
          />

          <Input
            label="비밀번호"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            hint={mode === 'signup' ? '8자 이상 입력' : undefined}
            className="mb-8"
          />

          <Button title={mode === 'login' ? '로그인' : '회원가입'} onPress={handleSubmit} loading={loading} className="mb-4" />

          <Button
            title={mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            variant="ghost"
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
