/** Unit tests for ConfirmDeleteModal component. */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

describe('ConfirmDeleteModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDeleteModal
        isOpen={false}
        itemName="Morning Run"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with item name, reassurance of past history preservation, and buttons', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <ConfirmDeleteModal
        isOpen={true}
        itemName="Read 20 Pages"
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    expect(screen.getByText('Delete Habit?')).toBeDefined();
    expect(screen.getByText('"Read 20 Pages"')).toBeDefined();
    expect(screen.getByText('Past History Preserved')).toBeDefined();
    expect(
      screen.getByText(/Your past completions, streak milestones, and earned XP remain safely intact/i)
    ).toBeDefined();

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const deleteBtn = screen.getByText('Delete Future Goals');
    fireEvent.click(deleteBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
