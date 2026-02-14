# Skills Configuration Reference

## Directory Structure

```
.claude/skills/<skill-name>/
├── SKILL.md           # Main instructions (required)
├── template.md        # Template for Claude to fill in (optional)
├── examples/          # Example outputs (optional)
└── scripts/           # Scripts Claude can execute (optional)
```

Skills locations:

| Location | Applies to |
|----------|-----------|
| `~/.claude/skills/<name>/SKILL.md` | All your projects |
| `.claude/skills/<name>/SKILL.md` | This project only |

## SKILL.md Format

```yaml
---
name: my-skill              # Slash command name (lowercase, hyphens only, max 64 chars)
description: What it does    # Helps Claude decide when to auto-load (recommended)
argument-hint: "[args]"      # Shown during autocomplete
disable-model-invocation: true  # Only user can invoke (default: false)
user-invocable: false        # Only Claude can invoke (default: true)
allowed-tools: Read, Grep    # Tools allowed without permission when active
model: opus                  # Model override
context: fork                # Run in isolated subagent
agent: Explore               # Subagent type (when context: fork)
---

Skill instructions in markdown...
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name / slash command. If omitted, uses directory name |
| `description` | Recommended | What it does and when to use it. Claude uses this for auto-loading |
| `argument-hint` | No | Autocomplete hint (e.g., `[issue-number]`) |
| `disable-model-invocation` | No | `true` = only user can invoke. For side-effect workflows |
| `user-invocable` | No | `false` = only Claude can invoke. For background knowledge |
| `allowed-tools` | No | Tools allowed without permission when skill is active |
| `model` | No | Model override when skill is active |
| `context` | No | `fork` = run in isolated subagent context |
| `agent` | No | Subagent type when `context: fork` (Explore, Plan, general-purpose, or custom) |

## Invocation Control

| Setting | User can invoke | Claude can invoke |
|---------|----------------|-------------------|
| (default) | Yes | Yes |
| `disable-model-invocation: true` | Yes | No |
| `user-invocable: false` | No | Yes |

## String Substitutions

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed when invoking |
| `$ARGUMENTS[N]` or `$N` | Specific argument by 0-based index |
| `${CLAUDE_SESSION_ID}` | Current session ID |

## Dynamic Context Injection

Use `!`command`` to run shell commands before the skill content is sent to Claude:

```yaml
---
name: pr-summary
context: fork
agent: Explore
---

## Context
- PR diff: !`gh pr diff $ARGUMENTS`
- Changed files: !`gh pr diff $ARGUMENTS --name-only`

## Task
Summarize this pull request...
```

The command output replaces the placeholder. This is preprocessing — Claude only sees the final result.

## Skill Types

### Reference Skills (auto-loaded knowledge)
```yaml
---
name: api-conventions
description: API design patterns for this codebase
---
When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
```

### Task Skills (user-invoked workflows)
```yaml
---
name: deploy
description: Deploy the application
disable-model-invocation: true
context: fork
---
Deploy $ARGUMENTS:
1. Run tests
2. Build
3. Push to deployment target
```

### Background Knowledge (Claude-only)
```yaml
---
name: legacy-context
description: How the legacy system works
user-invocable: false
---
The legacy API uses XML responses...
```

## Best Practices

- Keep SKILL.md under 500 lines; move details to supporting files
- Reference supporting files: `For API details, see [reference.md](reference.md)`
- Use `context: fork` for tasks that read many files (prevents main context pollution)
- Use `disable-model-invocation: true` for workflows with side effects
- Use `allowed-tools` to restrict tool access when appropriate
- Skill descriptions are always in context; full content loads only when invoked

Source: https://code.claude.com/docs/en/skills
