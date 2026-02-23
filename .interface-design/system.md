# AEO Dashboard — Design System

## Direction
Dark-first dashboard tool for AEO (Answer Engine Optimization). Technical, data-dense, not marketing. Dual theme (dark default + light). Anti-AI-generic: Geist Mono headings, asymmetric spacing, no generic SaaS card layouts.

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-heading` | `'Geist Mono', 'JetBrains Mono', monospace` | Headings, stat values, nav labels |
| `--font-body` | `'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | Body text, form labels, descriptions |
| `--font-mono` | `'Geist Mono', 'JetBrains Mono', monospace` | Code, data, timestamps |

### Font Size Scale (10 tiers)
| Token | Value | Usage |
|-------|-------|-------|
| `--text-2xs` | `0.625rem` (10px) | Badges, timestamps, tiny labels |
| `--text-xs` | `0.75rem` (12px) | Small labels, hints |
| `--text-sm` | `0.8125rem` (13px) | Form labels, secondary text, buttons |
| `--text-base` | `0.875rem` (14px) | Body text |
| `--text-md` | `0.9375rem` (15px) | Section titles |
| `--text-lg` | `1rem` (16px) | Normal body |
| `--text-xl` | `1.125rem` (18px) | View titles (.view-title) |
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
| `--radius-sm` | `0.375rem` (6px) | Small elements, badges |
| `--radius-md` | `0.5rem` (8px) | Buttons, inputs, default |
| `--radius-lg` | `0.75rem` (12px) | Cards, containers |
| `--radius-xl` | `1rem` (16px) | Modals, large panels |
| `--radius-full` | `624.9375rem` | Pills, circular |

## Depth: Borders-First

- Primary depth: `0.0625rem solid var(--border-subtle|default|strong)`
- Shadows reserved for: modals, toasts, hover-elevated cards, buttons

| Token | Dark | Light |
|-------|------|-------|
| `--shadow-sm` | `0 0.0625rem 0.1875rem rgba(0,0,0,0.3)` | `rgba(0,0,0,0.06)` |
| `--shadow-md` | `0 0.25rem 1rem rgba(0,0,0,0.4)` | `rgba(0,0,0,0.08)` |
| `--shadow-lg` | `0 1rem 3rem rgba(0,0,0,0.5), ring` | `rgba(0,0,0,0.12), ring` |
| `--shadow-button` | `0 0.0625rem 0.1875rem rgba(0,0,0,0.2)` | `rgba(0,0,0,0.06)` |
| `--hover-shadow` | `0 0.5rem 1.5rem rgba(0,0,0,0.35)` | `rgba(0,0,0,0.08)` |

## Color Palette

### Phase Colors (7-phase system, 60-30-10 rule)
| Token | Dark | Light |
|-------|------|-------|
| `--color-phase-1` | `#FF6B35` (Orange) | `#E55A1B` |
| `--color-phase-2` | `#7B2FBE` (Purple) | `#6B21A8` |
| `--color-phase-3` | `#0EA5E9` (Blue) | `#0284C7` |
| `--color-phase-4` | `#10B981` (Green) | `#059669` |
| `--color-phase-5` | `#F59E0B` (Amber) | `#D97706` |
| `--color-phase-6` | `#EC4899` (Pink) | `#DB2777` |
| `--color-phase-7` | `#EF4444` (Red) | `#DC2626` |

### Semantic Colors
| Token | Dark | Light |
|-------|------|-------|
| `--color-success` | `#10B981` | `#059669` |
| `--color-warning` | `#F59E0B` | `#D97706` |
| `--color-error` | `#EF4444` | `#DC2626` |

### Neutrals
| Token | Dark | Light |
|-------|------|-------|
| `--bg-page` | `#08080D` | `#F5F5F7` |
| `--bg-card` | `#111118` | `#FFFFFF` |
| `--bg-input` | `#0D0D14` | `#FFFFFF` |
| `--hover-bg` | `#1A1A24` | `#F0F0F4` |
| `--text-primary` | `#F0F0F2` | `#18181B` |
| `--text-secondary` | `#A0A0AE` | `#52525B` |
| `--text-tertiary` | `#858596` | `#71717A` |
| `--text-disabled` | `#3E3E4A` | `#C4C4CC` |
| `--border-subtle` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.06)` |
| `--border-default` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.10)` |
| `--border-strong` | `rgba(255,255,255,0.16)` | `rgba(0,0,0,0.16)` |

## Component Patterns

