---
name: ui-ux-pro-max
description: UI/UX design intelligence with searchable database (shadcn-first workflow)
---

# ui-ux-pro-max

Comprehensive design guide for web and mobile applications. Includes searchable UI/UX datasets and stack-specific implementation guidance.

This skill uses a **hybrid model** for web projects:

- Use **shadcn** as the component foundation (structure, accessibility, behavior).
- Use **ui-ux-pro-max** to drive visual style (brand tone, palette, typography, layout rhythm, motion).

## Prerequisites

Check if Python is installed:

```bash
python3 --version || python --version
```

If Python is not installed, install it based on user's OS:

**macOS:**

```bash
brew install python3
```

**Ubuntu/Debian:**

```bash
sudo apt update && sudo apt install python3
```

**Windows:**

```powershell
winget install Python.Python.3.12
```

## Path Convention (IMPORTANT)

Use the script path relative to repo root:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py ...
```

Do not use `skills/ui-ux-pro-max/...` unless that path actually exists.

## How to Use This Skill

When user requests UI/UX work (design, build, create, implement, review, fix, improve), follow this workflow.

### Step 0: Detect shadcn Project Context (REQUIRED for web)

Before recommending or implementing UI, check:

1. `components.json` exists
2. `tailwind.css` entry exists (usually `src/app/globals.css`)
3. aliases include `ui: "@/components/ui"`
4. `iconLibrary` is respected (e.g., `lucide`)
5. `tailwind.cssVariables` is `true` (or equivalent CSS variable theming enabled)

If project has shadcn config, default web stack to `shadcn`.

### Step 0.5: Define Style Boundary (REQUIRED)

Before implementation, separate decisions into 2 layers:

1. **Component Layer (shadcn-owned)**  
   Keep component semantics, structure, keyboard/focus behavior, and accessibility patterns.
2. **Visual Layer (ui-ux-pro-max-owned)**  
   Apply style direction through tokens, spacing scale, typography, density, icon tone, and animation language.

Rule: change appearance first; avoid rewriting shadcn component internals unless necessary.

### Step 0.7: Reference-First Consistency (REQUIRED when user says "refer to current page")

If user asks to "參考現在的頁面" (or equivalent), treat the referenced page as the primary visual source of truth.

1. Match layout rhythm first:
   - Keep the same information density, spacing cadence, card weight, and section hierarchy.
   - Avoid introducing a new "hero" treatment if the reference page does not use one.
2. Match color intensity first:
   - Keep labels and field titles neutral (`text-muted-foreground` family).
   - Use theme accent colors sparingly; do not flood the page with accent borders/glows.
3. Financial color semantics:
   - Green/red should be reserved for up/down or profit/loss values.
   - Do not use green/red for static labels, field titles, or non-directional metadata.
4. Re-check against reference before finishing:
   - If the new page feels more visually aggressive than the reference, tone it down.

### Step 1: Analyze User Requirements

Extract key information:

- Product type: SaaS, e-commerce, portfolio, dashboard, landing page
- Style keywords: minimal, playful, professional, editorial, etc.
- Industry: healthcare, fintech, gaming, education, etc.
- Platform: web/mobile
- Stack: if not specified and project has shadcn config, use `shadcn`

### Step 2: Generate Design System (REQUIRED)

Always start with `--design-system`:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

This returns:

1. Pattern + style direction
2. Color + typography recommendations
3. Visual effects guidance
4. Anti-patterns to avoid

### Step 2b: Persist Design System (Optional but recommended)

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

With page override:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

Hierarchy rule:

1. Check `design-system/<project>/pages/<page>.md` first
2. If exists, page rules override `MASTER.md`
3. Otherwise use `MASTER.md`

### Step 3: Pull shadcn Stack Guidance (REQUIRED for shadcn projects)

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack shadcn
```

Use this before implementation to align with component patterns.

### Step 3.5: Pull Style Direction from ui-ux-pro-max (REQUIRED)

