# CRM AI — UI Redesign Plan

## Design Read

**B2B SaaS product UI for agents (daily ops) and customers, dark-first, with a clean/minimalist language, leaning toward custom Tailwind v4 tokens + Geist + Motion for micro-interactions.**

### Three Dials

| Dial | Value | Rationale |
|---|---|---|
| `DESIGN_VARIANCE` | **4** | Predictable, symmetrical, usable daily — not a landing page |
| `MOTION_INTENSITY` | **3** | Subtle entry transitions + hover physics only — no GSAP or scroll-driven |
| `VISUAL_DENSITY` | **5** | Standard app density — not airy, not cramped |

### Theme

- **Dark-only** (no light mode, no toggle)
- Base: `zinc-950` / `zinc-900` / `zinc-800` surfaces
- Accent: **blue-600/blue-500** (professional, high-contrast, B2B-safe)
- Radii: `--radius-sm: 6px` (inputs), `--radius: 8px` (cards), `--radius-full: 9999px` (badges)

---

## Phase 1 — Foundation (index.css)

### Dependencies

```
bun add geist motion
```

### Token configuration

Rewrite `src/index.css` with:
- Geist font imports via `@import "geist/font/sans.css"` and `@import "geist/font/mono.css"`
- `@theme` block with:
  - Blue accent scale (500 / 600 primary)
  - Zinc surface scale (950 / 900 / 800 / 700)
  - Priority color map (red urgent, orange high, yellow medium, gray low)
  - Radius tokens (`--radius-sm`, `--radius`, `--radius-full`)
- `font-family: 'Geist', sans-serif` as default body
- `font-family: 'Geist Mono', monospace` for code / mono elements
- Tinted zinc shadows (no pure-black)

---

## Phase 2 — Shared UI Primitives

New directory: `src/components/ui/`

| Component | File | Key spec |
|---|---|---|
| **Button** | `Button.tsx` | Variants: primary, secondary, ghost, danger. Sizes: sm/md/lg. Loading spinner. `active:scale-[0.97]` tactile feedback. |
| **Input** | `Input.tsx` | `bg-zinc-900 border-zinc-700 focus:border-blue-500`. Label above, error below, helper text optional. |
| **Card** | `Card.tsx` | `bg-zinc-900 border border-zinc-800 rounded-xl p-4` with optional hover lift. |
| **Badge** | `Badge.tsx` | Pill shape. Variants: urgent (red), high (orange), medium (yellow), low/default (zinc). |
| **Skeleton** | `Skeleton.tsx` | `bg-zinc-800 animate-pulse`. Configurable width / height / shape (text, card, circle). |
| **Avatar** | `Avatar.tsx` | Initials-based fallback. `bg-zinc-700 text-zinc-300 rounded-full`. Sizes: sm/md/lg. |
| **Separator** | `Separator.tsx` | `h-px bg-zinc-800 w-full` for section dividers. |

---

## Phase 3 — Motion Layer

`MOTION_INTENSITY: 3` means restrained, purposeful animation:

| Element | Motion spec | Reduced-motion fallback |
|---|---|---|
| Message bubbles | `motion.div` `initial={{ opacity: 0, y: 8 }}` `animate={{ opacity: 1, y: 0 }}` | Static opacity 1, y 0 |
| Card hover | `whileHover={{ y: -2 }}` transition 200ms | No hover effect |
| Button press | CSS `active:scale-[0.97]` | None needed (CSS) |
| Page entry | Container fade-up via `initial`/`animate` on mount | No entry animation |

**Rules:**
- No `useScroll`, no ScrollTrigger, no GSAP
- No `window.addEventListener('scroll')`
- All Motion components isolated in `'use client'` leaf components
- `useReducedMotion()` wrap on every animated component

---

## Phase 4 — Page-by-Page Polish

### LoginPage.tsx
- Replace inline card → `Card` primitive
- Replace inline inputs → `Input` primitive with labels
- Replace inline button → `Button` primary
- Add brand wordmark / logo placeholder
- Fix spacing rhythm

