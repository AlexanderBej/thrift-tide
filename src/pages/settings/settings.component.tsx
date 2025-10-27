import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { setPercentsThunk } from '../../store/budget-store/budget.slice';
import { signOutUser } from '../../api/services/auth.service';
import { selectBudgetDoc } from '../../store/budget-store/budget.selectors.base';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);
  const doc = useSelector(selectBudgetDoc);

  const [needs, setNeeds] = useState(doc?.percents.needs ?? 0.5);
  const [wants, setWants] = useState(doc?.percents.wants ?? 0.3);
  const [savings, setSavings] = useState(doc?.percents.savings ?? 0.2);

  const total = needs + wants + savings;
  const balanced = Math.abs(total - 1) < 0.0001;

  const savePercents = () => {
    if (!user?.uuid || !doc) return;
    dispatch(setPercentsThunk({ uid: user.uuid, percents: { needs, wants, savings } }));
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Settings</h1>
      <div>
        Income Source (optional note or label — “Monthly salary”, etc.) Default income (optional
        base value) Custom percentages: Needs (%) Wants (%) Savings (%) When these change → dispatch
        setPercentsThunk (and maybe setIncomeThunk). UI ideas: A donut preview that updates live as
        they change sliders. Sliders with total = 100%. Save button → persists to Firestore
        monthDoc.percents.
      </div>
      {/* Budget Preferences */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Budget Preferences</h2>
        <p>Adjust your 50/30/20 split</p>

        {(['needs', 'wants', 'savings'] as const).map((key) => {
          const stateSetters: any = { needs: setNeeds, wants: setWants, savings: setSavings };
          const val = key === 'needs' ? needs : key === 'wants' ? wants : savings;
          const setVal = stateSetters[key];
          return (
            <div key={key} style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', textTransform: 'capitalize' }}>
                {key} ({(val * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={val}
                onChange={(e) => setVal(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          );
        })}
        <div>Total: {(total * 100).toFixed(0)}%</div>
        <button onClick={savePercents} disabled={!balanced} style={{ marginTop: 12 }}>
          Save
        </button>
      </section>

      {/* Account */}
      <section style={{ marginTop: 32 }}>
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

      {/* App preferences */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>App</h2>
        <div>
          Ideas: Theme: Light / Dark toggle Currency format: USD / EUR / etc. Language (if you plan
          to localize) Start week on: Monday / Sunday Show onboarding again / Reset demo data
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" /> Dark mode
        </label>
      </section>
    </div>
  );
};

export default Settings;
