# AEO Dashboard — CLAUDE.md

_Read this at the start of every Claude Code session before touching any file._

---

## What This Project Is

AEO Dashboard is a SaaS tool for web agencies to audit, score, and optimize client websites for Answer Engine Optimization. React 19 + Vite 7 + Firebase/Firestore + Tailwind CSS v4. Currently in waitlist/pre-launch phase on GitHub Pages.

4 entry points:
- `/` — Waitlist page (public, 16-step scorecard quiz, referral system)
- `/?/features` — Landing page (full marketing page, not yet live as main)
- `/?/app` — Dashboard app (authenticated, 17+ views)
- `/?/admin` — Admin panel (super-admin only, 12 views)

---

## Session Recovery

If context is lost, read in order:
1. `PLAN.md` — original 4-phase plan (ALL COMPLETE)
2. `IMPROVEMENT_PLAN.md` — active sprint roadmap (10 sprints, sprints 4/5/9 not done)
3. `.interface-design/system.md` — canonical design system
4. `PROGRESS.md` — current status of everything
5. This file

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19.2.4 + Vite 7.3.1 |
| Styling | Tailwind CSS v4.1.18 via @tailwindcss/vite |
| State | Zustand stores + Firestore sync |
| Charts | Recharts 3.7.0 |
| Icons | Lucide React 0.563.0 |
| i18n | i18next (EN, DE, SR) |
| Backend | Firebase 12 (Firestore + Auth) |
| PDF | jspdf + jspdf-autotable |
| Testing | Vitest 4 + @testing-library/react + Playwright |
| Routing | Custom useHashRouter (hash-based SPA) |

---

## Critical Rules

### 1. Design system is in `.interface-design/system.md` — always check it first
- Font heading + body: **Plus Jakarta Sans**
- Font mono (data/code/values): **JetBrains Mono**
- Waitlist/marketing pages only: **Sora** for headings
- Accent: **#2563EB** (blue) — the ONLY accent. Never use phase colors for buttons/links.
- Theme: **Light default** (`:root`), dark via `[data-theme="dark"]`
- All values in **rem**, never px (except 1px borders)
- Every view's outermost div: `className="view-wrapper"`

### 2. DON'T BREAK ANYTHING EXISTING
All changes additive. Run `npm run build` and `npm test` before committing.

### 3. Firebase writes — always merge
```js
await setDoc(docRef, data, { merge: true });
```
Never bare `setDoc` without `{ merge: true }` unless intentional full overwrite.

### 4. i18n — all 3 locales
Any new UI string needs a key in `src/locales/en.json`, `de.json`, `sr.json`.

### 5. Routing pattern
Hash-based: `/?/app`, `/?/admin`, `/?/features`. The `useHashRouter` hook handles navigation. 404.html in /public handles GitHub Pages SPA redirect.

### 6. Admin is super-admin only
Guard check in AdminApp.jsx against Firestore `superAdmins` collection. Never remove.

---

## Key File Map

| File | Purpose |
|---|---|
| `src/App.jsx` | Main entry — routing, auth, modals |
| `src/hooks/useHashRouter.js` | Custom SPA hash router |
| `src/hooks/useFirestoreProjects.js` | Project CRUD + Firestore |
| `src/hooks/useAuth.js` | Firebase auth |
| `src/hooks/useWaitlist.js` | Waitlist lead CRUD + Firestore |
| `src/stores/` | Zustand stores (App, Auth, Project, Notification, Seo) |
| `src/views/WaitlistPage.jsx` | Public waitlist + scorecard |
| `src/views/LandingPage.jsx` | Public marketing/features page |
| `src/views/landing/` | Landing page section components (20 components) |
| `src/admin/AdminApp.jsx` | Admin panel shell |
| `src/admin/views/AdminWaitlist.jsx` | Waitlist CRM — leads, pipeline, email |
| `src/utils/aiProvider.js` | AI abstraction (Anthropic + OpenAI) |
| `src/utils/referralSystem.js` | Referral codes + tracking |
| `src/utils/gamification.js` | Points, badges, levels logic |
| `.interface-design/system.md` | Canonical design system |
| `public/robots.txt` | AI crawler access rules |
| `public/sitemap.xml` | Sitemap |
| `public/sw.js` | Service worker (PWA + caching) |

---

## Firestore — Waitlist Lead Document

```js
waitlist/{docId}: {
  email: string,
  name: string,
  website: string,
  createdAt: Timestamp,
  referralCode: string,        // from referralSystem.js
  referredBy: string | null,
  scorecard: {
    answers: { [questionId]: answerValue },  // ALL 14 answers
    score: number,             // 0-33
    tier: 'invisible' | 'starting' | 'developing' | 'strong',
    leadScore: number,         // 0-12
    leadTier: 'hot' | 'warm' | 'cold',
    abandonedAtStep: number | null,
    completedAt: Timestamp | null,
    qualification: {
      role: string,
      siteCount: string,
      timeline: string
    }
  }
}
```

---

## Known Outstanding Issues

1. **Lead Detail Panel** — verify all 14 scorecard answers are shown in AdminWaitlist.jsx detail panel, not just qualification + category scores
2. **Confirmation email** — no email sending client found. Firebase Function → Resend not built yet.
3. **Client Portal expansion** — Sprint 4 of IMPROVEMENT_PLAN not done (no PortalCompetitorsTab, PortalContentTab, PortalSeoTab, PortalMetricsTab, PortalBrandingSection)
4. **Push Notifications** — Sprint 5 not done (no pushNotifications.js)
5. **MobileTabBar.jsx** — Sprint 7 partially done (useBreakpoint exists, bottom tab bar missing)
6. **Sentry** — Sprint 9 not done

---

## What NOT to Do

- Don't install Tailwind v3 or any Tailwind version other than v4
- Don't use px for spacing (rem only)
- Don't hardcode colors — always CSS variables
- Don't add phase colors to buttons/links/focus rings
- Don't fabricate testimonials or placeholder data that looks real
- Don't remove the admin auth guard
- Don't use Space Mono anywhere (not in this project — that was wrong context)
- Don't use `#6366F1` indigo as accent (correct is `#2563EB` blue)

---

## Build + Deploy

```bash
npm run build       # must pass zero errors
npm test            # 226 tests must pass
npm run test:e2e    # Playwright E2E (requires dev server)
```

Push to `main` → GitHub Actions → Vite build → GitHub Pages at `stefanninkov.github.io/AEO-Dashboard/`.
