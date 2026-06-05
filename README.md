# IdrokHub Instructor / Admin Dashboard

React + TypeScript + Vite + TailwindCSS frontend for the StudyQ / IdrokHub admin dashboard, paired with the FastAPI backend in `../satzone/`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run preview    # serve the production build locally
```

No backend? **Click "Skip login — explore with demo data →"** on the Sign In screen. Every list / detail / form is wired with a mock-data fallback, so the whole app is navigable offline.

## Connecting to the backend

The dev server expects `VITE_API_BASE_URL` to point at the API. The default in `.env` is `http://localhost:8000/api/v1`.

Start the backend from `../satzone/`:

```bash
docker compose up -d
docker compose exec api alembic upgrade head
docker compose exec api python -m scripts.seed
```

Seeded login: `demo@edure.local` / `DemoPass123!`.

## Architecture

```
src/
├── api/                       # Fetch wrapper, typed endpoints, token store
│   ├── client.ts              # api<T>() — single-flight refresh, demo short-circuit
│   ├── tokens.ts              # access (session) + refresh (localStorage) + pub/sub
│   ├── auth.ts                # login/register/refresh/me + password reset + verify
│   ├── me.ts                  # /me/* — profile, password, notifications, onboarding
│   ├── instructor.ts          # /instructor/courses + analytics
│   ├── courses.ts             # /admin/courses + /categories + /curriculum
│   ├── users.ts               # /admin/users + /admin/enrollments
│   ├── admin.ts               # /admin/instructors
│   ├── payments.ts            # /me/orders
│   └── types.ts               # Hand-rolled TS types (subset of OpenAPI)
│
├── auth/AuthContext.tsx       # status: loading | anon | authed; supports demo session
│
├── components/                # Reusable UI
│   ├── AppShell.tsx           # Sidebar + TopNav + page chrome (used by every authed page)
│   ├── Sidebar.tsx            # Route-aware nav (NavLink + useLocation)
│   ├── TopNav.tsx             # Search, notification & profile dropdowns
│   ├── NotificationDropdown.tsx
│   ├── ProfileDropdown.tsx
│   ├── ConfirmDeleteModal.tsx # Generic; takes title + entityName + async onConfirm
│   ├── Toast.tsx              # ToastProvider + useToast(); auto-dismiss
│   ├── ErrorBoundary.tsx      # Top-level render-error fallback
│   ├── DemoBanner.tsx         # Yellow strip shown while isDemo
│   ├── AuthLayout.tsx         # Split-screen auth shell with illustration carousel
│   ├── AuthAtoms.tsx          # Inputs, labels, banners, primary button
│   └── …                      # StatCard, charts, TransactionTable
│
├── data/                      # Mock fixtures (rendered as fallback when API is empty/down)
├── hooks/                     # Data hooks (each maps API → view model + mock fallback)
├── lib/cn.ts                  # clsx helper
├── pages/                     # One file per route
└── App.tsx                    # Routes + providers
```

## Routes

### Auth (anonymous)

- `/sign-in` — email + password, Google OAuth, demo button
- `/sign-up` — register (→ verify email)
- `/forgot-password` — request reset email
- `/reset-password?token=…` — set new password
- `/verify-code?mode=email|phone` — 2-step OTP
- `/auth/google/callback` — token handoff from backend

### Protected

- `/` — Dashboard (stats + charts + transactions)
- `/teachers`, `/teachers/new`, `/teachers/:id`, `/teachers/:id/edit`
- `/students`, `/students/new`, `/students/:id`, `/students/:id/edit`
- `/courses`, `/courses/new`, `/courses/:id`, `/courses/:id/edit`
- `/transactions`, `/transactions/new`, `/transactions/:id`, `/transactions/:id/edit`
- `/settings?tab=general|account|link|languages|password|push`

### Status

- `/404` — Not Found (also catch-all)
- `/error` — generic error
- `/maintenance` — maintenance page

## Auth model

- **Access token** in `sessionStorage` (memory-preferred but session is a reasonable middle ground).
- **Refresh token** in `localStorage`. Rotated on every successful `/auth/refresh`.
- `api()` runs a single-flight refresh on `401 missing_token|invalid_token|invalid_user`, retries once, otherwise wipes state and lets the AuthGate redirect to `/sign-in`.
- **Demo mode** is a separate flag in `localStorage` (`studyq.demo=1`). When set, `api()` throws fast (no network) so callers fall back to their mocks. The `loginDemo()` action sets it; `logout()` clears it.

## Conventions

- **Type-only imports** use `import type { … } from "…"` to play well with TypeScript's `verbatimModuleSyntax`.
- **Errors at boundaries** — the `api()` wrapper normalises everything to `ApiError(status, code, message, details)`. Pages branch on `error.code`, never on the message.
- **Mock fallbacks** — every list/detail page either renders fixtures when the API is down OR shows real data when it works. The hooks decide.
- **No dead permissions** — protected routes are gated by `<AuthGate mode="authed">`; anon-only routes by `<AuthGate mode="anon">`.
- **Toasts for confirmations** — use `useToast().notify(message, "success"|"error"|"info")`. Auto-dismisses after 4 s.

## Known gaps (where the backend doesn't fit the design)

- **Admin "create order"** doesn't exist — `/transactions/new` simulates the save.
- **Notification feed** isn't a backend resource — the bell dropdown uses mocks.
- **Charts** (Overview, Student Analysis) are mock — no time-series endpoint.
- **Social profile links** (Settings → Link Account) save to `localStorage` only.
- **Push-notification toggles** only persist `email_marketing` + `email_course_updates`; the other six in the design have no backend column yet.
- **Address fields** on Teacher / Student forms have no model field.

Search `// Backend has no` in the code for the exact spots.

## Scripts

- `npm run dev` — Vite dev server with HMR
- `npm run build` — typecheck (`tsc -b`) + production build to `dist/`
- `npm run preview` — serve `dist/` locally
- `npm run lint` — ESLint
