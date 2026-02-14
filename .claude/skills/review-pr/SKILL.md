---
name: review-pr
description: Review a pull request for code quality, best practices, and potential issues
context: fork
agent: Explore
disable-model-invocation: true
argument-hint: "[PR number]"
allowed-tools: Bash(gh *), Read, Grep, Glob
---

## PR Context

- PR details: !`gh pr view $ARGUMENTS`
- PR diff: !`gh pr diff $ARGUMENTS`
- Changed files: !`gh pr diff $ARGUMENTS --name-only`

## Task

Review this pull request thoroughly.

1. Read the changed files for full context
2. Review for:
   - TypeScript type safety and proper typing
   - React best practices (hooks rules, unnecessary re-renders)
   - Jotai atom usage patterns
   - styled-components patterns
   - Test coverage for new/changed code
   - Conventional Commits compliance in PR commits
3. Provide structured feedback

## Review Format

Categorize each finding:
- **Critical**: Bugs, security issues, data loss risks
- **Suggestion**: Better patterns, performance improvements
- **Nit**: Style, naming, minor improvements
