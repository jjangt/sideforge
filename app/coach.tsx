import { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useBrandStore } from '../src/stores/useBrandStore';
import { useDashboardStore } from '../src/stores/useDashboardStore';
import { useCoachStore } from '../src/stores/useCoachStore';
import { useAI } from '../src/hooks/useAI';
import { generateId } from '../src/utils/id';
import { CoachMessage } from '../src/types/coach';

export default function CoachScreen() {
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
      <View className="px-6 pt-12 pb-4 border-b border-brand-surface">
        <Text className="text-brand-text text-xl font-bold">🤖 AI 공동창업자</Text>
        <Text className="text-brand-muted text-xs mt-1">브랜드 성장을 함께 고민합니다</Text>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.length === 0 && (
          <View className="items-center py-8">
            <Text className="text-brand-muted text-sm text-center mb-6">
              무엇이든 물어보세요!{'\n'}브랜드 성장을 함께 고민하는 AI 파트너입니다.
            </Text>
            <View className="gap-2 w-full">
              {suggestedQuestions.map((q, i) => (
                <Pressable key={i} onPress={() => handleSend(q)} className="bg-brand-surface p-3 rounded-xl active:opacity-80">
                  <Text className="text-brand-text text-sm">{q}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg) => (
          <View key={msg.id} className={`mb-4 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
            <View className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary' : 'bg-brand-surface'}`}>
              <Text className={`text-sm leading-6 ${msg.role === 'user' ? 'text-white' : 'text-brand-text'}`}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View className="self-start bg-brand-surface p-4 rounded-2xl">
            <Text className="text-brand-muted text-sm">생각하고 있어요...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="px-4 py-3 border-t border-brand-surface flex-row gap-2">
        <TextInput
          className="flex-1 bg-brand-surface text-brand-text p-3 rounded-xl text-sm"
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#8892B0"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
        />
        <Pressable onPress={() => handleSend()} className="bg-brand-primary px-4 rounded-xl items-center justify-center active:opacity-80">
          <Text className="text-white font-bold">→</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
