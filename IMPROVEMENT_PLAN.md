# AEO Dashboard — Improvement Plan

Based on your preferences: **New features first**, then polish, then technical foundation.

---

## Phase 1: New Features (Priority)

### 1.1 AI Features Everywhere
**Current state:** No AI integration exists in the app.

| Feature | Where | What it does |
|---------|-------|--------------|
| AI Analysis Summaries | Dashboard, Metrics, GSC, GA4, Competitors | Auto-generated plain-English insights ("Your AEO score dropped 5pts this week because...") |
| AI Suggestions | Checklist, Content Ops, Analyzer, Keyword Research | Smart prioritization, content ideas, fix suggestions |
| AI Chat Assistant | Global (floating button or sidebar panel) | Ask questions about your data: "Why did my score drop?", "What should I work on next?" |
| AI Content Scoring | Content Writer, Content Scorer | Real-time AI feedback on content quality and AEO optimization |

**Implementation:** Create `src/hooks/useAiInsight.js` hook + `src/components/AiChatPanel.jsx` component. Uses OpenAI/Anthropic API via a Firebase Cloud Function proxy. Add AI summary cards to each view.

---

### 1.2 Expand Client Portal
**Current state:** Portal shows checklist progress + scores only. No branding.

| Feature | Details |
|---------|---------|
| More data sections | Add Competitor insights, Content Calendar, SEO audit results, Metrics charts to portal |
| Custom branding | Logo upload, primary color picker, custom domain display name |
| Portal settings page | New section in Settings to configure what's visible + branding |

**Implementation:** Expand `PortalView.jsx` with tabbed sections. Add `PortalBrandingSection.jsx` in settings. Store branding config in project Firestore doc.

---

### 1.3 Browser Push Notifications
**Current state:** NotificationCenter exists (bell icon, unread count, mark read). No browser push.

| Feature | Details |
|---------|---------|
| Push subscription | Prompt users to enable push notifications via browser API |
| Push triggers | Score drops > 5pts, task assignments, @mentions, phase completions |
| Settings control | Toggle push on/off per notification type in Settings |

**Implementation:** Add `src/utils/pushNotifications.js` using the Push API + Firebase Cloud Messaging. Add push preferences to `SettingsView.jsx`.

---

### 1.4 Collaboration Across All Views
**Current state:** PresenceAvatars exists. Comments only on checklist items.

| Feature | Where | Details |
|---------|-------|---------|
| Activity feed panel | Every view | Sliding panel showing recent actions by team members |
| @mentions | Comments, Content Ops notes, Analyzer notes | Tag team members, triggers notifications |
| Task assignments | Checklist, Content Ops, Monitoring alerts | Assign items to team members with due dates |
| Inline comments | Analyzer results, Competitor insights, Metrics charts | Click any data point to add a comment thread |

**Implementation:** Create `src/components/ActivityFeed.jsx`, `src/components/CommentThread.jsx`, `src/hooks/useComments.js`. Store comments in Firestore subcollection per project.

---

### 1.5 Scheduled Email Digests
**Current state:** EmailReportDialog exists for manual one-off email reports.

| Feature | Details |
|---------|---------|
| Digest scheduling | Daily, weekly, or monthly automated email summaries |
| Digest config | Choose recipients, sections to include, schedule time |
| Digest preview | Preview the email before enabling the schedule |

**Implementation:** Add `ProjectDigestSection.jsx` (may already exist in settings — expand it). Backend: Firebase Cloud Function with scheduled triggers using Cloud Scheduler.

---

### 1.6 Empty States with SVG Illustrations
**Current state:** EmptyState component uses Lucide icons only. No illustrations.

| View | Illustration concept |
|------|---------------------|
| Dashboard (no project) | Rocket launching — "Start your AEO journey" |
| Checklist (empty) | Clipboard with checkmarks — "Create your first checklist" |
| Competitors (none added) | Binoculars/telescope — "Add competitors to track" |
| Analyzer (no results) | Magnifying glass on page — "Analyze your first page" |
| Content Ops (no entries) | Calendar with pen — "Plan your first content piece" |
| Metrics (no data) | Chart growing — "Data will appear after your first analysis" |
| Monitoring (no alerts) | Shield with checkmark — "All clear, no alerts" |

