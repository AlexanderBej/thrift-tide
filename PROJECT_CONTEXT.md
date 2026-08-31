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

- Dashboard V3: financial hero, selected-period status, contextual insight, compact Budget Pulse, Recent Activity, and income entry in budget context.
- Transactions V3: selected-period ledger summary, filters/search, independent grouping and sorting, date or expense-group ledgers, and route-based expense editing.
- V3 Capture: full-screen Add/Edit Expense routes with expense-group-first classification.
- Categories V3 Overview: budget-map surface for selected-period allocation structure, Needs/Wants/Savings composition, expense-group previews, and drill-down navigation.
- Category detail V3: category activity drill-down for the selected period, focused on semantic category status, expense-group responsibility, and filtered Transactions handoff.
- Insights V3: multi-period analytical surface using up to the latest 6 usable closed-period summaries, with recent pattern, spending trend, budget outcomes, category patterns, savings consistency, and one pattern to watch.
- History V3: closed-period archive, newest-first persisted summaries, compact outcome cards, Needs/Wants/Savings usage, transaction-count metadata, missing-summary unavailable states, and pagination.
- Profile V3: compact account/settings hub with account identity, secondary Explore destinations, preferences, budget setup, data reset confirmation, and logout.
- Onboarding: language/currency, budget split, and budget start day setup.

## Product Principles

- Mobile-first.
- Recording an expense is a core high-frequency action.
- Expense capture should be fast, reliable, and low friction.
- The app should help users maintain the habit of keeping their budget current.
- Reliability and speed of capture are currently higher priority than adding more analytics or visual complexity.
- Future ideas must be clearly separated from current implementation.
- Do not use version prefixes such as V2/V3 for canonical UI components. Version prefixes may be temporary during migrations, but finalized components should be named by responsibility.

## Current Application Structure

Main routes are defined in `src/App.tsx`:

- `/login`
- `/onboarding`
- `/transactions/new`
- `/transactions/:month/:txnId/edit`
- `/`
- `/transactions`
- `/categories`
- `/categories/:type`
- `/insights`
- `/history`
- `/profile`

`src/pages/layout/layout.component.tsx` owns the authenticated app shell with `TopNav`, one central scrollable outlet, and `BottomNav`. The bottom navigation exposes Dashboard, Transactions, the central Add Expense action, Insights, and Profile as primary destinations/actions. Categories and History are secondary destinations, not BottomNav items, and are reachable through other surfaces such as Profile quick actions and route navigation.

Important UI areas:

- Pages: `src/pages`
- V3 Capture page: `src/pages/capture-expense`
- Feature components: `src/features`
- Widgets/navigation/sheets: `src/widgets`
- Shared UI primitives: `src/shared/ui`
- Shared components/hooks/utils: `src/shared/components`, `src/shared/hooks`, `src/shared/utils`

Authenticated shell contracts:

- `Layout` owns the TopNav and BottomNav sizing contract for authenticated routes.
- `.outlet-container` is the authenticated app's central vertical scroll owner.
- Top and bottom safe-area handling is owned by the shell.
- Page content reserves BottomNav clearance centrally through the shell instead of individual pages guessing navigation height.
- Explicit shell dimensions are used for TopNav/BottomNav spacing; the old undefined `--nav-h` pattern should not be reintroduced.

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
- Dashboard-ready budget context semantics live in `src/store/budget-store/budget-context.selectors.ts`, including selected-period phase, contextual attention priority, hero amount semantics, stale activity, and Budget Pulse row semantics.
- Insights historical analytical loading and selectors live under `src/store/insights-store`; Insights does not depend on the globally selected budget period.
- History archive rows and legacy historical smart insight selectors live under `src/store/history-store`.
- Insights uses persisted closed-period `MonthDoc.summary` snapshots only. It excludes missing summaries from analysis instead of fabricating values or reading historical transaction collections.

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
- V3 has begun in Capture and the app shell with scoped typography, semantic CSS-variable usage, fixed full-screen task layout where appropriate, and disciplined radii/spacing.
- V3 is expected to continue evolving the semantic token vocabulary rather than rewrite the theme mechanism.
- Brand, action/interface, status, and needs/wants/savings semantics should remain conceptually separate.
- The final V3 logo and palette are still in development.
- Do not hard-code future V3 brand values into components.

