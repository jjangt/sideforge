import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useProfileStore } from '../src/stores/useProfileStore';
import { generateId } from '../src/utils/id';

const STEPS = [
  { key: 'interests', label: '관심사', placeholder: '디저트, 카페, 여행, AI, 운동...', multi: true },
  { key: 'likes', label: '좋아하는 것', placeholder: '사진 찍기, 글쓰기, 요리, 음악...', multi: true },
  { key: 'skills', label: '잘하는 것', placeholder: '정보 정리, 디자인, SNS, 소통...', multi: true },
  { key: 'personality', label: '성격', placeholder: '꼼꼼하고 계획적인 편 / 자유롭고 창의적인 편...' },
  { key: 'goals', label: '목표', placeholder: '부수입 만들기, 퇴사 준비, 취미를 브랜드로...' },
  { key: 'preferredMood', label: '원하는 브랜드 분위기', placeholder: '따뜻하고 감성적인 / 전문적이고 신뢰감 있는...' },
  { key: 'targetRevenue', label: '목표 월 수익', placeholder: '50만원, 100만원, 300만원...' },
  { key: 'weeklyHours', label: '주당 투입 가능 시간', placeholder: '5시간, 10시간, 20시간...' },
] as const;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const setProfile = useProfileStore((s) => s.setProfile);

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      const now = new Date().toISOString();
      const profile = {
        id: generateId(),
        interests: (answers.interests || '').split(',').map((s) => s.trim()).filter(Boolean),
        likes: (answers.likes || '').split(',').map((s) => s.trim()).filter(Boolean),
        skills: (answers.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
        personality: answers.personality || '',
        goals: answers.goals || '',
        preferredMood: answers.preferredMood || '',
        targetRevenue: answers.targetRevenue || '',
        weeklyHours: parseInt(answers.weeklyHours) || 10,
        createdAt: now,
        updatedAt: now,
      };
      setProfile(profile);
      router.push('/recommendations');
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-brand-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-12">
          {/* Progress */}
          <View className="mb-8">
            <View className="flex-row justify-between mb-2">
              <Text className="text-brand-muted text-sm">{step + 1} / {STEPS.length}</Text>
              <Text className="text-brand-muted text-sm">{Math.round(progress)}%</Text>
            </View>
            <View className="h-2 bg-brand-surface rounded-full overflow-hidden">
              <View className="h-full bg-brand-primary rounded-full" style={{ width: `${progress}%` }} />
            </View>
          </View>

          {/* Question */}
          <Text className="text-brand-text text-2xl font-bold mb-2">{current.label}</Text>
          <Text className="text-brand-muted text-sm mb-6">
            {current.multi ? '쉼표(,)로 구분해서 여러 개 입력해주세요' : '자유롭게 작성해주세요'}
          </Text>

          {/* Input */}
          <TextInput
            className="bg-brand-surface text-brand-text p-4 rounded-xl text-base min-h-[100px]"
            placeholder={current.placeholder}
            placeholderTextColor="#8892B0"
            multiline
            value={answers[current.key] || ''}
            onChangeText={(text) => setAnswers({ ...answers, [current.key]: text })}
            textAlignVertical="top"
          />

          {/* Buttons */}
          <View className="flex-row gap-3 mt-8">
            {step > 0 && (
              <Pressable onPress={() => setStep(step - 1)} className="flex-1 border border-brand-primary px-6 py-4 rounded-xl active:opacity-80">
                <Text className="text-brand-primary text-center font-bold">이전</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleNext}
              className="flex-1 bg-brand-primary px-6 py-4 rounded-xl active:opacity-80"
            >
              <Text className="text-white text-center font-bold">
                {step === STEPS.length - 1 ? 'AI 분석 시작 🚀' : '다음'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
