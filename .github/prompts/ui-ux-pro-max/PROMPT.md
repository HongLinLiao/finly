---
mode: agent
description: "ui-ux-pro-max workflow (shadcn-first, design-system-driven)"
---

# ui-ux-pro-max (Copilot Prompt)

Use this prompt when the user asks for UI/UX design work: design, build, create, implement, review, fix, or improve.

Goal:

- Keep implementation structure and accessibility from `shadcn`.
- Drive visual direction from `ui-ux-pro-max` data and recommendations.
- Follow one consistent workflow so results can be reused across AI tools.

## Core Model

This workflow uses a hybrid model for web projects:

- `shadcn` owns component semantics, structure, keyboard/focus behavior, and accessibility patterns.
- `ui-ux-pro-max` owns visual style: brand tone, palette, typography, spacing rhythm, motion language.

Rule:

- Change appearance first.
- Avoid rewriting shadcn internals unless truly necessary.

## Prerequisites

Check Python:

```bash
python3 --version || python --version
```

If Python is missing:

macOS:

```bash
brew install python3
```

Ubuntu/Debian:

```bash
sudo apt update && sudo apt install python3
```

Windows:

```powershell
winget install Python.Python.3.12
```

## Required Path Convention

Always call scripts from repo root with:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py ...
```

Do not use `prompts/ui-ux-pro-max/...` unless that path actually exists.

## Workflow

### Step 0: Detect shadcn Context (required for web)

Before recommending or implementing UI, verify:

- `components.json` exists.
- `tailwind.css` entry exists (commonly `src/app/globals.css`).
- aliases include `ui: "@/components/ui"`.
- `iconLibrary` is respected (for example `lucide`).
- `tailwind.cssVariables` is `true` (or equivalent CSS variable theming is enabled).

Decision:

- If web project has shadcn config, default stack is `shadcn`.

### Step 0.5: Define Style Boundary (required)

Split decisions into two layers:

- Component Layer (`shadcn`): semantics, accessibility, interaction structure.
- Visual Layer (`ui-ux-pro-max`): tokens, spacing, typography, density, icon tone, animation.

### Step 1: Analyze requirements

Extract:

- Product type (SaaS, e-commerce, dashboard, landing, portfolio, etc.).
- Style keywords (minimal, playful, professional, editorial, etc.).
- Industry (healthcare, fintech, gaming, education, etc.).
- Platform (web/mobile).
- Stack (if not specified and shadcn config exists, use `shadcn`).

### Step 2: Generate design system (required)

Always start with `--design-system`:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

Expected output:

- Pattern and style direction.
- Color and typography recommendations.
- Visual effects guidance.
- Anti-patterns to avoid.

### Step 2b: Persist design system (optional, recommended)

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

With page override:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

Hierarchy rule:

- Read `design-system/<project>/pages/<page>.md` first.
- If page file exists, it overrides `MASTER.md`.
- Otherwise use `MASTER.md`.

### Step 3: Pull shadcn stack guidance (required for shadcn projects)

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack shadcn
```

