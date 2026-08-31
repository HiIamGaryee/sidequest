# SIDEQUEST Style Guide

## Overview

SIDEQUEST uses a focused productivity-game UI with two visual modes:

- Light mode: warm off-white surfaces, white cards, and cobalt blue accents
- Dark mode: monochrome HUD styling with high-contrast neutral surfaces

The interface should always feel:

- Tactical
- Calm
- Structured
- Slightly game-like, never childish

## Design Direction

- Prioritize clarity over decoration
- Keep layouts modular and dashboard-like
- Use soft rounded cards instead of hard industrial panels
- Treat blue as the core action color
- Reserve amber, green, and warning tones for status and feedback

## Color System

### Light Mode

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `#f7f6f1` | App background (warm off-white) |
| `--foreground` | `#183153` | Primary text |
| `--card` | `#ffffff` | Card surfaces |
| `--card-foreground` | `#183153` | Card text |
| `--secondary` | `#eef5ff` | Soft blue surface |
| `--muted` | `#f1f0ea` | Secondary surface |
| `--muted-foreground` | `#5f6f86` | Secondary text |
| `--border` | `#d9dee7` | Borders and dividers |
| `--primary` | `#0b4ccb` | Primary action color |

Light-mode surfaces, ink and status colors are also exposed as `--lt-*` variables on
`html:not(.dark)` in `src/index.css`. That block is the single source of truth for the
light theme; every rule in it is gated on `html:not(.dark)` so Dark Theme is unaffected.

| Extra light token | Value | Use |
| --- | --- | --- |
| `--lt-surface-inset` | `#f7f9fc` | Inset panels inside cards |
| `--lt-border-strong` | `#c8cfdb` | Emphasised borders |
| `--lt-text-3` | `#8a94a6` | Muted labels |
| `--lt-cyan` | `#0b8fd3` | Agent / WebMCP actions |
| `--lt-disabled-bg` / `--lt-disabled-text` | `#f4f5f7` / `#a1a8b4` | Disabled controls (opacity stays `1`) |

### Dark Mode

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `#09090b` | App background |
| `--foreground` | `#fafafa` | Main text |
| `--card` | `#18181b` | Card surfaces |
| `--secondary` | `#18181b` | Secondary surfaces |
| `--muted` | `#27272a` | Muted fills |
| `--muted-foreground` | `#71717a` | Secondary text |
| `--border` | `#27272a` | Borders and dividers |
| `--primary` | `#ffffff` | Primary emphasis |

### Status Colors

| Token | Value | Use |
| --- | --- | --- |
| `--xp` | amber in light, white in dark | XP and progress |
| `--focus` | blue in light, green in dark | Focus states |
| `--success` | green | Success feedback |
| `--warning` | amber | Alerts and caution states |

Status color rules:

- Blue is primary interaction and selection
- Cyan is agent / WebMCP / automation
- Amber is XP, level, combo and attention
- Green is reserved for success, saved, local and healthy status
- Red is destructive and error only, on a soft surface with a strong action button

## Typography

| Role | Font |
| --- | --- |
| Body | `Plus Jakarta Sans` |
| Display / headings | `Syne` |
| Code / system labels | `JetBrains Mono` |

Typography rules:

- Use `Syne` for headings, section titles, and standout labels
- Use `Plus Jakarta Sans` for body copy, controls, and navigation
- Use `JetBrains Mono` for tiny status text, system labels, timers, and technical UI
- Keep heading tracking slightly tight
- Keep body text readable and compact

## Shape and Surfaces

- Base radius is `0.5rem`
- Standard cards use rounded corners around `xl` scale
- Cards are the primary container pattern
- Card surfaces should feel layered, not flat
- Borders are visible and should separate panels cleanly

Common surface pattern from the app:

- Background: `bg-[#18181b]` in dark mode
- Border: `border-[#27272a]`
- Radius: `rounded-xl`

## Spacing

- Prefer `p-5` for standard card padding
- Use `gap-6` for major grid spacing
- Use `gap-2` to `gap-3.5` for compact inline controls
- Use `space-y-6` for major vertical page rhythm
- Use tighter spacing for metadata and status rows

## Layout Rules

- Build pages as stacked sections inside a centered page container
- Use responsive dashboard grids for major content areas
- Keep hero areas split between identity/status on the left and actions on the right
- Treat sidebar navigation as a persistent control surface
- Make mobile layouts collapse cleanly to one column before shrinking content density

## Components

### Cards

- Cards are the main structural unit
- Titles are compact, bold, and high contrast
- Descriptions use muted text
- Footer actions stay minimal

### Navigation

- Navigation items should feel like selectable mission entries
- Active state uses stronger contrast, visible border emphasis, and a status dot
- Labels stay short and scannable

### Buttons

- Primary buttons should feel decisive
- Outline buttons should remain visible on dark and light surfaces
- Icons are small and supportive, not dominant

### Status UI

- Use uppercase micro-labels for tactical or system-style metadata
- Badges should communicate state fast
- Progress indicators should feel game-inspired but still professional

## Motion

- Motion is short, controlled, and informative
- Prefer subtle fade and small vertical movement
- Use staggered reveals for dashboard sections
- Respect reduced motion settings
- Avoid decorative looping motion unless it communicates state

Current page reveal pattern:

- Small upward offset
- Quick ease-out transition
- Short stagger between sections

## Voice and Copy

- Short
- Direct
- Encouraging without sounding cute
- Productivity-first with light quest language

Good examples:

- `Start Focus`
- `Main Quest`
- `Next Action`
- `Stay on the main quest`

Avoid:

- Overly corporate language
- Joke-heavy copy
- Fantasy language that reduces usability

## Implementation Notes

- Keep using the existing token system in `src/index.css`
- Reuse shared layout and card patterns before inventing new ones
- Match existing `rounded-xl`, bordered, card-first UI
- Preserve the current font stack and theme behavior
- New screens should look native to the current dashboard system
