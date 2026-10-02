# Design System

> Veyra uses a glassmorphism-inspired design system with responsive, mobile-first layouts.

## Color Palette

### Light Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `hsl(220, 20%, 97%)` | Page background |
| `--color-surface` | `hsla(0, 0%, 100%, 0.6)` | Glass card surface |
| `--color-primary` | `hsl(252, 87%, 64%)` | Primary actions, links |
| `--color-primary-soft` | `hsl(252, 87%, 95%)` | Primary tints |
| `--color-accent` | `hsl(173, 80%, 46%)` | Success, streaks |
| `--color-warning` | `hsl(38, 92%, 55%)` | Warnings, deadlines |
| `--color-danger` | `hsl(0, 84%, 62%)` | Errors, destructive |
| `--color-text` | `hsl(220, 20%, 15%)` | Primary text |
| `--color-text-muted` | `hsl(220, 15%, 45%)` | Secondary text |

### Dark Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `hsl(225, 25%, 8%)` | Page background |
| `--color-surface` | `hsla(225, 25%, 15%, 0.5)` | Glass card surface |
| `--color-text` | `hsl(220, 20%, 95%)` | Primary text |
| `--color-text-muted` | `hsl(220, 15%, 60%)` | Secondary text |

## Glass Properties

| Token | Value | Notes |
|-------|-------|-------|
| `--glass-blur` | `16px` | Backdrop blur |
| `--glass-blur-heavy` | `24px` | Modal backdrop |
| `--glass-border` | `hsla(0, 0%, 100%, 0.15)` | Subtle border |
| `--glass-shadow` | `0 8px 32px hsla(0, 0%, 0%, 0.08)` | Card elevation |
| `--glass-radius` | `16px` | Border radius |
| `--glass-radius-sm` | `8px` | Small elements |
| `--glass-radius-lg` | `24px` | Modals, panels |

## Typography

- **Font family:** `'Inter', system-ui, sans-serif`
- **Scale:** Fluid via `clamp()` — headings scale smoothly from mobile to desktop
- **Weights:** 400 (body), 500 (labels), 600 (headings), 700 (display)

## Spacing

Standard 4px grid: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

## Responsive Breakpoints

| Token | Width | Target |
|-------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large monitors |

## Layout Patterns

- **Mobile:** Single column, bottom nav, full-width cards
- **Tablet:** Collapsible sidebar, 2-column grids
- **Desktop:** Persistent sidebar, 2–3 column dashboard grids

## Touch Targets

All interactive elements maintain a minimum 44×44px touch area on mobile.

## Animation

- **Duration:** 150ms (micro), 300ms (standard), 500ms (emphasis)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (standard), `cubic-bezier(0, 0, 0.2, 1)` (decelerate)
- **Reduced motion:** All animations respect `prefers-reduced-motion`
