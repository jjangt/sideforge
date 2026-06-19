import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────────────

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  type?: FeedbackType;
  duration?: number;
}

export interface AlertOptions {
  title: string;
  message: string;
  type?: FeedbackType;
  confirmText?: string;
  onConfirm?: () => void;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  type?: FeedbackType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastItem extends ToastOptions {
  id: string;
  visible: boolean;
}

interface ModalItem {
  id: string;
  variant: 'alert' | 'confirm';
  title: string;
  message: string;
  type: FeedbackType;
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  visible: boolean;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface FeedbackState {
  toasts: ToastItem[];
  modal: ModalItem | null;
  showToast: (options: ToastOptions) => void;
  hideToast: (id: string) => void;
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
  closeModal: () => void;
}

let toastCounter = 0;

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  toasts: [],
  modal: null,

  showToast: (options) => {
    const id = `toast-${++toastCounter}`;
    const toast: ToastItem = { id, visible: true, type: 'info', duration: 3000, ...options };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    setTimeout(() => get().hideToast(id), toast.duration);
  },

  hideToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  showAlert: ({ title, message, type = 'info', confirmText = '확인', onConfirm }) => {
    set({
      modal: { id: `modal-${Date.now()}`, variant: 'alert', title, message, type, confirmText, onConfirm, visible: true },
    });
  },

  showConfirm: ({ title, message, type = 'info', confirmText = '확인', cancelText = '취소', onConfirm, onCancel }) => {
    set({
      modal: { id: `modal-${Date.now()}`, variant: 'confirm', title, message, type, confirmText, cancelText, onConfirm, onCancel, visible: true },
    });
  },

  closeModal: () => set({ modal: null }),
}));

// ─── Imperative API (import해서 바로 호출) ───────────────────────────────────

export const toast = (options: ToastOptions) => useFeedbackStore.getState().showToast(options);
export const alert = (options: AlertOptions) => useFeedbackStore.getState().showAlert(options);
export const confirm = (options: ConfirmOptions) => useFeedbackStore.getState().showConfirm(options);
