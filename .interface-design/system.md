# AEO Dashboard — Design System

## Principles
1. **Data-first** — information density over white space. This is an analytics tool, not a marketing site.
2. **One accent color** — `--accent: #2563EB` (blue) for all interactive elements (buttons, links, focus rings, active tabs, toggles). Phase colors are ONLY for phase-specific semantic contexts (checklist badges, donut chart slices, phase progress bars).
3. **Borders over shadows** — depth comes from `var(--border-subtle|default|strong)`. Shadows reserved for modals, toasts, and hover-elevated cards only.
4. **Consistent patterns** — every stat card, tab bar, empty state, and button uses the same shared component/class. No one-off implementations.
5. **Light default** — `:root` = light theme. `[data-theme="dark"]` = dark override. Both must look intentional.

## Direction
Light-default analytics dashboard for AEO (Answer Engine Optimization). Technical, data-dense, not marketing. Dual theme (light default + dark). Professional look (Ahrefs, PostHog, Linear).

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-heading` | `'Plus Jakarta Sans', sans-serif` | Headings, nav labels, stat values |
| `--font-body` | `'Plus Jakarta Sans', sans-serif` | Body text, form labels, descriptions |
| `--font-mono` | `'JetBrains Mono', monospace` | Code, data values, timestamps |

### Font Size Scale (10 tiers)
| Token | Value | Usage |
|-------|-------|-------|
| `--text-2xs` | `0.6875rem` (11px) | Badges, timestamps, tiny labels |
| `--text-xs` | `0.75rem` (12px) | Small labels, hints, stat card labels |
| `--text-sm` | `0.8125rem` (13px) | Form labels, secondary text, buttons |
| `--text-base` | `0.875rem` (14px) | Body text, default |
| `--text-md` | `0.9375rem` (15px) | Section titles |
| `--text-lg` | `1rem` (16px) | Larger body text |
| `--text-xl` | `1.125rem` (18px) | View titles (`.view-title`) |
| `--text-2xl` | `1.25rem` (20px) | Large headings |
| `--text-3xl` | `1.5rem` (24px) | Hero-size |
| `--text-4xl` | `2rem` (32px) | Stat card values |

## Spacing (4px base grid)

| Token | Value |
|-------|-------|
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-5` | `1.25rem` (20px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-7` | `1.75rem` (28px) |
| `--space-8` | `2rem` (32px) |
| `--space-10` | `2.5rem` (40px) |
| `--space-12` | `3rem` (48px) |
| `--space-14` | `3.5rem` (56px) |
| `--space-16` | `4rem` (64px) |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.25rem` (4px) | Tiny elements |
| `--radius-md` | `0.375rem` (6px) | Buttons, inputs, default |
| `--radius-lg` | `0.5rem` (8px) | Cards, containers |
| `--radius-xl` | `0.75rem` (12px) | Modals, large panels |
| `--radius-full` | `624.9375rem` | Pills, circular |

## Depth

### Borders-First (primary depth)
```
0.0625rem solid var(--border-subtle)   → default card/container border
0.0625rem solid var(--border-default)  → hover state, form inputs
0.0625rem solid var(--border-strong)   → active/focus emphasis
```

### Shadows (elevation only)
| Token | Light | Dark |
|-------|-------|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.08)` | `0 2px 8px rgba(0,0,0,0.4)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | `0 8px 24px rgba(0,0,0,0.5)` |
| `--shadow-xl` | `0 16px 48px rgba(0,0,0,0.16)` | `0 16px 48px rgba(0,0,0,0.6)` |
| `--shadow-button` | `0 1px 2px rgba(0,0,0,0.06)` | `0 1px 3px rgba(0,0,0,0.2)` |
| `--hover-shadow` | `0 0.5rem 1.5rem rgba(0,0,0,0.08)` | `0 0.5rem 1.5rem rgba(0,0,0,0.35)` |

Usage: `.stat-card` gets no shadow. `.card-interactive:hover` gets `--hover-shadow`. Modals get `--shadow-xl`. Toasts get `--shadow-md`.

## Color Palette

### Accent
| Token | Value |
|-------|-------|
| `--accent` | `#2563EB` |
| `--accent-hover` | `#1D4ED8` |
| `--accent-subtle` | `rgba(37,99,235,0.08)` (light) / `rgba(37,99,235,0.15)` (dark) |

