import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../app/store';
import { AnalyticsPage } from '../AnalyticsPage';

describe('AnalyticsPage render test', () => {
  it('renders overview tab without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <AnalyticsPage activeSubTab="overview" />
        </BrowserRouter>
      </Provider>
    );
    expect(container).toBeTruthy();
  });
});

