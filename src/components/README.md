# Component Structure

All components follow a consistent 4-file system.

## File Structure

```
/ComponentName/
├── ComponentName.tsx          # Component implementation
├── ComponentName.types.ts     # TypeScript interfaces
├── ComponentName.styles.ts    # Tailwind class strings
└── ComponentName.constants.ts # Hardcoded values, configs
```

**Simple components** may skip `.constants.ts` if they have no hardcoded values.

## Quick Reference

### ComponentName.tsx
Component logic and JSX. Import from sibling files.

```typescript
import * as styles from './Button.styles';
import { DEFAULT_VARIANT } from './Button.constants';
import { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  variant = DEFAULT_VARIANT,
  children
}) => (
  <button className={styles.getButtonStyles(variant)}>
    {children}
  </button>
);
```

### ComponentName.types.ts
All TypeScript interfaces and types.

```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}
```

### ComponentName.styles.ts
Tailwind class strings. Use `cn()` for dynamic styles.

```typescript
import { cn } from '@/lib/utils';

export const button = 'px-4 py-2 rounded font-medium';

export const getButtonStyles = (variant: string) =>
  cn(button, variant === 'primary' ? 'bg-blue-600' : 'bg-gray-200');
```

### ComponentName.constants.ts
Extract hardcoded values here.

```typescript
export const DEFAULT_VARIANT = 'primary' as const;

export const SOCIAL_LINKS = [
  { href: 'https://github.com', label: 'GitHub' },
] as const;
```

## Styling Rules

1. **Use Tailwind utilities only** - No inline styles or CSS modules
2. **Never use margin** - Use `gap` for spacing between children, `padding` for internal spacing
3. **Always include line-height** - Every text element needs leading-*
4. **Scale responsively** - Use breakpoint prefixes: `text-4xl md:text-6xl`

**Good:**
```typescript
export const container = 'flex flex-col gap-4 p-6';
```

**Bad:**
```typescript
export const container = 'flex flex-col mt-4 mb-8'; // ❌ No margin!
```

## Common Patterns

### Base + Variant
**Card** is the base component. **CardArticle**, **CardRole**, **CardStudy** wrap it with domain-specific logic.

```typescript
// CardArticle wraps base Card
import { Card } from '@/components/Card/Card';

export const CardArticle: React.FC<CardArticleProps> = ({ article }) => (
  <a href={article.url}>
    <Card title={article.title} description={article.subtitle} />
  </a>
);
```

### Context-Aware
**Section** provides theme context. **Button**, **Heading**, etc. read from it.

```typescript
<Section theme="blue">
  <Button /> {/* Automatically styled for blue theme */}
</Section>
```

## Design System

**Colors:** `bones-blue`, `bones-white`, `bones-black`, `bones-yellow`
**Fonts:** `font-sans` (DM Sans), `font-serif` (DM Serif Display)
**Themes:** `mono`, `gray`, `yellow`, `blue`, `red`, `purple`

## Quick Start

```bash
# Create new component
mkdir src/components/NewComponent
cd src/components/NewComponent

# Create files
touch NewComponent.tsx NewComponent.types.ts NewComponent.styles.ts NewComponent.constants.ts
```

Look at **Button**, **Card**, or **Navigation** for examples.
