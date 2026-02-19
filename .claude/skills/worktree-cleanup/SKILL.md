---
name: worktree-cleanup
description: List and clean up git worktrees created by /worktree-task
disable-model-invocation: true
argument-hint: "[branch-name | path | all]"
allowed-tools: Bash(git *)
---

# Worktree Cleanup

Manage git worktrees created by `/worktree-task`.

## Current Worktrees

!`git worktree list`

## Actions

Argument: `$ARGUMENTS`

### No arguments — list worktrees

Show all worktrees with status. For each non-main worktree, check for uncommitted changes: `git -C <path> status --porcelain`.

### Specific branch or path — remove one

1. Find the matching worktree (by branch name or path)
2. Check for uncommitted changes: `git -C <path> status --porcelain`
3. If dirty, warn and ask for confirmation
4. If clean or confirmed:
   ```bash
   git worktree remove <path>
   git branch -d <branch>
   ```

### "all" — remove all non-main worktrees

1. For each non-main worktree:
   - Clean → remove automatically
   - Dirty → warn and skip
2. Prune stale references: `git worktree prune`
3. Report what was removed and what was kept
