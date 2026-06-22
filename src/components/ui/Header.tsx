import { View, Text, Pressable } from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { navigate, ROUTES } from '../../lib';

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <View className="w-full bg-brand-surface/80 border-b border-brand-border px-6 py-3">
      <View className="flex-row items-center justify-between" style={{ maxWidth: 896, alignSelf: 'center', width: '100%' }}>
        {/* Logo */}
        <Pressable onPress={() => navigate(ROUTES.landing)}>
          <Text className="text-brand-text font-bold text-lg">SideForge</Text>
        </Pressable>

        {/* Nav */}
        {user ? (
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => navigate(ROUTES.analyze)}>
              <Text className="text-brand-muted text-sm">분석하기</Text>
            </Pressable>
            <Pressable onPress={() => navigate(ROUTES.mypage)}>
              <Text className="text-brand-muted text-sm">마이페이지</Text>
            </Pressable>
            <View className="bg-brand-primary/20 px-2 py-1 rounded-full">
              <Text className="text-brand-primary-light text-xs font-medium">{user.plan.toUpperCase()}</Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => navigate(ROUTES.auth)}>
              <Text className="text-brand-muted text-sm">로그인</Text>
            </Pressable>
            <Pressable onPress={() => navigate(ROUTES.analyze)} className="bg-brand-primary px-4 py-2 rounded-xl">
              <Text className="text-white text-sm font-bold">시작하기</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
