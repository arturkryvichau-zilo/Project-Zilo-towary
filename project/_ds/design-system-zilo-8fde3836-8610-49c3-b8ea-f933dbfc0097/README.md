# Zilo Design System

A design system for **Zilo** — a SaaS panel for auto workshops (Polish market). Zilo is used by mechanics, service advisors, and workshop owners to manage bookings, service orders, notifications, an AI phone assistant, and marketing touchpoints.

UI is in **Polish** throughout.

## Index

| Path | What it is |
|---|---|
| `README.md` | This file. Brand context, content + visual foundations. |
| `SKILL.md` | Skill manifest so the design system can be invoked as a Claude Skill. |
| `colors_and_type.css` | All design tokens (CSS variables) + base typography. |
| `fonts/` | Rubik webfonts, self-hosted (300 – 900, normal + italic). |
| `assets/logos/` | Zilo logotypes — `zilo-blue.svg`, `zilo-white.svg`. |
| `assets/icons/` | Icon set — 20 × 20 and 32 × 32, outline + fill variants. |
| `assets/illustrations/` | Automotive illustrations (SVG + PNG). |
| `assets/images/` | Cover imagery. |
| `preview/` | Design-system cards rendered in the DS tab. |
| `skills/copy-writer-zilo/` | Polish UX copy generator + reviewer. |
| `skills/ux-review/` | UI/UX review against 9 principles + 8 anti-patterns. |
| `CHANGELOG.md` | Log of every component decision & iteration — reusable for a sibling Design System. |

---

## Content fundamentals

Polish · sentence case · "Ty" · no emoji · Rubik · matter-of-fact. Full copy rules in `skills/copy-writer-zilo/SKILL.md`.

## Visual foundations

**Zilo Blue 1 `#222693`** — primary. Steps to `#F6F6FC`. Sidebar navy `#0A0B29`. Rubik 300 – 900. Radii 4 / 8 / 10 / 999. Standard ease `cubic-bezier(0.2, 0, 0, 1)` @ 200ms. No focus ring — hover + active + high-contrast borders carry state.

## Related skills

- **`skills/copy-writer-zilo/SKILL.md`** — write and review Polish UX copy.
- **`skills/ux-review/SKILL.md`** — critique against 9 principles + 8 anti-patterns.