### Button
| Variant | Height | Padding | Font Size | Radius |
|---------|--------|---------|-----------|--------|
| `.btn-sm` | `1.75rem` | `0.5rem 0.75rem` | `0.75rem` | `0.625rem` |
| `.btn-md` | `2.25rem` | `0.625rem 1rem` | `0.8125rem` | `0.625rem` |
| `.btn-lg` | `2.75rem` | `0.75rem 1.25rem` | `0.875rem` | `0.625rem` |
| `.btn-icon` | `2rem` | `0` (centered) | — | `var(--radius-md)` |

Types: `.btn-primary` (gradient accent), `.btn-secondary` (border + hover), `.btn-ghost` (transparent), `.btn-danger` (error color), `.btn-danger-fill` (error bg)

### Card
| Class | Properties |
|-------|-----------|
| `.card` | `bg-card`, `border: 0.0625rem solid var(--border-subtle)`, `border-radius: 0.75rem`, `overflow: hidden` |
| `.card-padded` | Same + `padding: 1.25rem` |
| `.card-interactive` | Hover: `translateY(-0.125rem)` + `var(--hover-shadow)` |

### Input
| Class | Properties |
|-------|-----------|
| `.input-field` | `padding: 0.625rem 0.875rem`, `bg-input`, `border: 0.0625rem solid var(--border-default)`, `radius: 0.625rem`, `font-size: 0.875rem` |
| `.input-sm` | `height: 1.75rem`, `padding: 0 0.75rem` |
| `.input-md` | `height: 2.25rem`, `padding: 0 1rem` |
| Focus: `border-color: var(--color-phase-1)`, `box-shadow: 0 0 0 0.1875rem rgba(255,107,53,0.15)` |

### Tabs (3 variants)
| Variant | Active Style | Usage |
|---------|-------------|-------|
| `.tab-bar-segmented` + `.tab-segmented` | `bg-card` + `shadow-sm` + `font-weight: 600` | Dashboard, Settings, Docs |
| `.tab-bar-pills` + `.tab-pill` | `bg: var(--color-phase-1)` + `color: #fff` | Competitors, ContentOps |
| `.tab-bar-underline` + `.tab-underline` | `border-bottom: var(--color-phase-1)` | Settings sub-tabs |

### Settings Row
- `sectionTitleStyle`: flex, `gap: 0.5rem`, `font-size: 0.8125rem`, `font-weight: 700`, `padding: 1.125rem 1.25rem 0.875rem`
- `settingsRowStyle`: flex, `gap: 0.875rem`, `padding: 0.875rem 1.25rem`, `border-bottom: 0.0625rem solid var(--border-subtle)`
- `labelStyle`: `font-size: 0.8125rem`, `color: var(--text-secondary)`, `width: 8.125rem`

### Toast
- Position: fixed, bottom-right, `z-index: var(--z-toast)`
- Padding: `0.75rem 1rem`, `border-radius: 0.625rem`, `shadow-md`
- Variants: success, info, warning, error
- Icon size: 16
- Animations: `toastIn` 300ms, `toastOut` 200ms

## Animation & Transitions

| Token | Value |
|-------|-------|
| `--duration-fast` | `150ms` |
| `--duration-normal` | `250ms` |
| `--duration-slow` | `400ms` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

Patterns: hover lift (`translateY(-0.0625rem)`), press scale (`scale(0.97)`), stagger grid (50ms increments), fade-in-up entry

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
- Common sizes: `16` (default), `14` (compact), `12` (trend badges), `13` (button icons), `18-24` (emphasis)

## Responsive Breakpoints
| Name | Query | Behavior |
|------|-------|----------|
| Tablet | `max-width: 61.9375rem` | Sidebar overlay |
| Mobile landscape | `max-width: 47.9375rem` | Single column grids |
| Mobile portrait | `max-width: 29.9375rem` | Minimal padding, 1-col |
| Touch targets | `@media (pointer: coarse)` | Min `2.75rem` on interactive |

## Rules
1. **All values in rem** — no px anywhere
2. **60-30-10 color rule** — 60% neutrals, 30% secondary, 10% accent
3. **Borders-first depth** — shadows only for elevation (modals, toasts, hover-up)
4. **Geist Mono for headings** — `var(--font-heading)` on titles, nav, stat values
5. **Geist Sans for body** — `var(--font-body)` on running text, labels, descriptions
6. **Phase colors are semantic** — phase-1 through phase-7 map to AEO phases
7. **Card = border + radius-lg** — no shadows by default
8. **Button sizes match input sizes** — sm/md/lg heights align
9. **Tab badges use `.tab-badge`** — `font-size: var(--text-2xs)`, `radius-full`
10. **Spacing grid: 4px base** — only use values from `--space-*` scale