### Phase Colors (7-phase AEO system)
| Token | Value | Phase |
|-------|-------|-------|
| `--color-phase-1` | `#FF6B35` | Foundation (orange) |
| `--color-phase-2` | `#7C3AED` | Authority (violet) |
| `--color-phase-3` | `#0EA5E9` | Content (sky) |
| `--color-phase-4` | `#10B981` | Technical (emerald) |
| `--color-phase-5` | `#F59E0B` | Monitoring (amber) |
| `--color-phase-6` | `#EC4899` | Testing (pink) |
| `--color-phase-7` | `#EF4444` | Growth (red) |

**Rule:** Phase colors are ONLY for phase-specific contexts (checklist progress, phase badges, donut chart). NEVER for buttons, links, focus rings, or general UI accents.

### Semantic Colors
| Token | Value |
|-------|-------|
| `--color-success` | `#10B981` |
| `--color-warning` | `#F59E0B` |
| `--color-error` | `#EF4444` |
| `--color-info` | `#3B82F6` |

### Chart Palette
```
--chart-1: #2563EB (blue)
--chart-2: #7C3AED (violet)
--chart-3: #0EA5E9 (sky)
--chart-4: #10B981 (emerald)
--chart-5: #F59E0B (amber)
--chart-6: #EC4899 (pink)
```

### Neutrals
| Token | Light | Dark |
|-------|-------|------|
| `--bg-page` | `#F8F9FB` | `#0D1117` |
| `--bg-card` | `#FFFFFF` | `#161B22` |
| `--bg-card-2` | `#F1F3F6` | `#1C2128` |
| `--bg-input` | `#FFFFFF` | `#0D1117` |
| `--bg-elevated` | `#FFFFFF` | `#1C2128` |
| `--hover-bg` | `#F1F3F6` | `#1C2128` |
| `--text-primary` | `#0F1419` | `#E6EDF3` |
| `--text-secondary` | `#536471` | `#8B949E` |
| `--text-tertiary` | `#8899A6` | `#6E7681` |
| `--text-disabled` | `#BCC5CF` | `#484F58` |
| `--border-subtle` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.06)` |
| `--border-default` | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.10)` |
| `--border-strong` | `rgba(0,0,0,0.16)` | `rgba(255,255,255,0.16)` |

## Layout

### App Shell
```
.app-shell        → flex row, 100vh
  .sidebar        → 15rem fixed width, border-right
  .main-area      → flex: 1, flex column
    .top-bar      → flex-shrink: 0, border-bottom
    .content-scroll → flex: 1, overflow-y: auto, NO padding
      .content-wrapper → width: 100%, NO max-width (view-wrapper handles it)
        <ViewComponent /> → className="view-wrapper"
```

### View Wrapper
```css
.view-wrapper {
  padding: var(--space-6);
  max-width: 72rem;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
```
Every view's outermost `<div>` MUST use `className="view-wrapper"`.

### View Header
```css
.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
}
.view-header-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.view-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
```
Pattern: title+subtitle on left, action buttons on right.

### Grid: Stats
```css
.grid-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
```
Responsive: 2-col on mobile.

## Component Patterns

### Buttons
| Variant | Height | Padding | Font Size | Radius |
|---------|--------|---------|-----------|--------|
| `.btn-sm` | `1.75rem` | `0.375rem 0.75rem` | `var(--text-xs)` | `0.625rem` |
| `.btn-md` | `2.25rem` | `0.5rem 1rem` | `var(--text-sm)` | `0.625rem` |
| `.btn-lg` | `2.75rem` | `0.75rem 1.25rem` | `var(--text-base)` | `0.625rem` |
| `.btn-icon` | `2rem` | `0` (centered) | — | `var(--radius-md)` |

Types: `.btn-primary` (accent gradient bg), `.btn-secondary` (border + hover), `.btn-ghost` (transparent), `.btn-danger` (error text), `.btn-danger-fill` (error bg)

