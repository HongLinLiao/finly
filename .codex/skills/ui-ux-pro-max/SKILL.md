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

## Common Professional UI Rules

1. Use SVG icon systems (Lucide/Heroicons/Simple Icons), not emoji as UI icons
2. Keep hover/focus feedback visible and stable
3. Ensure readable contrast in light and dark themes
4. Keep interactive targets discoverable (`cursor-pointer` where appropriate)
5. Prefer consistent spacing and type scale over ad-hoc pixel values

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
