import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import Picker from 'react-mobile-picker';

import { BaseSheet } from '@shared/ui';
import { AppDispatch } from '@api/types';
import { selectAuthUser } from '@store/auth-store';
import { HistoryRow, loadRecentMonths, selectHistoryRecents } from '@store/history-store';
import { changeMonthThunk, selectBudgetMonth } from '@store/budget-store';
import { formatMonth } from '@shared/utils';

import './period-sheet.styles.scss';

export interface PeriodWheelItem {
  key: string;
  title: string;
  subtitle?: string;
  badge?: string;
  kind?: 'period' | 'createNext';
}

type PickerValue = { period: string };

interface PeriodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemHeight?: number;
  visibleItems?: number;
  closeOnConfirm?: boolean;
}

const buildSubtitle = (m: any) => {
  const start = new Date(m.periodStart);
  const end = new Date(m.periodEnd);

  const y1 = start.getFullYear();
  const y2 = end.getFullYear();

  if (y1 !== y2) {
    return `${format(start, 'd MMMM')} ${y1} – ${format(end, 'd MMMM')} ${y2}`;
  }
  return `${format(start, 'd MMMM')} – ${format(end, 'd MMMM')} ${y1}`;
};

const PeriodSheet: React.FC<PeriodSheetProps> = ({
  open,
  onOpenChange,
  itemHeight = 54,
  visibleItems = 5,
  closeOnConfirm = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectAuthUser);
  const month = useSelector(selectBudgetMonth);
  const recents = useSelector(selectHistoryRecents);

  const items: PeriodWheelItem[] = useMemo(() => {
    if (!recents) return [];

    const sorted = [...recents].sort(
      (a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime(),
    );

    const periodItems: PeriodWheelItem[] = sorted.map((m: any) => ({
      key: m.id,
      kind: 'period',
      title: formatMonth(m.month),
      subtitle: buildSubtitle(m),
      badge: m.id === month ? 'Current' : undefined,
    }));

    // append special action row
    periodItems.push({
      key: '__create_next__',
      kind: 'createNext',
      title: 'Create next period',
      subtitle: 'Set up income & allocations for the upcoming period',
    });

    return periodItems;
  }, [recents, month]);

  // local highlighted key (UI)
  const [value, setValue] = useState<PickerValue>({ period: month });

  // 1) Load recents when sheet opens
  useEffect(() => {
    if (!open) return;
    if (!user?.uuid) return;
    if (!recents) dispatch(loadRecentMonths({ uid: user.uuid }));
  }, [open, user?.uuid, recents, dispatch]);

  // 2) Whenever sheet opens OR items change, ensure current selection is valid
  useEffect(() => {
    if (!open) return;
    if (!items.length) return;

    const keys = new Set(items.map((x) => x.key));

    // Prefer current month if present in items; otherwise keep current value if valid; otherwise first item
    const preferred =
      (month && keys.has(month) && month) ||
      (value.period && keys.has(value.period) && value.period) ||
      items[0].key;

    setValue({ period: preferred });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items, month]); // intentionally not depending on value.period to avoid loops

  const selectedKey = value.period;

  const handleConfirm = async () => {
    if (!user?.uuid) return;
    if (!selectedKey) return;

    if (closeOnConfirm) onOpenChange(false);

    if (selectedKey !== month) {
      await dispatch(changeMonthThunk({ uid: user.uuid, month: selectedKey })).unwrap();
    }
  };

  const pickerHeight = itemHeight * visibleItems;

  console.log('items', items);

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Select a period"
      btnLabel="Select period"
      btnDisabled={!items.length || !selectedKey}
      onButtonClick={handleConfirm}
    >
      <div className="tt-picker">
        {/* 3) Guard: don't render Picker until items exist */}
        {items.length ? (
          <Picker
            value={value}
            onChange={(next: PickerValue) => {
              // react-mobile-picker will give { period: '...' }
              // keep it strict so it never becomes undefined
              if (next?.period) setValue(next);
            }}
            wheelMode="natural"
            height={pickerHeight}
            itemHeight={itemHeight}
          >
            <Picker.Column name="period">
              {items.map((it) => (
                <Picker.Item key={it.key} value={it.key}>
                  {({ selected }) => (
                    <div
                      className={clsx(
                        'tt-picker__row',
                        selected && 'is-selected',
                        it.kind === 'createNext' && 'is-action',
                      )}
                    >
                      <div className="tt-picker__title">
                        {it.title}
                        {it.badge ? <span className="tt-picker__badge">{it.badge}</span> : null}
                      </div>
                      {it.subtitle ? <div className="tt-picker__sub">{it.subtitle}</div> : null}
                    </div>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          </Picker>
        ) : (
          <div style={{ height: pickerHeight, display: 'grid', placeItems: 'center' }}>
            Loading periods…
          </div>
        )}

        <div className="tt-picker__center" aria-hidden />
        <div className="tt-picker__fade tt-picker__fade--top" aria-hidden />
        <div className="tt-picker__fade tt-picker__fade--bottom" aria-hidden />
      </div>
    </BaseSheet>
  );
};

export default PeriodSheet;
