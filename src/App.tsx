import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { AppDispatch } from './store/store';
import { useSystemTheme } from '@shared/hooks';
import { CaptureFeedbackProvider, initApp, ProtectedRoute } from '@shared/providers';
import {
  CategoryPage,
  CaptureExpense,
  History,
  CategoriesPage,
  Insights,
  Layout,
  Login,
  Onboarding,
  Transaction,
  ProfilePage,
} from '@pages';
import Dashboard from './pages/dashboard/dashboard.component';

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
      <CaptureFeedbackProvider>
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
            path="transactions/new"
            element={
              <ProtectedRoute>
                <CaptureExpense />
              </ProtectedRoute>
            }
          />
          <Route
            path="transactions/:month/:txnId/edit"
            element={
              <ProtectedRoute>
                <CaptureExpense />
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
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/:type" element={<CategoryPage />} />
            <Route path="insights" element={<Insights />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </CaptureFeedbackProvider>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            borderRadius: '10px',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-elevation-2)',
          },
        }}
      />
    </>
  );
}

export default App;
