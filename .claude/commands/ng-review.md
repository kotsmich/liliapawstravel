# Angular / RxJS / NgRx Code Review

Review the file(s) provided in $ARGUMENTS (or the currently open file if none given) against the official Angular, RxJS, and NgRx recommended practices below. Report all findings grouped by section, with file path and line number where applicable. Rate each finding as **[CRITICAL]**, **[WARNING]**, or **[INFO]**.

---

## ANGULAR OFFICIAL BEST PRACTICES

### Components
- [ ] Uses `OnPush` change detection (`changeDetection: ChangeDetectionStrategy.OnPush`)
- [ ] Component logic is minimal — business logic belongs in services, not components
- [ ] Inputs use `input()` signal or `@Input()` with explicit types (no `any`)
- [ ] Outputs use `output()` signal or `@Output() EventEmitter` with explicit event type
- [ ] `ngOnDestroy` implemented when subscriptions or timers are created manually
- [ ] No direct DOM manipulation — uses `Renderer2` or Angular template features instead
- [ ] Large components are split into smaller, focused components
- [ ] Component selector follows the project prefix convention (e.g. `app-`, `admin-`)

### Templates
- [ ] No complex logic in templates — expressions are simple property access or method calls
- [ ] `trackBy` used on all `*ngFor` / `@for` loops
- [ ] `async` pipe used to subscribe to Observables instead of manual subscriptions in the component
- [ ] No direct method calls that cause unnecessary re-evaluation on each change detection cycle — use pure pipes instead
- [ ] Lazy loading applied to feature routes (`loadComponent` / `loadChildren`)
- [ ] `@if`, `@for`, `@switch` (Angular 17+ control flow) preferred over `*ngIf`, `*ngFor`, `*ngSwitch`

### Services & Dependency Injection
- [ ] Services use `providedIn: 'root'` unless a narrower scope is intentional
- [ ] Services are stateless where possible; state is lifted to NgRx or a dedicated state service
- [ ] `HttpClient` calls return Observables — not converted to Promises unnecessarily
- [ ] No `new` keyword used to instantiate services — always injected via DI
- [ ] `inject()` function preferred over constructor injection in Angular 14+ code

### Signals (Angular 16+)
- [ ] `signal()` used for local component state instead of plain class properties when reactivity is needed
- [ ] `computed()` used for derived values — not recalculated manually
- [ ] `effect()` used sparingly and only for side effects (not for state derivation)
- [ ] Signal inputs (`input()`, `input.required()`) preferred over `@Input()` in new components

### Standalone Components (Angular 15+)
- [ ] New components are standalone (`standalone: true`) unless there is a specific NgModule reason
- [ ] Imports array in standalone components only includes what is actually used in the template

### Performance
- [ ] `ChangeDetectionStrategy.OnPush` is the default
- [ ] Images use `NgOptimizedImage` (`NgIf` + `loading="lazy"` for non-critical images)
- [ ] Heavy computations are moved out of the render path (Web Workers or memoized pipes)
- [ ] Route-level code splitting is applied (`loadComponent` / `loadChildren`)

### Security
- [ ] No use of `[innerHTML]` with user-controlled data — use `DomSanitizer` if unavoidable
- [ ] No `bypassSecurityTrust*` calls unless absolutely necessary and documented
- [ ] HTTP calls do not expose API keys in the frontend

### Testing
- [ ] Components have a corresponding `.spec.ts` file
- [ ] `TestBed` is configured with only the necessary imports/providers
- [ ] Tests use `fakeAsync` + `tick()` for async operations where appropriate
- [ ] Avoid snapshot tests for complex components — prefer assertion-based tests

---

## RXJS BEST PRACTICES

### Subscription Management
- [ ] No manual `.subscribe()` inside components without a corresponding `takeUntilDestroyed()` or `takeUntil(destroy$)`
- [ ] `takeUntilDestroyed()` (Angular 16+) preferred over manual `Subject` + `ngOnDestroy` pattern
- [ ] `async` pipe used in templates to auto-unsubscribe
- [ ] No nested `.subscribe()` calls — use `switchMap`, `mergeMap`, `concatMap`, or `exhaustMap` instead

