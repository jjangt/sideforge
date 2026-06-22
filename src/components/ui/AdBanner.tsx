import { View, Text, Platform } from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';

interface AdBannerProps {
  /** 광고 위치 식별자 (추후 AdSense 슬롯 매핑용) */
  slot?: string;
  className?: string;
}

/**
 * 광고 배너 컴포넌트
 * - Free 유저에게만 표시
 * - Plus/Pro/Admin은 광고 없음
 * - 웹에서만 동작 (앱에서는 별도 SDK 필요)
 * 
 * AdSense 승인 후 아래 주석 해제하여 실제 광고 적용:
 * 1. app/_layout.tsx의 <head>에 AdSense 스크립트 추가
 * 2. slot prop에 AdSense 광고 단위 ID 전달
 */
export function AdBanner({ slot = 'default', className = '' }: AdBannerProps) {
  const user = useAuthStore((s) => s.user);

  // 유료 플랜 또는 관리자는 광고 비표시
  if (user && user.plan !== 'free') return null;

  // 웹에서만 광고 표시
  if (Platform.OS !== 'web') return null;

  return (
    <View className={`w-full items-center py-3 ${className}`}>
      {/* 
        TODO: AdSense 승인 후 아래를 실제 광고 코드로 교체
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXX"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true" />
      */}
      <View className="w-full max-w-2xl bg-brand-surface/50 border border-brand-border/30 rounded-xl py-6 items-center">
        <Text className="text-brand-muted text-xs">광고 영역</Text>
        <Text className="text-brand-primary-light text-xs mt-1">Plus 업그레이드 시 광고 제거</Text>
      </View>
    </View>
  );
}
