/** Unit tests for NotificationCard component. */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationCard } from '../NotificationCard';
import type { NotificationItem } from '../../types';

describe('NotificationCard', () => {
  const mockUnreadNotif: NotificationItem = {
    id: 'n-1',
    userId: 'user-1',
    type: 'streak',
    title: '🔥 7-Day Streak Milestone!',
    body: 'Incredible consistency! You have logged habits for 7 consecutive days.',
    read: false,
    createdAt: new Date().toISOString(),
  };

  const mockReadNotif: NotificationItem = {
    id: 'n-2',
    userId: 'user-1',
    type: 'achievement',
    title: '🏆 Achievement Unlocked',
    body: 'First step completed.',
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  };

  it('renders unread notification with title, body, and mark as read button', () => {
    const handleMarkAsRead = vi.fn();
    const handleDelete = vi.fn();

    render(
      <NotificationCard
        notification={mockUnreadNotif}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText('🔥 7-Day Streak Milestone!')).toBeDefined();
    expect(
      screen.getByText('Incredible consistency! You have logged habits for 7 consecutive days.')
    ).toBeDefined();

    const readBtn = screen.getByLabelText('Mark as read');
    expect(readBtn).toBeDefined();
    fireEvent.click(readBtn);
    expect(handleMarkAsRead).toHaveBeenCalledWith('n-1');

    const deleteBtn = screen.getByLabelText('Delete notification');
    expect(deleteBtn).toBeDefined();
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith('n-1');
  });

  it('renders read notification without mark as read button', () => {
    render(<NotificationCard notification={mockReadNotif} />);

    expect(screen.getByText('🏆 Achievement Unlocked')).toBeDefined();
    expect(screen.queryByLabelText('Mark as read')).toBeNull();
  });
});
