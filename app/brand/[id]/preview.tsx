import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useBrandStore } from '../../../src/stores/useBrandStore';

export default function BrandPreviewScreen() {
  const brand = useBrandStore((s) => s.brand);

  if (!brand) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">브랜드가 없습니다</Text>
      </View>
    );
  }

  const { colorPalette: colors } = brand;

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Hero Section */}
      <View className="items-center py-16 px-6" style={{ backgroundColor: colors.primary }}>
        <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-6">
          <Text className="text-4xl">✨</Text>
        </View>
        <Text className="text-3xl font-bold text-white text-center">{brand.name}</Text>
        <Text className="text-white/80 text-base mt-3 text-center">{brand.slogan}</Text>
      </View>

      {/* Tagline */}
      <View className="px-6 py-10 items-center" style={{ backgroundColor: colors.background }}>
        <Text className="text-xl text-center font-medium" style={{ color: colors.text }}>
          {brand.tagline}
        </Text>
      </View>

      {/* Story */}
      <View className="px-6 py-10" style={{ backgroundColor: colors.background }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: colors.accent }}>Our Story</Text>
        <Text className="text-base leading-7" style={{ color: colors.text }}>
          {brand.story}
        </Text>
      </View>

      {/* For Who */}
      <View className="px-6 py-10" style={{ backgroundColor: colors.secondary + '15' }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: colors.accent }}>이런 분들을 위해</Text>
        <Text className="text-base leading-7" style={{ color: colors.text }}>
          {brand.targetCustomer}
        </Text>
      </View>

      {/* Color Palette Visual */}
      <View className="px-6 py-10" style={{ backgroundColor: colors.background }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: colors.accent }}>Brand Identity</Text>
        <View className="flex-row h-16 rounded-xl overflow-hidden">
          {Object.values(colors).map((color, i) => (
            <View key={i} className="flex-1" style={{ backgroundColor: color }} />
          ))}
        </View>
      </View>

      {/* Content Preview */}
      <View className="px-6 py-10" style={{ backgroundColor: colors.background }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: colors.accent }}>Latest Content</Text>
        <View className="gap-3">
          {brand.firstContentIdeas.slice(0, 2).map((idea, i) => (
            <View key={i} className="p-4 rounded-xl" style={{ backgroundColor: colors.secondary + '20' }}>
              <Text className="font-bold text-base" style={{ color: colors.text }}>{idea.title}</Text>
              <Text className="text-sm mt-1" style={{ color: colors.text + '99' }}>{idea.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* SNS */}
      <View className="px-6 py-10 items-center" style={{ backgroundColor: colors.background }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: colors.accent }}>Follow Us</Text>
        <Text className="text-center text-sm leading-6" style={{ color: colors.text }}>
          {brand.snsProfile.bio}
        </Text>
        <View className="flex-row gap-4 mt-4">
          {brand.snsProfile.platforms.map((p) => (
            <View key={p.platform} className="px-4 py-2 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
              <Text style={{ color: colors.primary }} className="text-sm font-bold">{p.platform}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View className="px-6 py-8 items-center" style={{ backgroundColor: colors.secondary }}>
        <Text className="text-white/60 text-xs">Powered by SideForge</Text>
      </View>

      {/* Back Button (overlay) */}
      <View className="absolute top-12 left-4">
        <Pressable onPress={() => router.back()} className="bg-black/40 px-4 py-2 rounded-full active:opacity-80">
          <Text className="text-white text-sm">← 돌아가기</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
