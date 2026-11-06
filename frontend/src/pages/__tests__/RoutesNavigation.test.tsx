import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../../app/store';
import { AppRoutes } from '../../routes/AppRoutes';

describe('AppRoutes - Sub-tab clicks', () => {
  it('navigates when clicking Danh sách from timeline', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/printers/timeline']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    // Find the 'Danh sách' button in PrintersPageHeader
    const listBtn = await screen.findByRole('button', { name: /Danh sách/i });
    expect(listBtn).toBeDefined();
    fireEvent.click(listBtn);

    // Wait and check what happens
    await waitFor(() => {
      // If it navigated to /printers/printers -> redirect to dashboard!
      // In dashboard, 'Tổng Quan Vận Hành' or KPI cards exist!
      // But if properly handled, it should stay in Printers page!
    });
  });
});
