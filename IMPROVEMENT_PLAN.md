# AEO Dashboard — Improvement Plan

Based on your preferences: **New features first**, then polish, then technical foundation.

---

## What Already Exists (No Rebuild Needed)

After a thorough codebase audit, these features are already implemented:

| Feature | Status | Files |
|---------|--------|-------|
| Command palette (Cmd+K) | Complete | `CommandPalette.jsx` |
| Grouped/collapsible sidebar | Complete (4 groups, localStorage-persisted) | `Sidebar.jsx` |
| Notification center (bell icon) | Complete (unread badge, mark read, clear) | `NotificationCenter.jsx` |
| PDF export | Complete (10 sections, agency branding, logo upload) | `PdfExportDialog.jsx`, `generatePdf.js` |
| Email reports | Complete (manual send via EmailJS or mailto fallback) | `EmailReportDialog.jsx`, `emailService.js` |
| Skeleton loaders | Partial (Dashboard, Checklist, Metrics, Docs, Testing) | `Skeleton.jsx` |
| AI provider abstraction | Complete (Anthropic + OpenAI, model selection, cost tracking) | `aiProvider.js`, `apiClient.js` |
| Code splitting | Complete (15+ lazy-loaded views, vendor chunking) | `vite.config.js`, `App.jsx` |
| Dark mode | Complete (light/dark/auto, View Transition API, CSS variables) | `ThemeContext.jsx`, `index.css` |
| RBAC (admin/editor/viewer) | Complete | `roles.js`, `usePermission.js` |
| Real-time presence | Complete (heartbeat, online indicators) | `usePresence.js`, `PresenceAvatars.jsx` |
| i18n (EN, DE, SR) | Complete | `i18n.js`, `locales/` |
| Gamification | Complete (badges, levels, streaks, points) | `gamification/`, `useGamification.js` |
| Onboarding | Complete (quiz, tutorial, getting started) | `onboarding/` |
| PWA | Complete (service worker, manifest, icons) | `public/sw.js`, `manifest.json` |
| Content Writer + Scorer | Complete (AI-powered) | `ContentWriterView.jsx`, `ContentScorerView.jsx` |
| Schema Generator | Complete (AI-powered JSON-LD) | `SchemaGeneratorView.jsx` |
| Help Chat Widget | Complete (AI-powered, fast model) | `HelpChatTab.jsx` |
| Digest scheduling UI | Exists | `ProjectDigestSection.jsx`, `useDigestScheduler.js` |
| Activity logging | Exists | `activityLogger.js`, `ActivityTimeline.jsx` |
| Mobile sidebar | Partial (hamburger, collapsible, backdrop) | `Sidebar.jsx` |

---

## Phase 1: New Features (Priority)

### 1.1 AI Summaries on Every Data View
**Current state:** AI exists for content writing, scoring, schema, and help chat. But there are NO auto-generated data insights on Dashboard, Metrics, GSC, GA4, or Competitors views.

| Feature | Where | What it does |
|---------|-------|--------------|
| AI Insight Cards | Dashboard, Metrics, GSC, GA4, AEO Impact | Auto-generated plain-English analysis: "Your AEO score dropped 5pts because citation coverage fell in Phase 3" |
| AI Priority Suggestions | Checklist, Content Ops | "Focus on these 3 items next for maximum impact" based on current data |
| AI Competitor Insights | Competitors view | "Competitor X overtook you on FAQ schema — here's what they did differently" |
| AI Trend Analysis | Monitoring, Metrics | "Score trending down 3 weeks in a row — likely caused by..." |

**Implementation:** Create `src/hooks/useAiInsight.js` that takes a context object (metrics, scores, history) and returns a streaming AI summary. Add `<AiInsightCard />` component to each view. Reuse existing `apiClient.js` and `aiProvider.js`.

**New files:**
- `src/hooks/useAiInsight.js`
- `src/components/AiInsightCard.jsx`

**Modified files:** DashboardView, MetricsView, GscView, Ga4View, CompetitorsView, MonitoringView, ChecklistView, ContentOpsView

---

### 1.2 Global AI Chat Assistant
**Current state:** Help chat exists but is limited to the help widget. No way to ask questions about YOUR project data.

| Feature | Details |
|---------|---------|
| Floating chat button | Persistent button in bottom-right corner, opens sliding panel |
| Data-aware queries | "Why did my score drop this week?", "What's my weakest phase?", "Compare me to competitor X" |
| Context injection | Automatically feeds current project data (scores, checklist progress, metrics) into prompts |
| Conversation history | Persists per-project chat history in Firestore |

