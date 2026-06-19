import { View, Text, Pressable, Modal as RNModal } from 'react-native';
import type { ReactNode } from 'react';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ visible, onClose, title, children, className = '' }: ModalProps) {
  return (
    <RNModal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/60 items-center justify-center px-6">
        <Pressable onPress={(e) => e.stopPropagation()} className={`bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-sm ${className}`}>
          {title && <Text className="text-brand-text text-lg font-bold mb-3">{title}</Text>}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
