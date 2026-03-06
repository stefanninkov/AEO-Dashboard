# AEO Dashboard — Master Implementation Plan

> **Created:** 2026-03-06
> **Last Updated:** 2026-03-06
> **Branch:** `claude/review-plan-status-wn5vR`
> **Status:** ALL 4 PHASES COMPLETE (with remaining future enhancements noted)

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
- [x] Define 4 preset layouts (Overview, SEO Focus, Content Focus, Competitive Intel)
- [x] Layout switcher UI in DashboardView header (`DashboardPresetSwitcher`)
- [x] Persist selected layout per user in localStorage
- [x] Section visibility control per preset

### 2.2 Onboarding — Product Tour + Checklist
- [x] **Product Tour** (`ProductTour.jsx`): 5-step tooltip walkthrough, keyboard nav, skip option, localStorage tracking
- [x] **Getting Started Checklist** (`GettingStartedChecklist.jsx`): 6 tasks, auto-detection, floating widget, confetti on completion

### 2.3 Inline Editing
- [x] `InlineEditor` component with click-to-edit, single/multi-line, undo/redo
- [x] Keyboard shortcuts (Enter save, Escape cancel, Ctrl+Z undo)
- [x] Uses `useUndoRedo` hook for state management
- [x] Integrated into BriefView for inline title editing

### 2.4 Templates & Presets
- [x] `TemplatesBrowser` modal component with built-in templates
- [x] Content templates: Blog Post, FAQ Page, Product Page, Landing Page
- [x] Schema templates: Organization, Article, FAQ, Product, HowTo, etc.
- [x] User can save custom templates, favorites, search/filter
- [x] Integrated into ContentOpsView and SchemaGeneratorView (onSelect populates form fields)

### 2.5 Batch Operations
- [x] `BulkActionBar` component — multi-select with bulk complete/clear/assign
- [x] `BulkFixGenerator` — AI-powered bulk fix for multiple analysis items
- [x] Multi-select in ChecklistView with BulkActionBar integration
- [x] Multi-select in PageAnalysisTable with bulk re-analyze/remove
- [x] Batch export capabilities

### 2.6 Undo/Redo System
- [x] `useUndoRedo` hook (configurable history stack, max 50 entries)
- [x] Applied to InlineEditor for text editing
- [x] Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
- [x] Visual undo/redo buttons in InlineEditor toolbar

### 2.7 Advanced Charts Integration
- [x] Heatmaps for engine performance (`MetricsView` new heatmap tab)
- [x] Treemaps for site structure (`AeoTreemapChart` integrated in SeoView > Structure tab)
- [x] Waterfall charts for score breakdowns (integrated in `BenchmarkTab`)
- [x] Funnel charts for user conversion in admin (`AdminDashboard`)
- [x] Animated data transitions (`AnimatedChartWrapper`)
- [x] Drill-down interactions (`DrilldownWrapper` component)

---

## Phase 3 — User-Facing Pages & UX Polish

**Focus:** Landing page redesign, waitlist conversion, UX polish, PWA.

### 3.1 Landing Page Full Redesign
- [x] Full landing page with hero, features, pricing, testimonials, FAQ sections (1100+ lines)
- [x] Responsive design with mobile menu support
- [x] Dark theme with smooth scroll animations
- [x] Intersection observer scroll effects
- [x] Dedicated `LandingPage.css` stylesheet
- [x] **Case studies section** with 3 success stories (metrics, quotes, industry)
- [x] **Video demo section** with play button overlay and description
- [x] **Feature comparison table** (AEO Dashboard vs Manual Tools vs Traditional Platforms)
- [x] **Social proof section** with trusted-by logos and live user count
- [ ] Firestore collections for dynamic data (future: `lp_testimonials`, `lp_case_studies`)
- [ ] A/B testing support (future enhancement)

### 3.2 Waitlist Conversion Optimization
- [x] Multi-step signup flow (16-step scorecard quiz)
- [x] **Referral program** (`referralSystem.js`):
  - Unique referral codes per user (deterministic from email)
  - Referral link builder with URL params
  - 4 reward tiers (1, 3, 5, 10 referrals)
  - Share buttons (Twitter, LinkedIn, email, copy link)
  - Auto-detect referral source from URL
- [x] Social sharing post-signup (Twitter, LinkedIn, clipboard)
- [x] Counter-up animation showing waitlist count
- [x] Lead tracking and conversion metrics
- [x] Better mobile experience (responsive CSS)
- [x] **Urgency/scarcity elements:**
  - Countdown timer ("Early access closes in X days")
  - "X spots remaining" messaging
  - Queue position display ("You're #Y in line")
  - Recent signups ticker ("Alex from Berlin just joined 2m ago")
- [x] **Referral dashboard UI** (`ReferralDashboard.jsx`):
  - Stats grid (people referred, current tier)
  - Tier progress bar with next reward
  - All 4 tiers displayed with earned/locked state
  - Referral link with copy button
  - Share buttons (Twitter/X, LinkedIn)

