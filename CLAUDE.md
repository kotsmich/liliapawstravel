# Lilia Paws Frontend — Claude Instructions

This is an Angular 21 + Nx 22 monorepo with two apps and two libs:

- [apps/admin-app/](apps/admin-app/) — staff-facing SPA (auth-gated, served as static via Nginx)
- [apps/user-app/](apps/user-app/) — public site, **SSR via Express/Node**
- [libs/models/](libs/models/) — shared types (`@models/*`)
- [libs/ui/](libs/ui/) — shared components, directives, pipes, WS service (`@ui/*`)

## Read these before non-trivial work

Two reference files live in [claude/](claude/):

- **[claude/FRONTEND.md](claude/FRONTEND.md)** — how the codebase *is*. Stack, routing, state, HTTP layer, libs, conventions, gotchas. Read before tasks that touch architecture, state, routing, or shared libs.
- **[claude/INSTRUCTIONS.md](claude/INSTRUCTIONS.md)** — how work *should be done*. Do/don't rules with reasoning. Read before making non-trivial changes.

Only fall through to grep/glob when these files don't cover the detail you need. When you discover something missing or wrong, update the relevant file as part of the task — both files decay without active upkeep.

## Quick reference

- **Standalone components everywhere** — no NgModules. Routes use `loadComponent()`.
- **OnPush by default**. Pair with `async` pipe **or** `toSignal({ initialValue: … })`, not both.
- **NgRx for global state**, plain signal-based `@Injectable()` stores for local state. **No `ComponentStore`**.
- **Reactive forms only.** Use `appValidationError` and `appAsyncButton` directives from `@ui`.
- **Path aliases** are mandatory across apps — never relative-import across apps. Aliases listed in [claude/FRONTEND.md](claude/FRONTEND.md).
- **PrimeNG** is the component library; "Lilia" theme presets differ between admin (orange) and user (tan).

## Things that bite

- **User app is SSR** — guard browser globals (`window`, `document`, `localStorage`) with `isPlatformBrowser`. Admin app is fine.
- **Admin app translation is being deprecated** — don't extract helpers around the langChange pattern in admin-app.
- **Toasts flow through NgRx actions** in both apps via `core/toast/` effects. Don't also call `MessageService.add()` for the same flow or you'll double-toast (admin's 403 interceptor toast is the deliberate exception).
- **`INJECT_VERSION` placeholder** in user-app `environment.ts` is replaced at Docker build time — don't remove it.

## Commands

```bash
npm run start:user-portal     # :4200
npm run start:admin-portal    # :4201
npm run build:all
npm run watch:all
npm run test                  # Karma + Jasmine
```

Full details: **[claude/FRONTEND.md](claude/FRONTEND.md)** · Working rules: **[claude/INSTRUCTIONS.md](claude/INSTRUCTIONS.md)**.
