import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Layout from './pages/layout/layout.component';
import Dashboard from './pages/dashboard/dashboard.component';
import Transaction from './pages/transactions/transactions.component';
import Settings from './pages/settings/settings.component';
import Login from './pages/login/login.component';
import ProtectedRoute from './utils/protected-route.util';
import { AppDispatch } from './store/store';
import { initApp } from './utils/app-init.util';
import History from './pages/history/history.component';
import Insights from './pages/insights/insights.component';
import BucketsPage from './pages/buckets/buckets.component';
import BucketPage from './pages/bucket/bucket.components';

import './App.scss';
import { useSystemTheme } from './utils/system-theme.hook';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unsub = initApp(dispatch);
    return () => unsub();
  }, [dispatch]);

  const systemTheme = useSystemTheme();

  useEffect(() => {
    console.log('User prefers', systemTheme);
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
          <Route path="settings" element={<Settings />} />
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
