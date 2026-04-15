# AgentSpy Frontend UI Specification

## Visual Design Principles

AgentSpy should feel like a precise local-first observability instrument, not a generic admin template. The interface uses a 2026 Apple-inspired direction: restrained, spatially calm, high-contrast where it matters, and layered with subtle translucent surfaces. Do not copy Apple branding, icons, product names, proprietary UI assets, or exact application chrome.

Design goals:

- Trust: stable layout, clear hierarchy, muted palette, explicit status labels.
- Observability: timeline-first structure, scannable event metadata, visible alert/cost context.
- Precision: thin borders, compact labels, exact timestamps, deterministic status language.
- Calmness: generous spacing, soft surfaces, limited color accents, no unnecessary motion.

## Color And Surface System

Base surfaces use a warm neutral light background with slight radial depth. Panels sit above it with translucent white and low-contrast borders.

Rules:

- Page background: warm off-white / pale slate gradient.
- Primary text: near-black slate.
- Secondary text: cool muted slate.
- Accent color is semantic, not decorative.
- Red/rose is reserved for alert or destructive severity.
- Emerald/teal is reserved for healthy state or cost success.
- Amber is reserved for warning or medium severity.
- Avoid broad saturated color blocks.

Surface levels:

- Level 0: page background.
- Level 1: glass shell panels with `rgba(255,255,255,0.68)`, blur, and soft shadow.
- Level 2: hairline cards with `rgba(255,255,255,0.74)`, thin slate border, and inset highlight.
- Level 3: semantic emphasis panels, such as alert cards with a restrained rose tint.

## Typography Scale

Font stack:

- Display: `Instrument Sans`, then `Manrope`, then system sans.
- Body: `Manrope`, then system sans.

Scale:

- Page title: 36-40px, bold, tight tracking.
- Section title: 20-24px, semibold, tight tracking.
- Card title: 16-18px, semibold.
- Body text: 14px, relaxed line height.
- Metadata labels: 11-12px, uppercase, high tracking.
- Numeric stat values: 30-48px, bold, tight tracking.

Use typography hierarchy before color. Labels should be small and precise; core values should be large and quiet.

## Spacing Rules

Use an 8px spacing rhythm.

- Shell padding: 16px mobile, 32px desktop.
- Sidebar inset: 16px from viewport edge.
- Section gap: 24px.
- Card internal padding: 20-24px.
- Dense list row padding: 16-20px.
- Icon-to-text gap: 12-16px.

Whitespace should create calmness without hiding useful density. Lists can be compact if labels and grouping remain clear.

## Border Radius Rules

- App shell/sidebar: 32px.
- Primary cards: 28-32px.
- List rows: 24px.
- Buttons/badges: fully rounded pills.
- Small icon tiles: 16px.

Large radius should be consistent. Do not mix sharp table corners with rounded shell cards.

## Panel And Card Treatment

Cards use low-contrast borders, translucent white, and soft shadows. Glassmorphism is used as depth, not decoration.

Rules:

- Use blur on shell/sidebar/header panels only where it improves layering.
- Keep text on translucent surfaces high-contrast.
- Avoid stacking many blurred surfaces inside each other.
- Prefer thin borders over heavy shadows.
- Use subtle hover lift only on interactive cards.

## Sidebar And Header Layout Rules

Sidebar:

- Fixed on desktop, hidden on small screens for the current MVP.
- Contains product mark, primary navigation, and a compact MVP context block.
- Active nav item uses high-contrast dark fill; inactive items stay quiet.

Header:

- Sticky at top of content area.
- Shows workspace context, current page title, and current mode.
- Uses backdrop blur lightly so content scroll feels layered.

Content:

- Maximum width around 1280px.
- Page sections stack with 24px vertical rhythm.
- Overview may use denser grids; detail pages should favor scan-friendly vertical lists.

## Icon Usage Rules

Use Lucide icons as simple line icons.

- Icons should clarify category or status, not decorate every label.
- Use 16-20px icons in rows and buttons.
- Use 40-48px icon tiles only for stat cards or alert emphasis.
- Keep icon stroke appearance consistent.
- Avoid colorful icon sets or branded icons.