### Operator Usage
- [ ] `switchMap` used for cancellable operations (e.g. search, HTTP calls where only the latest matters)
- [ ] `concatMap` used when order must be preserved
- [ ] `exhaustMap` used to ignore new emissions while a previous one is still processing (e.g. form submit)
- [ ] `mergeMap` used only when parallel execution is intentional
- [ ] `tap()` used only for side effects (logging, analytics) — never for state transformation
- [ ] `catchError()` placed correctly — inside the inner observable for streams that must continue, outside for streams that should terminate
- [ ] `shareReplay({ bufferSize: 1, refCount: true })` used on HTTP calls that are shared across multiple subscribers
- [ ] `debounceTime` applied to user input streams (search, resize, scroll)
- [ ] `distinctUntilChanged` used to prevent duplicate emissions

### Observable Design
- [ ] Observables are cold by default — `share()` or `shareReplay()` only when multicasting is needed
- [ ] `Subject` vs `BehaviorSubject` vs `ReplaySubject` chosen intentionally:
  - `BehaviorSubject` for state that has a current value
  - `ReplaySubject` for caching a defined number of values
  - `Subject` for events only
- [ ] No `.value` access on `BehaviorSubject` inside reactive chains — use `.pipe(take(1))` or `withLatestFrom`
- [ ] Error handling in every Observable chain that involves HTTP or external data

### Anti-Patterns to Flag
- [ ] **[CRITICAL]** `subscribe()` inside `subscribe()` (nested subscriptions)
- [ ] **[CRITICAL]** Missing unsubscribe / `takeUntilDestroyed` in components
- [ ] **[WARNING]** Using `toPromise()` — deprecated, use `firstValueFrom()` or `lastValueFrom()` instead
- [ ] **[WARNING]** `of()` wrapping a value that is already an Observable
- [ ] **[WARNING]** Creating a new `Subject` just to bridge a Promise — use `from()` instead

---

## NGRX BEST PRACTICES

### Store Structure
- [ ] State is normalized — no deeply nested objects in the store
- [ ] Each feature has its own state slice (`createFeature`) 
- [ ] Selectors are defined in a dedicated `*.selectors.ts` file
- [ ] No raw store state stored in component class properties — always select via selectors

### Actions
- [ ] Actions follow the `[Source] Event` naming convention (e.g. `[Auth API] Login Success`)
- [ ] Actions are defined with `createAction` and `props<>()` for type safety
- [ ] One action per user interaction or system event — no generic/reused actions
- [ ] Actions are dispatched from components or effects only — not from services

### Reducers
- [ ] Reducers are pure functions with no side effects
- [ ] `createReducer` + `on()` used (not switch statements)
- [ ] `createFeature` used to automatically generate feature selector
- [ ] State shape is flat and serializable (no `Date` objects, class instances, or functions in state)

### Effects
- [ ] Effects use `createEffect()` with proper `{ dispatch: false }` when not dispatching an action
- [ ] Every effect that can fail has error handling (`catchError` returning a failure action — not `EMPTY` silently)
- [ ] Effects do not mutate state directly
- [ ] `concatLatestFrom` (NgRx 12+) preferred over `withLatestFrom` for accessing store in effects
- [ ] Effects are in a dedicated `*.effects.ts` file
- [ ] Long-running effects use `exhaustMap` or `switchMap` intentionally

### Selectors
- [ ] `createSelector` used for memoized derived state
- [ ] Selectors are composable — complex selectors build on simpler ones
- [ ] No data transformation logic inside components — all transformations belong in selectors
- [ ] `selectSignal()` used in Angular 16+ components for signal-based selection

### Entity Adapter
- [ ] `@ngrx/entity` used for collections (lists) to avoid manual CRUD reducer logic
- [ ] `EntityAdapter` methods (`addOne`, `upsertMany`, `removeOne`, etc.) used in reducers
- [ ] `selectAll`, `selectEntities`, `selectIds` selectors used from the adapter

### Anti-Patterns to Flag
- [ ] **[CRITICAL]** Dispatching actions from reducers or other reducers
- [ ] **[CRITICAL]** Side effects (HTTP calls, routing) inside reducers
- [ ] **[CRITICAL]** Selecting from the store inside a reducer
- [ ] **[WARNING]** Components subscribing to multiple independent store slices separately — combine with `combineLatest` or a composed selector
- [ ] **[WARNING]** Storing derived/computed data in the store instead of using selectors
- [ ] **[WARNING]** Using `store.pipe(select(...))` directly in templates without `async` pipe or `selectSignal()`

---

## OUTPUT FORMAT

For each issue found, output:

```
[SEVERITY] Section > Rule
File: <path>:<line>
Issue: <what is wrong>
Fix: <concrete suggestion>
```

At the end, provide a **Summary** with:
- Total issues by severity
- Top 3 most impactful fixes to address first
