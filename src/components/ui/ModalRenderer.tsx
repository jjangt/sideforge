import { View, Text } from 'react-native';
import { useFeedbackStore } from '../../lib/feedback';
import { Modal } from './Modal';
import { Button } from './Button';

export function ModalRenderer() {
  const modal = useFeedbackStore((s) => s.modal);
  const closeModal = useFeedbackStore((s) => s.closeModal);

  if (!modal) return null;

  const handleConfirm = () => {
    modal.onConfirm?.();
    closeModal();
  };

  const handleCancel = () => {
    modal.onCancel?.();
    closeModal();
  };

  return (
    <Modal visible={modal.visible} onClose={handleCancel} title={modal.title}>
      <Text className="text-brand-muted text-sm mb-6">{modal.message}</Text>
      <View className="flex-row gap-3">
        {modal.variant === 'confirm' && (
          <Button title={modal.cancelText || '취소'} variant="ghost" size="sm" onPress={handleCancel} className="flex-1" />
        )}
        <Button title={modal.confirmText} size="sm" onPress={handleConfirm} className="flex-1" />
      </View>
    </Modal>
  );
}