### Cards
| Class | Properties |
|-------|-----------|
| `.card` | `bg-card`, `border: 0.0625rem solid var(--border-subtle)`, `border-radius: var(--radius-lg)`, `overflow: hidden` |
| `.card-padded` | Same + `padding: 1.25rem` |
| `.card-interactive` | Hover: `translateY(-0.125rem)` + `var(--hover-shadow)` |

### Stat Cards
```css
.stat-card         → bg-card, border-subtle, radius-lg, padding: space-5
.stat-card-label   → text-xs, uppercase, letter-spacing: 0.04em, text-tertiary, font-weight: 700
.stat-card-value   → font-mono, text-4xl (or text-2xl horizontal), font-weight: 700
.stat-card-trend   → font-mono, text-xs, font-weight: 600
.stat-card-trend-up   → color: success
.stat-card-trend-down → color: error
.stat-card-sub     → text-xs, text-tertiary
```
One shared `<StatCard>` component at `src/views/dashboard/StatCard.jsx`. NO local stat card implementations.

### Inputs
| Class | Properties |
|-------|-----------|
| `.input-field` | `padding: 0.625rem 0.875rem`, `bg-input`, `border: 0.0625rem solid var(--border-default)`, `radius: 0.625rem`, `font-size: 0.875rem` |
| `.input-sm` | `height: 1.75rem`, `padding: 0 0.75rem` |
| `.input-md` | `height: 2.25rem`, `padding: 0 1rem` |
| Focus: `border-color: var(--accent)`, `box-shadow: 0 0 0 0.1875rem rgba(37,99,235,0.15)` |

### Selection Cards
```css
.selection-card          → border-default, radius-md, padding: space-4, cursor: pointer, text-align: center
.selection-card:hover    → border-strong
.selection-card[data-active] → border: accent, bg: accent-subtle
.selection-card-label    → text-sm, font-weight: 600, text-primary
.selection-card-desc     → text-xs, text-tertiary
```

### Tabs (2 patterns)
| Variant | Active Style | Usage |
|---------|-------------|-------|
| `.tab-bar-segmented` + `.tab-segmented` | `bg-card` + `shadow-sm` + `font-weight: 600` | All main view tabs |
| `.tab-bar-underline` + `.tab-underline` | `border-bottom: var(--accent)` | Settings sub-tabs only |

**No pill tabs.** `.tab-bar-pills` / `.tab-pill` are deprecated and removed.

### Empty State
Shared `<EmptyState>` component at `src/components/EmptyState.jsx`. Props: `icon`, `title`, `description`, `action`, `color`, `compact`. NO inline empty state implementations.

### Badges
```css
.badge             → font-mono, text-2xs, font-weight: 600, radius-full, inline-flex
.badge-success     → green bg 10%, green text
.badge-warning     → amber bg 10%, amber text
.badge-error       → red bg 10%, red text
.badge-info        → blue bg 10%, blue text
```

### Toast
- Position: fixed, bottom-right, `z-index: var(--z-toast)`
- Padding: `0.75rem 1rem`, `border-radius: 0.625rem`, `shadow-md`
- Variants: success, info, warning, error
- Icon size: 16
- Animations: `toastIn` 300ms, `toastOut` 200ms

### Settings Row (from SettingsShared.jsx)
- `sectionTitleStyle`: flex, `gap: 0.5rem`, `font-size: 0.8125rem`, `font-weight: 700`, `padding: 1.125rem 1.25rem 0.875rem`
- `settingsRowStyle`: flex, `gap: 0.875rem`, `padding: 0.875rem 1.25rem`, `border-bottom: 0.0625rem solid var(--border-subtle)`
- `labelStyle`: `font-size: 0.8125rem`, `color: var(--text-secondary)`, `width: 8.125rem`

## Charts (Recharts)
- Use `--chart-1` through `--chart-6` for generic data series
- Use `--color-phase-N` ONLY when displaying AEO phase data
- Grid lines: `var(--border-subtle)`, no axis lines
- Tooltip: `bg-card`, `border-default`, `shadow-md`, `radius-md`
- Font: `var(--font-mono)` for values, `var(--font-body)` for labels

## Sidebar Navigation
- Width: `15rem` fixed
- Background: `var(--bg-card)`, border-right: `var(--border-subtle)`
- Active item: `background: var(--accent-subtle)`, `color: var(--accent)`, `font-weight: 600`
- Hover: `background: var(--hover-bg)`
- Groups: collapsible with `ChevronDown` rotate animation
- Sparkline: inline SVG polyline next to project name (if data available)

