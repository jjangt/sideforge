import { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBrandStore } from '../src/stores/useBrandStore';
import { useDashboardStore } from '../src/stores/useDashboardStore';
import { useCoachStore } from '../src/stores/useCoachStore';
import { useAI } from '../src/hooks/useAI';
import { generateId } from '../src/utils/id';
import { CoachMessage } from '../src/types/coach';
import { Container, Card } from '../src/components/ui';

export default function CoachScreen() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const brand = useBrandStore((s) => s.brand);
  const dashboard = useDashboardStore((s) => s.dashboard);
  const { messages, suggestedQuestions, isLoading, addMessage, setLoading } = useCoachStore();
  const { provider } = useAI();

  async function handleSend(text?: string) {
    const msg = text || input.trim();
    if (!msg || !brand || !dashboard) return;

    const userMessage: CoachMessage = {
      id: generateId(),
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setInput('');
    setLoading(true);

    const response = await provider.getCoachResponse(
      { brand, dashboard, recentMessages: messages.slice(-5), currentDay: dashboard.planProgress.completedDays + 1 },
      msg
    );
    addMessage(response);
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-brand-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View className="px-6 pt-12 pb-4 border-b border-brand-border">
        <Container className="px-0">
          <Text className="text-brand-text text-xl font-bold">🤖 {t('coach.title')}</Text>
          <Text className="text-brand-muted text-xs mt-1">{t('coach.subtitle')}</Text>
        </Container>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.length === 0 && (
          <View className="items-center py-8">
            <Text className="text-brand-muted text-sm text-center mb-6">{t('coach.empty')}</Text>
            <View className="gap-2 w-full max-w-md">
              {suggestedQuestions.map((q, i) => (
                <Card key={i} onPress={() => handleSend(q)} variant="glass" className="p-3">
                  <Text className="text-brand-text text-sm">{q}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg) => (
          <View key={msg.id} className={`mb-4 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
            <View className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary' : 'bg-brand-surface border border-brand-border'}`}>
              <Text className={`text-sm leading-6 ${msg.role === 'user' ? 'text-white' : 'text-brand-text'}`}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View className="self-start bg-brand-surface border border-brand-border p-4 rounded-2xl">
            <Text className="text-brand-muted text-sm">{t('coach.thinking')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="px-4 py-3 border-t border-brand-border flex-row gap-2">
        <TextInput
          className="flex-1 bg-brand-surface border border-brand-border text-brand-text p-3 rounded-xl text-sm"
          placeholder={t('coach.placeholder')}
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
        />
        <Pressable onPress={() => handleSend()} className="bg-brand-primary px-5 rounded-xl items-center justify-center active:opacity-80">
          <Text className="text-white font-bold text-lg">→</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
