import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import PagesManager from './pages/admin/PagesManager';
import PageEditor from './pages/admin/PageEditor';
import MenuManager from './pages/admin/MenuManager';
import SettingsManager from './pages/admin/SettingsManager';
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import NotFound from './pages/admin/NotFound';

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    path: '/admin/register',
    element: <Register />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <Dashboard />,
      },
      {
        path: 'pages',
        element: <PagesManager />,
      },
      {
        path: 'pages/create',
        element: <PageEditor />,
      },
      {
        path: 'pages/:id',
        element: <PageEditor />,
      },
      {
        path: 'menu',
        element: <MenuManager />,
      },
      {
        path: 'settings',
        element: <SettingsManager />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
