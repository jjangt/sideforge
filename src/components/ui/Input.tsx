import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  const borderColor = error ? 'border-brand-error' : 'border-brand-border';

  return (
    <View className={className}>
      {label && <Text className="text-brand-text text-sm font-medium mb-2">{label}</Text>}
      <TextInput
        className={`bg-brand-surface border ${borderColor} text-brand-text p-4 rounded-2xl text-base ${props.multiline ? 'min-h-[120px]' : ''}`}
        placeholderTextColor="#94A3B8"
        textAlignVertical={props.multiline ? 'top' : 'center'}
        {...props}
      />
      {hint && !error && <Text className="text-brand-muted text-xs mt-1.5">{hint}</Text>}
      {error && <Text className="text-brand-error text-xs mt-1.5">{error}</Text>}
    </View>
  );
}
