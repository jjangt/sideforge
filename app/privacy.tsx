import { View, Text, ScrollView } from 'react-native';
import { Container, Card } from '../src/components/ui';

export default function PrivacyScreen() {
  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        <Text className="text-brand-text text-2xl font-bold mb-2">개인정보처리방침</Text>
        <Text className="text-brand-muted text-xs mb-8">최종 수정일: 2025년 6월 22일</Text>

        <Section title="1. 수집하는 개인정보">
          <Row label="이메일 (필수)" desc="계정 식별, 로그인" />
          <Row label="이름 (선택)" desc="서비스 내 표시" />
          <Row label="Google 프로필 (소셜 로그인 시)" desc="계정 생성, 프로필 표시" />
          <Row label="IP, 접속 시간 (자동)" desc="보안, 서비스 개선" />
        </Section>

        <Section title="2. 이용 목적">
          <Text className="text-brand-muted text-sm leading-6">서비스 제공 및 계정 관리, 결제 처리, 서비스 개선 및 통계 분석, 공지사항 발송에 사용됩니다.</Text>
        </Section>

        <Section title="3. 보관 기간">
          <Row label="서비스 이용 중" desc="회원 탈퇴 시까지" />
          <Row label="회원 탈퇴" desc="즉시 삭제" />
          <Row label="구독 해지 (탈퇴 X)" desc="6개월 보관 후 삭제" />
          <Row label="결제 기록" desc="5년 (전자상거래법)" />
        </Section>

        <Section title="4. 제3자 제공">
          <Text className="text-brand-muted text-sm leading-6">원칙적으로 제3자에게 제공하지 않습니다. 이용자 동의 시 또는 법령에 의한 요구 시에만 예외로 합니다.</Text>
        </Section>

        <Section title="5. 처리 위탁">
          <Row label="Cloudflare" desc="서버 호스팅, 데이터 저장" />
          <Row label="Stripe / 토스페이먼츠" desc="결제 처리" />
          <Row label="Google" desc="OAuth 인증" />
        </Section>

        <Section title="6. 이용자의 권리">
          <Text className="text-brand-muted text-sm leading-6">개인정보 조회, 수정, 삭제 요청이 가능합니다. 계정 삭제 요청 시 30일 내 처리됩니다.</Text>
        </Section>

        <Section title="7. 보안 조치">
          <Text className="text-brand-muted text-sm leading-6">비밀번호 단방향 암호화, HTTPS 통신, JWT 토큰 인증(7일 만료), 환경변수 기반 시크릿 관리를 적용합니다.</Text>
        </Section>

        <Section title="8. 문의">
          <Text className="text-brand-muted text-sm leading-6">개인정보 관련 문의: privacy@sideforge.dev</Text>
        </Section>
      </Container>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      <Text className="text-brand-text font-bold text-base mb-3">{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, desc }: { label: string; desc: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-brand-border/30">
      <Text className="text-brand-text text-sm">{label}</Text>
      <Text className="text-brand-muted text-sm">{desc}</Text>
    </View>
  );
}
