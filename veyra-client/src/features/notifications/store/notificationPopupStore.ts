/**
 * Zustand store for managing floating in-app notification popups.
 */
import { create } from 'zustand';

export interface NotificationPopupItem {
  id: string;
  title: string;
  body: string;
  type?: string;
  date?: string;
  data?: Record<string, unknown> | null;
  createdAt?: string;
}

interface NotificationPopupState {
  currentPopup: NotificationPopupItem | null;
  showPopup: (item: NotificationPopupItem) => void;
  dismissPopup: () => void;
}

export const useNotificationPopupStore = create<NotificationPopupState>((set) => ({
  currentPopup: null,
  showPopup: (item) => set({ currentPopup: item }),
  dismissPopup: () => set({ currentPopup: null }),
}));
