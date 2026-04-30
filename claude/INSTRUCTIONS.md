# Lilia Paws Frontend — Working Rules

Rules for **how to work in this codebase**. Companion to [FRONTEND.md](FRONTEND.md), which describes how things *are*. This file describes how things *should be done* (and what to avoid).

> Each rule has a **Why** (so I can judge edge cases) and **How to apply** (when the rule kicks in). If a rule doesn't fit a specific case, surface it instead of bending the rule silently.

---

## 1. Architecture & Patterns

### Standalone components only — no NgModules
- **Why:** the entire codebase is standalone-first; reintroducing NgModules creates a split pattern that confuses tooling and contributors.
- **How to apply:** new components/directives/pipes use `standalone: true` (Angular 21 default). Routes use `loadComponent()`, not `loadChildren()` to a module.

### Default to `OnPush` change detection
- **Why:** every component in the codebase uses OnPush. Adding a `Default` component creates surprising re-render behaviour for anyone reading siblings.
- **How to apply:** new components set `changeDetection: ChangeDetectionStrategy.OnPush`. If you genuinely need `Default`, justify it in a comment.

### Lazy-load all feature routes
- **Why:** every route in both apps is lazy. Eager imports inflate the entry bundle without obvious benefit.
- **How to apply:** new top-level features get a `*.routes.ts` and are referenced via `loadComponent()` / `loadChildren()` from `app.routes.ts`.

---

## 2. State Management

### NgRx for global state; signal-based `@Injectable()` stores for local state
- **Why:** the codebase is split this way deliberately — global cross-feature state in NgRx, feature-local state in plain signal services (e.g. [dog-selection.store.ts](../apps/admin-app/src/app/features/trips/trip-form/dog-selection.store.ts)).
- **How to apply:** if state is needed by more than one feature or persists across navigation, it goes in NgRx. If it's owned by a single component tree, it's a signal store.

### Don't introduce `@ngrx/component-store`
- **Why:** the codebase consciously skipped it. We use either NgRx (global) or plain signal stores (local). Adding ComponentStore creates a third pattern.
- **How to apply:** if tempted to reach for ComponentStore, reach for a signal-based `@Injectable()` instead.

### Always pass `initialValue` to `toSignal()`
- **Why:** without it the signal is `undefined` until the source emits, and OnPush templates throw on the first paint.
- **How to apply:** `toSignal(store.select(...), { initialValue: [] })` for arrays, `false` for booleans, `null` for objects. Match the type the template expects.

### Effects call services, not HTTP directly
- **Why:** existing effects all delegate to a `*.service.ts` for the request. Inlining `HttpClient` calls in effects breaks the testing/mocking story.
- **How to apply:** if an effect needs new HTTP, add the method to the relevant service first, then call it from the effect.

### Don't use `effect()` to react to in-component state changes
- **Why:** `effect()` is for synchronizing signals to systems *outside* Angular's reactivity (DOM APIs, third-party libraries, browser-only side effects). Using it to watch one signal and write to another in the same component creates implicit, non-obvious control flow, makes the code harder to trace, and risks reentrancy/loop bugs. The "open the dialog ⇒ also seed its language from Transloco" pattern is a one-shot imperative concern, not a reactive subscription — it belongs in a method, not an effect.
- **How to apply:** if you find yourself writing `effect(() => { if (this.something()) this.somethingElse.set(...) })`, refactor to either (a) an explicit method on the component (e.g. `open()`, `submit()`) called by the parent — for cross-component cases use `viewChild()` + an imperative call instead of two-way binding a boolean — or (b) a `computed()` derived from the inputs. Reserve `effect()` for genuine cross-boundary side effects.

---

## 3. Forms & Validation

### Reactive forms only — never template-driven
- **Why:** all forms in the codebase use `FormBuilder`/`FormGroup`. Template-driven forms can't reuse the validation directives.
- **How to apply:** new forms use `inject(FormBuilder).group({...})`. No `ngModel` two-way binding except in trivial filter inputs.

