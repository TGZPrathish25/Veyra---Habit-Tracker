/** Unit tests for NotificationPopup component. */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationPopup } from '../NotificationPopup';
import { useNotificationPopupStore } from '../../store/notificationPopupStore';

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    markAsRead: vi.fn(),
  }),
  requestNotificationPermission: vi.fn().mockResolvedValue('granted'),
}));

describe('NotificationPopup', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    useNotificationPopupStore.getState().dismissPopup();
  });

  it('renders nothing when there is no active popup', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <NotificationPopup />
      </QueryClientProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders 9:30 PM uncompleted reminder popup and dismisses on Got it click', () => {
    act(() => {
      useNotificationPopupStore.getState().showPopup({
        id: 'notif_1',
        title: '⚡ 50% Not Completed Today',
        body: '1/2 habits done (50% left). Finish strong before midnight!',
        type: 'streak',
      });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationPopup />
      </QueryClientProvider>
    );

    expect(screen.getByText('⚡ 50% Not Completed Today')).toBeDefined();
    expect(screen.getByText('1/2 habits done (50% left). Finish strong before midnight!')).toBeDefined();
    expect(screen.getByText('9:30 PM Habit Check-in')).toBeDefined();

    const gotItBtn = screen.getByText('Got it');
    fireEvent.click(gotItBtn);

    expect(useNotificationPopupStore.getState().currentPopup).toBeNull();
  });

  it('renders 100% completed celebration popup', () => {
    act(() => {
      useNotificationPopupStore.getState().showPopup({
        id: 'notif_2',
        title: '🌟 100% Completed — Perfect Day!',
        body: 'You crushed all 3 habits today. Great job keeping the streak alive!',
        type: 'streak',
      });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationPopup />
      </QueryClientProvider>
    );

    expect(screen.getByText('🌟 100% Completed — Perfect Day!')).toBeDefined();
    expect(screen.getByText('Daily Completion Goal Achieved')).toBeDefined();
  });
});
