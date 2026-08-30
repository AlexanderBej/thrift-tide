import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS, ro } from 'date-fns/locale';
import { FiMoreHorizontal, FiX } from 'react-icons/fi';
import { FaChevronLeft } from 'react-icons/fa';
import clsx from 'clsx';

import { MonthDoc, Txn } from '@api/models';
import {
  EXPENSE_GROUP_OPTIONS,
  getAllExpenseGroupOptions,
  ResolvedExpenseGroupOption,
  toYMD,
} from '@shared/utils';
import { Button, PageSpinner } from '@shared/ui';
import { ExpenseGroupIcon } from '@shared/components';
import { selectAuthUser } from '@store/auth-store';
import {
  addTxnThunk,
  deleteTxnFromMonthThunk,
  loadTxnForEditThunk,
  selectBudgetDoc,
  selectBudgetTxns,
  updateTxnInMonthThunk,
} from '@store/budget-store';
import {
  selectCapturePreferences,
  selectSettingsCurrency,
  updateCapturePreferencesThunk,
} from '@store/settings-store';
import { AppDispatch } from '@store/store';
import { ConfirmSheet } from '@widgets';
import { useCaptureFeedback } from '@shared/providers';
import { DateSelector, GroupSelector, SelectorRow } from '../../features/capture';
import {
  buildExpensePayload,
  CaptureErrors,
  CaptureFormState,
  CaptureView,
  createEmptyCaptureForm,
  dateFromYmd,
  deriveRecentGroups,
  formFromTxn,
  getCaptureDateBounds,
  getCategoryForExpenseGroup,
  hasCaptureErrors,
  isDateAllowed,
  isToday,
  isYesterday,
  parseAmount,
  validateCaptureForm,
} from './capture-expense.util';

import './capture-expense.styles.scss';

type LocationState = {
  from?: string;
};