## Motion And Transition Principles

Motion should be fast and practical.

- Hover transitions: 150-200ms.
- Use small translate/lift effects only for cards that feel clickable.
- Avoid springy or playful effects.
- Avoid animated charts in this phase.
- Loading states should pulse gently if implemented later.

## List, Table, And Timeline Presentation Rules

Overview:

- Use the hero section to explain workspace value in one screen.
- Stat cards must answer operational questions directly: event volume, open alerts, enabled rules, and today's cost.
- Recent alerts and recent events should be previews, not separate feature surfaces.
- Cost preview should communicate current spend without adding a chart dependency.

Timeline:

- Newest-first ordering.
- Each row shows summary text, category.action, agent, time, and semantic badges.
- Risky events should be visually marked with a restrained alert badge and soft tinted row, not a loud banner.
- Target values should be visible because AgentSpy is an audit product.

Alerts:

- Severity and status must be visible without reading the body.
- Description should remain readable and concise.
- Event linkage should be represented as an affordance or metadata label until navigation is implemented.
- Open and resolved alerts should be visually distinct without using aggressive color blocks.

Rules:

- MVP `condition_*` fields should be translated into human-readable condition text.
- Enabled/disabled state and severity should be visible on every rule card.
- Actions should be shown as declarative outcomes, not executable code.
- Summary metrics should show total, enabled, disabled, and high-severity rule counts.
- Create-rule affordances can be visible as placeholders, but must not imply unsupported flows are wired.

Cost:

- Total cost should be prominent.
- Trends should be simple and legible without adding a charting dependency.
- Breakdowns can be placeholders only when clearly labeled as mock/demo content.
- Provider and agent breakdowns should use quiet progress bars or lists instead of noisy BI-style charts.
- Cost explanations must state when values are based on persisted event cost data.

## Empty And Loading States

Empty states should be quiet and instructive.

- Use an icon tile, short title, and one-line explanation.
- Avoid jokes or marketing copy.
- Loading states should reserve layout space and use soft skeletons in future API integration.

## Implementation Notes

- Tailwind utilities define most layout and surface styles.
- `src/index.css` owns design tokens and shared surface utilities.
- shadcn/ui is configured for Vite through `components.json`, path aliases, and local `src/components/ui` primitives.
- Zustand is used only for lightweight dashboard context: workspace, agent/run filters, time range, selected section, and local search text.
- Mock data lives in `src/data/mock.ts` and mirrors current backend MVP concepts.


## Shared Dashboard Context Controls

The shell header owns lightweight global context controls for workspace, time range, agent, and run filters. These controls should remain compact, quiet, and visually subordinate to the page title. Cross-page consistency matters more than dense filtering power in this phase.

Rules:

- Keep context controls in hairline or glass panels.
- Do not turn the header into a heavy query builder.
- Use page-local controls only for view-specific concerns such as event text search.
- Fetched API data should remain local to pages until a stronger server-state need exists.



## Demo Workspace Presentation

Demo mode is represented as a workspace context, not a separate product surface. The header may show a restrained demo badge or `View Demo` action, but pages must continue to use real backend API data. If demo data is missing, show calm setup guidance instead of mock fallbacks.

## URL Persistence

Top-level dashboard context is refresh-persistent and shareable through concise query parameters. This behavior should remain invisible in the interface: do not add technical URL controls, badges, or copy-heavy explanations to the product UI.

## Backend Data Integration

Overview, Events, Alerts, Rules, and Cost pages now consume real backend read APIs through a minimal fetch layer. The visual system must remain stable across loading, empty, error, and populated states.

Rules:

- API loading states use glass-panel skeleton rows, not raw text.
- API errors use quiet semantic panels with clear recovery guidance.
- Empty states should describe what backend data would populate the view.
- Overview uses hybrid backend data while preserving an editorial product-homepage structure.
- Do not expose API mechanics, raw JSON, or stack traces in product-facing panels.
