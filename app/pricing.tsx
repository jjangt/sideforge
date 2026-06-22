import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { Container, Button, Card, Badge } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';

const PLANS = [
  {
    name: 'Free',
    price: '₩0',
    period: '',
    features: [
      '월 3회 분석',
      '플랫폼 1개 선택',
      '기본 리포트 (점수 + 요약)',
      '리포트 열람: 7일간',
      '광고 포함',
    ],
    disabled: ['추천 콘텐츠 제안', '댓글/반응 분석', '경쟁 채널 비교', '정기 모니터링', 'PDF 다운로드'],
    cta: '무료로 시작',
    highlight: false,
  },
  {
    name: 'Plus',
    price: '₩9,900',
    period: '/월',
    features: [
      '월 30회 분석',
      '플랫폼 2개 조합',
      '상세 리포트 + 콘텐츠별 피드백',
      '추천 콘텐츠 제안',
      '리포트 열람: 구독 중 무제한',
      'PDF 다운로드',
      '광고 없음',
    ],
    disabled: ['댓글/반응 분석', '경쟁 채널 비교', '정기 모니터링'],
    cta: 'Plus 시작하기',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '₩29,900',
    period: '/월',
    features: [
      '무제한 분석',
      '전체 플랫폼',
      '상세 리포트 + 콘텐츠별 피드백',
      '추천 콘텐츠 제안',
      '댓글/반응 감성 분석',
      'UI/디자인 피드백',
      '경쟁 채널 비교',
      '주간 정기 모니터링',
      'PDF 다운로드',
      '리포트 열람: 구독 중 무제한',
      '광고 없음',
    ],
    disabled: [],
    cta: 'Pro 시작하기',
    highlight: false,
  },
];

const FAQ = [
  { q: '무료 플랜으로 뭘 할 수 있나요?', a: '매월 3회까지 원하는 플랫폼 1개를 선택하여 채널 분석이 가능합니다. 기본 점수와 요약을 확인할 수 있으며, 리포트는 생성 후 7일간 열람 가능합니다.' },
  { q: 'Plus와 Pro의 차이는 뭔가요?', a: 'Plus는 2개 플랫폼, 월 30회, 상세 리포트를 제공합니다. Pro는 전체 플랫폼, 무제한 분석, 댓글 분석, 경쟁사 비교, 주간 모니터링까지 포함됩니다.' },
  { q: '구독을 해지하면 어떻게 되나요?', a: '해지 후 남은 기간까지 정상 이용 가능합니다. 기간 만료 후 리포트 열람이 불가하며, 재구독하면 과거 데이터를 다시 볼 수 있습니다.' },
  { q: '환불 가능한가요?', a: '결제 후 7일 이내, 유료 기능을 사용하지 않았다면 전액 환불됩니다.' },
  { q: '결제 수단은 뭐가 되나요?', a: '신용카드 및 체크카드(Visa, Mastercard, 국내 전 카드)를 지원합니다.' },
  { q: '데이터는 얼마나 보관되나요?', a: '구독 중 영구 보관, 해지 후 6개월 보관됩니다. 6개월 내 재구독 시 모든 데이터가 복원됩니다.' },
  { q: '광고가 표시되나요?', a: 'Free 플랜에서만 광고가 표시됩니다. Plus/Pro에서는 광고 없이 이용 가능합니다.' },
  { q: '어떤 플랫폼을 분석할 수 있나요?', a: 'YouTube, 블로그(네이버, 티스토리, Medium, WordPress, Velog), Instagram을 지원합니다.' },
];

export default function PricingScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container size={isWide ? 'lg' : 'md'} className="py-16">
        {/* Header */}
        <Text className="text-brand-text text-3xl font-bold text-center mb-3">가격</Text>
        <Text className="text-brand-muted text-sm text-center mb-12">필요한 만큼만 선택하세요. 언제든 변경 가능합니다.</Text>

        {/* Plans - 가로(넓은 화면) / 세로(모바일) */}
        <View style={isWide ? { flexDirection: 'row', gap: 16 } : { gap: 16 }} className="mb-16">
          {PLANS.map((plan) => (
            <Card key={plan.name} variant={plan.highlight ? 'highlight' : 'default'} className="p-6" style={isWide ? { flex: 1 } : undefined}>
              {plan.highlight && <Badge label="인기" variant="primary" className="mb-3" />}
              <Text className="text-brand-text font-bold text-xl">{plan.name}</Text>
              <View className="flex-row items-end mt-2 mb-4">
                <Text className="text-brand-primary font-bold text-2xl">{plan.price}</Text>
                {plan.period && <Text className="text-brand-muted text-sm ml-1">{plan.period}</Text>}
              </View>

              {/* Features */}
              <View className="gap-2 mb-4">
                {plan.features.map((f, i) => (
                  <View key={i} className="flex-row items-start gap-2">
                    <Text className="text-brand-success text-sm">✓</Text>
                    <Text className="text-brand-text text-sm flex-1">{f}</Text>
                  </View>
                ))}
                {plan.disabled.map((f, i) => (
                  <View key={i} className="flex-row items-start gap-2">
                    <Text className="text-brand-muted text-sm">✗</Text>
                    <Text className="text-brand-muted text-sm flex-1">{f}</Text>
                  </View>
                ))}
              </View>

              <Button title={plan.cta} variant={plan.highlight ? 'primary' : 'outline'} onPress={() => navigate(ROUTES.auth)} className="mt-2" />
            </Card>
          ))}
        </View>

        {/* Annual discount */}
        <Card className="mb-16 items-center p-6">
          <Text className="text-brand-text font-bold text-base mb-2">💰 연간 결제 시 20% 할인</Text>
          <Text className="text-brand-muted text-sm text-center">Plus ₩95,000/년 (₩7,917/월) · Pro ₩287,000/년 (₩23,917/월)</Text>
        </Card>

        {/* FAQ */}
        <Text className="text-brand-text text-2xl font-bold text-center mb-8">자주 묻는 질문</Text>
        <View className="gap-3 mb-12">
          {FAQ.map((item, i) => (
            <Card key={i} className="p-5">
              <Text className="text-brand-text font-bold text-sm mb-2">{item.q}</Text>
              <Text className="text-brand-muted text-sm leading-6">{item.a}</Text>
            </Card>
          ))}
        </View>

        {/* Footer Links */}
        <View className="items-center gap-2">
          <Text className="text-brand-muted text-xs">결제 관련 문의: support@sideforge.dev</Text>
          <View className="flex-row gap-4">
            <Text className="text-brand-primary-light text-xs" onPress={() => navigate('/terms')}>이용약관</Text>
            <Text className="text-brand-primary-light text-xs" onPress={() => navigate('/privacy')}>개인정보처리방침</Text>
          </View>
        </View>
      </Container>
    </ScrollView>
  );
}
