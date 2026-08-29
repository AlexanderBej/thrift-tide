import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import { V3SuccessFeedback, useCompactSuccessFeedback } from '../../ui/v3-success-feedback';

import './capture-feedback-provider.styles.scss';

const AUTO_DISMISS_MS = 6400;

interface CaptureFeedbackSession {
  count: number;
  date: string;
  from: string;
  active: boolean;
}

interface CaptureFeedbackContextValue {
  continuationDate: string | null;
  showExpenseAdded: (payload: { date: string; from: string }) => void;
  endCaptureSession: () => void;
}

const CaptureFeedbackContext = createContext<CaptureFeedbackContextValue | null>(null);

export const CaptureFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation('budget');
  const tt = useCallback((key: string, options?: any) => t(key, options) as unknown as string, [t]);
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<CaptureFeedbackSession | null>(null);
  const [visible, setVisible] = useState(false);
  const [revealPath, setRevealPath] = useState<string | null>(null);
  const compact = useCompactSuccessFeedback(900, visible ? session?.count : undefined);

  const dismiss = useCallback(() => {
    setVisible(false);
    setSession(null);
    setRevealPath(null);
  }, []);

  const showExpenseAdded = useCallback(({ date, from }: { date: string; from: string }) => {
    setSession((prev) => ({
      count: prev?.active ? prev.count + 1 : 1,
      date,
      from,
      active: true,
    }));
    setVisible(false);
    setRevealPath(from);
  }, []);

  const endCaptureSession = useCallback(() => {
    setVisible(false);
    setSession(null);
    setRevealPath(null);
  }, []);

  const handleAddAnother = useCallback(() => {
    if (!session) return;
    setVisible(false);
    setSession((prev) => (prev ? { ...prev, active: true } : prev));
    navigate('/transactions/new', { state: { from: session.from } });
  }, [navigate, session]);

  useEffect(() => {
    if (!visible) return undefined;
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [dismiss, visible, session?.count]);

  useEffect(() => {
    if (location.pathname === '/login') dismiss();
  }, [dismiss, location.pathname]);

  useEffect(() => {
    if (!session || !revealPath || visible) return undefined;

    const currentPath = `${location.pathname}${location.search}`;
    if (currentPath !== revealPath && location.pathname !== revealPath) return undefined;

    const frame = window.requestAnimationFrame(() => {
      setVisible(true);
      setRevealPath(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search, revealPath, session, visible]);

  const value = useMemo<CaptureFeedbackContextValue>(
    () => ({
      continuationDate: session?.active ? session.date : null,
      showExpenseAdded,
      endCaptureSession,
    }),
    [endCaptureSession, session?.active, session?.date, showExpenseAdded],
  );

  const message = session
    ? tt('capture.success.expenseAdded', { count: session.count })
    : tt('capture.success.expenseAdded', { count: 1 });

  return (
    <CaptureFeedbackContext.Provider value={value}>
      {children}
      {visible && session && (
        <div
          className={clsx('capture-feedback-layer', compact && 'capture-feedback-layer--compact')}
        >
          <V3SuccessFeedback
            key={session.count}
            message={message}
            actionLabel={compact ? tt('capture.success.addAnother') : undefined}
            compact={compact}
            onAction={compact ? handleAddAnother : undefined}
          />
        </div>
      )}
    </CaptureFeedbackContext.Provider>
  );
};

export function useCaptureFeedback() {
  const context = useContext(CaptureFeedbackContext);
  if (!context) {
    throw new Error('useCaptureFeedback must be used within CaptureFeedbackProvider');
  }
  return context;
}