## Animation & Transitions

| Token | Value |
|-------|-------|
| `--duration-fast` | `120ms` |
| `--duration-normal` | `200ms` |
| `--duration-slow` | `350ms` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

Patterns:
- Hover lift: `translateY(-0.0625rem)` (small), `translateY(-0.125rem)` (interactive cards)
- Press scale: `scale(0.97)`
- Stagger grid: `.stagger-grid > *:nth-child(n)` with 50ms increments
- Fade-in-up: entry animation for views/modals

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | `0` | Normal |
| `--z-dropdown` | `50` | Dropdowns |
| `--z-sticky` | `100` | Sticky headers |
| `--z-modal-backdrop` | `200` | Modal bg |
| `--z-modal` | `210` | Modal content |
| `--z-command-palette` | `250` | Cmd+K |
| `--z-toast` | `300` | Toasts |

## Icons
- Library: **lucide-react**
- Default: `size={16}`
- Compact: `size={14}`
- Badges/trend: `size={12}`
- Button icons: `size={13}`
- Emphasis: `size={18}` to `size={24}`

## Responsive Breakpoints
| Name | Query | Behavior |
|------|-------|----------|
| Tablet | `max-width: 61.9375rem` | Sidebar → overlay |
| Mobile landscape | `max-width: 47.9375rem` | Single column grids, `.view-wrapper` padding reduces |
| Mobile portrait | `max-width: 29.9375rem` | Minimal padding, 1-col |
| Touch targets | `@media (pointer: coarse)` | Min `2.75rem` on interactive elements |

## Accessibility
- Focus ring: `0 0 0 0.1875rem rgba(37,99,235,0.15)` + `border-color: var(--accent)` on all interactive elements
- `:focus:not(:focus-visible)` — remove ring for mouse clicks
- `aria-selected="true"` on active tab buttons
- Color contrast: all text-on-bg combinations pass WCAG AA
- Touch targets: min `2.75rem` via `@media (pointer: coarse)`

## Rules
1. **All values in rem** — no px anywhere
2. **One accent color** — `--accent: #2563EB` for ALL interactive elements
3. **Phase colors are semantic** — ONLY for AEO phase contexts, never for buttons/links/focus
4. **Borders-first depth** — shadows only for elevation (modals, toasts, hover-up)
5. **Plus Jakarta Sans for headings + body** — `var(--font-heading)` and `var(--font-body)`
6. **JetBrains Mono for data** — `var(--font-mono)` on code, values, timestamps
7. **Card = border + radius-lg** — no shadows by default
8. **Button sizes match input sizes** — sm/md/lg heights align
9. **One shared StatCard** — no local stat card implementations
10. **One shared EmptyState** — no inline empty state implementations
11. **Two tab patterns only** — segmented (main) + underline (settings sub-tabs). No pill tabs.
12. **View wrapper on every view** — `className="view-wrapper"` on outermost div
13. **View header pattern** — `.view-header > .view-header-text + .view-header-actions`
14. **No project badges in titles** — removed from ChecklistView, ContentWriterView
15. **No icons in titles** — removed from SchemaGeneratorView, MonitoringView
16. **Spacing grid: 4px base** — only use values from `--space-*` scale
17. **Breathing room before CTAs** — always leave generous spacing (`≥ 3rem`) between body text and primary action buttons. Text and buttons must never feel cramped together.

## Waitlist / Marketing Page Design (WaitlistPage-specific)

The waitlist page follows the **frontend-design** plugin principles for distinctive, production-grade public-facing pages.

### Typography Pairing
| Token | Value | Usage |
|-------|-------|-------|
| `--wl-font-heading` | `'Sora', sans-serif` | Waitlist page headings, hero title, section titles |
| `--wl-font-body` | `'Plus Jakarta Sans', system-ui, sans-serif` | Waitlist page body text |

**Note:** The dashboard app continues to use `Plus Jakarta Sans` for both headings and body. `Sora` is only used on the waitlist/marketing page for a more distinctive feel.

