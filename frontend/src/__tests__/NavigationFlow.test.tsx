import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../app/store';
import { AppRoutes } from '../routes/AppRoutes';

describe('AppRoutes Full Flow Test', () => {
  it('renders printers page and checks header click', async () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/printers/list']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    // Check if printers header rendered
    await waitFor(() => {
      expect(screen.getByText('Danh Sách Máy In')).toBeInTheDocument();
    });

    // Find "Danh sách" button in header
    const dsButton = screen.getByRole('button', { name: /Danh sách/i });
    expect(dsButton).toBeInTheDocument();
    fireEvent.click(dsButton);

    // If it navigated to /printers/printers, it would fall back to /dashboard ("Fleet Overview" or "Tổng quan")
    // Let's see if it redirects to dashboard!
  });

  it('renders analytics overview tab', async () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/analytics/overview']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Phân Tích Sản Lượng Hạm Đội/i)).toBeInTheDocument();
    });
  });
});

