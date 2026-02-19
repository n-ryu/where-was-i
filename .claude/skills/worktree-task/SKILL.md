---
name: worktree-task
description: Execute a task in an isolated git worktree. Use when running multiple tasks in parallel to prevent file conflicts between agents.
disable-model-invocation: true
argument-hint: "[branch-name] [task description...]"
context: fork
agent: general-purpose
allowed-tools: Bash(git *), Bash(pnpm *), Read, Write, Edit, Grep, Glob
---

# Isolated Worktree Task

Execute a task in an isolated git worktree to prevent file conflicts with parallel agents.

## Context

- Repo root: !`git rev-parse --show-toplevel`
- Worktree: !`REPO=$(git rev-parse --show-toplevel); echo "$(dirname ${REPO})/$(basename ${REPO})--worktree--$(echo "$0" | tr '/' '-')"`
- Branch: `$0`
- Full args: `$ARGUMENTS`

The first word of args is the branch name. Everything after is the task description.

## Workflow

### 1. Create worktree and install

```bash
git worktree add -b <branch> <worktree>
# If branch already exists: git worktree add <worktree> <branch>
pnpm --dir <worktree> install --frozen-lockfile
```

### 2. Execute the task

IMPORTANT: All file operations MUST target the worktree directory, not the original repo.

- Read, Write, Edit: absolute paths like `<worktree>/src/...`
- Glob, Grep: set `path` parameter to `<worktree>`
- git: `git -C <worktree> ...`
- pnpm: `pnpm --dir <worktree> ...`

Read `<worktree>/CLAUDE.md` for project-specific conventions before starting work.

### 3. Verify and commit

```bash
pnpm --dir <worktree> typecheck && pnpm --dir <worktree> lint
git -C <worktree> add -A
git -C <worktree> commit -m "<type>: <description>"
```

Use conventional commits format.

### 4. Report

- Summary of changes and files modified
- Branch name and worktree path
- Next steps: PR creation, merge, or `/worktree-cleanup`
