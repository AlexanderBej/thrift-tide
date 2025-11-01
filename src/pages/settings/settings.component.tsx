import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { AppDispatch } from '../../store/store';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { setPercentsThunk } from '../../store/budget-store/budget.slice';
import {
  selectBudgetDoc,
  selectBudgetMutateStatus,
} from '../../store/budget-store/budget.selectors.base';
import { Donut, DonutItem } from '../../components-ui/charts/donut.component';
import { getCssVar } from '../../utils/style-variable.util';
import FormInput from '../../components-ui/form-input/form-input.component';
import Button from '../../components-ui/button/button.component';
import ConfirmationModal from '../../components/confirmation-modal/confirmation-modal.component';
import { useWindowWidth } from '../../utils/window-width.hook';

import './settings.styles.scss';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation(['common', 'budget']);

  const user = useSelector(selectAuthUser);
  const doc = useSelector(selectBudgetDoc);
  const mutateStatus = useSelector(selectBudgetMutateStatus);

  const defaultNeedsPct = doc?.percents.needs ?? 0.5;
  const defaultWantsPct = doc?.percents.wants ?? 0.3;
  const defaultSavingsPct = doc?.percents.savings ?? 0.2;

  const [needsPercents, setNeedsPercents] = useState(defaultNeedsPct);
  const [wantsPercents, setWantsPercents] = useState(defaultWantsPct);
  const [savingsPercents, setSavingsPercents] = useState(defaultSavingsPct);

  const total = needsPercents + wantsPercents + savingsPercents;
  const balanced = Math.abs(total - 1) < 0.0001;

  const width = useWindowWidth();
  const isMobile = width < 480;

  const haveChanged =
    !balanced ||
    needsPercents !== defaultNeedsPct ||
    wantsPercents !== defaultWantsPct ||
    savingsPercents !== defaultSavingsPct;

  const donutItems: DonutItem[] = [
    {
      id: 'needs',
      label: 'Needs',
      value: needsPercents * 100,
      color: getCssVar('--needs'),
    },
    {
      id: 'wants',
      label: 'Wants',
      value: wantsPercents * 100,
      color: getCssVar('--wants'),
    },
    {
      id: 'savings',
      label: 'Savings',
      value: savingsPercents * 100,
      color: getCssVar('--savings'),
    },
  ];

  const savePercents = () => {
    if (!user?.uuid || !doc) return;
    dispatch(
      setPercentsThunk({
        uid: user.uuid,
        percents: { needs: needsPercents, wants: wantsPercents, savings: savingsPercents },
      }),
    );
  };

  const resetData = () => {
    setNeedsPercents(defaultNeedsPct);
    setWantsPercents(defaultWantsPct);
    setSavingsPercents(defaultSavingsPct);
  };

  return (
    <div className="settings-page">
      <section className="settings-page-section">
        <h2 className="card-header">{t('pageContent.settings.pref') ?? 'Budget Preferences'}</h2>
        <p className="settings-label">
          {t('pageContent.settings.adjust') ?? 'Adjust your 50/30/20 split'}
          <span
            style={{
              fontSize: 18,
              color:
                total === 1
                  ? getCssVar('--success')
                  : total > 1
                    ? getCssVar('--error')
                    : getCssVar('--warning'),
            }}
          >
            {(total * 100).toFixed(0)}%
          </span>
        </p>

        <div className="budget-preferences-row">
          <div className="budget-sliders">
            {(['needs', 'wants', 'savings'] as const).map((key) => {
              const stateSetters: any = {
                needs: setNeedsPercents,
                wants: setWantsPercents,
                savings: setSavingsPercents,
              };
              const val =
                key === 'needs' ? needsPercents : key === 'wants' ? wantsPercents : savingsPercents;
              const setVal = stateSetters[key];
              return (
                <FormInput
                  key={key}
                  label={`${key === 'needs' ? (t('budget:bucketNames.needs') ?? 'Needs') : key === 'wants' ? (t('budget:bucketNames.wants') ?? 'Wants') : (t('budget:bucketNames.savings') ?? 'Savings')} (${(val * 100).toFixed(0)}%)`}
                  name="slider"
                  value={val}
                  inputType="range"
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e: { target: { value: any } }) => setVal(Number(e.target.value))}
                  customClassName="settings-slider"
                />
              );
            })}
          </div>
          <div className="donut-container">
            <Donut height={isMobile ? 60 : 250} showTooltip={false} data={donutItems} />
          </div>
        </div>

        <div className="settings-action-btns">
          <ConfirmationModal
            buttonLabel={t('actions.save') ?? 'Save'}
            message={
              t('confirmations.percentages') ?? 'Are you sure you want to change the percentages?'
            }
            handleConfirm={savePercents}
            loading={mutateStatus === 'loading'}
          />
          <Button
            buttonType="secondary"
            htmlType="button"
            onClick={resetData}
            disabled={!haveChanged}
          >
            <span>{t('actions.reset') ?? 'Reset'}</span>
          </Button>
        </div>
      </section>

      {/* <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Account</h2>

        <div>
          Display: Profile picture (user.photoURL) Display name / email Option: “Sign out”
          (Optional) Change display name (if you allow updates in Firestore) (Optional) Delete
          account (if you wire Firebase delete) If you integrate providers: Show “Connected with
          Google” or similar.
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={user.photoURL ?? ''}
              alt=""
              width={48}
              height={48}
              style={{ borderRadius: '50%' }}
            />
            <div>
              <div>{user.displayName}</div>
              <div style={{ opacity: 0.7 }}>{user.email}</div>
            </div>
          </div>
        )}
        <button onClick={signOutUser} style={{ marginTop: 12 }}>
          Sign out
        </button>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>App</h2>
        <div>
          Ideas: Theme: Light / Dark toggle Currency format: USD / EUR / etc. Language (if you plan
          to localize) Start week on: Monday / Sunday Show onboarding again / Reset demo data
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" /> Dark mode
        </label>
      </section> */}
    </div>
  );
};

export default Settings;