### Hero Section
- **Floating gradient orbs**: 3 animated `<div>` elements with `filter: blur(4rem)`, slow floating keyframes (`wl-float-1/2/3`), providing atmospheric depth
- **Grid pattern**: Dot grid + line grid overlay at low opacity
- **Radial glow**: Dual-layer — primary blue/indigo + secondary warm purple, centered behind the hero
- **h1**: Font weight 800, 3.5rem, gradient text (white→gray in dark, dark→medium in light)

### CTA Buttons (Waitlist)
- **Gradient background**: `linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)` instead of flat blue
- **Hover glow**: `box-shadow: 0 0.5rem 2rem rgba(37, 99, 235, 0.4)`
- **Active press**: `scale(0.97)`
- **Shimmer effect**: `::after` pseudo-element with translating gradient on hover

### Scroll Animations
- `[data-animate]` elements start hidden (`opacity: 0; transform: translateY(1.5rem)`)
- IntersectionObserver adds `.wl-visible` class on scroll into view
- Smooth `0.6s cubic-bezier(0.16, 1, 0.3, 1)` transition
- Respects `prefers-reduced-motion`

### Card Hover Effects (Waitlist)
All feature/stat/audience/cost cards get on hover:
- `border-color: rgba(37, 99, 235, 0.3)` accent glow border
- `box-shadow: 0 0 1.5rem rgba(37, 99, 235, 0.08)` soft glow
- `translateY(-0.125rem)` lift

### Section Visual Rhythm
- Even-numbered sections get subtle alternating background gradients
- Decorative gradient accent line at top of alternating sections
- Early access section has enhanced radial glow background

## Landing Page Design (LandingPage-specific)

The landing page (`?/features`) follows the same **frontend-design** principles as the waitlist page for a cohesive marketing experience.

### Typography
| Token | Value | Usage |
|-------|-------|-------|
| `--lp-font-heading` | `'Sora', 'Plus Jakarta Sans', sans-serif` | All landing page headings, hero title, section titles, card titles |

### Hero Enhancement
- **Triple-layer gradient glow**: Blue, indigo, and accent layers positioned behind hero content
- **Breathing animation**: `lp-hero-glow-drift` keyframe for subtle movement
- **Large h1**: Font weight 800 with gradient text effect in dark mode

### CTA Buttons (Landing)
- Same gradient pattern as waitlist: `linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)`
- Shimmer `::after` pseudo-element on hover
- Glow shadow on hover: `0 0.5rem 2rem rgba(37, 99, 235, 0.4)`
- Active press: `scale(0.97)`

### Card Hover Effects (Landing)
Applied to 6 card types (problem, feature grid, case study, pricing, testimonial, how-it-works):
- `border-color: rgba(37, 99, 235, 0.3)` accent glow border
- `box-shadow: 0 0 1.5rem rgba(37, 99, 235, 0.08)` soft glow
- `translateY(-0.125rem)` lift

### Section Visual Rhythm (Landing)
- 5 sections get alternating background gradients via `::before` pseudo-elements
- Gradient accent line at top of alternating sections
- Full light and dark theme support for all effects

## App Dashboard Design Enhancements (index.css)

The app dashboard and admin panel share `index.css` for a polished, professional feel.

### Sidebar
- Inner shadow for depth: `box-shadow: inset -1px 0 0 var(--border-subtle)`
- Dark mode: stronger shadow depth

### Primary Buttons
- Gradient background: `linear-gradient(135deg, var(--accent) 0%, #4F46E5 100%)`
- Resting glow shadow on all `.btn-primary` elements
- Stronger glow on hover
- Active press: `scale(0.97)`

### Card Interactions
- `.card-interactive`: smoother 0.2s transitions, refined hover lift and shadow
- Dark mode: subtle gradient top glow on cards

### Stat Cards
- Enhanced hover shadow for depth
- Dark mode: text glow on stat values (`text-shadow`)

### View Entry Animation
- Spring-eased 0.35s animation: `translateY(0.5rem) → 0` with `cubic-bezier(0.34, 1.56, 0.64, 1)`

### Tab Bar
- `.tab-segmented[data-active="true"]`: accent bottom indicator + elevation shadow

### Toast Animations
- Enter: bounce overshoot for playful feel
- Exit: clean 250ms slide-out
