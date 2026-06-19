import { View, Text, ScrollView, Pressable } from 'react-native';
import { useBrandStore } from '../../../src/stores/useBrandStore';
import { Loading } from '../../../src/components/ui';
import { goBack } from '../../../src/lib';

export default function BrandPreviewScreen() {
  const brand = useBrandStore((s) => s.brand);

  if (!brand) return <Loading message="No brand" />;

  const { colorPalette: c } = brand;

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: c.background }}>
      {/* Hero */}
      <View className="items-center py-16 px-6" style={{ backgroundColor: c.primary }}>
        <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-6">
          <Text className="text-4xl">✨</Text>
        </View>
        <Text className="text-3xl font-bold text-white text-center">{brand.name}</Text>
        <Text className="text-white/80 text-base mt-3 text-center">{brand.slogan}</Text>
      </View>

      {/* Tagline */}
      <View className="px-6 py-10 items-center" style={{ backgroundColor: c.background }}>
        <Text className="text-xl text-center font-medium" style={{ color: c.text }}>
          {brand.tagline}
        </Text>
      </View>

      {/* Story */}
      <View className="px-6 py-10" style={{ backgroundColor: c.background }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: c.accent }}>Our Story</Text>
        <Text className="text-base leading-7" style={{ color: c.text }}>{brand.story}</Text>
      </View>

      {/* Target */}
      <View className="px-6 py-10" style={{ backgroundColor: c.secondary + '15' }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: c.accent }}>For You</Text>
        <Text className="text-base leading-7" style={{ color: c.text }}>{brand.targetCustomer}</Text>
      </View>

      {/* Color Bar */}
      <View className="px-6 py-10" style={{ backgroundColor: c.background }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: c.accent }}>Brand Identity</Text>
        <View className="flex-row h-16 rounded-xl overflow-hidden">
          {Object.values(c).map((color, i) => (
            <View key={i} className="flex-1" style={{ backgroundColor: color }} />
          ))}
        </View>
      </View>

      {/* Content */}
      <View className="px-6 py-10" style={{ backgroundColor: c.background }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: c.accent }}>Latest Content</Text>
        <View className="gap-3">
          {brand.firstContentIdeas.slice(0, 2).map((idea, i) => (
            <View key={i} className="p-4 rounded-xl" style={{ backgroundColor: c.secondary + '20' }}>
              <Text className="font-bold text-base" style={{ color: c.text }}>{idea.title}</Text>
              <Text className="text-sm mt-1" style={{ color: c.text + '99' }}>{idea.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* SNS */}
      <View className="px-6 py-10 items-center" style={{ backgroundColor: c.background }}>
        <Text className="text-sm uppercase tracking-wider mb-4" style={{ color: c.accent }}>Follow Us</Text>
        <Text className="text-center text-sm leading-6" style={{ color: c.text }}>{brand.snsProfile.bio}</Text>
        <View className="flex-row gap-4 mt-4">
          {brand.snsProfile.platforms.map((p) => (
            <View key={p.platform} className="px-4 py-2 rounded-full" style={{ backgroundColor: c.primary + '20' }}>
              <Text style={{ color: c.primary }} className="text-sm font-bold">{p.platform}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View className="px-6 py-8 items-center" style={{ backgroundColor: c.secondary }}>
        <Text className="text-white/60 text-xs">Powered by SideForge</Text>
      </View>

      {/* Back */}
      <View className="absolute top-12 left-4">
        <Pressable onPress={goBack} className="bg-black/50 px-4 py-2 rounded-full active:opacity-80">
          <Text className="text-white text-sm">← Back</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