### Use the shared validation directive, not inline error markup
- **Why:** [validation-error.directive.ts](../libs/ui/src/lib/directives/validation-error.directive.ts) handles touch-aware error display consistently. Inline `*ngIf="control.invalid"` markup re-implements this badly and inconsistently.
- **How to apply:** use `*appValidationError="control"` for error spans. Add new error message keys to translation files only when needed.

### Use `appAsyncButton`, not manual `[disabled]` logic
- **Why:** [async-button.directive.ts](../libs/ui/src/lib/directives/async-button.directive.ts) already handles loading + invalid states for PrimeNG buttons.
- **How to apply:** `<p-button [appAsyncButton] [asyncLoading]="loading$ | async" [asyncInvalid]="form.invalid">`. Don't reinvent.

---

## 4. Styling

### PrimeNG is the component library — don't add Tailwind / Material / Bootstrap
- **Why:** stack is intentionally PrimeNG + custom SCSS. Adding a second component library doubles the surface area and theme management.
- **How to apply:** missing component? Build it as a wrapper in [libs/ui](../libs/ui) over PrimeNG primitives. Don't reach for a new dep.

### Brand colors come from CSS custom properties and PrimeNG presets
- **Why:** admin and user have different "Lilia" palettes (orange vs tan). Hardcoded hex values in components break theme separation.
- **How to apply:** use existing CSS variables from `styles.scss` or PrimeNG semantic tokens. Add new variables to `styles.scss` if a brand color is genuinely missing.

### Don't assume dark mode works end-to-end
- **Why:** dark mode is opt-in via `[data-theme="dark"]`, but several surfaces still hardcode light backgrounds.
- **How to apply:** if a feature explicitly needs dark mode coverage, audit the touched components. Otherwise, design for light only.

---

## 5. HTTP, Errors & Toasts

### Toasts flow through NgRx actions, not direct `MessageService.add()` calls
- **Why:** both apps have `core/toast/` `NotificationEffects` that translate actions into toasts. Direct calls bypass this and risk double-toasting.
- **How to apply:** dispatch a toast action from your effect/component. Add a new action+effect handler if you need a new toast type.
- **Exception:** the admin 403 case in [admin-api.interceptor.ts](../apps/admin-app/src/app/interceptors/admin-api.interceptor.ts) calls `MessageService` directly. Preserve that. Don't replicate the pattern elsewhere.

### Admin uses XSRF, user does not — don't cross the streams
- **Why:** admin has authenticated, mutating requests; user app is public/read-mostly.
- **How to apply:** keep `withXsrfConfiguration({...})` only in admin's `app.config.ts`. Don't add it to user-app.

### Don't add a 401 handler to user-app
- **Why:** user app is public. There is no auth state to invalidate.
- **How to apply:** if a user-app endpoint starts returning 401, that's a backend bug or scope change — surface it, don't paper over it with a redirect.

---

## 6. i18n

### Don't extract helpers around the langChange pattern in admin-app
- **Why:** admin-app translation is being deprecated. Helpers will be deleted soon. Refactoring there is wasted effort and creates merge conflicts with the removal work.
- **How to apply:** in admin-app, leave existing translation code as-is unless directly fixing a bug. New admin-app strings should still be considered against this deprecation — ask before adding.

### User-app translation must remain SSR-safe
- **Why:** user-app prerenders for SEO. The single loader [transloco-loader.ts](../apps/user-app/src/app/core/transloco-loader.ts) imports the JSON at build time so both the SSR bundle and the browser bundle resolve translations synchronously from the same snapshot — crawlers always see translated HTML, never raw keys, and there's no drift between SSR output and client hydration. A previous file-system server loader (resolving paths relative to `process.cwd()`) was removed because it could silently serve stale `dist/` JSON in dev and emit "Missing translation" warnings during pre-render.
- **How to apply:** don't move user-app i18n to async-only or HTTP-fetched sources. Don't add a server-only loader that reads from disk. Don't use `window`-dependent locale detection. Keep the loader synchronous.

