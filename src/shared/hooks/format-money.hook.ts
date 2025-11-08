import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { Currency } from '@api/types';
import { selectSettingsCurrency } from '@store/settings-store';

// A simple formatting util — this stays pure
function formatMoney(n: number | null | undefined, currency: Currency) {
  const isRON = currency === 'RON';
  const symbol = isRON ? 'RON' : '€';
  if (n == null) return '—';
  const sumWithCurrency = isRON ? `${n.toFixed(2)} ${symbol}` : `${symbol}${n.toFixed(2)}`;
  return sumWithCurrency;
}

// The hook that reads currency & language from Redux
export function useFormatMoney() {
  const currency = useSelector(selectSettingsCurrency);

  return useCallback((n: number | null | undefined) => formatMoney(n, currency), [currency]);
}
