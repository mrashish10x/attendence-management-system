# Presently — Student Attendance Management System (Frontend)

A frontend-only, professional SaaS-style attendance management system built with
Next.js (App Router), TypeScript, Tailwind CSS v4, Recharts and lucide-react.

## What's included

- **Landing page** (`/`) — navbar, hero, features, how it works, stats, CTA, footer
- **Login page** (`/login`) — mock, frontend-only auth with a role selector (Admin / Teacher / Student)
- **Admin panel** (`/admin/...`) — dashboard, students, teachers, classes, subjects,
  attendance, reports, notifications, settings
- **Teacher panel** (`/teacher/...`) — dashboard, my classes, my subjects, mark attendance,
  attendance history, students, reports, profile
- **Student panel** (`/student/...`) — dashboard, my attendance, subjects, attendance
  history, notifications, profile

All data is realistic **mock data** (`data/mock.ts`), generated deterministically so it's
stable across server/client renders. No backend, database or auth server is included —
everything is structured so a real API can be dropped in later (`data/mock.ts` and the
`types/` folder describe the contract to replace).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Log in with any role from `/login` — no real credentials are
checked, it's a frontend demo of authentication only.

## Project structure

```
app/            Routes (landing, login, admin/*, teacher/*, student/*)
components/
  ui/           Button, Badge, Modal, DataTable, FormField, Avatar, Toast, Skeleton…
  layout/       Sidebar, Topbar, DashboardShell, PublicNavbar, Footer, PageHeader
  dashboard/    DashboardCard (stat cards)
  charts/       Recharts wrappers (bar, line/area, horizontal bar, donut)
  landing/      Hero mockup widget
data/           Mock dataset (students, teachers, classes, subjects, attendance…)
types/          Shared TypeScript types — the contract for a future backend
lib/            cn(), formatting helpers, nav config
```

## Notes

- Fonts (Inter, Space Grotesk) load from Google Fonts via a `<link>` tag in `app/layout.tsx`,
  so an internet connection is needed at runtime for the custom typefaces — they fall back
  to clean system fonts otherwise. No external calls happen at build time.
- Add / Edit / Delete actions (students, teachers, classes, subjects) update in-memory React
  state only; refreshing the page resets to the seed mock data.
- "Mark Attendance" saves to component state for the session (no persistence yet).
- Export buttons are UI-only and show a toast instead of generating a real file.
- Responsive: sidebar becomes a drawer below `lg`, tables scroll horizontally on small
  screens, and dashboard cards stack down to 2 columns on mobile.

## Connecting a real backend later

- Replace the arrays in `data/mock.ts` with fetch calls (e.g. React Query / SWR) that
  return the same shapes defined in `types/index.ts`.
- Swap the mock login in `app/login/page.tsx` for a real auth call, and gate the
  `app/admin`, `app/teacher`, `app/student` layouts behind a session check / middleware.
- "Save" actions (Mark Attendance, Add/Edit/Delete Student/Teacher/Class/Subject) already
  call clear, single functions — point those at API mutations instead of `setState`.
