# AEO Dashboard — Master Implementation Plan

> **Created:** 2026-03-06
> **Last Updated:** 2026-03-06
> **Branch:** `claude/review-plan-status-wn5vR`
> **Status:** Phase 1 COMPLETE — Ready for Phase 2 implementation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current State Summary](#current-state-summary)
3. [All Decisions Made](#all-decisions-made)
4. [Phase 1 — Foundation & Core Features](#phase-1--foundation--core-features)
5. [Phase 2 — Advanced Features & Data Viz](#phase-2--advanced-features--data-viz)
6. [Phase 3 — User-Facing Pages & UX Polish](#phase-3--user-facing-pages--ux-polish)
7. [Phase 4 — Admin Upgrade, Testing & PWA](#phase-4--admin-upgrade-testing--pwa)
8. [Critical Rules](#critical-rules)
9. [Architecture Notes](#architecture-notes)
10. [File Map](#file-map)

---

## Project Overview

**AEO Dashboard** is a comprehensive Answer Engine Optimization platform. It's a React 19 + Vite app with Firebase/Firestore backend, i18next for 3 locales (EN, DE, SR), Tailwind CSS v4, and Recharts for data viz.

The app has 4 entry points:
- **Waitlist Page** (`/` default) — public, email signup + AEO scorecard quiz
- **Landing Page** (`/features`) — public, full product marketing page
- **Dashboard App** (`/app`) — authenticated, main product with 15+ views
- **Admin Panel** (`/admin`) — authenticated, super-admin CRM + analytics

**Goal:** Transform the dashboard into a world-class AEO/SEO platform with modern data viz, real API integrations, polished UX, and optimized conversion funnel. Go big.

---

## Current State Summary

### Tech Stack
- **Framework:** React 19.2.4 + Vite 7.3.1
- **Styling:** Tailwind CSS v4.1.18 (via @tailwindcss/vite)
- **State:** React hooks + Firestore (NO global state manager yet)
- **Charts:** Recharts 3.7.0
- **Icons:** Lucide React 0.563.0
- **i18n:** i18next + react-i18next (3 locales: en, de, sr)
- **Backend:** Firebase/Firestore
- **PDF:** jspdf + jspdf-autotable
- **Testing:** Vitest 4.0.18 + @testing-library/react 16.3.2 + jsdom
- **Routing:** Custom hash router (`useHashRouter`)

### Existing Dashboard Views (15)
1. `DashboardView` — overview with stat cards, phase donut, recommendations
2. `ChecklistView` — 7-phase AEO checklist with progress tracking
3. `AnalyzerView` — page analysis with fix generator, bulk fixes
4. `ContentWriterView` — AI content writer
5. `ContentScorerView` — content quality scorer
6. `ContentOpsView` — content calendar, briefs, history
7. `SchemaGeneratorView` — structured data generator
8. `SeoView` — SEO audit, on-page, technical, content optimization, keywords (recently enhanced with 16 features)
9. `MonitoringView` — auto-monitoring, content decay
10. `MetricsView` — AEO metrics with date ranges
11. `CompetitorsView` — citation DNA, citation share, content gaps, monitoring
12. `GscView` — Google Search Console integration
13. `Ga4View` — Google Analytics 4 integration
14. `AeoImpactView` — AEO impact analysis
15. `TestingView` — AEO testing tools
16. `DocsView` — documentation
17. `SettingsView` — project settings, integrations, team, webhooks

### Existing Admin Views (12)
1. `AdminDashboard` — overview stats
2. `AdminUsers` — user management
3. `AdminProjects` — project browser
4. `AdminActivity` — activity feed
5. `AdminRevenue` — revenue tracking
6. `AdminAnalytics` — usage analytics
7. `AdminSettings` — admin config
8. `AdminFeedback` — user feedback
9. `AdminChatLogs` — AI chat logs
10. `AdminWaitlist` — waitlist management with pipeline board, bulk email, templates
11. `AdminChurn` — churn analysis
12. `AdminTasks` — task management

### Existing Components
- Onboarding: `OnboardingQuiz`, `OnboardingTutorial`, `ProjectQuestionnaire`
- Export: `PdfExportDialog`, `CsvExportDialog`, `EmailReportDialog`
- UX: `CommandPalette`, `KeyboardShortcutsModal`, `HelpWidget`, `Celebration`, `Toast`, `EmptyState`, `Skeleton`
- Collaboration: `PresenceAvatars`, `PresenceHint`, `NotificationCenter`
- Data: `Sparkline`, `AnimatedNumber`, `ProgressBar`, `DataConfidenceLabel`

### Existing Hooks (30+)
- Auth: `useAuth`, `usePermission`, `usePresence`
- Data: `useFirestoreProjects`, `useAeoMetrics`, `useGscData`, `useGa4Properties`
- Competitors: `useCompetitorAnalysis`, `useCompetitorMonitor`, `useCitationDNA`, `useCitationShare`, `useContentGaps`, `useContentDecay`
- SEO: `useSeoAnalyzer` (in seo/ view folder)
- Utility: `useHashRouter`, `useModalManager`, `useDebounce`, `useLocalStorage`, `useReducedMotion`, `useScrollActiveTab`, `useFocusTrap`, `useGridNav`
- Features: `useAutoMonitor`, `useDigestScheduler`, `useNotifications`, `useWaitlist`, `useShareLink`, `useUsageStats`, `useWebhooks`

### Existing Tests
- Unit tests exist for: `aeo-checklist`, `useDebounce`, `useLocalStorage`, `usePermission`, `useReducedMotion`, `useShareLink`, `activityLogger`, `apiClient`, `chartColors`, `dataCache`, `generateCsv`, `generatePdf`, `generateReport`, `logger`, `roles`, `sanitizeUrl`, `webhookDispatcher`
- Test setup: `src/test/setup.js`
- Config: Vitest in `vite.config.js`

---

## All Decisions Made

### Scope & Approach
- **Scope:** Go big — everything across all views
- **Approach:** Foundation first, phased delivery (4 phases)
- **Critical rule:** DON'T BREAK ANYTHING EXISTING

### New Features
- **Competitor benchmarking:** Full intelligence — side-by-side comparison with radar charts, automated weekly tracking with alerts, benchmark scores with win/lose indicators
- **Smart recommendations:** AI-powered, contextual recommendations across all views
- **Score history timeline:** Track and visualize score changes over time
- **Customizable dashboard:** 3-4 preset layouts users can switch between (e.g., "SEO Focus", "Content Focus", "Overview", "Competitive Intel")

### Data Visualization (add to Recharts)
- Radar/spider charts (competitor comparisons)
- Heatmaps (content performance, keyword density)
- Treemaps (site structure, content distribution)
- Waterfall charts (score breakdowns)
- Funnel charts (conversion flows)
- Animated transitions between data states
- Interactive drill-downs (click chart elements to see details)
- Live data indicators (pulsing dots, real-time update badges)

### Workflow
- **Onboarding:** Both guided product tour (tooltip walkthrough of features) AND persistent getting started checklist ("Set up project", "Run first analysis", "Connect GSC", etc.)
- **Inline editing:** Edit content directly in analysis views without navigating to separate editors
- **Templates/presets:** Pre-built configurations for common use cases
- **Undo/redo:** For content editing and configuration changes
- **Batch operations:** Select multiple items, apply actions in bulk

### UX Polish
- Page transitions (smooth view switching with framer-motion or CSS)
- Better loading states (skeleton screens per view — some exist, expand to all)
- Empty states for all views (some exist via EmptyState component, expand)
- Guidance tooltips (contextual help throughout the app)
- Celebrations: Mix of confetti for milestones, gamification elements (points/badges/streaks), and subtle micro-animations for everyday actions
- Full responsive/mobile improvements → **Progressive Web App** (installable, offline mode, push notifications)

### Data Layer
- **SEO APIs:** Both user-provided API keys AND backend proxy support (with usage limits for proxy)
  - SEMrush API
  - Ahrefs API
  - Moz API
  - AI fallback when no API keys configured
- **State management:** Add Zustand for global state management
- **Landing page:** Make testimonials and mockup data dynamic (Firestore-backed)

### Landing Page (/features) — FULL REDESIGN
- Completely rethink with new conversion flow
- New sections to add:
  - Case studies / success stories with real metrics
  - Video demo / interactive product walkthrough
  - Feature comparison table (AEO Dashboard vs competitors)
  - Social proof widgets (live user count, "trusted by" logos, recent activity, press mentions)
- A/B testing support
- All data dynamic via Firestore

### Waitlist Page (/) — CONVERSION OPTIMIZATION
- Redesign for better conversion
- Above-fold CTA optimization
- **Referral program:** Unique referral links, rewards for sharing (priority access, free months)
- **Multi-step signup:** Email first → optional company/role → quiz for personalization
- **Urgency + scarcity:** Countdown timers, limited spots messaging, "X people ahead of you" queue position
- Progress indicators
- Email sequences

### Admin Panel (/admin) — FULL UPGRADE
- Add charts/graphs/visual analytics to all admin views (revenue trends, user growth, churn rates)
- Enhanced CRM: lead scoring, automated workflows, email sequences, conversion funnels
- Better filtering and export capabilities
- Real-time updates

### Testing
- Full test coverage with Vitest + React Testing Library (unit/integration)
- Playwright for E2E tests
- Expand existing test suite significantly

### Libraries to Add
- `zustand` — global state management
- `dnd-kit` — drag-and-drop (for widget layouts, kanban boards)
- Additional as needed (e.g., `framer-motion` for animations, chart libraries)

### Auth
- User-provided API keys for SEO services (stored securely)
- Optional backend proxy with usage limits

---

## Phase 1 — Foundation & Core Features

**Focus:** Set up the foundation (Zustand, new chart types), then build core new features.

### 1.1 Zustand Store Setup
- [x] Install zustand (v5.0.11)
- [x] Create store structure:
  - `useAppStore` — global app state (active view, sidebar, modals, theme)
  - `useProjectStore` — active project, projects list, project mutations
  - `useAuthStore` — user, auth state
  - `useNotificationStore` — notifications, unread count
  - `useSeoStore` — SEO analysis state, API keys, cached results
- [x] Migrate existing state from App.jsx gradually (don't break existing)
- [x] Keep Firestore sync — Zustand as client cache, Firestore as source of truth

### 1.2 Data Visualization Foundation
- [x] Create reusable chart components:
  - `AeoRadarChart` — for competitor comparisons (using Recharts Radar)
  - `HeatmapChart` — custom component for content/keyword heatmaps
  - `AeoTreemapChart` — using Recharts Treemap
  - `WaterfallChart` — custom component for score breakdowns
  - `AeoFunnelChart` — using Recharts Funnel or custom
- [x] Add animated transitions to existing charts (`AnimatedChartWrapper`)
- [x] Create `LiveIndicator` component (pulsing dot + "Live" badge)
- [x] Create `DrilldownWrapper` component for interactive chart drill-downs
- [x] Consistent chart theming (dark mode support, color palette)

### 1.3 Score History Timeline
- [x] Data model: store score snapshots in Firestore per project (date, scores object, source)
- [x] `useScoreHistory` hook — fetch, cache, and manage score history
- [x] `ScoreHistoryChart` component — area/line chart with time range selector
- [x] Score comparison (overlay two time periods)
- [x] Auto-record scores on each analysis run
- [x] Add to DashboardView and relevant views

### 1.4 Competitor Benchmarking Enhancement
- [x] Side-by-side comparison dashboard with radar charts (`BenchmarkTab.jsx`)
- [x] Overlay your scores vs competitors on same chart
- [x] Gap analysis visualization (what competitors do better/worse)
- [x] Automated weekly tracking:
  - Store competitor snapshots in Firestore
  - Background check on project load (if last check > 7 days ago)
  - Alert notifications when competitors improve significantly
- [x] Benchmark scoring: clear win/lose/tie indicators per dimension
- [x] Add to existing CompetitorsView as new tabs

### 1.5 Smart Recommendations Engine
- [x] `useRecommendations` hook — contextual recommendations based on:
  - Current scores and gaps
  - Competitor positioning
  - Industry benchmarks
  - User's checklist progress
- [x] `RecommendationCard` component — actionable cards with priority, impact estimate, and "Apply" button
- [x] Integrate into DashboardView, SeoView, AnalyzerView
- [x] AI-powered: use existing aiProvider for generating contextual advice

### 1.6 SEO API Integration Foundation
- [x] Create `src/utils/seoApiClient.js` — unified client for SEMrush, Ahrefs, Moz
- [x] API key management in Settings (encrypted storage via `secureStorage.js`)
- [x] Backend proxy support (Cloud Function stubs)
- [x] Rate limiting and caching layer
- [x] AI fallback: when no API keys, use AI to generate realistic analysis
- [x] Add API key configuration UI to SettingsView

---

## Phase 2 — Advanced Features & Data Viz

**Focus:** Advanced workflow features, preset layouts, and enhanced data viz.

### 2.1 Dashboard Preset Layouts
- [ ] Define 3-4 preset layouts:
  - **Overview** (default): stats + donut + recommendations + quick actions
  - **SEO Focus**: SEO scores + keyword trends + technical issues + competitors
  - **Content Focus**: content calendar + briefs + decay alerts + writer tools
  - **Competitive Intel**: competitor radar + citations + content gaps + alerts
- [ ] Layout switcher UI in DashboardView header
- [ ] Persist selected layout per user in Firestore
- [ ] Smooth transition animation between layouts

### 2.2 Onboarding — Product Tour + Checklist
- [ ] **Product Tour** (first login):
  - Step-by-step tooltip walkthrough of key features
  - Highlight sidebar nav, project selector, analyzer, checklist
  - "Skip tour" option
  - Track completion in Firestore
- [ ] **Getting Started Checklist** (persistent widget):
  - Floating checklist button (bottom-right or sidebar)
  - Tasks: "Create a project", "Run first analysis", "Check your checklist", "Connect Google Search Console", "Invite team member", "Set up monitoring"
  - Progress bar showing completion %
  - Auto-detect completed steps
  - Dismissible after all steps done
  - Celebrate completion with confetti

### 2.3 Inline Editing
- [ ] In AnalyzerView: edit page content directly from analysis results
- [ ] In ContentOpsView: inline edit calendar entries and briefs
- [ ] In ChecklistView: add custom items inline
- [ ] Undo/redo support for inline edits (simple state stack)

### 2.4 Templates & Presets
- [ ] Analysis templates: pre-configured analysis settings for common scenarios
- [ ] Content templates: blog post, FAQ page, product page, landing page
- [ ] Schema templates: Organization, Article, FAQ, Product, HowTo
- [ ] Template browser UI component
- [ ] User can save custom templates

### 2.5 Batch Operations
- [ ] Multi-select in AnalyzerView (select multiple pages)
- [ ] Bulk actions: analyze all, export selected, apply fix to all
- [ ] Multi-select in ChecklistView (check/uncheck multiple items)
- [ ] Batch export (PDF/CSV for selected items)
- [ ] Use existing `BulkActionBar` component, extend as needed

### 2.6 Undo/Redo System
- [ ] Create `useUndoRedo` hook (state history stack)
- [ ] Apply to: inline editing, configuration changes, checklist toggling
- [ ] Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
- [ ] Visual indicator: undo/redo buttons in toolbar when applicable

### 2.7 Advanced Charts Integration
- [ ] Heatmaps for content performance across pages
- [ ] Treemaps for site structure visualization
- [ ] Waterfall charts for score breakdowns (show contribution of each factor)
- [ ] Funnel charts for user conversion in admin
- [ ] Animated data transitions (smooth updates when data changes)
- [ ] Drill-down interactions (click a chart segment to see details)

---

## Phase 3 — User-Facing Pages & UX Polish

**Focus:** Landing page redesign, waitlist conversion, UX polish, PWA.

### 3.1 Landing Page Full Redesign
- [ ] New information architecture:
  1. Hero: bold headline, animated product demo, primary CTA
  2. Social proof bar: "Trusted by X users", company logos, live counter
  3. Problem/solution: animated before/after comparison
  4. Feature showcase: interactive product walkthrough (not static mockups)
  5. Case studies: 3 success stories with real metrics (Firestore-backed)
  6. Video demo: embedded product demo video
  7. Comparison table: AEO Dashboard vs manual SEO vs other tools
  8. Pricing: redesigned tiers with feature toggles
  9. Testimonials: dynamic carousel (Firestore-backed)
  10. FAQ: improved accordion with search
  11. Final CTA: compelling conversion section
  12. Footer: redesigned
- [ ] Firestore collections for dynamic data:
  - `lp_testimonials` — name, role, company, quote, avatar
  - `lp_case_studies` — title, metrics, description, image
  - `lp_social_proof` — logos, user count, stats
  - `lp_pricing` — tiers, features, prices (so you can A/B test)
- [ ] A/B testing support (feature flag based)
- [ ] Smooth scroll animations (intersection observer)
- [ ] Mobile-first responsive design
- [ ] New CSS file or major overhaul of `LandingPage.css`

### 3.2 Waitlist Conversion Optimization
- [ ] Above-fold redesign: clear value prop + immediate CTA
- [ ] **Multi-step signup flow:**
  1. Step 1: Email + name (minimal friction)
  2. Step 2: Company + role + website (optional)
  3. Step 3: AEO scorecard quiz (optional, for personalization)
- [ ] **Referral program:**
  - Generate unique referral codes per user
  - Track referrals in Firestore
  - Reward: priority access, discount on launch
  - Share buttons (Twitter, LinkedIn, email, copy link)
  - Referral dashboard: "You've referred X people"
- [ ] **Urgency/scarcity elements:**
  - "Only X beta spots remaining" (configurable from admin)
  - Queue position: "You're #Y in line"
  - Countdown to next cohort/launch
  - Recent signups ticker: "Sarah from NYC just joined"
- [ ] Email sequence hooks (trigger welcome email, drip campaign markers in Firestore)
- [ ] Better mobile experience

### 3.3 UX Polish — Page Transitions & Animations
- [ ] Smooth view transitions (CSS animations or framer-motion)
- [ ] Skeleton screens for ALL views (expand existing)
- [ ] Empty states for ALL views (expand existing `EmptyState`)
- [ ] Contextual guidance tooltips throughout the app
- [ ] Improved loading states with progress indicators
- [ ] Micro-interactions: button hover effects, card transitions, toggle animations

### 3.4 Celebrations & Gamification
- [ ] **Confetti moments:** First analysis complete, checklist phase done, 100% score, milestone reached
- [ ] **Gamification:**
  - Points system: earn points for actions (analyze page = 10pts, complete checklist item = 5pts, etc.)
  - Badges: "First Analysis", "Speed Demon" (fast completion), "Perfectionist" (100% score), etc.
  - Streaks: daily login/usage streaks with multipliers
  - Level system: Beginner → Intermediate → Expert → Master
  - Profile section showing badges and stats
- [ ] **Subtle micro-animations:**
  - Satisfying check animations on task completion
  - Smooth number counting transitions
  - Gentle pulse on new data
  - Card entrance animations on view load

### 3.5 Progressive Web App (PWA)
- [ ] Service worker for offline support
- [ ] Web app manifest (`manifest.json`)
- [ ] Install prompt UI ("Add to home screen")
- [ ] Offline fallback page
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Cache strategy: cache-first for static assets, network-first for data
- [ ] App icons in multiple sizes

---

## Phase 4 — Admin Upgrade, Testing & PWA

**Focus:** Admin panel full upgrade, comprehensive testing, final polish.

### 4.1 Admin Data Visualization
- [ ] AdminDashboard: add real-time charts
  - User growth line chart (daily/weekly/monthly)
  - Revenue trend chart
  - Active users gauge
  - Signup funnel chart
- [ ] AdminAnalytics: enhanced with:
  - Feature usage heatmap
  - User engagement scores
  - Session duration charts
  - Geographic distribution map
- [ ] AdminRevenue: MRR chart, churn rate chart, LTV calculation
- [ ] AdminChurn: cohort analysis chart, retention curves
- [ ] AdminWaitlist: conversion funnel, referral network visualization

### 4.2 Admin CRM Enhancement
- [ ] **Lead scoring:** Automatic scoring based on engagement, company size, role, quiz results
- [ ] **Automated workflows:**
  - When lead score > threshold → auto-move to pipeline stage
  - When inactive > X days → trigger re-engagement email
  - When trial expires → trigger conversion email
- [ ] **Email sequences:**
  - Welcome sequence (5 emails)
  - Onboarding sequence (3 emails)
  - Re-engagement sequence (3 emails)
  - Visual sequence builder
- [ ] **Conversion funnels:**
  - Waitlist → Signup → Active → Paying
  - Visual funnel with drop-off rates
  - Segment by source, role, company size
- [ ] Better filtering: advanced filter builder (AND/OR conditions)
- [ ] Export: enhanced CSV/PDF export with filters applied
- [ ] Real-time updates via Firestore listeners

### 4.3 Comprehensive Testing
- [ ] **Unit tests** (Vitest + RTL):
  - All utility functions
  - All hooks
  - All components (render + interaction)
  - Target: 80%+ coverage
- [ ] **Integration tests:**
  - Full view rendering with mock data
  - Navigation flows
  - Form submissions
  - Firebase interactions (mocked)
- [ ] **E2E tests** (Playwright):
  - Install and configure Playwright
  - Critical user flows:
    - Signup → Create project → Run analysis
    - Waitlist signup flow
    - Admin panel navigation
    - Export flows (PDF, CSV, Email)
  - Visual regression tests
- [ ] CI/CD: GitHub Actions workflow for test + build on PR

### 4.4 Final Polish & Performance
- [ ] Performance audit: bundle size analysis, code splitting optimization
- [ ] Accessibility audit: ARIA labels, keyboard navigation, screen reader testing
- [ ] SEO for public pages (meta tags, OG tags, structured data)
- [ ] Error tracking integration
- [ ] Analytics integration (beyond what exists)
- [ ] Documentation for developers (if needed)

---

## Critical Rules

1. **DON'T BREAK ANYTHING EXISTING** — All changes must be additive or careful modifications
2. **Phased delivery** — Complete each phase before moving to the next
3. **Test as you go** — Write tests for new features as they're built
4. **i18n** — All new user-facing strings must be translated to all 3 locales (en, de, sr)
5. **Dark mode** — All new components must support dark mode via CSS variables
6. **Accessibility** — All new components must be keyboard navigable and screen reader friendly
7. **Performance** — Lazy load new views, use code splitting, don't bloat the bundle
8. **Mobile** — All new features should be responsive (PWA is Phase 3)

---

## Architecture Notes

### State Management Migration (Zustand)
```
Current: App.jsx useState → props drilling → child components
Target:  Zustand stores → direct hook access in any component

Migration strategy:
1. Create Zustand stores alongside existing state
2. Gradually migrate consumers to use stores
3. Remove props drilling once all consumers migrated
4. Keep Firestore as source of truth — Zustand is client cache
```

### SEO API Architecture
```
User Settings (API keys) → seoApiClient.js
                               ↓
                    ┌──────────┼──────────┐
                    ↓          ↓          ↓
               SEMrush     Ahrefs       Moz
                    ↓          ↓          ↓
                    └──────────┼──────────┘
                               ↓
                         Unified Response
                               ↓
                    Cache (dataCache.js)
                               ↓
                    Component / Hook

Fallback: If no API keys → aiProvider.js generates analysis
Backend proxy: Cloud Function with usage limits per user
```

### File Organization for New Code
```
src/
  stores/              ← NEW: Zustand stores
    useAppStore.js
    useProjectStore.js
    useAuthStore.js
    useSeoStore.js
    useNotificationStore.js
  components/
    charts/            ← NEW: Reusable chart components
      RadarChart.jsx
      HeatmapChart.jsx
      TreemapChart.jsx
      WaterfallChart.jsx
      FunnelChart.jsx
      LiveIndicator.jsx
      DrilldownWrapper.jsx
    onboarding/        ← NEW: Onboarding components
      ProductTour.jsx
      GettingStartedChecklist.jsx
    gamification/      ← NEW: Gamification components
      BadgeDisplay.jsx
      PointsCounter.jsx
      StreakIndicator.jsx
      LevelProgress.jsx
  views/
    dashboard/
      presets/          ← NEW: Dashboard layout presets
  utils/
    seoApiClient.js    ← NEW: Unified SEO API client
    undoRedo.js        ← NEW: Undo/redo state manager
    referralSystem.js  ← NEW: Referral code generation/tracking
    gamification.js    ← NEW: Points, badges, levels logic
  e2e/                 ← NEW: Playwright E2E tests
```

---

## File Map

Key files to understand the codebase:

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app with routing (waitlist/LP/admin/dashboard), auth, modals |
| `src/hooks/useHashRouter.js` | Custom hash-based router for SPA |
| `src/hooks/useFirestoreProjects.js` | Project CRUD with Firestore sync |
| `src/hooks/useAuth.js` | Firebase authentication |
| `src/views/DashboardView.jsx` | Main dashboard with sub-components in `dashboard/` |
| `src/views/seo/SeoView.jsx` | SEO tab (recently enhanced with 16 features) |
| `src/views/CompetitorsView.jsx` | Competitor analysis with 5 tabs |
| `src/views/WaitlistPage.jsx` | Public waitlist page |
| `src/views/LandingPage.jsx` | Public features/marketing page |
| `src/admin/AdminApp.jsx` | Admin panel shell with 12 views |
| `src/utils/aiProvider.js` | AI provider abstraction |
| `src/utils/seoChecks.js` | SEO analysis utilities |
| `src/utils/seoScorer.js` | SEO scoring logic |
| `src/utils/secureStorage.js` | Encrypted storage for API keys |
| `src/firebase.js` | Firebase configuration |
| `src/contexts/ThemeContext.jsx` | Dark/light theme context |
| `src/i18n.js` | i18next configuration |
| `vite.config.js` | Vite + Tailwind + Vitest config |
| `package.json` | Dependencies (React 19, Vite 7, Firebase 12, Recharts 3) |

---

## Session Recovery Notes

If continuing in a new session, read this file first. Key context:
- The project is a deployed GitHub Pages app at `stefanninkov.github.io/AEO-Dashboard/`
- Firebase is used for auth + data, but the app also works in "dev mode" with localStorage fallback
- The `superAdmins.js` config gates admin access
- All CSS uses CSS custom properties (e.g., `--bg-page`, `--text-primary`, `--accent`)
- Hash router uses `#view-name` format (e.g., `#dashboard`, `#checklist`)
- Modals use `useModalManager` hook with open/closing/closed states
- The existing code is well-structured with lazy loading and code splitting
- Recent work added 16 SEO features, learn-more docs, and improved testing tab