### InboxPage.tsx
- Replace inline skeletons → `Skeleton` primitive
- Replace inline card markup → `Card` primitive in CustomerCard
- Header logout → `Button` ghost
- Composed empty state with icon

### ConversationPage.tsx / CustomerHomePage.tsx
- Shared polish pass (both use same components)
- Header back button → `Button` ghost
- Use `Badge` for ticket status in TicketSidebar
- Use `Card` for ticket cards
- Message bubbles: own = `bg-blue-600 text-white`, other = `bg-zinc-800`
- Motion entry on new messages

### ReplyInput.tsx
- Replace inline textarea → `Input` styled for chat
- Send button → `Button` primary

### TicketSidebar.tsx
- Ticket cards → `Card` + `Badge` for status/entities/tags
- Active ticket highlight with blue border

### UnauthorizedPage.tsx
- Minimal pass with `Card` + `Button` primitives

---

## Phase 5 — Interactive State Audit

| State | Requirement |
|---|---|
| Loading | `Skeleton` primitives matching actual layout shapes |
| Empty | Composed empty state with icon + optional action |
| Error | Consistent error block (`bg-red-900/50 text-red-300`) with retry `Button` |
| Hover | `hover:bg-*` on interactables, `whileHover` on cards |
| Active | `active:scale-[0.97]` on all buttons |
| Focus | `focus-visible:ring-2 ring-blue-500` on all interactive elements |
| Disabled | `opacity-50 cursor-not-allowed` on buttons + inputs |

---

## Phase 6 — Pre-Flight Checklist

- [ ] **Button contrast**: blue-500/600 on zinc passes WCAG AA (4.5:1)
- [ ] **Color Consistency Lock**: blue accent used identically across all sections
- [ ] **Shape Consistency Lock**: radius tokens applied consistently (no random `rounded-lg` mixed with `rounded-2xl`)
- [ ] **Form contrast**: inputs, placeholders, labels all pass AA against zinc-900
- [ ] **Dark-mode theme lock**: single mode, no mid-page flips (trivially satisfied)
- [ ] **Zero em-dashes** (`—`) anywhere visible (Section 9.G)
- [ ] **No AI tells** (Section 9): no "Acme", no "Jane Doe", no "seamless/elevate/unleash", no fake-precise numbers
- [ ] **Viewport stability**: `min-h-[100dvh]` everywhere (already done)
- [ ] **`useEffect` animations** have proper cleanup
- [ ] **Navigation on one line** at all viewports
- [ ] **Z-index restraint**: document in constants file if more than 2 layers
- [ ] **Empty / loading / error states** on every data-driven surface
- [ ] **Motion respects `prefers-reduced-motion`** via `useReducedMotion()`
- [ ] **No `window.addEventListener('scroll')`** anywhere
- [ ] **Icons from allowed libraries**: Phosphor / HugeIcons / Radix / Tabler — no hand-rolled SVG paths
- [ ] **Copy self-audit**: every visible string re-read, no AI-hallucinated or grammatically-broken copy

---

## Files Changed

### New files (~10)
```
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/Card.tsx
src/components/ui/Badge.tsx
src/components/ui/Skeleton.tsx
src/components/ui/Avatar.tsx
src/components/ui/Separator.tsx
src/components/ui/index.ts          # barrel export
```

### Rewritten (~8)
```
src/index.css                        # token foundation + font imports
src/pages/LoginPage.tsx
src/pages/InboxPage.tsx
src/pages/ConversationPage.tsx
src/pages/CustomerHomePage.tsx
src/pages/UnauthorizedPage.tsx
src/components/ReplyInput.tsx
src/components/TicketSidebar.tsx
```

### Modified (~2)
```
src/components/MessageBubble.tsx     # motion entry
src/components/CustomerCard.tsx      # use Card primitive
```

---

## Not touched

- Data fetching architecture (hooks, API client, types)
- Routing (React Router config, guards)
- Auth flow (useAuth, localStorage token handling)
- Business logic (message dedup, polling, ticket selection)