**Implementation:** Create `src/components/AiChatPanel.jsx` as a global sliding panel. It injects project context into system prompts via existing `callAI()`. Different from HelpChatTab (which answers general AEO questions).

**New files:**
- `src/components/AiChatPanel.jsx`
- `src/hooks/useAiChat.js`

---

### 1.3 Expand Client Portal
**Current state:** Portal shows checklist progress + analyzer results + monitoring history. No branding customization.

| Feature | Details |
|---------|---------|
| Tabbed navigation | Tabs for: Overview, Checklist, Competitors, Content Calendar, SEO, Metrics |
| Competitor section | Show competitor rankings, citation share, benchmark comparisons |
| Content calendar | Display upcoming/published content pieces |
| SEO audit summary | Show SEO scores and top issues |
| Metrics charts | Interactive score history and trends |
| Custom branding | Agency logo upload, primary color override, custom header text |
| Portal config | Settings section to toggle which tabs are visible per share link |

**New files:**
- `src/views/portal/PortalCompetitorsTab.jsx`
- `src/views/portal/PortalContentTab.jsx`
- `src/views/portal/PortalSeoTab.jsx`
- `src/views/portal/PortalMetricsTab.jsx`
- `src/views/settings/PortalBrandingSection.jsx`

**Modified files:** PortalView.jsx, SettingsView.jsx

---

### 1.4 Browser Push Notifications
**Current state:** NotificationCenter (in-app bell icon) exists. No browser push notifications.

| Feature | Details |
|---------|---------|
| Permission prompt | Smart timing — ask after first meaningful action, not on page load |
| Push triggers | Score drops > 5pts, new task assignments, @mentions, phase completions, monitoring alerts |
| Notification preferences | Per-type toggles in Settings (e.g., push for mentions but not score changes) |
| Service worker integration | Extend existing `sw.js` with push event handler |

**New files:**
- `src/utils/pushNotifications.js`

**Modified files:** `sw.js`, `useNotifications.js`, SettingsView (add push preferences section)

---

### 1.5 Collaboration Across All Views
**Current state:** Presence indicators work. Activity logging exists. Comments are on checklist items only. No @mentions, no inline comments on other views.

| Feature | Where | Details |
|---------|-------|---------|
| Inline comment threads | Analyzer results, Competitor cards, Metrics charts, Content Ops entries | Click any element to open a comment thread |
| @mentions | All comment threads | Type `@` to tag team members, sends notification |
| Task assignments with due dates | Checklist items, Content Ops entries, Monitoring alerts | Assign to team member + optional due date |
| Global activity feed | Accessible from TopBar icon | Sliding panel with filterable team activity across all views |
| View-level activity | Every view | "Recent activity" section showing who did what |

**New files:**
- `src/components/CommentThread.jsx`
- `src/components/MentionInput.jsx`
- `src/components/GlobalActivityFeed.jsx`
- `src/hooks/useComments.js`
- `src/hooks/useAssignments.js`

**Modified files:** AnalyzerView, CompetitorsView, MetricsView, MonitoringView, ContentOpsView, ChecklistView, TopBar

---

### 1.6 Empty States with SVG Illustrations
**Current state:** `EmptyState` component uses Lucide icons. Functional but not visually engaging.

| View | Illustration | CTA |
|------|-------------|-----|
| Dashboard (no project) | Rocket launching into stars | "Create your first project" |
| Checklist (empty) | Clipboard with sparkle checkmarks | "Import a checklist template" |
| Competitors (none) | Telescope scanning horizon | "Add your first competitor" |
| Analyzer (no results) | Magnifying glass over webpage | "Analyze your first page" |
| Content Ops (empty) | Calendar with colorful pins | "Plan your first content" |
| Metrics (no history) | Growing bar chart with seedling | "Run your first analysis" |
| Monitoring (no alerts) | Shield with green checkmark | "All clear — no issues detected" |
| GSC/GA4 (not connected) | Chain link connecting two nodes | "Connect your Google account" |

**New files:**
- `src/components/illustrations/RocketIllustration.jsx`
- `src/components/illustrations/ClipboardIllustration.jsx`
- `src/components/illustrations/TelescopeIllustration.jsx`
- `src/components/illustrations/MagnifyingGlassIllustration.jsx`
- `src/components/illustrations/CalendarIllustration.jsx`
- `src/components/illustrations/GrowthChartIllustration.jsx`
- `src/components/illustrations/ShieldIllustration.jsx`
- `src/components/illustrations/ConnectionIllustration.jsx`
- `src/components/illustrations/index.js`

**Modified files:** EmptyState.jsx (add `illustration` prop), all views that use EmptyState

---