Shared action primitives:

- `Button` in `src/shared/ui/button` is the canonical application action component.
- The former `V3Action` component has been removed/migrated into `Button`; do not revive it.
- `Pressable` in `src/shared/ui/pressable` is a low-level tactile interaction primitive for non-standard interactive surfaces and wrappers. It is not a second styled button system.
- Semantic actions should use `Button` unless the interaction genuinely needs a lower-level tactile wrapper.
- Temporary V3/version prefixes should be removed once a replacement becomes canonical; finalized shared components should be named by responsibility.

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
- Dashboard V3 uses a calm, page-led layout rather than the old V2 widget stack.
- Dashboard V3 prioritizes the selected period's remaining or overspent amount, a safe period status line, one contextual insight, compact Needs/Wants/Savings pulse rows, and the latest selected-period transactions.
- Dashboard V3 selected-period context is phase-aware: future periods, current periods, the final valid day, and past periods are distinct states. Because `periodEnd` is exclusive, the last valid transaction day is `periodEnd - 1 day`.
- Dashboard V3 has one contextual attention slot. It prioritizes past selected period, future selected period, missing income, last day, stale activity, warning/danger smart insights, ordinary useful smart insights, then quiet positive copy.
- Dashboard V3 treats stale activity as a current-period habit signal after 3 days without a transaction; future-dated transactions do not create stale state.
- Dashboard V3 shows overspending honestly in text, such as an over-budget amount, without changing the transaction or month persistence model.
- Dashboard V3 Budget Pulse treats Needs/Wants as spending ceilings and Savings as a contribution goal. Savings above goal is positive, and text percentages may exceed 100% while visual progress remains capped.
- Dashboard V3 removed the old proportional Needs/Wants/Savings strip, Dashboard category accordion cards, and Dashboard top expense-group accordion with nested transaction rows.
- Dashboard V3 keeps deeper bucket health, spend-driver, pace, and transaction detail out of the Dashboard hero/pulse and in purpose-built surfaces such as Category detail, Insights, and Transactions.
- Dashboard owns current-period attention/coaching. Insights owns historical trend and pattern interpretation.
- Insights TopNav has no `PeriodWidget`, because the page analyzes closed periods rather than the selected period.
- Insights V3 uses up to the latest 6 usable closed-period summaries in chronological chart order. Missing summaries are excluded from calculations; History remains responsible for showing individual unavailable summary states.
- Rich merchant or expense-group historical analytics remain deferred because historical transaction reconstruction is intentionally avoided. Historical currency snapshotting is also unavailable, so Insights formats historical values with the current app currency setting.
- `BaseSheet` in `src/shared/ui/base-sheet` wraps Vaul `Drawer`.
- V3 Add Expense lives at `/transactions/new`.
- V3 Edit Expense lives at `/transactions/:month/:txnId/edit`.
- Add/Edit Expense are full-screen routes, not sheets.
- The central `+` opens Add Expense directly.
- The central Add Expense FAB remains a primary shell action.
- BottomNav primary destinations/actions are Dashboard, Transactions, Add Expense, Insights, and Profile.
- Categories and History are secondary destinations and are not BottomNav items.
- BottomNav uses semantic `NavLink` route targets, with `Pressable` only providing tactile behavior around the navigation surface.
- TopNav owns page identity, contextual Back navigation, and selected-period access.
- TopNav behavior is driven by lightweight route metadata rather than scattered pathname checks.
- Normal in-app Back behavior preserves browser/app history. Direct-entry or refreshed secondary routes use structural fallbacks where appropriate.
- Dashboard uses the Thrift Tide logo in the TopNav.
- Period visibility in TopNav is route-dependent.
- TopNav automatically collapses when the user deliberately scrolls down and reveals when scrolling upward.
- TopNav hide-on-scroll listens to `.outlet-container`, the authenticated app's actual scroll owner, rather than `window`.
- Small scroll movement is accumulated/thresholded to avoid jitter and flicker.
- Near the top of a page, TopNav remains visible.
- Changing routes restores TopNav visibility.
- Hiding TopNav collapses its occupied content height so pages gain vertical space; it is not merely visually translated away.
- The top safe-area inset remains reserved while TopNav is hidden.
- Hide/reveal uses a smooth slide/collapse/fade transition and respects `prefers-reduced-motion`.
- BottomNav does not hide with scroll.
- `PeriodWidget` remains a bounded sheet interaction for selected-period access.
- `PeriodWidget` trigger exposes accessible labeling and expanded state.
- Profile V3 is a compact account/settings hub, not a dashboard.
- Profile V3 groups account identity, Explore, Preferences, Budget setup, Data, and logout as simple mobile rows/sections instead of large dashboard-style cards.
- Profile V3 exposes Categories and History as secondary Explore destinations outside BottomNav.
- Profile V3 Preferences are Language, Currency, and Appearance. These atomic settings use bounded selection sheets with full-width selectable rows, selected state, and immediate save-on-selection. Appearance remains explicit Light/Dark only; no persisted `system` option is exposed.
- Profile V3 Budget setup includes Budget split and Period start day. Budget split keeps the existing Needs/Wants/Savings percentage constraints, compact composition preview, and explicit update action with apply timing.
- Profile V3 Period start day uses a numeric 1-28 wheel picker because the setting is a recurring day of month, not a calendar date.
- Profile V3 Reset current period uses the existing reset thunk behind a destructive `ConfirmSheet`. It deletes selected-period expenses and clears the saved summary while keeping income, budget split, and period settings in place.
- Profile logout waits for Firebase sign-out to resolve before navigating away, so local auth state is not eagerly cleared on sign-out failure.
- History V3 is a secondary Profile destination for past closed budget periods at a glance. It is not a Dashboard, trends page, historical Transactions page, or Category detail page.
- History V3 queries closed periods only, newest first, using persisted month documents and summary snapshots without reading historical transactions or creating transaction listeners.
- History V3 is summary-only: no accordion, inline expansion, donut, nested analytics panels, smart insight carousel, or transaction drill-down action.
- History V3 period cards show localized month/year, the actual historical period range, financial outcome, total spent versus income, total-budget usage progress, Needs/Wants/Savings allocation usage, and transaction count as metadata.
- History V3 keeps closed month docs visible when `summary` is missing by showing a compact unavailable state instead of silently filtering them out.
- Historical Transactions deep-link behavior is deferred until there is an explicit selected-period/deep-link contract.
- Capture no longer shows an explicit needs/wants/savings selector; `category` is derived from the selected `expenseGroup` and still persisted on `Txn`.
- Capture recent groups are derived from currently loaded period transactions.
- Capture remembers the note expanded/collapsed preference through optional `capturePreferences.noteExpandedByDefault` settings.
- Successful add-expense saves close Capture and show a global, non-blocking V3 success feedback over the destination page.
- Capture success feedback uses an animated success-colored circle/check treatment and includes an optional Add another action.
- Add another reopens `/transactions/new` as an implicit continuation of the same UI session; there is no explicit batch mode, Finish step, or "done" prompt.
- Continuation entries retain the date from the last saved expense, while amount, expense group, note, validation errors, and transient submit state reset.
- The UI session count drives singular/plural success copy such as one expense added vs multiple expenses added.
- Failed add-expense saves stay inside Capture, preserve the entered data, and show inline action-region error copy instead of global success feedback.
- Expense capture no longer uses structural `SliderViewport` flows.
- `PeriodSheet` uses `react-mobile-picker`.
- Settings sheets use `BaseSheet` for language, currency, theme, split, and start day.
- Income no longer shares the central FAB. The current interim income entry is close to the Dashboard V3 financial summary and the no-income setup state, both opening the bounded `IncomeSheet`.
- Dashboard V3 no-income state avoids meaningless zero-width budget visuals and prompts income setup before Budget Pulse appears.
- Dashboard V3 Recent Activity is derived from currently loaded selected-period transactions and updates naturally after Capture saves.
- Transactions V3 owns selected-period ledger findability and transaction management, not overall budget-health communication.
- Transactions V3 uses the selected budget period and shared budget-context semantics for current/past/future period state; it does not duplicate period-phase calculations locally.
- Transactions V3 removed the old Spent/Budget/Remaining/progress summary card. The page summary is the selected-period spent amount plus transaction count.
- Transactions V3 keeps search and Needs/Wants/Savings filters as local Redux UI state over already-loaded selected-period transactions; it does not issue Firestore search/filter queries.
- Transactions V3 stores grouping and sorting independently in `budget.ui`: `groupBy` is `date` or `expenseGroup`, while `sortKey` is `newest`, `oldest`, `amountDesc`, or `amountAsc`.
- Transactions V3 defaults to date grouping. Newest/oldest change date-group order, while amount sorting changes row order within each date group rather than flattening the ledger.
- Transactions V3 expense-group grouping orders groups by highest selected-period spend total; sorting only changes rows inside each expense-group section.
- Transactions V3 rows are whole-row disclosure targets. Tapping a transaction expands compact inline management actions instead of navigating immediately.
- Only one Transactions V3 ledger row can be expanded at once. Period changes or filter/search/grouping changes that remove the active transaction clear the expanded row.
- Transactions V3 inline Edit navigates to `/transactions/:month/:txnId/edit` and preserves the origin navigation state for Capture.
- Transactions V3 inline Delete opens the bounded confirmation interaction and then uses the selected-month transaction deletion path; deletion is not immediate.
- Row-level swipe edit/delete gestures remain removed from Transactions V3.
- Transactions V3 date-group rows use note as primary text when present and expense-group name as secondary text; expense-group-grouped rows avoid repeating the group name and focus on note/date/amount.
- Transactions V3 expense-group rows without a note show a localized muted no-note placeholder above the date rather than promoting the date or fabricating an expense-group label.
- V3 destructive and discard confirmations use the shared bounded `ConfirmSheet` pattern.
- V3 confirmations use specific action-oriented copy, restrained semantic danger styling, compact two-action hierarchy, and loading guards for async confirmation.
- Capture and Transactions share the same V3 confirmation language for deleting expenses; Capture dirty-close uses the same shared pattern for discarding unsaved changes.
- V3 app boot uses a single top-level branded loader owned by `App`, covering initial auth resolution through authenticated settings/budget boot.
- The branded AppLoader is app/auth bootstrap only; normal selected-period switching must keep the authenticated shell mounted and must not replay welcome copy.
- The branded boot loader follows existing app boot state from `selectAppBootState`; it does not change auth, settings, budget, routing, or Firestore listener semantics.
- Categories V3 Overview is the user's budget map, answering how the budget is organized and what belongs where. Dashboard owns quick health/status, Transactions owns ledger management, and future Insights V3 should own deeper analysis.
- Categories V3 Overview displays the selected period's planned budget amount from the MonthDoc income/budget basis and the selected period's stored Needs/Wants/Savings percentages; it does not use future default settings as a replacement for historical months.
- Categories V3 Overview uses one compact proportional allocation strip for structure only. It is not a spending-progress indicator.
- Categories V3 Overview keeps Needs/Wants/Savings as the top-level budget containers and previews the first three static expense groups in each category's taxonomy order, with a remaining-count affordance. Expense-group previews are not interactive in this milestone.
- Categories V3 Overview category cards are full-width navigable surfaces that drill into `/categories/:type`; allocation editing is intentionally deferred and the Budget Settings flow is not opened from this page.
- Categories V3 Overview reuses shared selected-period budget-context pulse semantics for category status. Needs/Wants use spending-ceiling language such as left/unused/over, while Savings uses goal semantics: to goal, goal reached, and above goal. Savings above target is positive.
- Categories V3 Overview treats historical periods as snapshots, using unused/over wording instead of active-period health judgment, and treats future periods as planning maps without no-spend/healthy/on-track judgment.
- Category Detail V3 at `/categories/:type` uses the localized category name in TopNav, validates category params, and redirects invalid category params to `/categories`.
- Category Detail V3 is the category activity drill-down: compact identity, semantic financial summary, one slim category progress line, all seven taxonomy expense groups, and one filtered Transactions handoff.
- Category Detail V3 shows active expense groups first by selected-period activity total; zero-total groups remain visible afterward in static taxonomy order.
- Category Detail V3 composition bars show each active group's share of actual category activity, not budget progress. Large group share is not a danger state.
- Category Detail V3 uses Savings contribution/goal language, keeps above-goal Savings positive, and does not use Savings run-out or remaining-spend copy.
- Category Detail V3 removes the V2 smart insight carousel, pace chart, run-out timeline, and embedded transaction preview. Deeper analysis remains for Insights V3, and transaction management remains in Transactions V3.
- Category Detail V3 does not implement expense-group detail pages, group expansion, group sheets, or per-group transaction accordions.
- `ProtectedRoute` owns access control only and does not render startup loading UI while auth is unresolved.
- `Layout` owns the authenticated shell only and does not own app boot loader timers or presentation.
- Startup should not hand off between a generic spinner and the branded loader; the minimum presentation timer starts from the first branded loader display.
- When motion is enabled, the boot logo begins as mark plus wordmark and then uses a short CSS-only wordmark retraction so the mark recenters. Reduced-motion users do not receive the wordmark animation.
- The boot loader uses friendly localized copy and a small secondary spinner.
- A short anti-flash minimum presentation may be used for the branded boot loader, but app boot is not intentionally held for multiple seconds.

