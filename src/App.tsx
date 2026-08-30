import React, { useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch } from './store/store';
import { selectAppBootState } from '@store/app.selectors';
import { useSystemTheme } from '@shared/hooks';
import { V3AppLoader } from '@shared/ui/v3-app-loader';
import { CaptureFeedbackProvider, initApp, ProtectedRoute } from '@shared/providers';
import {
  CategoryPage,
  CaptureExpense,
  History,
  Insights,
  Layout,
  Login,
  Onboarding,
  Transaction,
  ProfilePage,
} from '@pages';
import Dashboard from './pages/dashboard/dashboard.component';
import CategoriesPage from './pages/categories/categories.component';

import './App.scss';

const BOOT_LOADER_MIN_MS = 600;
const BOOT_LOADER_EXIT_MS = 180;

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { booting } = useSelector(selectAppBootState);
  const [showBootLoader, setShowBootLoader] = useState(booting);
  const [bootLoaderLeaving, setBootLoaderLeaving] = useState(false);
  const bootLoaderShownAtRef = useRef<number | null>(booting ? Date.now() : null);

  useEffect(() => {
    const unsub = initApp(dispatch);
    return () => unsub();
  }, [dispatch]);

  const systemTheme = useSystemTheme();

  useEffect(() => {
    console.log('User prefers theme', systemTheme);
  }, [systemTheme]);

  useEffect(() => {
    let minTimer: ReturnType<typeof setTimeout> | undefined;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;

    if (booting) {
      if (!showBootLoader) {
        bootLoaderShownAtRef.current = Date.now();
        setShowBootLoader(true);
      } else if (bootLoaderShownAtRef.current == null) {
        bootLoaderShownAtRef.current = Date.now();
      }
      setBootLoaderLeaving(false);
      return undefined;
    }

    if (!showBootLoader) return undefined;

    const shownAt = bootLoaderShownAtRef.current ?? Date.now();
    const remaining = Math.max(0, BOOT_LOADER_MIN_MS - (Date.now() - shownAt));

    minTimer = setTimeout(() => {
      setBootLoaderLeaving(true);
      exitTimer = setTimeout(() => {
        setShowBootLoader(false);
        setBootLoaderLeaving(false);
        bootLoaderShownAtRef.current = null;
      }, BOOT_LOADER_EXIT_MS);
    }, remaining);

    return () => {
      if (minTimer) clearTimeout(minTimer);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [booting, showBootLoader]);

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
        {showBootLoader && <V3AppLoader leaving={bootLoaderLeaving} />}
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
