import React from 'react';
import { RouteObject } from 'react-router-dom';

const SettingsPage = React.lazy(() =>
  import('../../pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

export function getSettingsRoutes(): RouteObject[] {
  return [
    {
      path: '/settings',
      element: <SettingsPage />,
    },
  ];
}