Future Dashboard directions under discussion but not implemented:

- A larger historical/future selected-period Dashboard behavior redesign.

## Known Sheet/Mobile Problems

Durable conclusions from repository inspection:

- `BaseSheet` currently serves too many interaction types.
- Legacy Add Expense/Edit Expense nested structural sliders have been removed.
- Remaining complex sheet work should avoid nested dynamic measurements.
- `.sheet-content` scroll ownership/layout needs cleanup.
- `BaseSheet` compact styling now recognizes `sheet-compact`.
- Evidence does not currently justify replacing Vaul. Application architecture and CSS constraints are the larger problem.

## Established UX/Architecture Decisions

### Sheets

Sheets remain an accepted mobile pattern for bounded/contextual interactions, including:

- Sort
- Confirmation
- Language
- Currency
- Theme
- Budget split
- Period start day
- Period selection
- Suitable settings/selectors

### Structural Sliders

Do not place structural multi-step `SliderViewport` flows inside sheets. A structural slider moves between meaningful workflow steps whose contents have substantially different heights.

Horizontal chips, carousels, or presentation-only horizontal scrolling are not prohibited merely because they slide horizontally.

### Complex Workflows

Substantial workflows should be considered for full-screen surfaces/routes instead of being forced into a bottom sheet.

Current candidate:

- Add Income

Add/Edit Expense have moved to full-screen V3 routes.

### Vaul

Keep Vaul unless implementation evidence later shows that Vaul itself is the source of a concrete limitation. Current audit evidence indicates that application architecture/CSS usage is the larger problem.

## Current Product Direction

### 1. V3 Expense Capture

Implemented V3 milestone: Add/Edit Expense are dedicated full-screen mobile routes.

Current behavior:

- `/transactions/new` creates an expense for the selected period.
- `/transactions/:month/:txnId/edit` loads and edits a specific transaction under its month subcollection.
- The central FAB opens Add Expense directly.
- Expense group is the primary user classification.
- Needs/Wants/Savings category is derived from the selected expense group and persisted on `Txn.category` for compatibility.
- Recent groups come from currently loaded transactions for the selected period.
- Note expansion preference is persisted additively at `capturePreferences.noteExpandedByDefault`.
- Dirty close uses a bounded confirmation sheet.
- Edit mode provides an overflow delete action with confirmation.

### 2. Income Interaction

Income no longer shares equal prominence in the central FAB workflow. The current entry point is temporary: Dashboard budget context and no-budget insight CTA open a bounded `IncomeSheet` reusing the existing `AddIncome` form. A fuller V3 income redesign has not been implemented.

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

- Transaction sort label/behavior mismatch: sorting/grouping by expense group ultimately sorts groups by total in `src/store/budget-store/budget.selectors.ts`.

Speculative/runtime risks:

- Mobile keyboard behavior in the new full-screen Capture route still needs real-device validation.
- Very short viewport overflow with the route date picker open still needs real-device validation.
- Long Romanian strings in compact mobile controls.
- Stale history summaries if data changes outside expected mutation paths.

## Things Worth Preserving

- Needs/wants/savings core model unless product requirements explicitly change it.
- Firestore nesting of month documents and month transactions.
- Frozen period boundaries on month documents.
- Selector-derived calculations.
- Historical summary approach.
- Mobile bottom navigation and direct Add Expense FAB pattern.
- Shared mobile primitives where they fit the interaction.
- Existing insight system as a useful foundation.

## Current Priorities

Approximate current priority order:

1. Validate and harden V3 expense capture on real mobile devices.
2. Simplify remaining sheet responsibilities after complex workflows are removed.
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