**Implementation:** Create `src/components/illustrations/` folder with lightweight SVG React components. Update EmptyState to accept an `illustration` prop.

---

## Phase 2: Polish & UX

### 2.1 Mobile/Tablet Responsiveness
**Current state:** Some responsive CSS exists but many views are desktop-optimized.

| Area | Changes needed |
|------|---------------|
| Sidebar | Bottom tab bar on mobile, slide-out drawer on tablet |
| Data tables | Horizontal scroll with sticky first column, or card layout on mobile |
| Charts | Responsive chart containers, touch-friendly tooltips |
| Modals/dialogs | Full-screen on mobile instead of centered overlays |
| Navigation | Hamburger menu, swipe gestures for tab switching |

**Implementation:** Add Tailwind responsive breakpoints. Create `src/hooks/useBreakpoint.js`. Refactor Sidebar to support mobile drawer mode.

---

### 2.2 Skeleton Loaders Expansion
**Current state:** `Skeleton.jsx` has DashboardSkeleton and base components.

Add view-specific skeletons for: Competitors, Analyzer, Content Ops, Metrics, GSC, GA4, Settings, Monitoring, SEO, Portal.

---

### 2.3 Dark Mode Audit
Review all views and fix any inconsistencies with CSS variable usage. Ensure charts, modals, empty states, and illustrations work in dark mode.

---

## Phase 3: Technical Foundation

### 3.1 Sentry Error Tracking
| Task | Details |
|------|---------|
| Install `@sentry/react` | Add to dependencies |
| Initialize in `main.jsx` | DSN config, environment tags |
| Error boundary integration | Connect existing ErrorBoundary to Sentry.captureException |
| Performance monitoring | Add Sentry performance tracing for route changes |
| Source maps | Upload source maps during build |

---

### 3.2 Performance Optimizations

| Optimization | Details |
|-------------|---------|
| Code splitting | `React.lazy()` + `Suspense` for every view. Only Dashboard loaded eagerly. |
| Lazy loading | Lazy load chart components, heavy dialogs (PDF, Email, Import) |
| Data caching | Expand existing `dataCache.js` — add TTL-based cache for API responses |
| Virtualized lists | Use `react-window` for Checklist items, Analyzer results, Competitor tables when rows > 50 |

---

### 3.3 Expand Test Coverage

**Unit/Integration tests to add:**
- All view components (render tests, interaction tests)
- All hooks (especially useAiInsight, useComments, usePushNotifications)
- Store tests (Zustand stores)
- Utility functions not yet covered

**E2E tests to add:**
- Full onboarding flow
- Checklist CRUD operations
- Analyzer run + results
- Settings changes
- Client portal access via share link
- Command palette navigation
- Notification interactions
- Mobile responsive breakpoints

---

## Implementation Order (Recommended)

| Sprint | Focus | Estimated scope |
|--------|-------|----------------|
| **Sprint 1** | AI Features (summaries + chat) | Hook, chat panel, dashboard/metrics integration |
| **Sprint 2** | Collaboration (activity feed, comments, assignments) | 4-5 new components, Firestore schema |
| **Sprint 3** | Portal expansion + branding | Portal tabs, branding settings, Firestore updates |
| **Sprint 4** | Push notifications + email digests | Push API, FCM, digest scheduling |
| **Sprint 5** | Empty state illustrations | 8-10 SVG components, EmptyState upgrade |
| **Sprint 6** | Mobile responsiveness | Sidebar refactor, responsive layouts, touch UX |
| **Sprint 7** | Skeleton loaders + dark mode audit | View-specific skeletons, CSS fixes |
| **Sprint 8** | Sentry + performance | Error tracking, code splitting, lazy loading |
| **Sprint 9** | Test coverage expansion | Unit tests, E2E tests, CI integration |

---

## What Already Works Well (No Changes Needed)
- Command palette (Cmd+K) — already implemented
- Grouped/collapsible sidebar — already implemented
- Notification center (bell icon) — already implemented
- PDF export — already implemented with section selection + agency branding
- Basic skeleton loaders — already implemented for Dashboard
- i18n (English, German, Serbian) — already implemented
- Gamification (badges, levels, streaks) — already implemented
- Onboarding (quiz, tutorial, getting started checklist) — already implemented
