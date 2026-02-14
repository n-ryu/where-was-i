---
name: claude-config
description: Best practices for writing and maintaining CLAUDE.md files, skills (SKILL.md), and hooks configuration. Use when creating, editing, or reviewing Claude Code configuration files.
user-invocable: false
---

# Claude Code Configuration Guide

When creating or modifying Claude Code configuration files, follow these principles:

## CLAUDE.md

- Keep under 60 lines. For each line, ask: "Would removing this cause Claude to make mistakes?" If not, cut it.
- Structure around WHAT (tech stack), WHY (purpose), HOW (workflow commands).
- Use `IMPORTANT:` prefix for critical rules that must not be ignored.
- Don't include what Claude can infer from code or what linters enforce.
- Use `@path/to/file` imports for detailed docs (progressive disclosure).
- Use `CLAUDE.local.md` (gitignored) for personal preferences.
- For detailed guidance, see [claude-md-guide.md](claude-md-guide.md)

## Skills (SKILL.md)

- Every skill needs a `SKILL.md` with YAML frontmatter (`---` markers) and markdown content.
- Use `disable-model-invocation: true` for workflows with side effects (deploy, commit, send messages).
- Use `context: fork` to run in an isolated subagent (prevents main context pollution).
- Use `!`command`` syntax to inject dynamic data before Claude sees the prompt.
- Use `$ARGUMENTS` for user input, `$ARGUMENTS[N]` or `$N` for positional args.
- Keep SKILL.md under 500 lines; move detailed reference to supporting files.
- For detailed guidance, see [skills-guide.md](skills-guide.md)

## Hooks

- Use hooks for actions that MUST happen every time (deterministic), not CLAUDE.md (advisory).
- Define in `.claude/settings.json` (project-shared) or `.claude/settings.local.json` (personal).
- Common pattern: `PostToolUse` with `Edit|Write` matcher for auto-linting after file changes.
- Use `PreToolUse` to block dangerous commands, `Stop` to enforce completion criteria.
- Hooks receive JSON on stdin, use exit codes (0=allow, 2=block) or JSON stdout for control.
- For detailed guidance, see [hooks-guide.md](hooks-guide.md)
