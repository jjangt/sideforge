import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  label?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ options, value, placeholder = '선택하세요', label, onChange, className = '' }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className={`relative ${className}`}>
      {label && <Text className="text-brand-text text-sm font-medium mb-2">{label}</Text>}
      <Pressable
        onPress={() => setOpen(!open)}
        className="bg-brand-surface border border-brand-border px-4 py-4 rounded-2xl flex-row justify-between items-center"
      >
        <Text className={selected ? 'text-brand-text text-base' : 'text-brand-muted text-base'}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text className="text-brand-muted">{open ? '▲' : '▼'}</Text>
      </Pressable>

      {open && (
        <View className="absolute top-full left-0 right-0 mt-1 bg-brand-surface border border-brand-border rounded-2xl overflow-hidden z-50">
          <ScrollView className="max-h-48">
            {options.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => { onChange(opt.value); setOpen(false); }}
                className={`px-4 py-3 border-b border-brand-border/50 ${opt.value === value ? 'bg-brand-primary/10' : ''}`}
              >
                <Text className={opt.value === value ? 'text-brand-primary font-medium' : 'text-brand-text'}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