After stack guidance, run domain searches for visual decisions:

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<brand/style keywords>" --domain style
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<product type>" --domain color
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<mood>" --domain typography
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<interaction needs>" --domain ux
```

Then map results into shadcn tokens/components instead of introducing separate custom UI systems.

### Step 4: Supplement with Domain Searches (as needed)

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

Examples:

- style exploration: `--domain style`
- chart selection: `--domain chart`
- UX/accessibility checks: `--domain ux`
- typography alternatives: `--domain typography`
- landing structure: `--domain landing`

## shadcn Implementation Rules (Must Follow)

### Setup & Installation

1. Use CLI, not manual copy:

```bash
npx shadcn@latest add <component>
```

2. If config is missing, initialize first:

```bash
npx shadcn@latest init
```

3. Use aliases:

```tsx
import { Button } from "@/components/ui/button"
```

Avoid long relative imports like `../../components/ui/button`.

### Theming & Tokens

1. Use semantic CSS variables (`--primary`, `--primary-foreground`, etc.)
2. Do not hardcode utility colors for semantic UI states when theme tokens exist
3. Keep both light and dark token sets (`:root` and `.dark`)
4. Convert ui-ux-pro-max color/type recommendations into token values in `globals.css`
5. When using design-system components, do not override color at the usage site with utility classes; let components consume semantic tokens from `globals.css`
6. Plain HTML elements can use local Tailwind color utilities in feature/page files when needed
7. Keep `globals.css` focused on reusable semantic theme tokens, not one-off page-specific color styling

### Composition & Variants

1. Prefer variants (`cva`) over ad-hoc class branching
2. Use `className` extension for one-off tweaks
3. Use `asChild` for Link/button composition
4. Prefer compound structures (e.g., `CardHeader`, `CardContent`, `CardFooter`)
5. If style requires a new look, add a variant before creating a new parallel component

### Form & Validation

1. Prefer shadcn `Form` with `react-hook-form`
2. Use `FormField` + `FormItem` + `FormLabel` + `FormControl` + `FormMessage`
3. Prefer Zod + resolver for schema validation

### Accessibility

1. Keep semantic structure provided by shadcn primitives
2. Do not replace accessible components with clickable `div`
3. Ensure labels exist (not placeholder-only)
4. Keep focus handling behavior in `Dialog`, `Sheet`, etc.
5. Any visual customization must preserve contrast, focus ring visibility, and keyboard flow

### Feedback & States

1. Use `Skeleton` for loading placeholders
2. Use `AlertDialog` for destructive confirmations
3. Use `sonner` + root `Toaster` for toast notifications

## Command Reference

### Design System

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system -p "Finly"
```

### shadcn Stack Rules

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "form dialog table theme" --stack shadcn
```

### Markdown Output

```bash
python3 .codex/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system -f markdown
```

## Available Domains

`product`, `style`, `typography`, `color`, `landing`, `chart`, `ux`, `icons`, `react`, `web`

## Available Stacks

`html-tailwind`, `react`, `nextjs`, `astro`, `vue`, `nuxtjs`, `nuxt-ui`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

## Default Decision Rule

- If web project has shadcn config: default stack = `shadcn`
- If web project does not have shadcn config: default stack = `html-tailwind`
- If user explicitly specifies another stack: follow user choice
- If both shadcn and ui-ux-pro-max are requested: keep shadcn structure, apply ui-ux-pro-max style via tokens/variants/layout patterns

## Project Preset: Finly (Auto-Apply)

When working inside the `finly` repo, apply this visual preset by default unless the user explicitly asks for a different theme:

1. Theme direction: dark fintech with emerald/green as the primary accent
2. Contrast rule: avoid near-identical black-on-black layers; floating surfaces must be visually separable from page background
3. Token mapping preference:
   - `--primary`: emerald range (`#10B981` to `#34D399`)
   - `--accent`: deep green tint (`#052E2B` / translucent variants)
   - `--background`: keep dark neutral base, but component surfaces should include green-tinted depth
4. Interaction states:
   - active/selected: green tint + subtle inner stroke
   - hover: brighter green text/icon emphasis
   - focus: visible green focus ring preserving accessibility contrast
5. Icon color policy: use neutral-emerald hierarchy, never default to amber/purple in Finly unless requested

Operational shortcut:
- For Finly UI requests, do not require repeated user prompts for "green theme" or "contrast from black background"; assume these as defaults.

Finly consistency guardrail (important):
- Green is an accent, not a background system.
- Prefer neutral surfaces and neutral label text.
- Keep visual emphasis concentrated on actionable controls and directional numbers (P/L, return up/down).
- When designing a peer page (e.g., funds vs stocks), default to matching the existing page's visual weight before adding new effects.

## Common Professional UI Rules

1. Use SVG icon systems (Lucide/Heroicons/Simple Icons), not emoji as UI icons
2. Keep hover/focus feedback visible and stable
3. Ensure readable contrast in light and dark themes
4. Keep interactive targets discoverable (`cursor-pointer` where appropriate)
5. Prefer consistent spacing and type scale over ad-hoc pixel values
6. For data-heavy finance pages, prefer neutral text hierarchy:
   - labels/titles: muted neutral
   - primary values: foreground
   - directional values only: semantic up/down colors

## Quick Workflow Summary

1. Detect project context (`components.json`, aliases, css variables)
2. Run `--design-system`
3. Run `--stack shadcn` when shadcn project
4. Run style/color/typography/ux domain searches for visual direction
5. Apply design via tokens + variants + composition (not by replacing shadcn primitives)
6. Validate accessibility and interaction states

## Practical Mapping (shadcn + ui-ux-pro-max)

1. `ui-ux-pro-max` outputs brand palette -> map to `--primary`, `--secondary`, `--accent`, `--muted`
2. Typography pairing -> map to app font variables and semantic text utilities
3. Card/button tone -> implement with `cva` variants (e.g., `brand`, `soft`, `outline-strong`)
4. Interaction style -> use consistent transition/easing tokens while preserving focus-visible states
5. Page layout style -> compose with shadcn blocks/components, then tune spacing and hierarchy
