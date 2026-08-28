# AGENTS.md

Durable working instructions for AI coding agents in this repository. For evolving product and architecture context, read `PROJECT_CONTEXT.md`.

## Repository Purpose

Thrift Tide is a mobile-first personal budgeting PWA. The verified frontend/runtime stack is React 19, TypeScript 4.9, Create React App via CRACO, React Router, Redux Toolkit, Firebase Auth/Firestore, Sass for structural styling constants, CSS custom-property theme colors, i18next, Vaul sheets, and mobile-focused UI helpers such as `react-day-picker`, `react-mobile-picker`, and Embla.

## Source of Truth

- The implementation is the source of truth for current behavior.
- `PROJECT_CONTEXT.md` records current product/architecture decisions and direction, but code still must be inspected before making assumptions.
- Stale comments, old README boilerplate, and older assumptions must not override current implementation or explicit project decisions.
- Preserve existing behavior unless the task explicitly changes it.

## Working Principles

- Prefer narrow, coherent changes.
- Do not refactor unrelated areas during feature work.
- Do not replace working architecture for stylistic purity.
- Product requirements should justify architectural changes.
- Reuse shared components, selectors, services, and tokens where appropriate.
- Avoid new abstractions until there is a concrete reuse or simplification case.
- Distinguish confirmed bugs from intentional product behavior.
- Do not invent backend, Firestore, auth, notification, or data-migration capabilities.
- When data-model changes are required, explicitly identify migration implications before editing persistence code.

## Product-Sensitive Architecture Rules

- Thrift Tide is mobile-first. Mobile usability takes priority over desktop-specific patterns.
- Sheets are acceptable for bounded/contextual interactions, but larger workflows should use an appropriate full-screen surface or route when warranted.
- Structural multi-step `SliderViewport` workflows must not be placed inside bottom sheets.
- A structural slider means navigation between meaningful workflow steps with substantially different vertical layouts. Horizontal chips, carousels, or presentation-only horizontal scrolling are not automatically prohibited.
- Do not add more dynamic-height measurement hacks to make complex workflows fit inside sheets.
- Vaul is currently considered viable. Do not replace it without concrete evidence that Vaul itself is the limitation.
- The existing Firestore month/transaction nesting and selector-derived calculations should not be redesigned without a concrete product requirement.

## State and Data Rules

- Redux state lives under `src/store`: `auth`, `budget`, `settings`, and `history`.
- Prefer selector-derived state for computed UI data. Budget selectors in `src/store/budget-store` derive in-period transactions, totals, category panels, smart insights, badges, and transaction groups.
- Use thunks in slices for async persistence flows. Do not write Firestore calls directly inside page components unless an established service/thunk boundary is being intentionally changed.
- Firebase setup is in `src/api/services/firebase.service.ts`; Auth and Firestore service functions are under `src/api/services`.
- Month documents are the period-level source for income, percents, allocations, frozen `startDay`, `periodStart`, `periodEnd`, and optional `summary`.
- Transactions are stored under `users/{uid}/months/{month}/transactions`.
- Current-period screens derive live calculations from loaded transactions. History uses persisted month summaries, so any mutation path that changes transactions or allocations must keep summaries fresh.
- Period boundary logic is product-sensitive. Start days are clamped to `1..28`; period ends are exclusive.
- Do not duplicate Firestore transaction listeners. Listener lifecycle should remain centralized and cleaned up on auth/month changes.

## Mobile UI Rules

- Respect `env(safe-area-inset-*)` and installed PWA/mobile browser modes.
- Avoid viewport assumptions that only work in desktop browsers. Prefer explicit mobile validation for short/narrow viewports.
- Be careful with keyboard-sensitive forms. Code validation alone is insufficient for mobile form changes.
- Complex surfaces should have one clear vertical scroll owner.
- Avoid nested dynamic height measurement in viewport-constrained surfaces.
- Preserve touch-friendly targets, swipe behavior, bottom navigation ergonomics, and momentum scrolling where already intentional.

## i18n

- Supported languages are English (`en`) and Romanian (`ro`), configured in `src/i18n/i18n.ts`.
- User-facing strings should use i18n resources rather than new hard-coded English.
- Translation namespaces currently include `common`, `budget`, `insights`, `settings`, `onboarding`, `taxonomy`, and `history`.
- Layout must tolerate longer translated strings, especially on narrow mobile screens.
- Supported currencies are currently `EUR` and `RON` in `src/api/types/settings.types.ts`.

## Styling and Design System

- Theme colors are CSS custom properties defined in `src/styles/global.scss`.
- Light theme values are the defaults under `:root`; dark values override them under `[data-theme='dark']`.
- Runtime theme state is represented by `data-theme="light|dark"` on the root `<html>` element.
- Components should consume theme-aware colors through semantic CSS variables such as `var(--...)`, not literal theme colors.
- Do not introduce Sass color variables for runtime/theme-sensitive values.
- Sass remains appropriate for structural/static constants in `src/styles/_variables.scss` and helpers in `src/styles/_mixins.scss`: spacing, typography constants, radii, breakpoints, dimensions, transitions, and mixins.
- Future V3 semantic tokens should extend the existing CSS-variable architecture rather than replacing it.
- Reuse existing CSS custom properties and shared UI primitives from `src/shared/ui` and `src/shared/components`.
- Preserve the existing needs/wants/savings color language unless a product/design task explicitly changes it.
- Avoid introducing one-off visual systems when existing buttons, sheets, inputs, badges, progress bars, selectors, or cards fit the task.
- Feature styles should avoid reaching into shared internals such as `.sheet-content` unless the shared primitive is being deliberately extended.

## Testing and Validation

Available scripts from `package.json`:

- `npm start` - runs `npm run start:cra`.
- `npm run start:cra` - starts CRACO dev server only.
- `npm run build` - runs `craco build`.
- `npm test` - CRACO test runner.
- `npm run migrate:txn-fields` - local migration command referenced by package scripts.

Useful validation commands:

- `npx tsc --noEmit` for TypeScript checking.
- `npm test -- --watchAll=false` for a non-watch test run.
- `npm run build` for production build validation when warranted.

There is no dedicated `lint` script in `package.json`. Do not claim one exists.

For mobile-sensitive UI changes, also validate representative viewports and states: small iPhone, standard iPhone, Android Chrome, PWA standalone, browser mode, portrait, landscape/short height, keyboard open/closed, Romanian text, date picker open, and maximum validation/error content.

## Change Discipline

- Keep changes scoped to the request.
- Report changed files and validation performed.
- Call out assumptions and unresolved runtime/device risks.
- Call out backend/data migration requirements before changing persistence.
- Do not create branches, commits, or PRs unless explicitly requested.
- Avoid editing ignored local-only artifacts unless the task explicitly requires them.
- `build/`, `.env*`, `.config/`, `scripts/`, and dependency directories are ignored. i18n report JSON files are tracked.

## Known Architectural Traps

- Do not introduce structural sliders into sheets.
- Do not create multiple competing vertical scroll owners.
- Do not use dynamic-height measurement when viewport-constrained layout would solve the problem.
- Be careful around period boundary logic and historical summary persistence.
- Do not duplicate Firestore listeners.
- Check `PROJECT_CONTEXT.md` before investing in repairs to flows that current product direction may replace.
