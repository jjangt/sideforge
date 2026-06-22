import { View, Text, ScrollView } from 'react-native';
import { Container, Button, Card, Badge } from '../src/components/ui';
import { navigate, ROUTES } from '../src/lib';

export default function LandingScreen() {
  return (
    <ScrollView className="flex-1 bg-brand-background">
      {/* Hero */}
      <Container className="pt-24 pb-16 items-center">
        <Badge label="✨ AI 콘텐츠 성장 파트너" variant="primary" className="mb-8" />

        <Text className="text-5xl font-bold text-brand-text text-center mb-5">
          SideForge
        </Text>

        <Text className="text-lg text-brand-muted text-center leading-8 mb-4">
          당신의 채널을 AI가 분석하고{'\n'}구체적인 성장 액션을 제안합니다
        </Text>

        <Text className="text-sm text-brand-primary-light text-center mb-12">
          YouTube · Blog · Instagram 통합 분석
        </Text>

        <Button
          title="무료로 분석 시작 →"
          size="lg"
          onPress={() => navigate(ROUTES.analyze)}
          className="w-full"
        />

        <Text className="text-brand-muted text-sm mt-4">가입 후 3회 무료 분석</Text>
      </Container>

      {/* What We Do */}
      <Container className="pb-12">
        <Text className="text-brand-text text-xl font-bold text-center mb-3">숫자가 아닌, 액션을 드립니다</Text>
        <Text className="text-brand-muted text-sm text-center mb-8">
          기존 도구는 조회수만 보여줍니다.{'\n'}SideForge는 "왜 안 되는지"와 "어떻게 고칠지"를 알려드립니다.
        </Text>
        <View className="gap-4">
          <FeatureCard icon="🔍" title="채널 분석" desc="URL 하나로 콘텐츠, 반응, 성장 추세를 종합 분석" />
          <FeatureCard icon="🎯" title="개선 액션 제안" desc="지금 바로 실행할 수 있는 구체적 개선 방법 제공" />
          <FeatureCard icon="📊" title="벤치마킹" desc="같은 카테고리 인기 채널과 비교하여 차이점 분석" />
          <FeatureCard icon="💡" title="콘텐츠 제안" desc="AI가 다음에 만들면 좋을 콘텐츠 주제 추천" />
        </View>
      </Container>

      {/* How it works */}
      <Container className="pb-12">
        <Text className="text-brand-text text-xl font-bold text-center mb-8">3단계로 끝</Text>
        <View className="gap-4">
          <StepCard step="1" title="URL 입력" desc="분석할 채널 URL을 붙여넣기" />
          <StepCard step="2" title="AI 분석" desc="AI가 데이터를 수집하고 패턴을 분석 (30초)" />
          <StepCard step="3" title="리포트 확인" desc="점수, 강점, 약점, 개선 액션, 추천 콘텐츠 확인" />
        </View>
      </Container>

      {/* Supported Platforms */}
      <Container className="pb-12">
        <Text className="text-brand-text text-xl font-bold text-center mb-8">지원 플랫폼</Text>
        <View className="gap-3">
          <PlatformCard icon="▶️" name="YouTube" status="available" desc="채널 분석, 영상별 피드백, 댓글 분석" />
          <PlatformCard icon="📝" name="Blog" status="coming" desc="네이버, 티스토리, Medium, WordPress, Velog" />
          <PlatformCard icon="📸" name="Instagram" status="coming" desc="피드 분석, 해시태그 전략, 참여율" />
        </View>
      </Container>

      {/* Pricing Preview */}
      <Container className="pb-12">
        <Text className="text-brand-text text-xl font-bold text-center mb-8">가격</Text>
        <View className="gap-3">
          <PricingCard plan="Free" price="₩0" features={['월 3회 분석', '플랫폼 1개 선택', '기본 리포트 (7일 열람)']} />
          <PricingCard plan="Plus" price="₩9,900/월" features={['월 30회 분석', '플랫폼 2개 조합', '상세 리포트 + 추천 콘텐츠', '광고 없음']} highlight />
          <PricingCard plan="Pro" price="₩29,900/월" features={['무제한 분석', '전체 플랫폼', '댓글 분석 + 경쟁사 비교', '주간 모니터링 + 광고 없음']} />
        </View>
        <Button title="플랜 비교 더 보기" variant="ghost" onPress={() => navigate(ROUTES.pricing)} className="mt-4" />
      </Container>

      {/* CTA */}
      <Container className="pb-12 items-center">
        <Card className="w-full items-center p-8">
          <Text className="text-3xl mb-3">🚀</Text>
          <Text className="text-brand-text text-base font-bold text-center mb-4">
            지금 바로 내 채널을 분석해보세요
          </Text>
          <Button title="무료로 시작하기" onPress={() => navigate(ROUTES.analyze)} className="w-full" />
        </Card>
      </Container>

      {/* Footer */}
      <Container className="pb-24 items-center">
        <View className="flex-row gap-4">
          <Text className="text-brand-muted text-xs" onPress={() => navigate(ROUTES.pricing)}>가격</Text>
          <Text className="text-brand-muted text-xs" onPress={() => navigate(ROUTES.terms)}>이용약관</Text>
          <Text className="text-brand-muted text-xs" onPress={() => navigate(ROUTES.privacy)}>개인정보처리방침</Text>
        </View>
        <Text className="text-brand-muted text-xs mt-2">© 2026 SideForge. All rights reserved.</Text>
      </Container>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <Card className="flex-row items-start gap-4">
      <View className="w-12 h-12 bg-brand-primary/10 rounded-xl items-center justify-center">
        <Text className="text-2xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-brand-text font-bold text-base mb-1">{title}</Text>
        <Text className="text-brand-muted text-sm leading-6">{desc}</Text>
      </View>
    </Card>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <Card className="flex-row items-center gap-4">
      <View className="w-10 h-10 bg-brand-primary rounded-full items-center justify-center">
        <Text className="text-white font-bold">{step}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-brand-text font-bold text-base">{title}</Text>
        <Text className="text-brand-muted text-sm">{desc}</Text>
      </View>
    </Card>
  );
}

function PlatformCard({ icon, name, status, desc }: { icon: string; name: string; status: 'available' | 'coming'; desc: string }) {
  return (
    <Card className="flex-row items-center gap-4">
      <Text className="text-2xl">{icon}</Text>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-brand-text font-bold">{name}</Text>
          <Badge label={status === 'available' ? '이용 가능' : 'Coming Soon'} variant={status === 'available' ? 'success' : 'muted'} />
        </View>
        <Text className="text-brand-muted text-sm mt-1">{desc}</Text>
      </View>
    </Card>
  );
}

function PricingCard({ plan, price, features, highlight }: { plan: string; price: string; features: string[]; highlight?: boolean }) {
  return (
    <Card variant={highlight ? 'highlight' : 'default'} className="p-6">
      <Text className="text-brand-text font-bold text-lg">{plan}</Text>
      <Text className="text-brand-primary font-bold text-xl mt-1">{price}</Text>
      <View className="mt-3 gap-2">
        {features.map((f, i) => (
          <View key={i} className="flex-row items-start gap-2">
            <Text className="text-brand-success text-sm">✓</Text>
            <Text className="text-brand-muted text-sm flex-1">{f}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