### 3.3 UX Polish — Page Transitions & Animations
- [x] Smooth view transitions (15+ CSS @keyframes animations)
- [x] Skeleton screens for all major views (`Skeleton.jsx`)
- [x] Empty states for all views (`EmptyState.jsx`)
- [x] Contextual help system (`HelpChatTab.jsx`)
- [x] Loading states with shimmer and progress indicators
- [x] Micro-interactions: hover effects, card transitions, check animations

### 3.4 Celebrations & Gamification
- [x] **Confetti moments** (`Celebration.jsx`): milestones, score achievements
- [x] **Gamification system** (`gamification.js`):
  - Points system: 13 action types (analyze=10, checklist=5, schema=6, etc.)
  - 12 badges: First Steps, Speed Demon, Perfectionist, Checklist Champion, etc.
  - Streak tracking (current + longest) with fire indicators
  - 8-level system: Beginner → Grandmaster (0-2000 XP)
- [x] **Gamification components**:
  - `BadgeDisplay.jsx` — earned/locked badges grid
  - `LevelProgress.jsx` — level + XP progress bar
  - `StreakIndicator.jsx` — fire streak display
  - `PointsCounter.jsx` — animated XP counter
- [x] Integrated into Settings > Achievements tab
- [x] **`useGamification` hook** — persistent gamification state via localStorage
  - `trackAction(type)` function wired to actual user events
  - Integrated into AnalyzerView, ChecklistView, ContentWriterView, SchemaGeneratorView
  - Automatic streak calculation and badge checking
  - Action-specific counter tracking (analyses, schemas, briefs, etc.)
- [x] Micro-animations: fade-in-up, number counting transitions, card entrance

### 3.5 Progressive Web App (PWA)
- [x] Service worker (`sw.js`) with sophisticated caching (cache v3)
- [x] Web app manifest (`manifest.json`) — standalone mode
- [x] Cache strategy: cache-first for assets, network-first for data
- [x] Auto-registration in `main.jsx`
- [x] App icons (192x192, 512x512 SVG)

---

## Phase 4 — Admin Upgrade, Testing & PWA

**Focus:** Admin panel full upgrade, comprehensive testing, final polish.

### 4.1 Admin Data Visualization
- [x] AdminDashboard: user conversion funnel chart (`AeoFunnelChart`)
- [x] AdminAnalytics: 10+ chart types (trends, engagement, adoption, demographics, funnel)
- [x] AdminRevenue: full dashboard with MRR trend, churn rate, plan distribution, conversion funnel, revenue breakdown (waterfall)
- [x] AdminChurn: churn trend, user journey funnel, drop-off analysis, retention cohorts
- [x] AdminWaitlist: score distribution, pipeline analytics, conversion funnel

### 4.2 Admin CRM Enhancement
- [x] **Lead scoring:** Integrated with scorecard system, tier-based filtering, score display
- [x] **Email system:**
  - BulkEmailComposer with filter-based targeting
  - LeadEmailComposer for individual leads
  - EmailTemplateModal for template management
  - NudgeEmailDialog for at-risk user re-engagement
- [x] **Pipeline Board:** Kanban-style with drag-drop, 4 stages
- [x] **Conversion funnels:** Visual funnel with drop-off rates
- [x] **Export:** CSV/PDF export with filters applied
- [x] **Filtering:** Score tier, lead tier, role, timeline, status, language filters

### 4.3 Comprehensive Testing
- [x] **Unit tests** (Vitest + RTL): 19 test files, 226 tests
  - Utility tests: generatePdf, activityLogger, sanitizeUrl, dataCache, generateReport, webhookDispatcher, apiClient, roles, chartColors, logger, generateCsv
  - Hook tests: usePermission, useReducedMotion, useLocalStorage, useDebounce, useShareLink
  - Data tests: aeo-checklist
  - **NEW:** gamification.test.js (23 tests), referralSystem.test.js (12 tests)
- [x] Test setup: `src/test/setup.js` with localStorage mock, jest-dom matchers
- [x] **E2E tests** (Playwright):
  - `playwright.config.js` configured with Chromium, web server auto-start
  - `e2e/waitlist.spec.js` — hero, navigation, scorecard quiz, FAQ, theme toggle
  - `e2e/landing.spec.js` — page load, features, pricing, FAQ accordion
  - `e2e/dashboard.spec.js` — load, sidebar navigation, hash routing, settings
  - `e2e/admin.spec.js` — admin panel load, navigation
- [x] **CI/CD GitHub Actions** (`.github/workflows/ci.yml`):
  - Lint & test job: npm ci, vitest run, vite build
  - E2E job: Playwright with artifact upload
  - Deploy job: auto-deploy to GitHub Pages on main branch push

### 4.4 Final Polish & Performance
- [x] Performance: 7 manual vendor chunks (react, firebase, recharts, lucide, zustand, i18n, jspdf)
- [x] Code splitting: lazy-loaded views with React.lazy + Suspense
- [x] SEO: meta tags, OG tags, Twitter cards, CSP headers in index.html
- [x] Error handling: ErrorBoundary component, connection banners
- [x] Accessibility: extensive ARIA labels, keyboard navigation, screen reader support
- [x] PWA: manifest.json + sw.js with sophisticated caching

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