## Phase 2: Polish & UX

### 2.1 Mobile/Tablet Responsiveness Deep Pass
**Current state:** Basic responsive CSS exists (breakpoints, hamburger menu, collapsible sidebar). But many views have layout issues on small screens.

| Area | Improvements |
|------|-------------|
| Bottom tab bar | Replace sidebar with 5-icon bottom tab on mobile (Dashboard, Checklist, Analyzer, Metrics, More) |
| Data tables | Card layout on mobile (stack columns vertically), horizontal scroll on tablet |
| Charts | Full-width with scroll snap, touch-friendly tooltips, tap-to-select data points |
| Dialogs | Full-screen sheets on mobile (slide up from bottom) |
| Tab navigation | Scrollable pill tabs with active indicator, swipe gesture support |
| Form inputs | Larger touch targets, floating labels, mobile-optimized date pickers |

**New files:**
- `src/components/MobileTabBar.jsx`
- `src/hooks/useBreakpoint.js`

**Modified files:** Sidebar, TopBar, all table-heavy views, all modal/dialog components

---

### 2.2 Skeleton Loaders for Remaining Views
**Current state:** 5 skeletons exist (Dashboard, Checklist, Metrics, Docs, Testing).

**Add skeletons for:** Competitors, Analyzer, Content Ops, GSC, GA4, AEO Impact, SEO, Monitoring, Settings, Portal

**Modified files:** `Skeleton.jsx`

---

### 2.3 Dark Mode Audit
Systematic review of all views, modals, and new components to ensure CSS variable consistency. Special attention to: chart colors in dark mode, SVG illustrations adapting to theme, portal branding colors working in both themes.

---

## Phase 3: Technical Foundation

### 3.1 Sentry Error Tracking
| Task | Details |
|------|---------|
| Install `@sentry/react` | Add to dependencies |
| Init in `main.jsx` | DSN, environment, release version tagging |
| ErrorBoundary integration | `Sentry.captureException` in existing ErrorBoundary |
| Performance tracing | Route-level tracing via Sentry BrowserTracing |
| Source maps | Configure Vite to upload source maps to Sentry on build |
| User context | Attach user ID + project ID to error reports |

---

### 3.2 Performance Optimizations
**Current state:** Code splitting and vendor chunking already exist.

| Optimization | Details |
|-------------|---------|
| Lazy-load heavy dialogs | PDF, Email, Import, CSV dialogs loaded on demand |
| Virtualized lists | `react-window` for Checklist (99+ items), Analyzer results, Competitor tables |
| Data caching expansion | Extend `dataCache.js` with TTL, stale-while-revalidate, per-project namespacing |
| Image/chart lazy loading | IntersectionObserver for below-fold charts and images |
| Bundle analysis | Add `rollup-plugin-visualizer` for ongoing bundle monitoring |

---

### 3.3 Expand Test Coverage
**Current state:** 19 unit test files + 4 E2E test files

**Unit/integration tests to add:**
- View components: render tests for all 15+ views
- New hooks: useAiInsight, useAiChat, useComments, useAssignments, useBreakpoint
- New components: AiInsightCard, AiChatPanel, CommentThread, MentionInput, GlobalActivityFeed
- Zustand stores: useAppStore, useAuthStore, useProjectStore

**E2E tests to add:**
- AI chat interaction flow
- Collaboration: add comment, @mention, assign task
- Client portal with all tabs
- Push notification permission flow
- Mobile navigation (bottom tab bar)
- Command palette search + navigate
- Empty states → CTA → first action

---

## Implementation Order

| Sprint | Focus | Key Deliverables |
|--------|-------|-----------------|
| **1** | AI Insight Cards | `useAiInsight` hook + `AiInsightCard` on Dashboard, Metrics, Competitors |
| **2** | AI Chat Assistant | `AiChatPanel` + `useAiChat` with project context injection |
| **3** | Collaboration | Comment threads, @mentions, assignments, global activity feed |
| **4** | Portal Expansion | Tabbed portal, competitor/SEO/metrics tabs, branding settings |
| **5** | Push Notifications | Browser push via FCM, notification preferences, SW integration |
| **6** | SVG Illustrations | 8 illustration components, EmptyState upgrade, dark mode variants |
| **7** | Mobile Responsiveness | Bottom tab bar, mobile card layouts, full-screen dialogs |
| **8** | Skeleton Loaders + Dark Mode | 10 new view skeletons, dark mode consistency audit |
| **9** | Sentry + Performance | Error tracking, virtualized lists, lazy dialogs, bundle analysis |
| **10** | Test Coverage | Unit tests for new code + E2E tests for critical flows |
