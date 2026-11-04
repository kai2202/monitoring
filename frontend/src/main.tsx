/**
 * Frontend/src/main.tsx
 *
 * Entry point chính của FleetMonitor React Application.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Chart, registerables } from 'chart.js';
import { App } from './App';
import './styles/global.css';

Chart.register(...registerables);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('[FleetMonitor] Không tìm thấy phần tử root trong index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

