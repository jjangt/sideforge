import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export function Loading({ message, submessage, className = '' }: LoadingProps) {
  return (
    <View className={`flex-1 bg-brand-background items-center justify-center px-6 ${className}`}>
      <ActivityIndicator size="large" color="#7C3AED" />
      {message && <Text className="text-brand-text text-lg font-bold mt-6">{message}</Text>}
      {submessage && <Text className="text-brand-muted text-sm mt-2 text-center">{submessage}</Text>}
    </View>
  );
}
