# where-was-i

Personal task management service for writing todos, tracking progress, and retrospective review.

## Tech Stack

- **Frontend**: React + Vite + TypeScript (SPA)
- **Styling**: styled-components
- **State**: Jotai
- **Storage**: IndexedDB (Dexie.js)
- **Package Manager**: pnpm

## Commands

- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm test` — Run tests (Vitest)
- `pnpm lint` — Lint with ESLint
- `pnpm format` — Format with Prettier
- `pnpm typecheck` — TypeScript type checking

IMPORTANT: Always run `pnpm typecheck && pnpm lint` after making code changes to catch errors early.

## Project Structure

```
src/
  components/    # Reusable UI components
  features/      # Feature modules (todos, progress, retrospective)
  hooks/         # Custom React hooks
  stores/        # Jotai atoms and derived state
  db/            # IndexedDB (Dexie) schemas and queries
  styles/        # Global styles and theme
  types/         # Shared TypeScript types
  utils/         # Utility functions
  pages/         # Route-level page components
```

## Code Conventions

- Use named exports; avoid default exports
- Co-locate tests next to source files (`Component.test.tsx`)
- All code, comments, and commit messages in English
- For detailed architecture and patterns, see @docs/architecture.md

## Work Rules

IMPORTANT: Break changes into small, reviewable units of ≤400 lines (additions and deletions each). Pause and ask for user approval after each unit before continuing. When creating pull requests, keep each PR under 400 lines of additions and 400 lines of deletions; split into multiple PRs if needed.

## Git

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`, `style:`
- Branch naming: `feat/description`, `fix/description`, `chore/description`
