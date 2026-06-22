import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../src/stores/useAuthStore';
import { Container, Button, Input } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';
import { toast } from '../src/lib';

export default function AuthScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuthStore();

  async function handleSubmit() {
    if (!email || !password) {
      toast({ message: '이메일과 비밀번호를 입력하세요', type: 'warning' });
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

  return (
    <KeyboardAvoidingView className="flex-1 bg-brand-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Container className="py-12">
          <Text className="text-brand-text text-3xl font-bold text-center mb-2">SideForge</Text>
          <Text className="text-brand-muted text-sm text-center mb-10">
            {mode === 'login' ? '로그인하고 분석 시작하기' : '계정 만들고 분석 시작하기'}
          </Text>

          {mode === 'signup' && (
            <Input label="이름" placeholder="홍길동" value={name} onChangeText={setName} className="mb-4" />
          )}

          <Input label="이메일" placeholder="email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" className="mb-4" />

          <Input label="비밀번호" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry className="mb-8" />

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