### Don't remove the `INJECT_VERSION` placeholder in user-app `environment.ts`
- **Why:** [Dockerfile.user](../Dockerfile.user) replaces this string at build time and it's exposed as `environment.assetVersion` for cache-busting static-asset URLs (e.g. export documents in [document-download.util.ts](../apps/user-app/src/app/shared/utils/document-download.util.ts)). Removing it breaks production cache invalidation silently.
- **How to apply:** the placeholder stays. If you need a new build-time variable, add a sibling placeholder and a corresponding `sed` line in the Dockerfile.

---

## 7. Imports & Cross-App Boundaries

### Use path aliases, never relative imports across apps or libs
- **Why:** relative imports like `../../../../libs/models/...` are brittle and bypass the boundary the aliases enforce.
- **How to apply:** `@admin/*`, `@user/*`, `@models/*`, `@ui/*`. Full alias list in [FRONTEND.md](FRONTEND.md#tooling-and-stack). Within a single feature folder, relative imports are fine.

### Never import from `@admin/*` in user-app or vice versa
- **Why:** the apps are independent deploys. A cross-app import couples builds and breaks the user-app SSR boundary.
- **How to apply:** if both apps need the same code, extract it into [libs/models](../libs/models) (types) or [libs/ui](../libs/ui) (components/directives/services).

---

## 8. SSR (user-app only)

### Guard browser globals with `isPlatformBrowser`
- **Why:** user-app renders on Node. `window`, `document`, `localStorage`, `navigator` are undefined server-side and crash hydration.
- **How to apply:** `inject(PLATFORM_ID)` + `if (isPlatformBrowser(this.platformId)) { ... }`. Move browser-only logic into `ngAfterViewInit` or behind the guard.

### Don't put non-deterministic values in component initialization
- **Why:** `Date.now()`, `Math.random()`, `crypto.randomUUID()` produce different values on server vs client, causing hydration mismatches.
- **How to apply:** initialize such values inside `ngAfterViewInit` (browser-only) or pass them in from a service that's deterministic per-request.

---

## 9. Workflow Rules (for Claude)

### Read [FRONTEND.md](FRONTEND.md) before non-trivial frontend work
- **Why:** it's the single source of truth for architecture, conventions, and gotchas. Skipping it leads to suggestions that contradict existing patterns.
- **How to apply:** for any task touching app structure, state, routing, or shared libs, open FRONTEND.md first. For one-line fixes or trivial questions, skip.

### Update [FRONTEND.md](FRONTEND.md) when you learn something missing or wrong
- **Why:** the file decays without active upkeep. Drift makes it untrustworthy, which makes future sessions skip it.
- **How to apply:** if a task surfaces a gotcha, pattern, or fact not in FRONTEND.md, add it as part of the task. Same for corrections — fix in place, don't leave stale notes.

### Don't add new dependencies without confirming
- **Why:** the stack is intentional (PrimeNG, NgRx, Transloco, jspdf). New deps need a real justification and may conflict with existing patterns.
- **How to apply:** before `npm install <thing>`, propose it and wait for the user to agree.

### For UI changes, verify in the browser before reporting complete
- **Why:** type-check + tests pass != feature works. Visual regressions, broken bindings, and CSS issues only show in a real browser.
- **How to apply:** run `npm run start:admin-portal` or `npm run start:user-portal`, exercise the changed flow + nearby flows, then report. If you can't run the dev server, say so explicitly instead of claiming success.

### Expect complexity in the trip-form / trip-request areas
- **Why:** dog selection, multi-requester grouping, file uploads, and validation are spread across multiple services. See [FRONTEND.md § Gotchas](FRONTEND.md#3-trip-form-is-the-heaviest-feature-in-the-codebase).
- **How to apply:** when working on trips (admin) or trip-request (user), read all the related services before making changes. Don't refactor across them without explicit scope.

---

## 10. Additional Rules

*Add user-specified rules below. Keep the same format: a one-line title, a **Why:** line, and a **How to apply:** line.*

<!-- e.g.
### Always run prettier before committing
- **Why:** ...
- **How to apply:** ...
-->