### Step 3.5: Pull visual direction from domains (required)

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<brand/style keywords>" --domain style
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<product type>" --domain color
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<mood>" --domain typography
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<interaction needs>" --domain ux
```

Map findings into shadcn tokens/components.
Do not introduce a parallel custom component system unless explicitly requested.

### Step 4: Supplement with domain searches (as needed)

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

Examples:

- style exploration: `--domain style`
- chart selection: `--domain chart`
- UX/accessibility checks: `--domain ux`
- typography alternatives: `--domain typography`
- landing structure: `--domain landing`

## shadcn Implementation Rules (must follow)

### Setup

- Use CLI, not manual copy:

```bash
npx shadcn@latest add <component>
```

- If config is missing, initialize first:

```bash
npx shadcn@latest init
```

- Use alias imports:

```tsx
import { Button } from "@/components/ui/button";
```

### Theming and tokens

- Use semantic CSS variables (`--primary`, `--primary-foreground`, etc.).
- Avoid hardcoded utility colors for semantic states when tokens exist.
- Maintain both `:root` and `.dark` token sets.
- Convert ui-ux-pro-max recommendations into token values in `globals.css`.
- For design-system components, do not apply direct color overrides at usage sites; they should consume semantic tokens from `globals.css`.
- Plain HTML elements can use local Tailwind color utilities when needed.
- Keep `globals.css` for reusable semantic theme tokens, not one-off page-specific color styling.

### Composition and variants

- Prefer variants (`cva`) over ad-hoc class branching.
- Prefer `className` extension for one-off tweaks.
- Use `asChild` for Link/button composition.
- Prefer compound structures (`CardHeader`, `CardContent`, `CardFooter`).
- Add a variant before creating a parallel component.

### Forms and validation

- Prefer shadcn `Form` with `react-hook-form`.
- Use `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`.
- Prefer Zod + resolver for schema validation.

### Accessibility

- Preserve semantic structure from shadcn primitives.
- Never replace accessible controls with clickable `div`.
- Ensure labels exist (not placeholder-only).
- Keep focus handling in `Dialog`, `Sheet`, etc.
- Visual customization must keep contrast, focus ring visibility, and keyboard flow.

### Feedback and states

- Use `Skeleton` for loading placeholders.
- Use `AlertDialog` for destructive confirmations.
- Use `sonner` + root `Toaster` for toast notifications.

## Command Reference

Design system:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system -p "Finly"
```

shadcn rules:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "form dialog table theme" --stack shadcn
```

Markdown output:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system -f markdown
```

## Available Domains

`product`, `style`, `typography`, `color`, `landing`, `chart`, `ux`, `icons`, `react`, `web`

## Available Stacks

`html-tailwind`, `react`, `nextjs`, `astro`, `vue`, `nuxtjs`, `nuxt-ui`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

## Default Decision Rules

- If web project has shadcn config: default stack = `shadcn`.
- If web project does not have shadcn config: default stack = `html-tailwind`.
- If user explicitly specifies another stack: follow user choice.
- If both shadcn and ui-ux-pro-max are requested: keep shadcn structure and apply ui-ux-pro-max style via tokens, variants, and layout patterns.

## Project Preset: Finly (auto-apply)

When working in `finly`, use this preset unless user asks otherwise:

- Theme: dark fintech with emerald/green primary accent.
- Contrast: avoid near-identical black-on-black layers; floating surfaces must be visually distinct.
- Token mapping preference:
  - `--primary`: emerald range (`#10B981` to `#34D399`).
  - `--accent`: deep green tint (`#052E2B` and translucent variants).
  - `--background`: dark neutral base with green-tinted surface depth.
- Interaction states:
  - active/selected: green tint with subtle inner stroke.
  - hover: brighter green text/icon emphasis.
  - focus: visible green focus ring with accessible contrast.
- Icon policy: neutral-emerald hierarchy; do not default to amber/purple unless requested.

## Professional UI Baseline

- Use SVG icon systems (Lucide, Heroicons, Simple Icons), not emoji as UI icons.
- Keep hover/focus feedback visible and stable.
- Maintain readable contrast in light and dark themes.
- Keep interactive targets discoverable (`cursor-pointer` where appropriate).
- Prefer consistent spacing and type scale over ad-hoc pixel values.

## Quick Summary

- Detect project context.
- Run `--design-system` first.
- Run `--stack shadcn` for shadcn projects.
- Run domain searches for style, color, typography, and UX.
- Implement via tokens + variants + composition.
- Validate accessibility and interaction quality.

## Practical Mapping

- Brand palette output -> map to `--primary`, `--secondary`, `--accent`, `--muted`.
- Typography pairing -> map to app font variables and semantic text utilities.
- Card/button tone -> implement with `cva` variants (for example `brand`, `soft`, `outline-strong`).
- Interaction style -> keep consistent transition/easing tokens while preserving focus-visible.
- Page layout style -> compose with shadcn blocks, then tune spacing and hierarchy.