const CaptureExpense: React.FC = () => {
  const { t, i18n } = useTranslation(['budget', 'common', 'taxonomy']);
  const tt = useCallback((key: string, options?: any) => t(key, options) as unknown as string, [t]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { month, txnId } = useParams();

  const user = useSelector(selectAuthUser);
  const currentDoc = useSelector(selectBudgetDoc);
  const currentTxns = useSelector(selectBudgetTxns);
  const currency = useSelector(selectSettingsCurrency);
  const capturePreferences = useSelector(selectCapturePreferences);
  const { continuationDate, endCaptureSession, showExpenseAdded } = useCaptureFeedback();

  const isEdit = !!month && !!txnId;
  const noteExpandedByDefault = capturePreferences.noteExpandedByDefault ?? false;
  const fallbackPath = (location.state as LocationState | null)?.from ?? '/transactions';
  const continuationDateValue = useMemo(
    () => (!isEdit && continuationDate ? dateFromYmd(continuationDate) : undefined),
    [continuationDate, isEdit],
  );

  const [view, setView] = useState<CaptureView>('form');
  const [form, setForm] = useState<CaptureFormState>(() =>
    createEmptyCaptureForm(noteExpandedByDefault, currentDoc, continuationDateValue),
  );
  const [initialForm, setInitialForm] = useState<CaptureFormState>(() =>
    createEmptyCaptureForm(noteExpandedByDefault, currentDoc, continuationDateValue),
  );
  const [editDoc, setEditDoc] = useState<MonthDoc | null>(null);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    isEdit ? 'loading' : 'ready',
  );
  const [errors, setErrors] = useState<CaptureErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [didInitAddForm, setDidInitAddForm] = useState(false);

  const activeDoc = isEdit ? editDoc : currentDoc;
  const dateBounds = useMemo(() => getCaptureDateBounds(activeDoc), [activeDoc]);
  const selectedCategory = getCategoryForExpenseGroup(form.expenseGroup);
  const amountValue = parseAmount(form.amount);
  const validAmount = Number.isFinite(amountValue) && amountValue > 0;

  const locale = useMemo(() => (i18n.language === 'ro' ? ro : enUS), [i18n.language]);

  const recentGroups = useMemo(() => deriveRecentGroups(currentTxns), [currentTxns]);

  const allGroups = useMemo(() => getAllExpenseGroupOptions(), []);
  const filteredGroups = useMemo(() => {
    const query = groupSearch.trim().toLowerCase();
    if (!query) return allGroups;

    return allGroups.filter((group) => {
      const label = tt(group.i18nLabel).toLowerCase();
      return label.includes(query) || group.value.toLowerCase().includes(query);
    });
  }, [allGroups, groupSearch, tt]);

  const submitLabel = useMemo(() => {
    if (isEdit) return tt('budget:capture.saveChanges');
    if (!validAmount) return tt('budget:capture.noAmount');
    if (!selectedCategory) return tt('budget:capture.noCat');

    const formatted = new Intl.NumberFormat(i18n.language === 'ro' ? 'ro-RO' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amountValue);

    return tt('budget:capture.saveAmount', { amount: formatted });
  }, [amountValue, currency, i18n.language, isEdit, tt, validAmount, selectedCategory]);

  const meaningfulDirty = useMemo(() => {
    const comparable = (state: CaptureFormState) => ({
      amount: state.amount.trim(),
      expenseGroup: state.expenseGroup,
      note: state.note.trim(),
      date: state.date ? toYMD(state.date) : '',
    });

    return JSON.stringify(comparable(form)) !== JSON.stringify(comparable(initialForm));
  }, [form, initialForm]);

  const canSubmit = useMemo(() => {
    const nextErrors = validateCaptureForm(form, dateBounds);
    return !hasCaptureErrors(nextErrors);
  }, [dateBounds, form]);

  useEffect(() => {
    if (isEdit || currentDoc == null || didInitAddForm) return;
    const next = createEmptyCaptureForm(noteExpandedByDefault, currentDoc, continuationDateValue);
    setForm((prev) => ({ ...next, noteExpanded: prev.noteExpanded }));
    setInitialForm(next);
    setDidInitAddForm(true);
  }, [continuationDateValue, currentDoc, didInitAddForm, isEdit, noteExpandedByDefault]);

  useEffect(() => {
    if (!isEdit || !user?.uuid || !month || !txnId) return;

    let alive = true;
    setLoadStatus('loading');
    dispatch(loadTxnForEditThunk({ uid: user.uuid, month, id: txnId }))
      .unwrap()
      .then(({ txn, doc }) => {
        if (!alive) return;
        const next = formFromTxn({ ...txn, date: txn.date } as Txn, noteExpandedByDefault);
        setForm(next);
        setInitialForm(next);
        setEditDoc(doc);
        setLoadStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setLoadStatus('error');
        setSubmitError(tt('budget:capture.errors.load'));
      });

    return () => {
      alive = false;
    };
  }, [dispatch, isEdit, month, noteExpandedByDefault, tt, txnId, user?.uuid]);

  const goBack = () => {
    navigate(fallbackPath, { replace: true });
  };

  const requestClose = () => {
    if (!meaningfulDirty) {
      endCaptureSession();
      goBack();
      return;
    }
    setDiscardOpen(true);
  };

  const updateNotePreference = (expanded: boolean) => {
    setForm((prev) => ({ ...prev, noteExpanded: expanded }));
    if (!user?.uuid) return;

    dispatch(
      updateCapturePreferencesThunk({
        uid: user.uuid,
        capturePreferences: { noteExpandedByDefault: expanded },
      }),
    );
  };

  const handleSubmit = async () => {
    if (submitting || !user?.uuid) return;

    const nextErrors = validateCaptureForm(form, dateBounds);
    setErrors(nextErrors);
    setSubmitError('');
    if (hasCaptureErrors(nextErrors)) return;

    const payload = buildExpensePayload(form);
    if (!payload) return;

    setSubmitting(true);
    try {
      if (isEdit && month && txnId) {
        await dispatch(
          updateTxnInMonthThunk({ uid: user.uuid, month, id: txnId, patch: payload }),
        ).unwrap();
      } else {
        await dispatch(addTxnThunk({ uid: user.uuid, txn: payload })).unwrap();
        showExpenseAdded({ date: payload.date, from: fallbackPath });
      }
      goBack();
    } catch {
      setSubmitError(tt('budget:capture.errors.saveAction'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.uuid || !month || !txnId || submitting) return;

    setSubmitting(true);
    try {
      await dispatch(deleteTxnFromMonthThunk({ uid: user.uuid, month, id: txnId })).unwrap();
      goBack();
    } catch {
      setSubmitError(tt('budget:capture.errors.delete'));
    } finally {
      setSubmitting(false);
    }
  };

  const selectGroup = (group: ResolvedExpenseGroupOption) => {
    setForm((prev) => ({ ...prev, expenseGroup: group.value }));
    setErrors((prev) => ({ ...prev, expenseGroup: undefined }));
    setView('form');
  };

  const selectDate = (date: Date) => {
    if (!isDateAllowed(date, dateBounds)) return;
    setForm((prev) => ({ ...prev, date }));
    setErrors((prev) => ({ ...prev, date: undefined }));
    setView('form');
  };

  const selectedGroup = allGroups.find((group) => group.value === form.expenseGroup);

  if (loadStatus === 'loading' || (!isEdit && !currentDoc)) return <PageSpinner />;

  if (loadStatus === 'error') {
    return (
      <main className="capture-page capture-page--center">
        <p className="capture-inline-error">{submitError}</p>
        <Button variant="secondary" onClick={goBack}>
          {t('common:actions.back')}
        </Button>
      </main>
    );
  }

  return (
    <main className="capture-page">
      <header className="capture-header">
        <Button
          variant="quiet"
          icon={view === 'form' ? FiX : FaChevronLeft}
          iconOnly
          ariaLabel={view === 'form' ? tt('budget:capture.close') : tt('common:actions.back')}
          onClick={view === 'form' ? requestClose : () => setView('form')}
        />
        <h1>
          {view === 'groups'
            ? t('budget:capture.expenseGroup')
            : view === 'date'
              ? t('budget:capture.date')
              : isEdit
                ? t('budget:capture.editExpense')
                : t('budget:capture.addExpense')}
        </h1>
        <div className="capture-header-right">
          {isEdit && view === 'form' && (
            <>
              <Button
                variant="quiet"
                icon={FiMoreHorizontal}
                iconOnly
                ariaLabel={tt('budget:capture.moreActions')}
                onClick={() => setDeleteMenuOpen((open) => !open)}
              />
              {deleteMenuOpen && (
                <div className="capture-overflow-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteMenuOpen(false);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    {t('budget:capture.deleteExpense')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {view === 'groups' ? (
        <GroupSelector
          groups={filteredGroups}
          groupedOptions={EXPENSE_GROUP_OPTIONS}
          selectedValue={form.expenseGroup}
          search={groupSearch}
          onSearch={setGroupSearch}
          onSelect={selectGroup}
        />
      ) : view === 'date' ? (
        <DateSelector value={form.date} bounds={dateBounds} locale={locale} onSelect={selectDate} />
      ) : (
        <>
          <section className="capture-body">
            <div className="capture-amount-block">
              <div className="capture-money-input">
                <span aria-hidden>{currency === 'RON' ? 'RON' : '€'}</span>
                <input
                  id="capture-amount"
                  name="amount"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.amount}
                  type="number"
                  placeholder="0"
                  aria-invalid={!!errors.amount}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, amount: event.target.value }));
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                />
              </div>
              <label htmlFor="capture-amount">{t('budget:modals.amount')}</label>
              {errors.amount && <p className="capture-field-error">{t(errors.amount)}</p>}
            </div>

            {recentGroups.length > 0 && (
              <section className="capture-section" aria-labelledby="capture-recent">
                <h2 id="capture-recent">{t('budget:capture.recent')}</h2>
                <div className="capture-recent-row">
                  {recentGroups.map((group) => (
                    <button
                      type="button"
                      key={group.value}
                      className={clsx('capture-chip', `capture-chip--${group.category}`, {
                        'capture-chip--selected': form.expenseGroup === group.value,
                      })}
                      onClick={() => selectGroup(group)}
                    >
                      {/* <TTIcon icon={group.icon} color={group.color} size={18} /> */}
                      <ExpenseGroupIcon expenseGroup={group} />
                      <span>{t(group.i18nLabel)}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="capture-section capture-section__gap">
              <SelectorRow
                label={tt('budget:capture.expenseGroup')}
                value={
                  selectedGroup ? tt(selectedGroup.i18nLabel) : tt('budget:capture.chooseGroup')
                }
                meta={
                  selectedCategory ? tt(`taxonomy:categoryNames.${selectedCategory}`) : undefined
                }
                icon={selectedGroup?.icon}
                labelColor={selectedGroup?.color}
                category={selectedCategory ?? undefined}
                error={errors.expenseGroup ? tt(errors.expenseGroup) : undefined}
                variant="group"
                onClick={() => setView('groups')}
              />

              <SelectorRow
                label={tt('budget:capture.date')}
                value={formatCaptureDate(form.date, locale, tt)}
                meta={dateBounds?.hasValidDate ? undefined : tt('budget:capture.noValidDate')}
                error={errors.date ? tt(errors.date) : undefined}
                variant="date"
                onClick={() => setView('date')}
              />
            </section>

            <section className="capture-section capture-note-section">
              {!form.noteExpanded ? (
                <Button
                  variant="quiet"
                  size="sm"
                  fullWidth
                  className="capture-note-add"
                  onClick={() => updateNotePreference(true)}
                >
                  {t('budget:capture.addNote')}
                </Button>
              ) : (
                <div className="capture-note-field">
                  <div className="capture-note-label-row">
                    <label htmlFor="capture-note">{t('budget:modals.note')}</label>
                    <button type="button" onClick={() => updateNotePreference(false)}>
                      {t('budget:capture.collapseNote')}
                    </button>
                  </div>
                  <textarea
                    id="capture-note"
                    name="note"
                    rows={2}
                    maxLength={MAX_NOTE_LENGTH_PLUS_BUFFER}
                    value={form.note}
                    aria-invalid={!!errors.note}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, note: event.target.value }));
                      if (errors.note) setErrors((prev) => ({ ...prev, note: undefined }));
                    }}
                    placeholder={tt('budget:capture.notePlaceholder')}
                  />
                  <div className="capture-note-meta">
                    {errors.note ? (
                      <p className="capture-field-error">{t(errors.note)}</p>
                    ) : (
                      <span>{form.note.length}/200</span>
                    )}
                  </div>
                </div>
              )}
            </section>
          </section>

          <footer className="capture-footer">
            {submitError && (
              <p className="capture-inline-error" role="alert">
                {submitError}
              </p>
            )}
            <Button
              size="lg"
              fullWidth
              disabled={!canSubmit}
              loading={submitting}
              haptic="medium"
              onClick={handleSubmit}
            >
              {submitLabel}
            </Button>
          </footer>
        </>
      )}

      <ConfirmSheet
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title={tt('budget:capture.discard.title')}
        description={tt('budget:capture.discard.text')}
        confirmLabel={tt('budget:capture.discard.confirm')}
        cancelLabel={tt('budget:capture.discard.cancel')}
        tone="discard"
        onConfirm={() => {
          endCaptureSession();
          goBack();
        }}
      />
      <ConfirmSheet
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={tt('budget:capture.delete.title')}
        description={tt('budget:capture.delete.text')}
        confirmLabel={tt('budget:capture.delete.confirm')}
        cancelLabel={tt('common:actions.cancel')}
        tone="destructive"
        loading={submitting}
        onConfirm={handleDelete}
      />
    </main>
  );
};

const MAX_NOTE_LENGTH_PLUS_BUFFER = 240;

function formatCaptureDate(
  date: Date | null,
  locale: Locale,
  t: (key: string, options?: any) => string,
) {
  if (!date) return t('budget:capture.chooseDate');
  if (isToday(date)) return `${t('common:dates.today')} · ${format(date, 'd MMMM', { locale })}`;
  if (isYesterday(date)) {
    return `${t('common:dates.yesterday')} · ${format(date, 'd MMMM', { locale })}`;
  }
  return format(date, 'd MMMM yyyy', { locale });
}

export default CaptureExpense;
