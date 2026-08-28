# PROJECT_CONTEXT.md

Evolving product and architecture context for Thrift Tide. For durable agent workflow rules, read `AGENTS.md`.

## Product Overview

Thrift Tide is a mobile-first personal budgeting PWA for tracking income, expenses, budget allocation, and spending pace across custom monthly periods.

The core budgeting concept is a three-bucket model:

- `needs`
- `wants`
- `savings`

Users authenticate with Google, complete or skip onboarding, choose language/currency/default split/start day, add income, record expenses, group expenses, review category health, view insights, switch budget periods, and browse historical summaries.

Current implemented areas:

- Dashboard: current remaining budget, spent/allocated totals, category cards, smart insight, and top expense groups.
- Transactions: filters, search, sort, grouped transaction list, swipe edit/delete, add/edit expense sheet.
- Categories: category health and category information.
- Category detail: category progress, insights, top groups, pace/timeline, recent transactions.
- Insights: smart insight carousel, category health, top spenders.
- History: month summary accordion, spend bars/donut, historical insights, pagination.
- Profile: user info, quick links, language/currency/theme/budget split/start day settings, logout.
- Onboarding: language/currency, budget split, and budget start day setup.

## Product Principles

- Mobile-first.
- Recording an expense is a core high-frequency action.
- Expense capture should be fast, reliable, and low friction.
- The app should help users maintain the habit of keeping their budget current.
- Reliability and speed of capture are currently higher priority than adding more analytics or visual complexity.
- Future ideas must be clearly separated from current implementation.

## Current Application Structure

Main routes are defined in `src/App.tsx`:

- `/login`
- `/onboarding`
- `/`
- `/transactions`
- `/categories`
- `/categories/:type`
- `/insights`
- `/history`
- `/profile`

`src/pages/layout/layout.component.tsx` provides the authenticated app shell with `TopNav`, a scrollable outlet, and `BottomNav`. The bottom navigation currently exposes Dashboard, Transactions, Insights, Profile, and a central FAB that opens `AddActionSheet`. Categories and History are reachable through other surfaces such as Profile quick actions and route navigation.

Important UI areas:

- Pages: `src/pages`
- Feature components: `src/features`
- Widgets/navigation/sheets: `src/widgets`
- Shared UI primitives: `src/shared/ui`
- Shared components/hooks/utils: `src/shared/components`, `src/shared/hooks`, `src/shared/utils`

## Budget and Period Model

The primary types are in:

- `src/api/models/month-doc.ts`
- `src/api/models/txn.ts`
- `src/api/models/user.ts`
- `src/api/types/percent.types.ts`
- `src/api/types/settings.types.ts`

Each budget period is represented by a month document. The month key is a `YYYY-MM` string, but the budget period can cross calendar-month boundaries depending on `startDay`.

Important fields on `MonthDoc`:

- `month`
- `income`
- `percents`
- `allocations`
- `startDay`
- `periodStart`
- `periodEnd`
- `summary`

Important invariants:

- `startDay` is constrained to `1..28`.
- `periodStart` and `periodEnd` are frozen per month document.
- `periodEnd` is exclusive.
- `allocations` are derived from income and percents.
- Transactions use canonical `YYYY-MM-DD` dates.
- Current-period screens derive live calculations from loaded transactions.
- History relies on persisted month summaries for efficient display.

Period utilities live in `src/shared/utils/period.util.ts` and related formatting/service utilities in `src/shared/utils`.

## Data Architecture

Authentication uses Firebase Auth. Firebase setup is in `src/api/services/firebase.service.ts`.

Firestore layout:

- `users/{uid}` stores profile/settings fields such as display name, email, photo URL, currency, default percents, start day, language, theme, and onboarding status.
- `users/{uid}/months/{month}` stores period documents.
- `users/{uid}/months/{month}/transactions/{txn}` stores transactions for that period.

Redux slices:

- `src/store/auth-store/auth.slice.ts`
- `src/store/settings-store/settings.slice.ts`
- `src/store/budget-store/budget.slice.ts`
- `src/store/history-store/history.slice.ts`

Important selector-derived state:

- Budget totals, in-period transactions, transaction groups, category panels, top expense groups, badges, and smart insights live under `src/store/budget-store`.
- History rows and historical smart insights live under `src/store/history-store`.

Persistence services:

- `src/api/services/auth.service.ts`
- `src/api/services/settings.service.ts`
- `src/api/services/budget.service.ts`

Current history behavior depends on mutation paths recomputing and persisting summaries after transaction/income/allocation changes.

## Design System

