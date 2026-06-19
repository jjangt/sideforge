import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '../src/stores/useProfileStore';
import { generateId } from '../src/utils/id';
import { Container, Button, Input, ProgressBar } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';

const STEP_KEYS = ['interests', 'likes', 'skills', 'personality', 'goals', 'preferredMood', 'targetRevenue', 'weeklyHours'] as const;
const MULTI_STEPS = new Set(['interests', 'likes', 'skills']);

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const setProfile = useProfileStore((s) => s.setProfile);

  const key = STEP_KEYS[step];
  const isMulti = MULTI_STEPS.has(key);
  const progress = ((step + 1) / STEP_KEYS.length) * 100;

  function handleNext() {
    if (step < STEP_KEYS.length - 1) {
      setStep(step + 1);
      return;
    }
    const now = new Date().toISOString();
    setProfile({
      id: generateId(),
      interests: split(answers.interests),
      likes: split(answers.likes),
      skills: split(answers.skills),
      personality: answers.personality || '',
      goals: answers.goals || '',
      preferredMood: answers.preferredMood || '',
      targetRevenue: answers.targetRevenue || '',
      weeklyHours: parseInt(answers.weeklyHours) || 10,
      createdAt: now,
      updatedAt: now,
    });
    navigate(ROUTES.recommendations);
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-brand-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <Container className="flex-1 py-12">
          {/* Progress */}
          <View className="mb-10">
            <View className="flex-row justify-between mb-2">
              <Text className="text-brand-muted text-sm">{step + 1} / {STEP_KEYS.length}</Text>
            </View>
            <ProgressBar value={progress} showLabel height="md" />
          </View>

          {/* Question */}
          <Text className="text-brand-text text-2xl font-bold mb-2">
            {t(`onboarding.${key}`)}
          </Text>
          <Text className="text-brand-muted text-sm mb-8">
            {isMulti ? t('onboarding.multiHint') : t('onboarding.singleHint')}
          </Text>

          {/* Input */}
          <Input
            placeholder={t(`onboarding.${key}Placeholder`)}
            multiline
            value={answers[key] || ''}
            onChangeText={(text) => setAnswers({ ...answers, [key]: text })}
          />

          {/* Buttons */}
          <View className="flex-row gap-3 mt-10">
            {step > 0 && (
              <Button title={t('common.prev')} variant="outline" onPress={() => setStep(step - 1)} className="flex-1" />
            )}
            <Button
              title={step === STEP_KEYS.length - 1 ? t('onboarding.submit') : t('common.next')}
              onPress={handleNext}
              className="flex-1"
            />
          </View>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function split(val?: string) {
  return (val || '').split(',').map((s) => s.trim()).filter(Boolean);
}
