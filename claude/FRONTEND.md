# Lilia Paws Travel — Frontend Architecture Reference

This is the deep reference for the Angular Nx monorepo at `lilia-paws-front/`. [CLAUDE.md](CLAUDE.md) points here for frontend questions. Paths are relative to `lilia-paws-front/`.

> **Last full scan:** 2026-04-28. If a section feels stale, re-verify against source before relying on it.

## Table of Contents

1. [Tooling and Stack](#tooling-and-stack)
2. [Admin App Architecture](#admin-app-architecture)
3. [User App Architecture](#user-app-architecture)
4. [Libraries: models and ui](#libraries-models-and-ui)
5. [Cross-Cutting Conventions](#cross-cutting-conventions)
6. [Gotchas and Surprises](#gotchas-and-surprises)

---

## Tooling and Stack

### Versions and Core Dependencies

- **Angular**: 21.2.6
- **Nx**: 22.6.3 (`@nx/angular` 22.6.3)
- **TypeScript**: 5.9.0
- **Node**: >=20.0.0 required

### UI Framework

- **PrimeNG**: 21.1.4 (tables, dialogs, forms, buttons, datepicker)
- **PrimeNG Themes**: `@primeng/themes` 21.0.4 (Aura preset; custom "Lilia" semantic palette)
- **PrimeFlex**: 4.0.0 (utility CSS, available but not the primary layout system)
- **No Tailwind, no Material**

### State Management

- **NgRx**: 21.0.0 (`store`, `effects`, `entity` adapter)
  - Admin stores: auth, trips, calendar, notifications, requests, messages, users
  - User stores: trips, tripRequest, contact
- **Signals**: limited; mostly used as `toSignal()` over store selectors, plus `computed()`/`signal()` for local state
- **No `ComponentStore`** — local non-global state uses plain `@Injectable()` signal stores (e.g. [dog-selection.store.ts](apps/admin-app/src/app/features/trips/trip-form/dog-selection.store.ts))

### RxJS / Signals

- **RxJS**: 7.8.0
- **Signals usage**:
  - `toSignal()` to bridge store observables into components
  - `computed()` for derived view state
  - `input()`, `output()`, `viewChild()` in newer components (see [dog-form.component.ts](libs/ui/src/lib/dog-form/dog-form.component.ts))
  - Plain `signal()` for local UI state (preview images, selections)

### i18n

- **Library**: `@jsverse/transloco` 8.2.1
- **Languages**: `en`, `el` (Greek, default), `de`
- **Loaders**:
  - Admin: HTTP loader [transloco-loader.ts](apps/admin-app/src/app/core/transloco-loader.ts) → fetches `/assets/i18n/{lang}.json`
  - User: HTTP loader + SSR-aware [transloco-server.loader.ts](apps/user-app/src/app/core/transloco-server.loader.ts)
- **Files**: [admin-app i18n](apps/admin-app/src/assets/i18n/), [user-app i18n](apps/user-app/src/assets/i18n/)
- **Status**: admin-app translation is planned for removal (per project memory) — do **not** extract helpers around the langChange pattern in admin-app. User app keeps Transloco.

### Forms

- Reactive Forms (`FormBuilder`, `FormGroup`, Validators)
- Custom helpers in `libs/ui`:
  - [validation-error.directive.ts](libs/ui/src/lib/directives/validation-error.directive.ts) — show errors only after touched + invalid
  - [async-button.directive.ts](libs/ui/src/lib/directives/async-button.directive.ts) — disable PrimeNG buttons during async
  - [focus-invalid-input.directive.ts](libs/ui/src/lib/directives/focus-invalid-input.directive.ts) — auto-focus first invalid field on submit

### Build / Serve / Test

```bash
npm run start:user-portal     # user app on :4200
npm run start:admin-portal    # admin app on :4201
npm run build:all             # nx run-many — user-app, admin-app, api
npm run watch:all             # concurrent dev for everything
npm run test                  # ng test (Karma + Jasmine)
```

### Testing

- Karma 6.4.0 + Jasmine 4.6.0 (chrome launcher).

### Lint / Format

- No `.eslintrc` or `prettier` config at project or app roots (Nx defaults). If linting work comes up, treat this as an open question to confirm with the user.

### TypeScript Path Aliases ([tsconfig.base.json](tsconfig.base.json))

```
@models/*          → libs/models/src/*
@ui/*              → libs/ui/src/*
@admin/core/*      → apps/admin-app/src/app/core/*
@admin/services/*  → apps/admin-app/src/app/services/*
@admin/shared/*    → apps/admin-app/src/app/shared/*
@admin/features/*  → apps/admin-app/src/app/features/*
@admin/interceptors/* → apps/admin-app/src/app/interceptors/*
@admin/guards/*    → apps/admin-app/src/app/core/guards/*
@user/core/*       → apps/user-app/src/app/core/*
@user/services/*   → apps/user-app/src/app/services/*
@user/shared/*     → apps/user-app/src/app/shared/*
@user/features/*   → apps/user-app/src/app/features/*
@user/interceptors/* → apps/user-app/src/app/interceptors/*
```

Use these — avoid relative imports, especially across apps.

### Docker

- **Admin** ([Dockerfile.admin](Dockerfile.admin)): Node 20 builder → `nx build admin-app --configuration=production` → static SPA served by Nginx ([nginx.admin.conf](nginx.admin.conf)).
- **User** ([Dockerfile.user](Dockerfile.user)): Node 20 builder → `nx build user-app` (browser + server bundles) → Node runtime running `dist/apps/user-app/server/server.mjs` on port 4000 (Express + http-proxy-middleware). Build timestamp injected into `environment.ts` for i18n cache-busting.

---

## Admin App Architecture

**Location**: [apps/admin-app/](apps/admin-app/)

### Bootstrap

- [src/main.ts](apps/admin-app/src/main.ts) — `bootstrapApplication()` with `provideZoneChangeDetection()` + `appConfig.providers`. Standalone, no NgModule.

### App Config ([app.config.ts](apps/admin-app/src/app/app.config.ts))

- Router with `PreloadAllModules`
- `provideHttpClient` with `adminApiInterceptor` + XSRF (`XSRF-TOKEN` cookie / `X-XSRF-TOKEN` header)
- NgRx store with 7 root reducers (auth, trips, calendar, requests, messages, notifications, users) + matching effects
- Store DevTools (dev only)
- PrimeNG with custom **"Lilia" preset** — warm orange/brown palette
- `MessageService`, `ConfirmationService`
- Transloco with HTTP loader
- `APP_INITIALIZER`: `initializeAuth()` calls `authService.getProfile()` and dispatches `restoreSession()` on success; silently continues on failure

### Root Component ([app.component.ts](apps/admin-app/src/app/app.component.ts))

- Standalone, `OnPush`
- Subscribes to `selectTotalCount` (notifications) to update browser title with unread count
- Uses `takeUntilDestroyed()`
- Template: `<router-outlet>` + global `<p-toast>`

### Routing ([app.routes.ts](apps/admin-app/src/app/app.routes.ts))

- `/` → `/admin/dashboard`
- `/admin/login` → [LoginComponent](apps/admin-app/src/app/features/login/login.component.ts)
- `/admin/**` (guarded by `authGuard`) → [ShellComponent](apps/admin-app/src/app/shared/components/shell/shell.component.ts) wraps:
  - `/dashboard` → [DashboardComponent](apps/admin-app/src/app/features/dashboard/dashboard.component.ts)
  - `/trips`, `/trips/new`, `/trips/:id/edit` → [TripsListComponent](apps/admin-app/src/app/features/trips/trips-list/trips-list.component.ts), [TripFormComponent](apps/admin-app/src/app/features/trips/trip-form/trip-form.component.ts)
  - `/requests` → [RequestsListComponent](apps/admin-app/src/app/features/requests/requests-list.component.ts)
  - `/messages` → [MessagesPageComponent](apps/admin-app/src/app/features/messages/messages-page.component.ts)
  - `/settings` → [SettingsComponent](apps/admin-app/src/app/features/settings/settings.component.ts) with `/profile`, `/invitation`, `/users`
- Wildcard → `/admin/login`
- Pattern: `loadComponent()` lazy bundles, no NgModules.

### Auth

- **Guard**: [auth.guard.ts](apps/admin-app/src/app/core/guards/auth.guard.ts) — functional guard via `selectIsAuthenticated`, redirects to `/admin/login`.
- **Service**: [auth.service.ts](apps/admin-app/src/app/services/auth.service.ts) — `login`, `logout`, `getProfile`, `changePassword`, `changeEmail`, user CRUD against `${environment.apiUrl}/auth`.
- **Store**: [core/store/auth/](apps/admin-app/src/app/core/store/auth/) — actions/reducer/effects/selectors for auth + session restore.
- **Tokens**: HTTP-only cookies (server-set); XSRF via cookie/header pair.
- **401 handling**: `adminApiInterceptor` dispatches `logout()`.

### HTTP Layer

- Base URL: `/api` (proxied in dev via [proxy.conf.json](apps/admin-app/proxy.conf.json), absolute in prod via `environment.apiUrl`).
- **Interceptor**: [admin-api.interceptor.ts](apps/admin-app/src/app/interceptors/admin-api.interceptor.ts)
  - Adds `withCredentials: true` for `environment.apiUrl` requests
  - On `401` → dispatches `logout()`
  - On `403` → toast via `MessageService`
  - Re-throws for downstream handling.

### Feature Stores (lazy-bound by route)

- **Trips** ([features/trips/store/](apps/admin-app/src/app/features/trips/store/)): `@ngrx/entity` adapter. State has `trips`, `selectedTripId`, `loading`, `mutating`, `error`. Effects call [trips.service.ts](apps/admin-app/src/app/services/trips.service.ts).
- **Requests** ([features/requests/store/](apps/admin-app/src/app/features/requests/store/)): trip requests with approval flow handled by [requests-approval.service.ts](apps/admin-app/src/app/features/requests/requests-approval.service.ts).
- **Messages** ([features/messages/store/](apps/admin-app/src/app/features/messages/store/)): inbox/sent.
- **Users (admin mgmt)** ([features/settings/users/store/](apps/admin-app/src/app/features/settings/users/store/)): admin-user CRUD.

### Notable Services

- [trips.service.ts](apps/admin-app/src/app/services/trips.service.ts), [dogs.service.ts](apps/admin-app/src/app/services/dogs.service.ts), [requests.service.ts](apps/admin-app/src/app/services/requests.service.ts), [messages.service.ts](apps/admin-app/src/app/services/messages.service.ts)
- **PDF export**: [dog-bio-export.service.ts](apps/admin-app/src/app/services/dog-bio-export.service.ts), [trip-manifest-export.service.ts](apps/admin-app/src/app/services/trip-manifest-export.service.ts) (uses `jspdf` + `jspdf-autotable`)
- **A11y**: [font-size.service.ts](apps/admin-app/src/app/services/font-size.service.ts) — user-controlled zoom
- **Confirm dialogs**: [confirm-action.service.ts](apps/admin-app/src/app/shared/services/confirm-action.service.ts) — wrapper over PrimeNG `ConfirmationService`

### Feature Folder Map

```
features/
├── dashboard/          stats, KPIs, recent trips
├── login/              login form
├── trips/
│   ├── trip-form/      MOST COMPLEX: dog selection, multi-requester, bulk upload
│   ├── trips-list/     filterable table
│   ├── shared/         feature-local shared
│   └── store/          NgRx (entity adapter)
├── requests/           trip request approval/review
├── messages/           admin inbox
└── settings/           profile, users, invitations
```

### Styling

- Globals: [styles.scss](apps/admin-app/src/styles.scss)
  - CSS custom props for brand (`#e07b54` orange, sidebar dark, etc.)
  - WCAG AA contrast notes inline
  - PrimeNG overrides (datepicker for trip calendar, etc.)
  - Animations (`tripCalHeartbeat`)
  - A11y: skip-link, focus rings, reduced-motion support
  - Dark mode is opt-in via `[data-theme="dark"]`, **not** auto from `prefers-color-scheme`
- Component styles: scoped SCSS (`.component.scss`).

---

## User App Architecture

**Location**: [apps/user-app/](apps/user-app/)

### Bootstrap and SSR

- [main.ts](apps/user-app/src/main.ts) — browser bootstrap
- [main.server.ts](apps/user-app/src/main.server.ts) — platform-server entry
- [server.ts](apps/user-app/src/server.ts) — Express runtime, built to `server.mjs`
- [app.config.server.ts](apps/user-app/src/app/app.config.server.ts) — server provider overrides

### App Config ([app.config.ts](apps/user-app/src/app/app.config.ts))

- `provideClientHydration(withEventReplay())`
- Router: `PreloadAllModules` + `withInMemoryScrolling({ scrollPositionRestoration: 'top' })`
- HttpClient with `userApiInterceptor`
- NgRx store with 3 reducers (contact, tripRequest, trips) + 4 effect classes (Contact, TripRequest, Trips, Notification)
- PrimeNG with **"Lilia" tan/brown palette** (different from admin)
- Transloco with HTTP loader (server loader merged in [app.config.server.ts](apps/user-app/src/app/app.config.server.ts))

### Root Component ([app.component.ts](apps/user-app/src/app/app.component.ts))

- Standalone, `OnPush`. Just `<router-outlet>` + `<p-toast>`.

### Routing ([app.routes.ts](apps/user-app/src/app/app.routes.ts)) — public, no guards

- `/` → `HOME_ROUTES` → [HomeComponent](apps/user-app/src/app/features/home/home.component.ts)
- `/about` → [AboutComponent](apps/user-app/src/app/features/about/about.component.ts)
- `/contact` → [ContactComponent](apps/user-app/src/app/features/contact/contact.component.ts)
- `/request` → [TripRequestComponent](apps/user-app/src/app/features/trip-request/trip-request.component.ts)
- Wildcard → `/`
- Each feature exports its own `*.routes.ts` with lazy-loaded children.

### State Management

- **No auth, no auth guard** — fully public site.
- **Core**: [core/store/trips/](apps/user-app/src/app/core/store/trips/) — read-only trip list, with WS update support (`wsTripsReceived`).
- **Feature stores**:
  - [features/trip-request/store/](apps/user-app/src/app/features/trip-request/store/) — multi-step submission state.
  - [features/contact/store/](apps/user-app/src/app/features/contact/store/) — contact form submission state.

### HTTP Layer

- Base URL: `/api` (dev proxy / prod absolute via env).
- **Interceptor**: [user-api.interceptor.ts](apps/user-app/src/app/interceptors/user-api.interceptor.ts)
  - Sets `Content-Type: application/json` (skips for `FormData`)
  - On `status === 0` → dispatch `httpConnectionError()` (toast)
  - On `status >= 500` → dispatch `httpServerError({ status })`
  - No 401 handling (no auth).

### Notable Services

- [trip-request.service.ts](apps/user-app/src/app/services/trip-request.service.ts) — request submission, dog photo/document upload (multipart)
- [contact.service.ts](apps/user-app/src/app/services/contact.service.ts) — contact form
- [trips.service.ts](apps/user-app/src/app/services/trips.service.ts) — fetch available trips
- [trips-websocket.service.ts](apps/user-app/src/app/services/trips-websocket.service.ts) — real-time trip updates (uses [libs/ui websocket](libs/ui/src/lib/websocket/))
- [seo.service.ts](apps/user-app/src/app/services/seo.service.ts) — meta, OG, structured data
- [router-url.service.ts](apps/user-app/src/app/services/router-url.service.ts), [logger.service.ts](apps/user-app/src/app/services/logger.service.ts)

### Feature Folder Map

```
features/
├── home/         landing — hero, CTA, stats, panorama
├── about/        static-ish about page
├── contact/      contact form + map, NgRx store
└── trip-request/ MOST COMPLEX: multi-step wizard, dog selection, file uploads, real-time availability
```

### Styling

- [styles.scss](apps/user-app/src/styles.scss) — same architecture as admin, but tan/brown palette.

---

## Libraries: models and ui

### libs/models — [libs/models/](libs/models/)

Pure TypeScript types/interfaces; no component code.

**Public API** ([src/index.ts](libs/models/src/index.ts)):

```ts
export * from './lib/utils';
export * from './lib/dog.model';
export * from './lib/trip.model';
export * from './lib/calendar-event.model';
export * from './lib/contact-form.model';
export * from './lib/trip-request.model';
export * from './lib/admin-user.model';
export * from './lib/socket-events.model';
export * from './lib/table-column.interface';
export * from './lib/dialog-config.interface';
```

**Notable types**:

- [dog.model.ts](libs/models/src/lib/dog.model.ts) — `Dog` (name, size, behaviors, gender, age, chip ID, photos, documents). Enums: `DogHeight` (`under10` | `10to25` | `over30`), `DogBehavior` (friendly/aggressive/fearful/anxious/calm). Includes `requesterId`, `destinationId`, `pickupLocationId`, `receiver`, `receiverPhone`, transient `newRequesterName` for inline requester creation.
- [trip.model.ts](libs/models/src/lib/trip.model.ts) — `Trip` plus `TripStatus` (`upcoming` | `in-progress` | `completed`), `TripDestination`, `TripRequester`.
- [trip-request.model.ts](libs/models/src/lib/trip-request.model.ts), [admin-user.model.ts](libs/models/src/lib/admin-user.model.ts), [calendar-event.model.ts](libs/models/src/lib/calendar-event.model.ts), [contact-form.model.ts](libs/models/src/lib/contact-form.model.ts), [socket-events.model.ts](libs/models/src/lib/socket-events.model.ts).
- [table-column.interface.ts](libs/models/src/lib/table-column.interface.ts) — config for `GenericTableComponent`.
- [utils.ts](libs/models/src/lib/utils.ts) — shared helpers.

Consumed via `@models/*`.

### libs/ui — [libs/ui/](libs/ui/)

Shared components, directives, pipes, WS utilities.

**Public API** ([src/index.ts](libs/ui/src/index.ts)):

```ts
export * from './lib/loading-spinner/loading-spinner.component';
export * from './lib/pipes/local-date.pipe';
export * from './lib/toast-notification/toast-notification.component';
export * from './lib/dog-form/dog-form.component';
export * from './lib/trip-calendar/trip-calendar.component';
export * from './lib/websocket/app-websocket.service';
export * from './lib/components/table/generic-table.component';
export * from './lib/components/dialog/generic-dialog.component';
export * from './lib/components/dialog/app-confirm-dialog.component';
export * from './lib/components/form/form-field.component';
export * from './lib/components/empty-state/empty-state.component';
export * from './lib/components/loading/loading-overlay.component';
export * from './lib/components/page-header/page-header.component';
export * from './lib/directives/validation-error.directive';
export * from './lib/directives/async-button.directive';
```

**Highlights**:

- [dog-form.component.ts](libs/ui/src/lib/dog-form/dog-form.component.ts) — standalone, signal-based (`input()`, `output()`, `viewChild()`, `computed()`). Drag-drop photo + document upload, behaviour multi-select, computed dropdown options via Transloco.
- [generic-table.component.ts](libs/ui/src/lib/components/table/generic-table.component.ts) — generic `<T extends object>`. Inputs: `data`, `columns: TableColumn[]`, `actions`, `config`, `loading`, `rowSelectable`. Two-way `selection` via `model()`. Wraps PrimeNG DataTable.
- [trip-calendar.component.ts](libs/ui/src/lib/trip-calendar/trip-calendar.component.ts) — PrimeNG datepicker wrapper with trip event highlighting.
- [page-header.component.ts](libs/ui/src/lib/components/page-header/page-header.component.ts), [empty-state.component.ts](libs/ui/src/lib/components/empty-state/empty-state.component.ts), [loading-overlay.component.ts](libs/ui/src/lib/components/loading/loading-overlay.component.ts).
- WebSocket: [app-websocket.service.ts](libs/ui/src/lib/websocket/app-websocket.service.ts) over [base-websocket.service.ts](libs/ui/src/lib/websocket/base-websocket.service.ts).
- Pipes: [local-date.pipe.ts](libs/ui/src/lib/pipes/local-date.pipe.ts).
- Directives: [validation-error.directive.ts](libs/ui/src/lib/directives/validation-error.directive.ts), [async-button.directive.ts](libs/ui/src/lib/directives/async-button.directive.ts), [focus-invalid-input.directive.ts](libs/ui/src/lib/directives/focus-invalid-input.directive.ts).

Consumed via `@ui/*`.

---

## Cross-Cutting Conventions

### File Naming

- `.component.ts` / `.component.html` / `.component.scss` (always co-located)
- `.service.ts` (mostly `providedIn: 'root'`)
- NgRx files: `.actions.ts`, `.reducer.ts`, `.selectors.ts`, `.effects.ts`, `index.ts` barrel
- `.directive.ts`, `.pipe.ts`, `.guard.ts`

### Folder Structure (per app)

```
src/app/
├── core/            global state, guards, loaders, toast registry
├── shared/          app-level shared components/services
├── services/        app-level services
├── interceptors/    HTTP interceptors
└── features/        lazy-loaded feature areas
    └── {feature}/
        ├── components/
        ├── services/
        ├── store/
        ├── {feature}.routes.ts
        └── {feature}.component.ts
```

Library structure mirrors this: `lib/components`, `lib/directives`, `lib/pipes`, plus a top-level `index.ts` barrel.

### Standalone Everywhere

- All components are `standalone: true`. No NgModules, even for lazy features. Routes use `loadComponent()`.

### Change Detection

- `OnPush` is the default on most components.
- Pair with `async` pipe **or** `toSignal()` — pick one per component, don't mix.
- Manual `markForCheck()` only where unavoidable (e.g. file input preview).

### RxJS vs Signals

- Store selects → observables; convert to signals at the component edge with `toSignal({ initialValue: … })`.
- New code prefers `input()`/`output()` over `@Input`/`@Output`.
- Local non-global state: signal-based `@Injectable()` stores or simple component signals. **No `ComponentStore`**.

### Forms

- Reactive forms only.
- Validation surfaced via `appValidationError` directive (touch-aware).
- Async submit buttons disabled via `appAsyncButton` directive while loading or when form invalid.

### Shared Bases

- [detail-dialog-base.ts](apps/admin-app/src/app/shared/components/detail-dialog-base.ts) — common pattern for detail dialogs.

---

## Gotchas and Surprises

### 1. Admin app translation deprecation

Project memory: admin-app translation is planned for removal. Both apps still use Transloco today, but **don't extract helpers around the langChange pattern in admin-app** — they'll be deleted. User app keeps i18n.

### 2. Dog selection store is a signal store, not NgRx

[dog-selection.store.ts](apps/admin-app/src/app/features/trips/trip-form/dog-selection.store.ts) is a custom `@Injectable()` signal store:

```ts
@Injectable()
export class DogSelectionStore {
  readonly selectedDogs = signal<IndexedDog[]>([]);
  private readonly selectionsByGroup = new Map<string, IndexedDog[]>();
}
```

It tracks per-group selections (dogs grouped by requester/destination) but exposes a flat selection signal. Feature-local pattern, not monorepo-wide.

### 3. Trip form is the heaviest feature in the codebase

Dog management spans:

- [dog-selection.store.ts](apps/admin-app/src/app/features/trips/trip-form/dog-selection.store.ts) — selection state
- [dog-manager.service.ts](apps/admin-app/src/app/features/trips/trip-form/dog-manager.service.ts) — orchestrates updates
- [dog-actions.service.ts](apps/admin-app/src/app/features/trips/trip-form/dog-actions.service.ts) — per-dog actions
- [dog-dialog.service.ts](apps/admin-app/src/app/features/trips/trip-form/dog-dialog.service.ts) — bulk-upload dialog
- [dog-grouping.service.ts](apps/admin-app/src/app/features/trips/trip-form/dog-grouping.service.ts) — grouping logic

Expect this complexity when touching trips. The same level of complexity lives in the user app's [trip-request.component.ts](apps/user-app/src/app/features/trip-request/trip-request.component.ts).

### 4. SSR in user app, SPA in admin

- **User app** runs on Node (Express, port 4000) with hydration. Components must be **SSR-safe** — guard `window`/`document`/`localStorage` access (use `isPlatformBrowser`).
- **Admin app** is a static SPA via Nginx — browser APIs are fine.

### 5. Two PrimeNG palettes

Both apps use a "Lilia" preset in their respective `app.config.ts`, but with **different colors** (admin = orange, user = tan/brown). When designing cross-app UI, drive colors via the per-app theme variables, not hardcoded hex.

### 6. XSRF only in admin

Admin uses `withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })`; the server must set the cookie. User app doesn't (public, no auth).

### 7. 401 → logout in admin, ignored in user

Admin's [admin-api.interceptor.ts](apps/admin-app/src/app/interceptors/admin-api.interceptor.ts) catches 401 and dispatches `logout()`. User has no equivalent.

### 8. Toasts flow through actions, not direct calls

Both apps have a `core/toast/` area whose `NotificationEffects` translate NgRx actions into `MessageService` toasts. **Don't also call `MessageService.add()` manually for the same flows** — you'll double-toast. Admin's interceptor deliberately calls MessageService directly only for 403; everything else dispatches actions.

### 9. Store is registered globally, but features only "wake up" lazily

Reducers + effects are registered in the root `appConfig`, but feature effects only fire once their lazy route loads. If an effect isn't running, check that the route is actually being navigated to.

### 10. `toSignal()` initial values matter

Many components do:

```ts
readonly trips = toSignal(store.select(selectAllTrips), { initialValue: [] });
```

Don't drop the `initialValue` — without it the signal can be `undefined` before the store emits, and OnPush templates will throw.

### 11. User app build-version injection

[Dockerfile.user](Dockerfile.user) does:

```bash
BUILD_VERSION=$(date +%Y%m%d%H%M%S) && \
sed -i "s/INJECT_VERSION/${BUILD_VERSION}/" apps/user-app/src/environments/environment.ts
```

The `INJECT_VERSION` placeholder in [environment.ts](apps/user-app/src/environments/environment.ts) is exposed as `environment.assetVersion` and used to cache-bust static assets the app references by URL (e.g. the export documents in [document-download.util.ts](apps/user-app/src/app/shared/utils/document-download.util.ts)). **Don't remove the placeholder.**

### 12. Admin trips uses `@ngrx/entity`, user trips uses a flat array

Admin trips state is normalized via `createEntityAdapter<Trip>()` (`adapter.setAll`, `addOne`, `updateOne` …). User trips state is just `trips: Trip[]`. Don't try to share trip selectors between apps — the shapes are different.

### 13. User app has typed connection-error actions

[core/toast/toast.actions.ts](apps/user-app/src/app/core/toast/toast.actions.ts) defines `httpConnectionError()` and `httpServerError({ status })`, dispatched from the interceptor on `status === 0` and `status >= 500`. Admin app doesn't have these — it routes errors through `MessageService` directly.

### 14. File inputs reset by clearing `value`

Some components clear `<input type="file">` via `nativeElement.value = ''` to allow re-uploading the same file. Standard HTML quirk, expected behaviour.

### 15. Dark mode is opt-in only

The `[data-theme="dark"]` rules exist, but **`prefers-color-scheme` does not auto-toggle**. Some surfaces still hardcode light backgrounds. Don't assume dark mode is supported end-to-end.
