import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Container, Button, Input, Select, Card } from '../src/components/ui';
import { toast } from '../src/lib';
import { goBack } from '../src/lib';

const CATEGORIES = [
  { label: '결제/환불', value: 'billing' },
  { label: '분석 오류', value: 'bug' },
  { label: '기능 제안', value: 'feature' },
  { label: '기타', value: 'other' },
];

export default function ContactScreen() {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!category || !title || !content) {
      toast({ message: '모든 항목을 입력해주세요', type: 'warning' });
      return;
    }
    // TODO: API 연동 (향후)
    setSubmitted(true);
    toast({ message: '문의가 접수되었습니다', type: 'success' });
  }

  if (submitted) {
    return (
      <ScrollView className="flex-1 bg-brand-background">
        <Container className="py-16 items-center">
          <Text className="text-4xl mb-4">✅</Text>
          <Text className="text-brand-text text-xl font-bold mb-2">문의가 접수되었습니다</Text>
          <Text className="text-brand-muted text-sm text-center mb-6">빠른 시일 내에 답변 드리겠습니다.</Text>
          <Button title="돌아가기" variant="outline" onPress={goBack} />
        </Container>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        <Text className="text-brand-text text-2xl font-bold mb-2">문의하기</Text>
        <Text className="text-brand-muted text-sm mb-8">궁금한 점이나 불편한 점을 알려주세요.</Text>

        <Select
          label="카테고리"
          options={CATEGORIES}
          value={category}
          onChange={setCategory}
          placeholder="선택하세요"
          className="mb-4"
        />

        <Input label="제목" placeholder="문의 제목" value={title} onChangeText={setTitle} className="mb-4" />

        <Input label="내용" placeholder="자세히 적어주세요" value={content} onChangeText={setContent} multiline className="mb-8" />

        <Button title="문의 보내기" onPress={handleSubmit} />
      </Container>
    </ScrollView>
  );
}
