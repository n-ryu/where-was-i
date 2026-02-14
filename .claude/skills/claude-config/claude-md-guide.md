# CLAUDE.md Writing Guide

## File Locations and Priority

| Location | Purpose | Shared |
|----------|---------|--------|
| `~/.claude/CLAUDE.md` | Personal preferences for all projects | No |
| `./CLAUDE.md` or `./.claude/CLAUDE.md` | Project instructions (commit to git) | Yes |
| `./CLAUDE.local.md` | Personal project-specific (auto-gitignored) | No |
| `./.claude/rules/*.md` | Modular topic-specific rules | Yes |
| Child directory `CLAUDE.md` | Loaded on demand when working in that directory | Yes |

More specific locations take precedence over broader ones.

## Structure Template

```markdown
# Project Name

One-line description of purpose.

## Tech Stack
- Key technologies only (what Claude can't infer)

## Commands
- `cmd` — description (only non-obvious commands)

IMPORTANT: Critical workflow rules here.

## Project Structure
- Directory layout with brief comments

## Code Conventions
- Only rules that differ from language/framework defaults
- Only rules that linters can't enforce
- Reference detailed docs: @docs/architecture.md

## Git
- Commit and branch conventions
```

## What to Include

- Bash commands Claude can't guess (custom scripts, non-standard test runners)
- Code style rules that differ from defaults
- Testing instructions and preferred test runners
- Repository etiquette (branch naming, PR conventions)
- Architectural decisions specific to your project
- Developer environment quirks (required env vars)
- Common gotchas or non-obvious behaviors

## What to Exclude

- Anything Claude can figure out by reading code
- Standard language conventions Claude already knows
- Detailed API documentation (link to docs instead with `@path`)
- Information that changes frequently
- Long explanations or tutorials
- File-by-file descriptions of the codebase
- Self-evident practices like "write clean code"
- Formatting rules enforced by linters/formatters

## Import Syntax

Use `@path/to/file` to reference other files:

```markdown
See @README.md for project overview.
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

- Relative paths resolve relative to the file containing the import
- Imports are recursive (max depth 5)
- Not evaluated inside code spans or code blocks

## Modular Rules (.claude/rules/)

For larger projects, organize into `.claude/rules/`:

```
.claude/rules/
├── code-style.md
├── testing.md
├── frontend/
│   └── react.md
└── backend/
    └── api.md
```

Rules can be scoped to specific files with frontmatter:

```markdown
---
paths:
  - "src/api/**/*.ts"
---
# API Rules (only loaded when working with matching files)
```

## Emphasis for Critical Rules

Use `IMPORTANT:` or `YOU MUST` to improve adherence to critical rules. But use sparingly — if everything is important, nothing is.

## Maintenance

- Treat CLAUDE.md like code: review when things go wrong
- Prune regularly — if Claude already does something correctly without the instruction, delete it
- Test changes by observing whether Claude's behavior actually shifts
- If Claude ignores a rule, the file is probably too long and the rule is getting lost

Sources:
- https://code.claude.com/docs/en/best-practices
- https://code.claude.com/docs/en/memory
- https://www.humanlayer.dev/blog/writing-a-good-claude-md
- https://www.builder.io/blog/claude-md-guide
