# UI Components Guidelines

## Overview

All UI elements in this project use **shadcn/ui**. Do not create custom components from scratch — always use or extend shadcn/ui components.

## Rules

### General

- **Only shadcn/ui** — never build custom button, input, dialog, card, or other UI primitives from scratch.
- Install components via the shadcn CLI: `npx shadcn@latest add <component>`.
- Imported components live in `components/ui/` and should not be modified unless absolutely necessary.
- Compose complex UI by combining existing shadcn/ui components rather than writing raw HTML/CSS.

### Styling

- Use Tailwind CSS utility classes for layout and spacing adjustments on top of shadcn/ui components.
- Do not override shadcn/ui component internals with arbitrary CSS files or inline styles.
- Use the `cn()` utility from `@/lib/utils` to conditionally merge class names.

### Adding New Components

1. Check the [shadcn/ui docs](https://ui.shadcn.com/docs/components) to confirm the component exists.
2. Run `npx shadcn@latest add <component-name>` to scaffold it into `components/ui/`.
3. Import and use it directly — do not duplicate or re-implement it elsewhere.

### Forbidden Patterns

- ❌ Creating custom `<Button>`, `<Input>`, `<Modal>`, etc. components outside of shadcn/ui.
- ❌ Installing other UI libraries (e.g., MUI, Chakra UI, Ant Design, Radix UI directly).
- ❌ Copying shadcn/ui source code manually instead of using the CLI.
