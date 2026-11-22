# VMS 3D Spare-Parts Dashboard

Production-style React/TypeScript rebuild of the standalone `VMS_3D_Spare_Parts_Dashboard v2` prototype. The original HTML files in the parent folder are left untouched.

## Quick start

```bash
cd vms-dashboard
npm install
cp .env.example .env   # Windows: Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173` and sign in with the demo account:

- Username: `omar nad`
- Password: `admin123`

> **Security warning:** this is a demo-only auth plugin for local development/preview. The password is stored as a bcrypt hash in `.env` (`VMS_PASSWORD_HASH`), never in client code. Sessions use a signed `httpOnly` cookie and login is rate limited. Change the default password and `VMS_SESSION_SECRET` before any deployment, and replace the Vite middleware with a real backend. When generating a new hash, escape every `$` as `\$` in `.env` so Vite's dotenv loader does not expand it.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server with the demo auth middleware |
| `npm run build` | Type-check project references, then production build |
| `npm run preview` | Preview the built app with the same auth middleware |
| `npm run typecheck` | TypeScript project check without emitting files |
| `npm run lint` | ESLint over the source and config |

## Stack and libraries

- **Framework/build:** Vite 7, React 19, TypeScript 5.9, React Router 7
- **Styling:** Tailwind CSS 4 (`@tailwindcss/vite`), custom design tokens, logical CSS properties for RTL
- **Animation:** Motion, Framer Motion, GSAP, three.js
- **Charts:** Recharts 3
- **i18n:** i18next, react-i18next with `en`, `fr`, `ar`, `zgh` resources; Arabic RTL and Tifinagh font; `Intl` number/date/money formatting
- **Forms/validation:** Zod 4
- **Icons:** lucide-react
- **Auth:** bcryptjs, signed `httpOnly` cookie, demo Vite middleware
- **Installed component packs:**
  - **Skiper UI:** `skiper40`, `skiper41`, `skiper49`, `skiper101` (tooltip)
  - **Vengeance UI:** `animated-button`, `animated-rays`
  - **Magic UI:** `shimmer-button`, `border-beam`, `dot-pattern`, `blur-fade`, `animated-gradient-text`
  - **Aceternity UI:** `background-beams`, `hover-border-gradient`
  - **shadcn/ui:** button, card, input, label, skeleton, dropdown-menu, select, dialog, tooltip, badge, separator
- **Animmaster Lib** is a paid Google-Drive component pack with no installable registry package. As requested, it was replaced with Magic UI, Aceternity UI and shadcn/ui components; the installed components are listed above.

## Structure

```text
src/
  assets/                 vms-logo.png restored from the original prototype + favicon
  components/
    brand/                VMS logo, identity backdrop, nudge/bounce GSAP animation, lazy three.js scene
    common/               Page header, cards, skeleton, toast, error boundary
    layout/               App shell, sidebar, header
    ui/                   shadcn/Skiper/Vengeance/Magic/Aceternity components
  data/seed.ts            Typed prototype data and search catalogue
  features/
    admin/                JIT grants, data sources, audit, model versions
    alerts/               Severity/status alert queue
    auth/                 Login, auth context, protected routes, auth service
    dashboard-state/      Shared decisions, audit, grants and filter state
    forecast/             Forecast math and Recharts demand chart
    insights/             Satisfaction, failure and unmet-request analytics
    overview/             Connected operations overview
    recommendations/      Transfers/imports with decisions and audit trail
    search/               Debounced global search with keyboard navigation
    splash/               Once-per-session splash
  hooks/                  Debounce, theme, reduced motion, visibility, persistence
  i18n/                   Resources, language detection, formatting helpers
  styles/index.css        Tokens, Tailwind theme, RTL and reduced-motion rules
server/authPlugin.ts      Demo-only signed-session auth middleware
```

## Behaviour notes

- The original **VMS logo** was restored from the prototype and the `E.png` / espacia logo removed. The motorcycle is gone, but the original nudge-and-bounce GSAP timing is unchanged (first run at 700ms, then every 10s) on the splash and header logos; it pauses when the tab is hidden, respects reduced motion and cleans up on unmount.
- A VMS-identity backdrop sits behind the splash, login and dashboard: charcoal depth with drifting signature red/cyan glows, a technical blueprint grid, diagonal guide lines and a faint VMS wordmark. It is decorative, pointer-event free and disabled under reduced motion.
- Theme defaults to the system preference, persists to `localStorage`, and is applied before first paint to avoid flashing.
- Global search is debounced at 250ms, supports `Ctrl`/`Cmd+K`, grouped highlighted results, keyboard navigation and navigation into the relevant page.
- Forecast defaults to **All agencies** and aggregates demand, revenue and chart series across agencies. The price what-if updates both the numbers and the 3D scene.
- All dashboard workflow step indicators (`1/6 … 6/6`) and the old "next step" workflow space were removed.
- Recommendation decisions and audit entries persist locally for the demo; every decision writes an audit event with its reason.

## i18n

All interface strings live in `src/i18n/locales/*.ts`. Add a fifth language by adding a locale object typed against `typeof en`, registering it in `src/i18n/index.ts`, and adding its `Intl` locale in `src/i18n/format.ts`.
