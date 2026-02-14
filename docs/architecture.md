# Architecture Guide

## Component Structure

Each feature module in `src/features/` follows this structure:
- `components/` — Feature-specific UI components
- `hooks/` — Feature-specific hooks
- `types.ts` — Feature-specific types

## Styling Pattern

styled-components usage:
- Define styled components in the same file as the React component
- Use the theme from `src/styles/theme.ts` for consistent colors, spacing, fonts

## State Management

- Jotai atoms live in `src/stores/`
- Derived state uses Jotai's `atom()` with getter functions
- Async data loading uses Jotai's async atoms

## Storage

- Dexie.js wraps IndexedDB in `src/db/`
- Database schema is defined in `src/db/schema.ts`
- All DB operations go through repository functions in `src/db/repositories/`