Styling uses SCSS imported through the normal CRACO pipeline. Theme colors are runtime CSS custom properties, not generated stylesheet bundles.

Current styling files and responsibilities:

- Color/theme source: `src/styles/global.scss`
- Structural Sass constants: `src/styles/_variables.scss`
- Structural Sass helpers: `src/styles/_mixins.scss`
- Runtime theme utilities: `src/shared/utils/theme/theme.util.ts` and `src/shared/utils/theme/theme-listener.util.ts`
- Initial theme boot hint: `public/index.html`

Current theme behavior:

- Light mode values are declared as CSS custom property defaults under `:root`.
- Dark mode values override those properties under `[data-theme='dark']`.
- Runtime theme state is represented by `data-theme="light|dark"` on the root `<html>` element.
- Components consume theme-aware colors with semantic CSS variables such as `var(--...)`.
- Theme switching changes `data-theme`; CSS custom properties resolve automatically.
- There is no runtime stylesheet swapping.
- There are no generated `public/light.css` / `public/dark.css` theme files.
- There are no `theme.light.scss` / `theme.dark.scss` theme entry files.
- There is no separate Sass theme-generation or watch pipeline.
- Sass remains in use for structural/static constants such as spacing, typography constants, radii, breakpoints, transitions, dimensions, and mixins.

Theme persistence/system nuance:

- The persisted `Theme` type currently supports explicit `light` and `dark`.
- The application persists the user's selected theme through settings/Firestore and localStorage boot behavior.
- OS preference is used as an initial fallback when no explicit theme is available.
- The application does not currently expose a true persisted `system` theme option.
- Dynamic OS theme changes are observed in existing code but are not currently applied as the active app theme.

General visual language:

- Mobile app shell with top nav, bottom nav, and FAB.
- Rounded cards/buttons/sheets.
- Needs/wants/savings category colors.
- Tone colors for success/warning/error/info-style insight states.
- Shared primitives for sheets, buttons, inputs, radios, progress bars, carousels, accordions, icons, spinners, info blocks, and charts.

V3 visual/theme direction:

- The current CSS custom-property theme architecture is considered a good foundation for V3.
- V3 is expected to evolve the semantic token vocabulary rather than rewrite the theme mechanism.
- Brand, action/interface, status, and needs/wants/savings semantics should remain conceptually separate.
- The final V3 logo and palette are still in development.
- Do not hard-code future V3 brand values into components.

## Internationalization

i18n is configured in `src/i18n/i18n.ts`.

Supported languages:

- English (`en`)
- Romanian (`ro`)

Namespaces:

- `common`
- `budget`
- `insights`
- `settings`
- `onboarding`
- `taxonomy`
- `history`

Supported currencies:

- `EUR`
- `RON`

Locale-sensitive behavior exists for dates/month labels and money formatting. Future UI work should avoid hard-coded English strings and should test Romanian layouts on narrow screens.

## Current Interaction Architecture

Current implementation:

- Pages/routes handle primary navigation.
- Secondary mobile interactions commonly use sheets.
- `BaseSheet` in `src/shared/ui/base-sheet` wraps Vaul `Drawer`.
- `AddActionSheet` in `src/widgets/sheets/action-sheet` is a multi-step sheet using `SliderViewport`.
- `AddExpense` nests another `SliderViewport` for form vs date picker.
- `AddIncome` is currently part of `AddActionSheet`.
- `TxnDayPicker` uses `react-day-picker` inside the expense sheet.
- `PeriodSheet` uses `react-mobile-picker`.
- Settings sheets use `BaseSheet` for language, currency, theme, split, and start day.

Intended redesign direction is not implemented yet: Add/Edit Expense may become a dedicated full-screen mobile workflow rather than a bottom sheet.

## Known Sheet/Mobile Problems

Durable conclusions from repository inspection:

- `BaseSheet` currently serves too many interaction types.
- Complex Add Expense/Edit Expense flow nests structural sliders.
- Nested dynamic measurements are fragile.
- Keyboard/visual viewport changes can interact badly with measured slider heights.
- `.sheet-content` scroll ownership/layout needs cleanup.
- `BaseSheet` emits `sheet-compact`, but the SCSS targets `.compact`; this mismatch is a confirmed bug.
- Add/Edit Expense is the highest-risk current sheet workflow.
- Evidence does not currently justify replacing Vaul. Application architecture and CSS constraints are the larger problem.

## Established UX/Architecture Decisions

### Sheets

Sheets remain an accepted mobile pattern for bounded/contextual interactions, including:

