import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { AppDispatch } from './store/store';
import { useSystemTheme } from '@shared/hooks';
import { initApp, ProtectedRoute } from '@shared/providers';
import {
  AppPreferencesPage,
  BucketPage,
  History,
  BucketsPage,
  BudgetPage,
  Dashboard,
  Insights,
  Layout,
  Login,
  Onboarding,
  ProfilePage,
  SettingsLayout,
  SettingsShell,
  Transaction,
} from '@pages';

import './App.scss';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unsub = initApp(dispatch);
    return () => unsub();
  }, [dispatch]);

  const systemTheme = useSystemTheme();

  useEffect(() => {
    console.log('User prefers theme', systemTheme);
  }, [systemTheme]);

  window.addEventListener('pwa:update-available', (e: Event) => {
    const reg = (e as CustomEvent<ServiceWorkerRegistration>).detail;
    // show your toast/button “Update”
    // on click:
    reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
    // give it a tick to activate then reload
    setTimeout(() => window.location.reload(), 400);
  });

  return (
    <>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transaction />} />
          <Route path="buckets" element={<BucketsPage />} />
          <Route path="buckets/:type" element={<BucketPage />} />
          <Route path="insights" element={<Insights />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<SettingsShell />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="app" element={<AppPreferencesPage />} />
          </Route>
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
          },
        }}
      />
    </>
  );
}

export default App;
