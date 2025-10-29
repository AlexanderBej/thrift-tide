import React, { useEffect } from 'react';
import './App.scss';
import { Route, Routes } from 'react-router-dom';
import Layout from './pages/layout/layout.component';
import Dashboard from './pages/dashboard/dashboard.component';
import Transaction from './pages/transactions/transactions.component';
import Settings from './pages/settings/settings.component';
import Login from './pages/login/login.component';
import ProtectedRoute from './utils/protected-route.util';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store/store';
import { initApp } from './utils/app-init.util';
import History from './pages/history/history.component';
import Insights from './pages/insights/insights.component';
import BucketsPage from './pages/buckets/buckets.component';
import BucketPage from './pages/bucket/bucket.components';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unsub = initApp(dispatch);
    return () => unsub();
  }, [dispatch]);

  return (
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
  );
}

export default App;