- Sort
- Confirmation
- Language
- Currency
- Theme
- Period selection
- Suitable settings/selectors

### Structural Sliders

Do not place structural multi-step `SliderViewport` flows inside sheets. A structural slider moves between meaningful workflow steps whose contents have substantially different heights.

Horizontal chips, carousels, or presentation-only horizontal scrolling are not prohibited merely because they slide horizontally.

### Complex Workflows

Substantial workflows should be considered for full-screen surfaces/routes instead of being forced into a bottom sheet.

Current candidates:

- Add Expense
- Edit Expense
- Add Income

No final redesigned UX has been implemented yet.

### Do Not Prematurely Repair Soon-To-Be-Removed Flows

Before spending significant effort repairing the current `AddActionSheet`/`AddExpense` nested-slider architecture, check whether the active task intends to replace that architecture. Do not optimize a flow that the current redesign intends to remove.

### Vaul

Keep Vaul unless implementation evidence later shows that Vaul itself is the source of a concrete limitation. Current audit evidence indicates that application architecture/CSS usage is the larger problem.

## Current Product Direction

### 1. Expense Capture Redesign

Immediate direction under discussion: explore making Add/Edit Expense a dedicated full-screen mobile workflow rather than a sheet.

Likely goals:

- Faster entry
- Fewer taps
- Stable viewport layout
- Keyboard-safe behavior
- No structural slider inside a bottom sheet
- Easy editing reuse
- Potential direct deep linking

The final design is not yet decided.

### 2. Income Interaction

Reconsider whether Add Income belongs alongside Add Expense as an equally prominent FAB action. Income is generally lower-frequency than expense capture. The final entry point is not yet decided.

### 3. Reminder/Re-Engagement System

Future product goal: help users remember to keep expenses current.

Potential mechanisms under consideration:

- PWA push notifications
- Reminder preferences
- Catch-up reminders
- Weekly summaries
- Potential email summaries later

These are future concepts, not current implemented capabilities.

## Known Confirmed Issues

Confirmed from repository inspection:

- Duplicate/unmanaged transaction listener during initialization: `initBudget` starts the managed listener and `initApp` attaches another `onTransactionsSnapshot` listener.
- PWA update listener is registered during render in `src/App.tsx`.
- Profile reset row incorrectly opens the language sheet in `src/pages/profile/profile.component.tsx`.
- Expense quick-date comparison uses weekday (`getDay`) rather than full date in `src/features/add-action/expense-form/expense-form.component.tsx`.
- History has zero-allocation division risks when computing category ratios in `src/pages/history/history.component.tsx`.
- Period "create next" flow uses plain calendar month logic instead of custom-period-aware `nextMonthKey` in `src/widgets/sheets/period-sheet/period-sheet.component.tsx`.
- Transaction sort label/behavior mismatch: sorting/grouping by expense group ultimately sorts groups by total in `src/store/budget-store/budget.selectors.ts`.
- `sheet-compact`/`.compact` selector mismatch in `BaseSheet` implementation and styles.

Speculative/runtime risks:

- Mobile keyboard behavior in complex sheets.
- Very short viewport overflow with date picker open.
- Long Romanian strings in compact mobile controls.
- Stale history summaries if data changes outside expected mutation paths.

## Things Worth Preserving

- Needs/wants/savings core model unless product requirements explicitly change it.
- Firestore nesting of month documents and month transactions.
- Frozen period boundaries on month documents.
- Selector-derived calculations.
- Historical summary approach.
- Mobile bottom navigation and FAB pattern, subject to expense-capture redesign.
- Shared mobile primitives where they fit the interaction.
- Existing insight system as a useful foundation.

## Current Priorities

Approximate current priority order:

1. Redesign/reliably implement high-frequency expense capture.
2. Simplify sheet responsibilities after complex workflows are removed.
3. Fix confirmed correctness/lifecycle bugs.
4. Improve habit/re-engagement mechanisms.
5. Address targeted i18n/accessibility/mutation-state polish.
6. Consider larger product extensions only after core capture/re-engagement is healthy.

This ordering can change with explicit product decisions.

## Future-Session Checklist

Before implementing a substantial feature:

1. Read `AGENTS.md`.
2. Read `PROJECT_CONTEXT.md`.
3. Inspect the actual affected implementation.
4. Determine whether the requested work changes an established product decision.
5. Identify data-model/migration implications before changing persistence.
6. Avoid reviving deprecated/problematic interaction patterns.
7. Keep the change scoped.
8. Update `PROJECT_CONTEXT.md` if a durable product or architecture decision changes.
