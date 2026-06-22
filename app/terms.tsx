import { Text, ScrollView } from 'react-native';
import { Container } from '../src/components/ui';

export default function TermsScreen() {
  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Container className="py-12">
        <Text className="text-brand-text text-2xl font-bold mb-2">이용약관</Text>
        <Text className="text-brand-muted text-xs mb-8">최종 수정일: 2025년 6월 22일</Text>

        <Section title="제1조 (목적)" body="본 약관은 SideForge(이하 '서비스')를 이용함에 있어 회사와 이용자 간의 권리, 의무 및 책임사항을 규정합니다." />
        <Section title="제2조 (서비스 내용)" body="서비스는 YouTube, Blog, Instagram 등의 공개된 채널 데이터를 수집하여 AI 분석 리포트를 제공합니다. 분석은 공개된 데이터만을 대상으로 하며, AI 분석 결과는 참고 목적이며 정확성을 보장하지 않습니다." />
        <Section title="제3조 (회원가입)" body="이용자는 이메일 또는 소셜 로그인(Google)을 통해 가입할 수 있습니다. 가입 시 허위 정보를 제공하면 서비스 이용이 제한될 수 있습니다. 계정 정보의 관리 책임은 이용자에게 있습니다." />
        <Section title="제4조 (유료 서비스)" body="유료 서비스는 월간 또는 연간 구독 방식으로 제공됩니다. 결제 후 7일 이내 유료 기능 미사용 시 전액 환불이 가능합니다. 구독 요금은 사전 고지 후 변경될 수 있습니다." />
        <Section title="제5조 (서비스 제한)" body="비정상적 대량 요청, 분석 결과 허위 변조, 타인 계정 무단 사용, 시스템 공격 시도 시 서비스 이용이 제한됩니다." />
        <Section title="제6조 (면책)" body="AI 분석 결과를 바탕으로 한 의사결정에 대해 회사는 책임지지 않습니다. 외부 플랫폼 API 변경이나 장애로 인한 서비스 중단에 대해 회사는 책임지지 않습니다." />
        <Section title="제7조 (약관 변경)" body="약관 변경 시 7일 전 공지합니다. 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다." />

        <Text className="text-brand-muted text-xs mt-8">본 약관은 2025년 6월 22일부터 시행합니다.</Text>
      </Container>
    </ScrollView>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Text className="text-brand-text font-bold text-base mt-6 mb-2">{title}</Text>
      <Text className="text-brand-muted text-sm leading-6">{body}</Text>
    </>
  );
}
